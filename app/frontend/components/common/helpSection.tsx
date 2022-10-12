import {captureException} from '@sentry/browser'
import {ErrorHelpType} from '../../types'
import {useSelector} from '../../helpers/connect'

interface Props {
  closeHandler: () => void
  helpType: ErrorHelpType
}

const HelpSection = ({closeHandler, helpType}: Props) => {
  const error = useSelector((state) => state.error)
  return (
    <div className="modal-instructions">
      <p>
        If you are experiencing problems, please try the following{' '}
        <a href="https://github.com/vacuumlabs/adalite/wiki/Troubleshooting">troubleshooting suggestions</a>{' '}
        before contacting us.
      </p>
      {helpType === 'troubleshoot_and_contact' && (
        <p>
          Didn't help?{' '}
          <a
            onClick={() => {
              closeHandler()
              captureException(error)
            }}
          >
            Send
          </a>{' '}
          us the error.
        </p>
      )}
    </div>
  )
}

export default HelpSection
