import 'babel-polyfill'

import {createRoot} from 'react-dom/client'
import {Provider as UnistoreStoreProvider} from 'unistore/react'
import {StoreProvider as HooksStoreProvider} from './libs/unistore-hooks'

import App from './components/app'

import {createStore} from './store'
import {ADALITE_CONFIG} from './config'

import {init} from '@sentry/browser'

if (ADALITE_CONFIG.ADALITE_TREZOR_CONNECT_URL) {
  const url = new URL(ADALITE_CONFIG.ADALITE_TREZOR_CONNECT_URL)
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

init({
  dsn: ADALITE_CONFIG.ADALITE_SENTRY_DSN_WEB,
  environment: ADALITE_CONFIG.ADALITE_ENV,
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
    // Eternl wallet error, unrelated to Adalite
    // https://github.com/ccwalletio/tracker/issues/119
    'WebAssembly.instantiate(): expected magic word',
  ],
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
