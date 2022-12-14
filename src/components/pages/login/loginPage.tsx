import {useState} from 'react'
import {useSelector, useActions} from '../../../helpers/connect'
import actions from '../../../actions'
import KeyFileAuth from './keyFileAuth'
import MnemonicAuth from './mnemonicAuth'
import HardwareAuth from './hardwareAuth'
import GenerateMnemonicDialog from './generateMnemonicDialog'
import LogoutNotification from './logoutNotification'
import LoginPageSidebar from './loginPageSidebar'
import * as Section from '../../common/section'
import Tag from '../../common/tag'
import WalletLoadingErrorModal from './walletLoadingErrorModal'
import {getErrorHelpType, getErrorMessage} from '../../../errors'
import {State} from '../../../state'
import {AuthMethodType, ScreenType} from '../../../types'
import {useViewport, isBiggerThanMobile} from '../../common/viewPort'
import assertUnreachable from '../../../helpers/assertUnreachable'
import {GearIcon, LockOpen1Icon} from '@radix-ui/react-icons'
import {WalletOptions} from './walletOptions'

const getAuthMethodName = (authMethod: AuthMethodType): string => {
  switch (authMethod) {
    case AuthMethodType.MNEMONIC:
      return 'Mnemonic'
    case AuthMethodType.HW_WALLET:
      return 'Hardware Wallet'
    case AuthMethodType.KEY_FILE:
      return 'Key file'
    default:
      return assertUnreachable(authMethod)
  }
}

const CurrentDropdownItem = ({
  authMethod,
  toggleDropdown,
}: {
  authMethod: AuthMethodType
  toggleDropdown: () => void
}) => (
  <div
    className={`dropdown-item current ${authMethod} ${
      authMethod === AuthMethodType.HW_WALLET ? 'recommended' : ''
    }`}
    onClick={toggleDropdown}
  >
    <span className="dropdown-item-text">{getAuthMethodName(authMethod)}</span>
  </div>
)

const DropdownItem = ({
  authMethod,
  toggleDropdown,
  tabName,
  recommended = false,
}: {
  authMethod: AuthMethodType
  toggleDropdown: () => void
  tabName: AuthMethodType
  recommended?: boolean
}) => {
  const {setAuthMethod} = useActions(actions)
  return (
    <li
      className={`dropdown-item ${tabName} ${authMethod === tabName ? 'selected' : ''} ${
        recommended ? 'recommended' : ''
      }`}
      onClick={() => {
        toggleDropdown()
        setAuthMethod(tabName)
      }}
    >
      <span className={`dropdown-item-text ${tabName}`}>{getAuthMethodName(tabName)}</span>
    </li>
  )
}

const AuthTab = ({
  authMethod,
  tabName,
  recommended = false,
}: {
  authMethod: AuthMethodType
  tabName: AuthMethodType
  recommended?: boolean
}) => {
  const {setAuthMethod} = useActions(actions)
  return (
    <li
      className={`auth-tab ${tabName} ${authMethod === tabName ? 'selected' : ''} ${
        recommended ? 'recommended' : ''
      }`}
      onClick={() => setAuthMethod(tabName)}
    >
      <span className={`auth-tab-text ${tabName}`}>{getAuthMethodName(tabName)}</span>
    </li>
  )
}

const AuthOption = ({tabName, texts, tag}: {tabName: AuthMethodType; texts: Array<string>; tag: string}) => {
  const {setAuthMethod} = useActions(actions)
  return (
    <div className={`auth-option ${tabName}`} onClick={() => setAuthMethod(tabName)}>
      {tag && <Tag type={`auth ${tag}`} text={tag} />}
      <h3 className="auth-option-title">{getAuthMethodName(tabName)}</h3>
      {texts.map((text, i) => (
        <p key={i} className="auth-option-text">
          {text}
        </p>
      ))}
    </div>
  )
}

const AuthCardInitial = () => (
  <div className="authentication card initial">
    <h2 className="authentication-title">How do you want to access your Cardano Wallet?</h2>
    <Section.Root>
      <Section.Header>
        <GearIcon /> Wallet options
      </Section.Header>
      <Section.Body>
        <WalletOptions />
      </Section.Body>
    </Section.Root>
    <Section.Root>
      <Section.Header>
        <LockOpen1Icon /> Security
      </Section.Header>
      <Section.Body>
        <div className="auth-options">
          <AuthOption
            tabName={AuthMethodType.MNEMONIC}
            texts={['12, 15, 24 or 27 word passphrase']}
            tag={'fastest'}
          />
          <AuthOption
            tabName={AuthMethodType.HW_WALLET}
            texts={['Trezor T', 'Ledger Nano S/S Plus/X', 'Android device & Ledger', 'BitBox02']}
            tag={'recommended'}
          />
          <AuthOption tabName={AuthMethodType.KEY_FILE} texts={['Encrypted .JSON file']} tag={''} />
        </div>
      </Section.Body>
    </Section.Root>
  </div>
)

const SubCardByAuthMethod = ({authMethod}: {authMethod: AuthMethodType}) => {
  switch (authMethod) {
    case AuthMethodType.MNEMONIC:
      return <MnemonicAuth />
    case AuthMethodType.HW_WALLET:
      return <HardwareAuth />
    case AuthMethodType.KEY_FILE:
      return <KeyFileAuth />
    default:
      return assertUnreachable(authMethod)
  }
}

const AuthCard = ({
  authMethod,
  screenType,
  isDropdownOpen,
  toggleDropdown,
}: {
  authMethod: AuthMethodType
  screenType: ScreenType
  isDropdownOpen: boolean
  toggleDropdown: () => void
}) => (
  <div className="authentication card">
    {isBiggerThanMobile(screenType) ? (
      <ul className="auth-tabs">
        <AuthTab tabName={AuthMethodType.MNEMONIC} authMethod={authMethod} />
        <AuthTab tabName={AuthMethodType.HW_WALLET} authMethod={authMethod} recommended />
        <AuthTab tabName={AuthMethodType.KEY_FILE} authMethod={authMethod} />
      </ul>
    ) : (
      <div className={`dropdown auth ${isDropdownOpen ? 'open' : ''}`}>
        <CurrentDropdownItem authMethod={authMethod} toggleDropdown={toggleDropdown} />
        <ul className="dropdown-items">
          <DropdownItem
            authMethod={authMethod}
            tabName={AuthMethodType.MNEMONIC}
            toggleDropdown={toggleDropdown}
          />
          <DropdownItem
            tabName={AuthMethodType.HW_WALLET}
            toggleDropdown={toggleDropdown}
            authMethod={authMethod}
            recommended
          />
          <DropdownItem
            authMethod={authMethod}
            tabName={AuthMethodType.KEY_FILE}
            toggleDropdown={toggleDropdown}
          />
        </ul>
      </div>
    )}
    <SubCardByAuthMethod authMethod={authMethod} />
  </div>
)

const LoginPage = () => {
  const screenType = useViewport()
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false)
  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen)
  const {
    authMethod,
    shouldShowLogoutNotification,
    walletLoadingError,
    shouldShowGenerateMnemonicDialog,
    shouldShowWalletLoadingErrorModal,
  } = useSelector((state: State) => ({
    authMethod: state.authMethod,
    shouldShowLogoutNotification: state.shouldShowLogoutNotification,
    walletLoadingError: state.walletLoadingError,
    shouldShowGenerateMnemonicDialog: state.shouldShowGenerateMnemonicDialog,
    shouldShowWalletLoadingErrorModal: state.shouldShowWalletLoadingErrorModal,
  }))
  const {closeWalletLoadingErrorModal} = useActions(actions)

  return (
    <div className="page-wrapper">
      <div className="page-inner">
        <main className="page-main">
          {authMethod === null ? (
            <AuthCardInitial />
          ) : (
            <AuthCard
              authMethod={authMethod}
              screenType={screenType}
              isDropdownOpen={isDropdownOpen}
              toggleDropdown={toggleDropdown}
            />
          )}
        </main>
        <LoginPageSidebar />
        {shouldShowGenerateMnemonicDialog && <GenerateMnemonicDialog />}
        {shouldShowLogoutNotification && <LogoutNotification />}
        {shouldShowWalletLoadingErrorModal && (
          <WalletLoadingErrorModal
            onRequestClose={closeWalletLoadingErrorModal}
            errorMessage={getErrorMessage(walletLoadingError.code, walletLoadingError.params)}
            helpType={getErrorHelpType(walletLoadingError.code)}
          />
        )}
      </div>
    </div>
  )
}

export default LoginPage
