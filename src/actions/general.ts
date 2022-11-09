import {Store, State} from '../state'
import delegateActions from './delegate'
import commonActions from './common'
import {ADAHIDE_CONFIG} from '../config'
import {MainTabs} from '../constants'
import {localStorageVars} from '../localStorage'
import {AuthMethodType} from '../types'

export default (store: Store) => {
  const {setState} = store
  const {resetDelegation} = delegateActions(store)
  const {resetSendFormFields, resetTransactionSummary, resetAccountIndexes} = commonActions(store)

  const openWelcome = (state: State) => {
    setState({
      displayWelcome: true,
    })
  }

  const closeWelcome = (state, dontShowDisclaimer) => {
    // we may get an ignored click event as the second argument, check only against booleans
    window.localStorage.setItem(localStorageVars.WELCOME, dontShowDisclaimer)
    setState({
      displayWelcome: false,
    })
  }

  const openInfoModal = (state) => {
    setState({
      displayInfoModal: true,
    })
  }

  const closeInfoModal = (state, dontShowInfoModal) => {
    // we may get an ignored click event as the second argument, check only against booleans
    window.localStorage.setItem(localStorageVars.INFO_MODAL, dontShowInfoModal)
    setState({
      displayInfoModal: false,
    })
  }

  const closeLogoutNotification = (state) => {
    setState({
      shouldShowLogoutNotification: false,
    })
  }

  const setActiveMainTab = (state: State, mainTab: MainTabs) => {
    resetAccountIndexes(state)
    setState({activeMainTab: mainTab})
    resetTransactionSummary(state)
    resetSendFormFields(state)
    resetDelegation()
  }

  const closeUnexpectedErrorModal = (state) => {
    setState({
      shouldShowUnexpectedErrorModal: false,
    })
  }

  const setAuthMethod = (state: State, authMethod: AuthMethodType): void => {
    setState({authMethod})
  }

  const closeNonShelleyCompatibleDialog = (state) => {
    setState({
      shouldShowNonShelleyCompatibleDialog: false,
    })
  }

  const openNonShelleyCompatibleDialog = (state) => {
    setState({
      shouldShowNonShelleyCompatibleDialog: true,
    })
  }

  const closeWalletLoadingErrorModal = (state) => {
    setState({
      shouldShowWalletLoadingErrorModal: false,
    })
  }

  return {
    openWelcome,
    closeWelcome,
    closeLogoutNotification,
    closeUnexpectedErrorModal,
    setActiveMainTab,
    openInfoModal,
    closeInfoModal,
    setAuthMethod,
    closeNonShelleyCompatibleDialog,
    openNonShelleyCompatibleDialog,
    closeWalletLoadingErrorModal,
  }
}
