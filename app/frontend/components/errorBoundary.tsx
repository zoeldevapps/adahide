import {Component, ReactNode} from 'react'
import {captureException} from '@sentry/browser'
import {connect} from 'unistore/react'
import actions from '../actions'
import UnexpectedErrorModal from './common/unexpectedErrorModal'

interface Props {
  shouldShowUnexpectedErrorModal: boolean
  children: ReactNode
}

class ErrorBoundary extends Component<Props, {}> {
  state = {errorCaughtAtBoundary: null}

  static getDerivedStateFromError(error) {
    return {errorCaughtAtBoundary: error.message}
  }

  componentDidCatch(error) {
    captureException(error)
  }

  render() {
    const isUnhandledError = this.state.errorCaughtAtBoundary != null

    return (
      <span>
        {!isUnhandledError && this.props.children}
        {this.props.shouldShowUnexpectedErrorModal && (
          <UnexpectedErrorModal reloadPageOnClose={isUnhandledError} />
        )}
      </span>
    )
  }
}

export default connect<Omit<Props, 'shouldShowUnexpectedErrorModal'>, unknown, any, unknown>(
  (state) => ({
    shouldShowUnexpectedErrorModal: state.shouldShowUnexpectedErrorModal,
  }),
  actions
)(ErrorBoundary)
