import {Component} from 'react'
import {connect} from 'unistore/react'
import actions from '../../actions'
import {State} from '../../state'
import Modal from './modal'

interface Props {
  closeModal: () => void
}

class ImageModal extends Component<Props, {}> {
  render() {
    return (
      <Modal onRequestClose={this.props.closeModal}>
        <img style={{width: '100%', height: '100%'}} src="/delegationCycle.png" alt="Delegation cycle" />
      </Modal>
    )
  }
}

export default connect<Props, unknown, any, unknown>(
  (state: State) => ({
    displayInfoModal: state.displayInfoModal,
  }),
  actions
)(ImageModal)
