import {connect} from 'unistore/react'
import {Provider as ToastProvider, Viewport as ToastViewport} from '@radix-ui/react-toast'
import {TopLevelRouter} from './router'
import Welcome from './common/welcome'
import Footer from './common/footer'
import LoadingOverlay from './common/loadingOverlay'
import NavbarAuth from './common/navbar/navbarAuth'
import NavbarUnauth from './common/navbar/navbarUnauth'
import AutoLogout from './autoLogout'
import {ADAHIDE_CONFIG} from '../config'
import Exchange from './pages/exchange/exchange'
import ErrorBoundary from './errorBoundary'
import {State} from '../state'

import classes from './app.module.css'
import {UpdateToast} from './common/updateToast'

const {ADAHIDE_LOGOUT_AFTER} = ADAHIDE_CONFIG

const Navbar = connect((state: State) => ({walletIsLoaded: state.walletIsLoaded}))(({walletIsLoaded}) =>
  walletIsLoaded ? <NavbarAuth /> : <NavbarUnauth />
)

const App = connect((state: State) => ({
  pathname: state.router.pathname,
  displayWelcome: state.displayWelcome,
}))(({pathname, displayWelcome}) => {
  const currentTab = pathname.split('/')[1]

  const content =
    currentTab === 'exchange' ? (
      <Exchange />
    ) : (
      <>
        <LoadingOverlay />
        <Navbar />
        <TopLevelRouter />
        <Footer />
        {ADAHIDE_LOGOUT_AFTER > 0 && <AutoLogout />}
        {displayWelcome && <Welcome />}
      </>
    )

  return (
    <div className="wrap">
      <ErrorBoundary>
        <ToastProvider swipeDirection="right">
          {content}
          <UpdateToast />
          <ToastViewport className={classes.ToastViewport} />
        </ToastProvider>
      </ErrorBoundary>
    </div>
  )
})

export default App
