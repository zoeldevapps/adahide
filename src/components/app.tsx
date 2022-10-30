import {connect} from 'unistore/react'
import {TopLevelRouter} from './router'
import Welcome from './common/welcome'
import ContactForm from './common/contactForm'
import Footer from './common/footer'
import LoadingOverlay from './common/loadingOverlay'
import NavbarAuth from './common/navbar/navbarAuth'
import NavbarUnauth from './common/navbar/navbarUnauth'
import AutoLogout from './autoLogout'
import {ADALITE_CONFIG} from '../config'
import Exchange from './pages/exchange/exchange'
import NufiPreviewPage from './pages/nufiPreview/nufiPreviewPage'
import ErrorBoundary from './errorBoundary'
import {State} from '../state'

const {ADALITE_LOGOUT_AFTER} = ADALITE_CONFIG

const Navbar = connect((state: State) => ({walletIsLoaded: state.walletIsLoaded}))(({walletIsLoaded}) =>
  walletIsLoaded ? <NavbarAuth /> : <NavbarUnauth />
)

const App = connect((state: State) => ({
  pathname: state.router.pathname,
  displayWelcome: state.displayWelcome,
  shouldShowContactFormModal: state.shouldShowContactFormModal,
  shouldShowUnexpectedErrorModal: state.shouldShowUnexpectedErrorModal,
}))(({pathname, displayWelcome, shouldShowContactFormModal, shouldShowUnexpectedErrorModal}) => {
  const currentTab = pathname.split('/')[1]
  if (currentTab === 'exchange') {
    return <Exchange />
  }
  if (currentTab === 'nufi') {
    return (
      <div className="wrap nufi-background">
        <NufiPreviewPage />
        <Footer />
      </div>
    )
  }
  return (
    <div className="wrap">
      <ErrorBoundary>
        <LoadingOverlay />
        <Navbar />
        <TopLevelRouter />
        <Footer />
        {ADALITE_LOGOUT_AFTER > 0 && <AutoLogout />}
        {displayWelcome && <Welcome />}
        {shouldShowContactFormModal && <ContactForm />}
      </ErrorBoundary>
    </div>
  )
})

export default App
