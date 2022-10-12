import {Component} from 'react'
import Tag from './tag'

interface Props {
  onRequestClose?: () => void
  children?: any
  bodyClass?: string
  title?: string
  showWarning?: boolean
  closeOnClickOutside?: boolean
}

class Modal extends Component<Props, {}> {
  componentWillMount() {
    document.body.classList.add('no-scroll')
  }

  componentWillUnmount() {
    document.body.classList.remove('no-scroll')
  }

  render() {
    const {
      children,
      onRequestClose,
      bodyClass = '',
      title = '',
      showWarning = false,
      closeOnClickOutside = true,
    } = this.props
    return (
      <div className="modal">
        <div className="modal-overlay" onClick={closeOnClickOutside ? onRequestClose : undefined} />
        <div
          className={`modal-body ${bodyClass}`}
          onKeyDown={(e) => {
            if (e.key === 'Escape' && onRequestClose) {
              onRequestClose()
            }
          }}
        >
          <div className="modal-content">
            {onRequestClose && (
              <button
                className="button close modal-close"
                onClick={onRequestClose}
                {
                  ...{ariaLabel: 'Close dialog'} /* fix ts error*/
                }
              />
            )}
            {title && (
              <div className="modal-head">
                {title && <h2 className="modal-title">{title}</h2>}
                {showWarning && <Tag type="big warning" text="Proceed with caution" />}
              </div>
            )}
            {children}
          </div>
        </div>
      </div>
    )
  }
}

export default Modal
