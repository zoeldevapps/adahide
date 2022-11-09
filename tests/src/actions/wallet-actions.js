import mockNetwork from '../common/mock'
import {ADAHIDE_CONFIG} from '../../../src/config'
import {CryptoProviderType} from '../../../src/wallet/types'
import mnemonicToWalletSecretDef from '../../../src/wallet/helpers/mnemonicToWalletSecretDef'
import assert from 'assert'
import {assertPropertiesEqual, setupInitialMockState} from './actions.spec'
import {walletSettings} from '../common/wallet-settings'
import {AssetFamily} from '../../../src/types'
import BigNumber from 'bignumber.js'

let state, action

beforeEach(() => {
  ;[state, action] = setupInitialMockState()
})

const expectedStateChanges = {
  walletIsLoaded: true,
  loading: false,
  mnemonicAuthForm: {
    mnemonicInputValue: '',
    mnemonicInputError: null,
    formIsValid: false,
  },
  shouldShowGenerateMnemonicDialog: false,
  // send form
  sendAmount: {
    assetFamily: AssetFamily.ADA,
    fieldValue: '',
    coins: new BigNumber(0),
  },
  sendAddress: {fieldValue: ''},
  ticker2Id: null,
}

const expectedStakepool = {
  pledge: '30000000000',
  margin: 0.03,
  fixedCost: '340000000',
  url: 'https://adalite.io/ADLT-metadata.json',
  name: 'AdaLite Stake Pool',
  ticker: 'ADLT',
  homepage: 'https://adalite.io/',
  poolHash: '04c60c78417132a195cbb74975346462410f72612952a7c4ade7e438',
}

it('Should properly load shelley wallet', async () => {
  ADAHIDE_CONFIG.ADAHIDE_NETWORK = 'MAINNET'
  const mockNet = mockNetwork(ADAHIDE_CONFIG)
  mockNet.mockBulkAddressSummaryEndpoint()
  mockNet.mockGetAccountInfo()
  mockNet.mockGetStakePools()
  mockNet.mockGetConversionRates()
  mockNet.mockPoolMeta()
  mockNet.mockGetAccountState()
  mockNet.mockAccountDelegationHistory()
  mockNet.mockAccountStakeRegistrationHistory()
  mockNet.mockWithdrawalHistory()
  mockNet.mockRewardHistory()
  mockNet.mockPoolRecommendation()
  mockNet.mockPoolRecommendation()
  mockNet.mockTokenRegistry()
  mockNet.mockUtxoEndpoint()

  await action.loadWallet(state, {
    cryptoProviderType: CryptoProviderType.WALLET_SECRET,
    walletSecretDef: await mnemonicToWalletSecretDef(walletSettings.Shelley15Word.secret),
    shouldExportPubKeyBulk: true,
  })
  assertPropertiesEqual(state, expectedStateChanges)
  assert.equal(state.accountsInfo[0].visibleAddresses.length, 20)
  assert.deepStrictEqual(
    state.validStakepoolDataProvider.getPoolInfoByPoolHash(
      '04c60c78417132a195cbb74975346462410f72612952a7c4ade7e438'
    ),
    expectedStakepool
  )
  assert.deepStrictEqual(state.validStakepoolDataProvider.getPoolInfoByTicker('ADLT'), expectedStakepool)

  mockNet.clean()
})
