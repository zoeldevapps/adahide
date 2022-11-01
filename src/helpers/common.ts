import {ADAHIDE_CONFIG} from '../config'
import {TxSummaryEntry, WalletOperationStatusType} from '../types'
import {CaTxEntry} from '../wallet/backend-types'

export const stripNonNumericCharacters = (text: string): string => text.replace(/[^0-9]/gi, '')

type VotingRegistrationStatus =
  | {
      isOpen: true
    }
  | {
      isOpen: false
      explanation: string
    }

export const getVotingRegistrationStatus = (): VotingRegistrationStatus => {
  const now = Date.now()
  if (now < ADAHIDE_CONFIG.ADAHIDE_NEXT_VOTING_START) {
    return {
      isOpen: false,
      explanation: `Registration for ${ADAHIDE_CONFIG.ADAHIDE_NEXT_VOTING_ROUND_NAME} Voting not open yet.`,
    }
  }
  if (now > ADAHIDE_CONFIG.ADAHIDE_NEXT_VOTING_END) {
    return {
      isOpen: false,
      explanation: `Registration for ${ADAHIDE_CONFIG.ADAHIDE_NEXT_VOTING_ROUND_NAME} Voting closed.`,
    }
  }

  return {isOpen: true}
}

export const shouldDisableSendingButton = (walletOperationStatusType: WalletOperationStatusType): boolean =>
  walletOperationStatusType != null &&
  (walletOperationStatusType === 'reloading' ||
    walletOperationStatusType === 'txPending' ||
    walletOperationStatusType === 'txSubmitting')

export function filterValidTransactions<T extends CaTxEntry | TxSummaryEntry>(txs: T[]): T[] {
  // filters txs that did not pass alonzo block script validation
  return txs.filter((tx) => tx.isValid)
}

export function getDateDiffInSeconds(date1: Date, date2: Date) {
  return Math.abs((date1.getTime() - date2.getTime()) / 1000)
}

export function getCardanoscanUrl() {
  return ADAHIDE_CONFIG.ADAHIDE_NETWORK === 'mainnet'
    ? 'https://cardanoscan.io'
    : 'https://testnet.cardanoscan.io'
}
