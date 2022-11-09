import {connect, useActions} from '../../../helpers/connect'
import actions from '../../../actions'
import {ADAHIDE_CONFIG} from '../../../config'
import {useEffect} from 'react'
const APP_VERSION = ADAHIDE_CONFIG.ADAHIDE_APP_VERSION

const NavbarAuth = () => {
  let scrollDestination: any
  const {openWelcome, openInfoModal, logout} = useActions(actions)

  const scrollToTop = () => {
    if (window.innerWidth < 767) {
      window.scrollTo(0, scrollDestination.offsetHeight)
    } else {
      window.scrollTo(0, 0)
    }
  }

  useEffect(() => {
    scrollToTop()
  })
  return (
    <nav
      className={`navbar authed`}
      ref={(element) => {
        scrollDestination = element
      }}
    >
      <div className="navbar-wrapper">
        <h1 className="navbar-heading">
          <span className="navbar-title">Adahide - Cardano Wallet</span>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault()
              window.history.pushState({}, 'txHistory', 'txHistory')
            }}
          >
            <img src="assets/adahide-logo.svg" alt="Adahide" className="navbar-logo" />
          </a>
        </h1>
        <div className="navbar-version">{`Ver. ${APP_VERSION}`}</div>
        <div className="navbar-content">
          <a
            className="navbar-link primary"
            href="#"
            onClick={(e) => {
              e.preventDefault()
              openInfoModal()
            }}
          >
            News
          </a>
          <a
            className="navbar-link"
            href="#"
            onClick={(e) => {
              e.preventDefault()
              openWelcome()
            }}
          >
            About
          </a>
          <a
            className="navbar-link"
            href="https://github.com/zoeldev/adahide/wiki"
            target="_blank"
            rel="noopener"
          >
            Help
          </a>
        </div>
        <button className="button secondary logout" onClick={() => setTimeout(logout, 100)}>
          Logout
        </button>
      </div>
    </nav>
  )
}

export default connect(
  (state) => ({
    router: state.router,
  }),
  actions
)(NavbarAuth)
