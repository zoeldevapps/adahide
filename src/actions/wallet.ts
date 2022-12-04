import {NETWORKS} from '../wallet/constants'
import {CryptoProviderType} from '../wallet/types'
import ShelleyCryptoProviderFactory from '../wallet/shelley/shelley-crypto-provider-factory'
import {ShelleyWallet} from '../wallet/shelley-wallet'

import debugLog from '../helpers/debugLog'
import getConversionRates from '../helpers/getConversionRates'

import {ADAHIDE_CONFIG} from '../config'
import {
  AccountInfo,
  Lovelace,
  AssetFamily,
  AuthMethodType,
  ConversionRates,
  LedgerTransportChoice,
} from '../types'
import {State, Store} from '../state'
import errorActions from './error'
import loadingActions from './loading'

import {saveAs} from 'file-saver'
import {exportWalletSecretDef} from '../wallet/keypass-json'
import {getDefaultLedgerTransportType} from '../wallet/shelley/helpers/transports'
import {getDeviceBrandName, isHwWallet} from '../wallet/helpers/cryptoProviderUtils'
import BigNumber from 'bignumber.js'
import {useAuthStore} from '../store/auth'

// TODO: we may be able to remove this, kept for backwards compatibility
const getShouldShowSaturatedBanner = (accountsInfo: Array<AccountInfo>) =>
  accountsInfo.some(({poolRecommendation}) => poolRecommendation.shouldShowSaturatedBanner)

type Wallet = ReturnType<typeof ShelleyWallet>
let wallet: Wallet | null
export const setWallet = (w: Wallet | null) => {
  wallet = w
}

export const getWallet = (): Wallet => {
  if (!wallet) {
    throw new Error('Wallet is not loaded')
  }
  return wallet
}

export default (store: Store) => {
  const {loadingAction, stopLoadingAction} = loadingActions(store)
  const {setError} = errorActions(store)
  const {getState, setState} = store

  const loadAsyncWalletData = async (): Promise<void> => {
    const wallet = getWallet()
    const asyncFetchAndUpdate = async <T extends Partial<State>>(
      fetchFn: () => Promise<T>,
      fallbackValue: T,
      debugMessage: string | null = null
    ): Promise<void> => {
      try {
        setState(await fetchFn())
      } catch (e) {
        debugMessage ?? debugLog(debugMessage)
        setState(fallbackValue)
      }
    }

    await Promise.all([
      asyncFetchAndUpdate<{conversionRates: ConversionRates | null}>(
        async () => ({conversionRates: await getConversionRates(getState())}),
        {conversionRates: null},
        'Could not fetch conversion rates.'
      ),
      asyncFetchAndUpdate(
        async () => ({tokensMetadata: await wallet.getTokensMetadata(getState().accountsInfo)}),
        {tokensMetadata: new Map()},
        'Could not fetch tokens metadata.'
      ),
    ])
  }

  const loadWallet = async (
    state: State,
    {
      cryptoProviderType,
      walletSecretDef,
      ledgerTransportChoice,
      shouldExportPubKeyBulk,
    }: {
      cryptoProviderType: CryptoProviderType
      walletSecretDef?: any // TODO: until now, arguments came in freestyle combinations, refactor
      ledgerTransportChoice?: LedgerTransportChoice
      shouldExportPubKeyBulk: boolean
    }
  ) => {
    loadingAction(state, 'Loading wallet data...')
    setState({walletLoadingError: undefined})
    const isShelleyCompatible = !(walletSecretDef && walletSecretDef.derivationScheme.type === 'v1')
    const ledgerTransportType =
      ledgerTransportChoice === LedgerTransportChoice.DEFAULT
        ? await getDefaultLedgerTransportType()
        : ledgerTransportChoice
    const bitbox02OnPairingCode = (pairingCode: string) => {
      if (pairingCode !== null) {
        loadingAction(state, `BitBox02 pairing code:\n${pairingCode}`)
      } else {
        stopLoadingAction(state)
      }
    }

    const walletOptions = useAuthStore.getState()
    const config = {
      ...ADAHIDE_CONFIG,
      addressDerivationType: walletOptions.derivationType,
      isShelleyCompatible,
      shouldExportPubKeyBulk,
      ledgerTransportType,
      bitbox02OnPairingCode,
    }

    try {
      if (
        ledgerTransportType === LedgerTransportChoice.WEB_HID ||
        ledgerTransportType === LedgerTransportChoice.WEB_USB
      ) {
        loadingAction(
          state,
          'Loading wallet data...\nIf a prompt appears, click on the Ledger device, then click "Connect."'
        )
      }
      const cryptoProvider = await ShelleyCryptoProviderFactory.getCryptoProvider(cryptoProviderType, {
        walletSecretDef,
        network: NETWORKS[ADAHIDE_CONFIG.ADAHIDE_NETWORK],
        config,
      })
      loadingAction(state, 'Loading wallet data...')
      setWallet(
        await ShelleyWallet({
          config,
          cryptoProvider,
        })
      )
      const wallet = getWallet()

      const validStakepoolDataProvider = await wallet.getStakepoolDataProvider()
      const accountsInfo = await wallet.getAccountsInfo(validStakepoolDataProvider)
      const shouldShowSaturatedBanner = getShouldShowSaturatedBanner(accountsInfo)

      const maxAccountIndex = wallet.getMaxAccountIndex()

      const cryptoProviderInfo = wallet.getCryptoProviderInfo()
      const usingHwWallet = isHwWallet(cryptoProviderInfo.type)
      if (isHwWallet(cryptoProviderInfo.type)) {
        loadingAction(state, `Waiting for ${getDeviceBrandName(cryptoProviderInfo.type)}...`)
      }

      setState({
        validStakepoolDataProvider,
        accountsInfo,
        maxAccountIndex,
        shouldShowSaturatedBanner,
        walletIsLoaded: true,
        loading: false,
        mnemonicAuthForm: {
          mnemonicInputValue: '',
          mnemonicInputError: null,
          formIsValid: false,
        },
        cryptoProviderInfo,
        shouldShowNonShelleyCompatibleDialog: !isShelleyCompatible,
        shouldShowGenerateMnemonicDialog: false,
        shouldShowAddressVerification: usingHwWallet,
        // send form
        sendAmount: {
          assetFamily: AssetFamily.ADA,
          fieldValue: '',
          coins: new BigNumber(0) as Lovelace,
        },
        sendAddress: {fieldValue: ''},
        // shelley
        isShelleyCompatible,
      })
      loadAsyncWalletData()
    } catch (e) {
      setState({
        loading: false,
      })
      setError(state, {errorName: 'walletLoadingError', error: e})
      setState({
        shouldShowWalletLoadingErrorModal: true,
      })
      return false
    }
    return true
  }

  const loadDemoWallet = (state: State) => {
    setState({
      mnemonicAuthForm: {
        mnemonicInputValue: ADAHIDE_CONFIG.ADAHIDE_DEMO_WALLET_MNEMONIC,
        mnemonicInputError: null,
        formIsValid: true,
      },
      walletLoadingError: undefined,
      shouldShowWalletLoadingErrorModal: false,
      authMethod: AuthMethodType.MNEMONIC,
    })
  }

  const logout = (state: State) => {
    window.location.reload()
  }

  const exportJsonWallet = async (state, password, walletName) => {
    const walletExport = JSON.stringify(
      await exportWalletSecretDef(getWallet().getWalletSecretDef(), password, walletName)
    )

    const blob = new Blob([walletExport], {
      type: 'application/json;charset=utf-8',
    })
    saveAs(blob, `${walletName}.json`)
  }

  return {
    loadWallet,
    loadDemoWallet,
    loadAsyncWalletData,
    logout,
    getShouldShowSaturatedBanner,
    exportJsonWallet,
  }
}
