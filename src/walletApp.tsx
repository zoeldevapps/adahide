import {createRoot} from 'react-dom/client'
import {Provider as UnistoreStoreProvider} from 'unistore/react'
import {StoreProvider as HooksStoreProvider} from './libs/unistore-hooks'

import * as Sentry from '@sentry/react'
import {BrowserTracing} from '@sentry/tracing'

import App from './components/app'

import {createStore} from './store'
import {ADAHIDE_CONFIG} from './config'

if (ADAHIDE_CONFIG.ADAHIDE_TREZOR_CONNECT_URL) {
  const url = new URL(ADAHIDE_CONFIG.ADAHIDE_TREZOR_CONNECT_URL)
  // @ts-ignore
  window.__TREZOR_CONNECT_SRC = `${url.origin}/`
}

// polyfill to trigger onpushstate events on history api
// http://felix-kling.de/blog/2011/01/06/how-to-detect-history-pushstate/
;(function (history: any) {
  const pushState = history.pushState
  history.pushState = function (state) {
    // must be before our function so that url changes before we dispatch the action
    const retValue = pushState.apply(history, arguments) // eslint-disable-line prefer-rest-params
    if (typeof history.onpushstate === 'function') {
      history.onpushstate({state})
    }
    return retValue
  }
})(window.history)

const store = createStore()

// Keep state after hot-reload
// https://github.com/developit/unistore/issues/81#issuecomment-378244539
function addMemory(store) {
  // @ts-ignore
  if (window.STATE) store.setState(window.STATE)
  store.subscribe((state) => {
    // @ts-ignore
    window.STATE = state
  })
}
addMemory(store)

// complete routing here

// @ts-ignore
window.history.onpushstate = () =>
  store.setState({
    router: {
      pathname: window.location.pathname,
      hash: window.location.hash,
    },
  })

window.onpopstate = (event) =>
  store.setState({
    router: {
      pathname: event.target.location.pathname,
      hash: event.target.location.hash,
    },
  })

window.onhashchange = () =>
  store.setState({
    router: {
      pathname: window.location.pathname,
      hash: window.location.hash,
    },
  })

Sentry.init({
  dsn: ADAHIDE_CONFIG.ADAHIDE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  // debug: true,
  beforeSend(event) {
    if (!event.exception) return event
    return new Promise((resolve) => {
      store.setState({
        sendSentry: {
          event,
          resolve,
        },
        shouldShowUnexpectedErrorModal: true,
      })
    }).then((tags) => {
      // @ts-ignore
      if (tags) event.tags = tags
      return tags ? event : null
    })
  },
  ignoreErrors: [
    // FF 83.0 specific error to be ignored
    // https://bugzilla.mozilla.org/show_bug.cgi?id=1678243
    'XDR encoding failure',
  ],
  integrations: [new BrowserTracing()],

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,
})

const root = createRoot(document.getElementById('root') as HTMLElement)
function reload() {
  const Wrapper = (
    <HooksStoreProvider value={store}>
      {/* @ts-ignore */}
      <UnistoreStoreProvider store={store}>
        <App />
      </UnistoreStoreProvider>
    </HooksStoreProvider>
  )
  root.render(Wrapper)
}

reload()
