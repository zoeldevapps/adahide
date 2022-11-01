import {setMockState, setupInitialMockState} from './actions.spec'
import {ADAHIDE_CONFIG} from '../../../src/config'
import mockNetwork from '../common/mock'
import {CryptoProviderType} from '../../../src/wallet/types'
import mnemonicToWalletSecretDef from '../../../src/wallet/helpers/mnemonicToWalletSecretDef'
import assert from 'assert'
import {walletSettings} from '../common/wallet-settings'
import {AssetFamily, TxType} from '../../../src/types'
import BigNumber from 'bignumber.js'

let state, action

beforeEach(() => {
  ;[state, action] = setupInitialMockState()
})

before(() => {
  ADAHIDE_CONFIG.ADAHIDE_NETWORK = 'MAINNET'
  const mockNet = mockNetwork(ADAHIDE_CONFIG)
  mockNet.mockBulkAddressSummaryEndpoint()
  mockNet.mockGetAccountInfo()
  mockNet.mockGetStakePools()
  mockNet.mockGetConversionRates()
  mockNet.mockUtxoEndpoint()
  mockNet.mockPoolMeta()
  mockNet.mockGetAccountState()
  mockNet.mockAccountDelegationHistory()
  mockNet.mockAccountStakeRegistrationHistory()
  mockNet.mockWithdrawalHistory()
  mockNet.mockRewardHistory()
  mockNet.mockPoolRecommendation()
  mockNet.mockTokenRegistry()
})

const loadTestWallet = async (mockState) => {
  await action.loadWallet(state, {
    cryptoProviderType: CryptoProviderType.WALLET_SECRET,
    walletSecretDef: await mnemonicToWalletSecretDef(walletSettings.Shelley15Word.secret),
  })
  setMockState(state, mockState)
}

const sendAdaTxSettings = {
  sendAda: {
    state: {
      sendAddress: {
        fieldValue:
          'addr1qjag9rgwe04haycr283datdrjv3mlttalc2waz34xcct0g4uvf6gdg3dpwrsne4uqng3y47ugp2pp5dvuq0jqlperwj83r4pwxvwuxsgds90s0',
      },
      sendAmount: {
        assetFamily: AssetFamily.ADA,
        fieldValue: '1',
        coins: new BigNumber(1500000),
      },
    },
    transactionSummary: {
      fee: new BigNumber(177882),
    },
  },
  // TODO:
  // sendToken: {
  //   sendAddress: {
  //     fieldValue:
  //       'addr1qjag9rgwe04haycr283datdrjv3m
  //lttalc2waz34xcct0g4uvf6gdg3dpwrsne4uqng3y47ugp2pp5dvuq0jqlperwj83r4pwxvwuxsgds90s0',
  //   },
  //   state: {
  //     sendAmount: {assetFamily: AssetFamily.TOKEN, fieldValue: '2', token: {
  //       policyId: 'ca37dd6b151b6a1d023ecbd22d7e881d814b0c58a3a3148b42b865a0',
  //       assetName: '7365636f6e646173736574',
  //       quantity: 2,
  //     }},
  //   },
  //   transactionSummary: {
  //     fee: 176871,
  //   },
  // },
}

const delegationSettings = {
  delegation: {
    state: {
      activeMainTab: 'Staking',
      shelleyDelegation: {
        selectedPool: {
          poolHash: '04c60c78417132a195cbb74975346462410f72612952a7c4ade7e438',
        },
      },
    },
    transactionSummary: {
      fee: new BigNumber(191022),
    },
  },
}

const withdrawalSettings = {
  rewardWithdrawal: {
    state: {},
    transactionSummary: {
      fee: new BigNumber(182189),
    },
  },
}

const votingSettings = {
  voting: {
    state: {},
    votingPubKey: '2145823c77df07a43210af5422e6447bb4d1f44f1af81a261205146cc67d2cf0',
    transactionSummary: {
      fee: new BigNumber(182804),
    },
  },
}

describe('Send ADA fee calculation', () => {
  Object.entries(sendAdaTxSettings).forEach(([name, setting]) =>
    it(`should calculate fee for tx with ${name}`, async () => {
      await loadTestWallet(setting.state)
      action.calculateFee()
      assert.deepEqual(state.transactionSummary.fee, setting.transactionSummary.fee)
    })
  )
})

describe('Delegation fee calculation', () => {
  Object.entries(delegationSettings).forEach(([name, setting]) =>
    it(`should calculate fee for tx with ${name}`, async () => {
      await loadTestWallet(setting.state)
      await action.calculateDelegationFee(setting.state)
      assert.deepEqual(state.cachedTransactionSummaries[TxType.DELEGATE].fee, setting.transactionSummary.fee)
    })
  )
})

describe('Withdrawal fee calculation', () => {
  Object.entries(withdrawalSettings).forEach(([name, setting]) =>
    it(`should calculate fee for tx with ${name}`, async () => {
      await loadTestWallet(setting.state)
      await action.withdrawRewards(state)
      assert.deepEqual(state.transactionSummary.fee, setting.transactionSummary.fee)
    })
  )
})

describe('Voting fee calculation', () => {
  Object.entries(votingSettings).forEach(([name, setting]) =>
    it(`should calculate fee for tx with ${name}`, async () => {
      await loadTestWallet(setting.state)
      await action.registerVotingKey(state, {
        votingPubKey: setting.votingPubKey,
      })
      assert.deepEqual(
        state.cachedTransactionSummaries[TxType.REGISTER_VOTING].fee,
        setting.transactionSummary.fee
      )
    })
  )
})
