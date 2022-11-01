const LOGO_PATH_DARK = 'assets/zoeldev-logo.svg'

interface Props {
  dark: boolean
}

const Branding = ({dark}: Props) => (
  <div className="branding">
    <p className={`branding-label ${dark ? 'dark' : ''}`}>Developed by</p>
    <img className="branding-logo" src={LOGO_PATH_DARK} alt="Zoeldev logo" />
  </div>
)

export default Branding
