import {Component, Fragment} from 'react'
import {connect} from 'unistore/react'
import actions from '../../actions'
import Modal from './modal'
import {localStorageVars} from '../../localStorage'
import {State} from '../../state'

const NewsSection = ({children, date}) => (
  <Fragment>
    <h3 className="info-date">{date}</h3>
    {children}
    <hr className="info-separator" />
  </Fragment>
)

const Article = ({children, title, icon}) => (
  <article className="article">
    <span className={`article-icon ${icon ? `${icon}` : ''}`} />
    <h3 className="article-title">{title}</h3>
    <p className="article-paragraph">{children}</p>
  </article>
)

interface Props {
  displayInfoModal: State['displayInfoModal']
  closeInfoModal: (dontShowAgain: boolean) => void
}

class InfoModal extends Component<Props, {dontShowAgainCheckbox: boolean}> {
  constructor(props) {
    super(props)
    this.state = {
      dontShowAgainCheckbox: window.localStorage.getItem(localStorageVars.INFO_MODAL) === 'true',
    }
    this.checkboxClick = this.checkboxClick.bind(this)
    this.closeInfoModal = this.closeInfoModal.bind(this)
  }

  checkboxClick() {
    this.setState({dontShowAgainCheckbox: !this.state.dontShowAgainCheckbox})
  }

  closeInfoModal() {
    this.props.closeInfoModal(this.state.dontShowAgainCheckbox)
  }

  render() {
    const {dontShowAgainCheckbox} = this.state
    return (
      <Modal>
        <section className="welcome">
          <div className="welcome-body">
            <h2 className="welcome-title">Adahide News</h2>
            <NewsSection
              date={'1/11/2022'}
              children={
                <Fragment>
                  <Article title="Adalite fork Adahide - The beginnings" icon="">
                    <p className="info-spaced-paragraph">
                      AdaLite was put on life-support in favor of a the multi-chain NuFi wallet. While NuFi is
                      great, we wanted a much lighter infrastructure-wise. Something truly lighter. Both
                      AdaLite and NuFi rely on heavy backend services. The aim of Adahide is to be a much
                      lighter infrastructure-wise - just requiring node + ogmios to run -, or use existing SaS
                      solutions (like blockfrost, koios) for more advanced things. Anything on top of this
                      base should be modular.
                    </p>
                  </Article>
                </Fragment>
              }
            />
          </div>
          <div className="welcome-footer">
            <label className="checkbox">
              <input
                type="checkbox"
                checked={dontShowAgainCheckbox}
                onChange={this.checkboxClick}
                className="checkbox-input"
              />
              <span className="checkbox-indicator">{undefined}</span>Don't show on startup again.
            </label>
            <button
              onClick={this.closeInfoModal}
              className="button primary wide modal-button"
              onKeyDown={(e) => {
                e.key === 'Enter' && (e.target as HTMLButtonElement).click()
              }}
            >
              Close
            </button>
          </div>
        </section>
      </Modal>
    )
  }
}

export default connect(
  (state: State) => ({
    displayInfoModal: state.displayInfoModal,
  }),
  actions
)(InfoModal)
