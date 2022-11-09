import printAda from '../helpers/printAda'
import debugLog from '../helpers/debugLog'
import {BITBOX02_VERSIONS, LEDGER_VERSIONS, TREZOR_VERSIONS} from '../wallet/constants'
import {CryptoProviderFeature} from '../types'
import {knownExternalErrors, InternalErrorReason} from '.'
import {MIN_UTXO_VALUE} from '../wallet/shelley/transaction/constants'

const hwWalletTroubleshootingSuggestion =
  'Make sure other apps (e.g. Ledger Live) or websites interacting with your HW wallet are closed. Also make sure to use the latest available version of the Cardano app/firmware on your HW wallet and web browser.'

const internalErrorMessages: {[key in InternalErrorReason]: (params?: any) => string} = {
  [InternalErrorReason.SendAddressInvalidAddress]: () => 'Invalid address',
  [InternalErrorReason.SendAddressPoolId]: () => 'Invalid address, to stake your funds use the Staking tab',
  [InternalErrorReason.SendAmountIsNan]: () => 'Invalid format: Amount has to be a number',
  [InternalErrorReason.SendAmountIsNotPositive]: () => 'Invalid format: Amount has to be a positive number',
  [InternalErrorReason.SendAmountInsufficientFunds]: ({balance}) =>
    `Insufficient funds for the transaction. Your balance is ${printAda(balance)} ADA.`,
  [InternalErrorReason.SendAmountCantSendAnyFunds]: () =>
    'Sending funds is not possible since there is not enough balance to pay the transaction fee',
  [InternalErrorReason.SendAmountPrecisionLimit]: () =>
    'Invalid format: Maximum allowed precision is 0.000001',
  [InternalErrorReason.SendAmountIsTooBig]: () => 'Invalid format: Amount too big',
  [InternalErrorReason.TokenAmountOnlyWholeNumbers]: () =>
    'Invalid format: This asset amount has to be a whole number',
  [InternalErrorReason.TokenSendAmountPrecisionLimit]: ({decimals}) =>
    `Invalid format: Maximum allowed precision for this token is ${decimals} decimal places`,
  [InternalErrorReason.TokenAmountInsufficientFunds]: ({tokenBalance}) =>
    `Insufficient funds for the transaction. Your balance is ${tokenBalance}`,
  [InternalErrorReason.SendTokenNotMinimalLovelaceAmount]: ({minimalLovelaceAmount}) =>
    `Insufficient funds for the transaction, the minimal amount of ADA for sending the tokens is ${printAda(
      minimalLovelaceAmount
    )}`,
  [InternalErrorReason.DonationAmountTooLow]: () =>
    `Minimum donation is ${MIN_UTXO_VALUE} ADA due to blockchain requirements`,
  [InternalErrorReason.DonationInsufficientBalance]: () => 'Insufficient balance for the donation.',

  [InternalErrorReason.InvalidStakepoolIdentifier]: ({hasTickerMapping}) =>
    `Enter a valid ${hasTickerMapping ? 'ticker or ' : ''}stakepool id.`,
  [InternalErrorReason.TickerSearchDisabled]: ({hasTickerMapping}) =>
    'Search by ticker is temporary disabled',
  [InternalErrorReason.DelegationBalanceError]: () => 'Not enough funds to pay the delegation fee.',
  [InternalErrorReason.RewardsBalanceTooLow]: () =>
    'Rewards account balance lower than the fee required to pay for the transacion.',

  [InternalErrorReason.InvalidMnemonic]: () =>
    'Invalid mnemonic, check your mnemonic for typos and try again.',

  [InternalErrorReason.TransactionRejectedByNetwork]: () =>
    'Submitting the transaction into Cardano network failed. We received this error and we will investigate the cause.',
  [InternalErrorReason.TransactionRejectedMempoolFull]: () =>
    'Transaction rejected because the mempool is full. The blockchain is likely congested. Please, try again later.',
  [InternalErrorReason.TransactionRejectedWhileSigning]: ({message}) =>
    `Transaction rejected while signing. ${message || hwWalletTroubleshootingSuggestion}`,
  [InternalErrorReason.TransactionNotFoundInBlockchainAfterSubmission]: ({txHash}) =>
    `Transaction ${
      txHash || ''
    } not found in blockchain after being submitted. It may take up to an hour for the transaction to appear, if it was successful.`,
  [InternalErrorReason.TransactionSubmissionTimedOut]: () =>
    'Transaction submission timed out, the blockchain is likely congested. It may take up to an hour for the transaction to appear, if it was successful.',
  [InternalErrorReason.TxSerializationError]: ({message}) => `TxSerializationError: ${message}`,

  [InternalErrorReason.TrezorSignTxError]: ({message}) => `TrezorSignTxError: ${message}`,
  [InternalErrorReason.TrezorError]: ({message}) =>
    `TrezorError: Trezor operation failed, please make sure ad blockers are switched off for this site and you are using the latest version of Trezor firmware. ${message}`,
  [InternalErrorReason.LedgerOperationError]: ({message}) =>
    `LedgerOperationError: ${message}. Please make sure you are using the latest version of the Cardano application.`,

  [InternalErrorReason.CoinAmountError]: () =>
    'CoinAmountError: Some of the transaction outputs exceeds the maximum supported amount.',
  [InternalErrorReason.OutputTooSmall]: () =>
    'OutputTooSmall: Not enough funds to make this transaction, try sending a different amount.',
  [InternalErrorReason.ChangeOutputTooSmall]: () =>
    'ChangeOutputTooSmall: Not enough funds to make this transaction, try sending a different amount.',
  [InternalErrorReason.TxTooBig]: () => 'Transaction too big, try sending less in multiple transactions.',
  [InternalErrorReason.OutputTooBig]: () => 'Transaction output is too big, try sending a diffrent amount.',

  [InternalErrorReason.SendAmountTooLow]: () => 'Amount too low. Minimum amount to send is 1 ADA',
  [InternalErrorReason.SendAmountBalanceTooLow]: () => 'Minimum output amount is 1 ADA.',
  [InternalErrorReason.CryptoProviderError]: ({message}) => `CryptoProviderError: ${message}`,
  [InternalErrorReason.NetworkError]: () =>
    'NetworkError: Request to our servers has failed. Please check your network connection and if the problem persists, contact us.',
  [InternalErrorReason.ServerError]: () =>
    'ServerError: Our servers are probably down. Please try again later and if the problem persists, contact us.',
  [InternalErrorReason.EpochBoundaryUnderway]: () =>
    'Our servers are temporarily down while Cardano is undergoing an epoch boundary. We should be back in a few minutes.',
  [InternalErrorReason.BitBox02OutdatedFirmwareError]: ({message}) =>
    `BitBox02OutdatedFirmwareError: Your BitBox02 firmware (version ${message}) is outdated. Please update your firmware to version ${
      BITBOX02_VERSIONS[CryptoProviderFeature.MINIMAL].major
    }.${BITBOX02_VERSIONS[CryptoProviderFeature.MINIMAL].minor}.${
      BITBOX02_VERSIONS[CryptoProviderFeature.MINIMAL].patch
    } or later, using the latest release of the BitBoxApp.`,
  [InternalErrorReason.BitBox02MultiAssetNotSupported]: () =>
    'BitBox02MultiAssetNotSupported: Please update your BitBox02 firmware for token support.',
  [InternalErrorReason.LedgerMultiAssetNotSupported]: () =>
    'LedgerMultiAssetNotSupported: Sending tokens is not supported on Ledger device. Please update your cardano application to the latest version.',
  [InternalErrorReason.LedgerOutdatedCardanoAppError]: ({message}) =>
    `LedgerOutdatedCardanoAppError: Your cardano application is running on an outdated version ${message}. Please update your cardano application to the version ${
      LEDGER_VERSIONS[CryptoProviderFeature.MINIMAL].major
    }.${LEDGER_VERSIONS[CryptoProviderFeature.MINIMAL].minor}.${
      LEDGER_VERSIONS[CryptoProviderFeature.MINIMAL].patch
    } or later. See https://support.ledger.com/hc/en-us/articles/360006523674-Install-uninstall-and-update-apps for more information.`,
  [InternalErrorReason.LedgerWithdrawalNotSupported]: ({message}) =>
    `RewardsWithdrawalNotSupported: There was a bug in Ledger Cardano app 2.0.3 that didn't allow rewards withdrawals. To withdraw rewards, you need to update your Ledger firmware and your Ledger Cardano app. You need to update to firmware version 1.6.1 for Ledger Nano S and to firmware version 1.2.4-4 for Nano X. For more information how to do this please refer to https://support.ledger.com/hc/en-us/articles/360005885733-Update-device-firmware. After your ledger firmware is updated please install the latest version of the the Ledger Cardano app. Your current version is ${message} and the required version is ${
      LEDGER_VERSIONS[CryptoProviderFeature.WITHDRAWAL].major
    }.${LEDGER_VERSIONS[CryptoProviderFeature.WITHDRAWAL].minor}.${
      LEDGER_VERSIONS[CryptoProviderFeature.WITHDRAWAL].patch
    }. For more information how to do this, please refer to https://support.ledger.com/hc/en-us/articles/360006523674-Install-uninstall-and-update-apps`,
  [InternalErrorReason.LedgerPoolRegNotSupported]: ({message}) =>
    `Pool registration is not supported on this device. Your current version is ${message} and the required version is ${
      LEDGER_VERSIONS[CryptoProviderFeature.POOL_OWNER].major
    }.${LEDGER_VERSIONS[CryptoProviderFeature.POOL_OWNER].minor}.${
      LEDGER_VERSIONS[CryptoProviderFeature.POOL_OWNER].patch
    }`,
  [InternalErrorReason.LedgerCatalystNotSupported]: ({message}) =>
    `Catalyst voting is not supported on this device. Your current version is ${message} and the required version is ${
      LEDGER_VERSIONS[CryptoProviderFeature.VOTING].major
    }.${LEDGER_VERSIONS[CryptoProviderFeature.VOTING].minor}.${
      LEDGER_VERSIONS[CryptoProviderFeature.VOTING].patch
    }`,
  [InternalErrorReason.LedgerBulkExportNotSupported]: () => '', // TODO
  [InternalErrorReason.TrezorPoolRegNotSupported]: ({message}) =>
    `Pool registration is not supported on this device. Your current version is ${message} and the required version is ${
      TREZOR_VERSIONS[CryptoProviderFeature.POOL_OWNER].major
    }.${TREZOR_VERSIONS[CryptoProviderFeature.POOL_OWNER].minor}.${
      TREZOR_VERSIONS[CryptoProviderFeature.POOL_OWNER].patch
    }`,
  [InternalErrorReason.TrezorMultiAssetNotSupported]: () =>
    'TrezorMultiAssetNotSupported: Sending tokens is not supported on Trezor device. Please update your firmware to the latest version.',

  [InternalErrorReason.PoolRegIncorrectBufferLength]: ({message}) =>
    `Given property has incorrect byte length: ${message}.`,
  [InternalErrorReason.PoolRegDuplicateOwners]: () => 'The certificate contains duplicate owner hashes.',

  [InternalErrorReason.PoolRegInvalidMargin]: () => 'The given pool margin is not valid.',
  [InternalErrorReason.PoolRegInvalidRelay]: () => 'Relay type is incorrect.',
  [InternalErrorReason.PoolRegInvalidMetadata]: () =>
    'Pool metadata must be either empty or contain both url and metadata hash.',
  [InternalErrorReason.PoolRegNoHwWallet]: () => 'Only hardware wallet users can use this feature.',
  [InternalErrorReason.PoolRegTxParserError]: ({message}) =>
    `Parser error: Invalid transaction format. ${message}`,
  [InternalErrorReason.MissingOwner]: () =>
    'This HW device is not an owner of the pool stated in registration certificate.',
  [InternalErrorReason.TransactionCorrupted]: () => 'TransactionCorrupted: Transaction assembling failure.',
  [InternalErrorReason.Error]: ({message}) => {
    const errors = {
      // an issue with CryptoToken extension allowing 2-step verification
      // https://askubuntu.com/questions/844090/what-is-cryptotokenextension-in-chromium-extensions
      "SyntaxError: Failed to execute 'postMessage' on 'Window': Invalid target origin 'chrome-extension://kmendfapggjehodndflmmgagdbamhnfd' in a call to 'postMessage'": `${message} ${hwWalletTroubleshootingSuggestion}`,
    }
    // we return undefined in case of unmached message on purpose since we
    // want to treat such errors as unexpected
    return errors[message]
  },
  [InternalErrorReason.BitBox02Error]: ({message}) =>
    `BitBox02Error: BitBox02 operation failed, please make sure you are using the latest version of the BitBox02 firmware. ${message}`,
}

const externalErrorMessages: {[key: string]: (params?: any) => string} = {
  [knownExternalErrors.DeviceStatusError]: ({message}) => {
    const cardanoAppOpenSuggestion =
      'Please make sure that the Cardano Ledger App is opened before initiating the connection.'

    const errors = {
      'Ledger device: Wrong Ledger app': `Ledger device: Wrong Ledger app. ${cardanoAppOpenSuggestion}`,
      'Ledger device: Device is locked': 'Ledger device: Device is locked. Please unlock your device.',
      'General error 0x6e01. Please consult https://github.com/cardano-foundation/ledger-app-cardano/blob/master/src/errors.h': `General error 0x6e01. ${cardanoAppOpenSuggestion}`,
    }
    return `DeviceStatusError: ${errors[message] || message}`
  },
  [knownExternalErrors.InvalidDataProviderInitilization]: () => 'Invalid data provider initilization',
  [knownExternalErrors.PoolRegNoTtl]: () =>
    'TTL parameter is missing in the transaction. It is explicitly required even for the Allegra era.',
  [knownExternalErrors.PoolRegNotTheOwner]: () =>
    'This HW device is not an owner of the pool stated in registration certificate.',
  [knownExternalErrors.PoolRegInvalidFileFormat]: () =>
    'Specified file is not a cli-format pool registration certificate transaction.',
  [knownExternalErrors.PoolRegWithdrawalDetected]: () => 'The transaction must not include withdrawals.',
  [knownExternalErrors.PoolRegInvalidType]: () =>
    'The certificate in transaction is not a pool registration.',
  [knownExternalErrors.PoolRegInvalidNumCerts]: () =>
    'The transaction must include exactly one certificate, being the pool registration.',
  [knownExternalErrors.TrezorRejected]: () =>
    'TrezorRejected: Operation rejected by the Trezor hardware wallet.',
  [knownExternalErrors.DaedalusMnemonic]: () => '',

  [knownExternalErrors.TransportOpenUserCancelled]: ({message}) => {
    const errors = {
      'navigator.usb is undefined': 'Your browser does not support WebUSB, use e.g. Google Chrome instead.',
    }

    return `TransportCanceledByUser: ${message}. ${errors[message] || ''}`
  },
  [knownExternalErrors.TransportError]: ({message}) =>
    `TransportError: ${message}. ${hwWalletTroubleshootingSuggestion}`,
  [knownExternalErrors.TransportStatusError]: ({message}) => {
    const errors = {
      'Failed to sign with Ledger device: U2F DEVICE_INELIGIBLE': hwWalletTroubleshootingSuggestion,
    }
    return `TransportError: ${message}. ${errors[message] || hwWalletTroubleshootingSuggestion}`
  },
  [knownExternalErrors.TransportInterfaceNotAvailable]: ({message}) => {
    const errors = {
      'Unable to claim interface.':
        'Please make sure that no other web page/app is interacting with your Ledger device at the same time.',
    }
    return `TransportInterfaceNotAvailable: ${message} ${errors[message] || ''}`
  },
  [knownExternalErrors.DisconnectedDeviceDuringOperation]: () =>
    `DisconnectedDeviceDuringOperation: ${hwWalletTroubleshootingSuggestion}`,
  [knownExternalErrors.TransportWebUSBGestureRequired]: () =>
    `TransportWebUSBGestureRequired: ${hwWalletTroubleshootingSuggestion}`,
  [knownExternalErrors.NotFoundError]: () => `NotFoundError: ${hwWalletTroubleshootingSuggestion}`,
  [knownExternalErrors.AbortError]: () => `NotFoundError: ${hwWalletTroubleshootingSuggestion}`,
  [knownExternalErrors.SecurityError]: () => `Access denied: ${hwWalletTroubleshootingSuggestion}`,
  // happens sometimes for WebHID on MacOS
  [knownExternalErrors.NotAllowedError]: ({message}) =>
    `Failed to open the device.': ${message} ${hwWalletTroubleshootingSuggestion}`,
  [knownExternalErrors.RedundantStakePool]: () => 'This stake pool is already chosen.',
  [knownExternalErrors.DelegationFeeError]: () => 'Unsuccessful delegation fee calculation.',
  [knownExternalErrors.DeviceVersionUnsupported]: ({message}) =>
    `DeviceVersionUnsupported: ${message}. Please make sure you are using the latest version of the Cardano application. You can do this update in Ledger Live > Manager section.  (If you dont see this update available there, please update your Ledger Live and Ledger Firmware first).`,
}

// TODO: refactor this to receive error class as argument intead of code
function getErrorMessage(code: InternalErrorReason | string, params = {}) {
  if (InternalErrorReason[code]) {
    return internalErrorMessages[code](params)
  }
  if (knownExternalErrors[code]) {
    return externalErrorMessages[code](params)
  }
  debugLog(`Error message for ${code} not found!`)
  return null
}

export {getErrorMessage}
