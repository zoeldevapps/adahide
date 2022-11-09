import {InternalErrorReason} from '../errors'
import {CryptoProviderFeature} from '../types'
import {Network, NetworkId, ProtocolMagic} from './types'
import BigNumber from 'bignumber.js'

export const HARDENED_THRESHOLD = 0x80000000
export const MAX_INT32 = 2147483647
export const MAX_UINT64 = new BigNumber(2).pow(64).minus(1)
export const MAX_ADDRESS_INFO_AGE = 10000
export const BTC_BLOCKCHAIN_EXPLORER = 'https://www.blockchain.com/btc/address/'
export const ETH_BLOCKCHAIN_EXPLORER = 'https://etherscan.io/address/'
export const BTC_DONATION_ADDRESS = 'bc1qsgf4q99jjxzm7jqmzhm3tzgz5f4zcgnfemauvt'
export const ETH_DONATION_ADDRESS = '0xE43B415C894a06F426EFe42b916b61dA78Fd5C4d'
export const ADA_DONATION_ADDRESS =
  'addr1qx4a4yw54jzq78f5y58ru9yx3cjuwwulq2cnweg2fypqe74xjr24v3vw44mpe4vge0la5lzc7nf3rszlyl9gspjqxvqq9r0v3h'

export const TX_WITNESS_SIZES = {
  byronv2: 139,
  shelley: 139, //TODO: this is too much
  byronV1: 170,
}

export const GAP_LIMIT = 20
export const MAX_TX_SIZE = 16384
export const MAX_TX_OUTPUT_SIZE = 4000
export const CATALYST_SIGNATURE_BYTE_LENGTH = 64
export const METADATA_HASH_BYTE_LENGTH = 32
export const VOTING_PIN_LENGTH = 4

export const PROTOCOL_MAGIC_KEY = 2

export const NETWORKS: {[key: string]: Network} = {
  MAINNET: {
    name: 'mainnet',
    networkId: NetworkId.MAINNET,
    protocolMagic: ProtocolMagic.MAINNET,
    eraStartSlot: 4492800, // 21600 slot x 208 epochs
    eraStartDateTime: Date.parse('29 Jul 2020 21:44:51 UTC'),
    epochsToRewardDistribution: 4,
    minimalOutput: 1000000,
  },
  TESTNET: {
    name: 'public-testnet',
    networkId: NetworkId.TESTNET_OR_PREPROD,
    protocolMagic: ProtocolMagic.TESTNET,
    eraStartSlot: 0,
    eraStartDateTime: Date.parse('24 Jul 2019 20:20:16 UTC'),
    epochsToRewardDistribution: 4,
    minimalOutput: 1000000,
  },
  PREPROD: {
    name: 'preprod',
    networkId: NetworkId.TESTNET_OR_PREPROD,
    protocolMagic: ProtocolMagic.PREPROD,
    eraStartSlot: 86400,
    eraStartDateTime: Date.parse('26 Jun 2022 00:00:00 UTC'),
    epochsToRewardDistribution: 4,
    minimalOutput: 1000000,
  },
}

export const DEFAULT_TTL_SLOTS = 3600 // 1 hour

export const DELAY_AFTER_TOO_MANY_REQUESTS = 2000

export const ADAHIDE_SUPPORT_EMAIL = 'contact@zoeldev.com'

export const SENTRY_USER_FEEDBACK_API =
  'https://sentry.io/api/0/projects/vacuumlabs-sro/adalite-frontend/user-feedback/'

export const UNKNOWN_POOL_NAME = '<Unknown pool>'

export const CATALYST_MIN_THRESHOLD = 500000000

export const WANTED_DELEGATOR_ADDRESSES = []

export const SATURATION_POINT = 66800000000000

export const BITBOX02_VERSIONS = {
  [CryptoProviderFeature.MINIMAL]: {
    major: 9,
    minor: 8,
    patch: 0,
  },
  [CryptoProviderFeature.MULTI_ASSET]: {
    major: 9,
    minor: 9,
    patch: 0,
  },
}

export const BITBOX02_ERRORS = {
  [CryptoProviderFeature.MINIMAL]: InternalErrorReason.BitBox02OutdatedFirmwareError,
}

export const LEDGER_VERSIONS = {
  [CryptoProviderFeature.MINIMAL]: {
    major: 2,
    minor: 0,
    patch: 2,
  },
  [CryptoProviderFeature.WITHDRAWAL]: {
    major: 2,
    minor: 0,
    patch: 4,
  },
  [CryptoProviderFeature.BULK_EXPORT]: {
    major: 2,
    minor: 1,
    patch: 0,
  },
  [CryptoProviderFeature.POOL_OWNER]: {
    major: 2,
    minor: 1,
    patch: 0,
  },
  [CryptoProviderFeature.MULTI_ASSET]: {
    major: 2,
    minor: 2,
    patch: 0,
  },
  [CryptoProviderFeature.VOTING]: {
    major: 2,
    minor: 3,
    patch: 2,
  },
}

export const LEDGER_ERRORS = {
  [CryptoProviderFeature.MINIMAL]: InternalErrorReason.LedgerOutdatedCardanoAppError,
  [CryptoProviderFeature.WITHDRAWAL]: InternalErrorReason.LedgerWithdrawalNotSupported,
  [CryptoProviderFeature.BULK_EXPORT]: InternalErrorReason.LedgerBulkExportNotSupported,
  [CryptoProviderFeature.POOL_OWNER]: InternalErrorReason.LedgerPoolRegNotSupported,
  [CryptoProviderFeature.VOTING]: InternalErrorReason.LedgerCatalystNotSupported,
}

export const TREZOR_VERSIONS = {
  [CryptoProviderFeature.MINIMAL]: {
    major: 2,
    minor: 3,
    patch: 2,
  },
  [CryptoProviderFeature.POOL_OWNER]: {
    major: 2,
    minor: 3,
    patch: 5,
  },
  [CryptoProviderFeature.MULTI_ASSET]: {
    major: 2,
    minor: 3,
    patch: 5,
  },
  [CryptoProviderFeature.VOTING]: {
    major: 2,
    minor: 4,
    patch: 0,
  },
}

export const TREZOR_ERRORS = {
  [CryptoProviderFeature.POOL_OWNER]: InternalErrorReason.TrezorPoolRegNotSupported,
}

export const MAX_ACCOUNT_INDEX = 30
