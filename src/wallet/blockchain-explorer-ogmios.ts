import request from './helpers/request'
import BigNumber from 'bignumber.js'
import {
  HexString,
  Lovelace,
  TxSummaryEntry,
  StakingHistoryObject,
  HostedPoolMetadata,
  NextRewardDetailsFormatted,
  RewardWithMetadata,
  Balance,
  Address,
  Stakepool,
} from '../types'
import {UNKNOWN_POOL_NAME} from './constants'
import {
  NextRewardDetail,
  PoolRecommendationResponse,
  StakingInfoResponse,
  BestSlotResponse,
  TxSubmission,
  StakePoolInfo,
} from './backend-types'
import {UTxO} from './types'
import {aggregateTokenBundles} from './helpers/tokenFormater'
import {StakepoolDataProvider} from '../helpers/dataProviders/types'
import {InternalError, InternalErrorReason} from '../errors'
import cacheResults from '../helpers/cacheResults'
import {
  createInteractionContext,
  createStateQueryClient,
  createTxSubmissionClient,
  InteractionContext,
} from '@cardano-ogmios/client'
import {StateQueryClient} from '@cardano-ogmios/client/dist/StateQuery'
import {TxSubmissionClient} from '@cardano-ogmios/client/dist/TxSubmission'

/**
 * This is a highly inefficient blockchain explorer method.
 * It uses the deprecated utxo listing, which in itself is running in linear time
 * over all utxos.
 */
const blockchainExplorer = (ADAHIDE_CONFIG) => {
  let _context: InteractionContext | null = null
  let _ogmiosStateQueryClient: StateQueryClient | null = null
  let _ogmiosSubmitClient: TxSubmissionClient | null = null

  async function _getContext() {
    if (!_context) {
      _context = await createInteractionContext(
        (err) => {
          // eslint-disable-next-line no-console
          console.error(err)
          throw err
        },
        () => {
          // eslint-disable-next-line no-console
          console.log('Connection closed.')
          _context = null
          _ogmiosStateQueryClient = null
          _ogmiosSubmitClient = null
        },
        {connection: {port: ADAHIDE_CONFIG.OGMIOS_PORT}}
      )
    }
    return _context
  }

  async function _getQueryClient() {
    if (!_ogmiosStateQueryClient) {
      const context = await _getContext()
      const client = await createStateQueryClient(context)
      _ogmiosStateQueryClient = client
    }
    return _ogmiosStateQueryClient
  }

  async function _getSubmitCient() {
    if (!_ogmiosSubmitClient) {
      const context = await _getContext()
      const client = await createTxSubmissionClient(context)
      _ogmiosSubmitClient = client
    }
    return _ogmiosSubmitClient
  }

  const {fn: cachedUtxos, invalidate: invalidateUtxoCache} = cacheResults(10000)(
    async (addresses: string[]) => {
      if (!addresses || addresses.length === 0) {
        return []
      }
      const client = await _getQueryClient()
      return client.utxo(addresses)
    }
  )

  function getTxHistory(_addresses: Array<string>): Promise<TxSummaryEntry[]> {
    // ⚠️ @TODO reimplement it
    return Promise.resolve([])
  }

  async function fetchUnspentTxOutputs(addresses: Array<string>): Promise<UTxO[]> {
    const utxos = await cachedUtxos(addresses)
    return utxos.map(
      ([txIn, txOut]): UTxO => ({
        address: txOut.address as Address,
        coins: new BigNumber(String(txOut.value.coins)) as Lovelace,
        outputIndex: txIn.index,
        txHash: txIn.txId,
        tokenBundle: Object.entries(txOut.value.assets ?? {}).map(([asset, quantity]) => ({
          policyId: asset.split('.')[0],
          assetName: asset.split('.')[1] || '',
          quantity: new BigNumber(String(quantity)),
        })),
      })
    )
  }

  async function isSomeAddressUsed(addresses: Array<string>): Promise<boolean> {
    // NOTE this is not ideal and might be heavy just to get these addresses
    // ideally use a completely different method to detect if an account is used
    const utxos = await cachedUtxos(addresses)
    return utxos.length > 0
  }

  async function submitTxRaw(txHash, txBody, _params): Promise<TxSubmission> {
    const submitClient = await _getSubmitCient()

    try {
      await submitClient.submitTx(txBody)
    } catch (err) {
      throw new InternalError(InternalErrorReason.TransactionRejectedByNetwork, {message: err.message})
    }

    return {
      txHash,
    }
  }

  async function getBalance(addresses: Array<string>): Promise<Balance> {
    const utxos = await fetchUnspentTxOutputs(addresses)
    return {
      coins: BigNumber.sum(new BigNumber(0), ...utxos.map((utxo) => utxo.coins)) as Lovelace,
      tokenBundle: aggregateTokenBundles(utxos.map((utxo) => utxo.tokenBundle)),
    }
  }

  async function fetchTxInfo(txHash: string): Promise<boolean> {
    // ⚠️
    // NOTE this is a waste of space callback. The only place it's used to check
    // if a tx appeared on chain. For this it would be enough to check if there
    // is an utxo with this txhash
    // this is kind of cheating, as the utxo could be spent right away, so
    // it is not an ideal way how to check if it exists
    const client = await _getQueryClient()
    const utxos = await client.utxo([{txId: txHash, index: 0}])
    return utxos.length > 0
  }

  function filterUsedAddresses(addresses: Array<string>): Promise<Set<string>> {
    // ⚠️
    // Note, here cheating again. Assume that all addresses are used
    return Promise.resolve(new Set(addresses))
  }

  async function getPoolInfo(url: string): Promise<HostedPoolMetadata> {
    const response: HostedPoolMetadata = await request(url, 'GET').catch(() => {
      return {}
    })

    return response
  }

  function getStakingHistory(
    stakingKeyHashHex: HexString,
    validStakepoolDataProvider: StakepoolDataProvider
  ): Promise<StakingHistoryObject[]> {
    return Promise.resolve([])
  }

  async function getRewardDetails(
    nextRewardDetails: Array<NextRewardDetail>,
    currentDelegationPoolHash: string,
    validStakepoolDataProvider: StakepoolDataProvider,
    epochsToRewardDistribution: number
  ): Promise<NextRewardDetailsFormatted> {
    // ⚠️ COPYPATE from the adalite blockchain explorer
    const getPool = async (poolHash: string): Promise<StakePoolInfo | HostedPoolMetadata> => {
      const stakePool = validStakepoolDataProvider.getPoolInfoByPoolHash(poolHash)
      if (stakePool?.name) {
        return stakePool
      }
      const poolInfo = stakePool ? await getPoolInfo(stakePool.url) : null
      return poolInfo && 'name' in poolInfo ? poolInfo : ({name: UNKNOWN_POOL_NAME} as HostedPoolMetadata)
    }

    const nextRewardDetailsWithMetaData: Array<RewardWithMetadata> = await Promise.all(
      nextRewardDetails.map(async (nextRewardDetail: NextRewardDetail) => {
        const poolHash = nextRewardDetail.poolHash
        if (poolHash) {
          return {
            ...nextRewardDetail,
            distributionEpoch: nextRewardDetail.forEpoch + epochsToRewardDistribution,
            pool: await getPool(nextRewardDetail.poolHash),
          }
        } else {
          return {
            ...nextRewardDetail,
            pool: {},
          }
        }
      })
    )
    const sortedValidRewardDetails = nextRewardDetailsWithMetaData
      .filter((rewardDetail) => rewardDetail.poolHash != null)
      .sort((a, b) => a.forEpoch - b.forEpoch)
    const nearestRewardDetails = sortedValidRewardDetails[0]
    const currentDelegationRewardDetails = sortedValidRewardDetails.find(
      (rewardDetail) => rewardDetail.poolHash === currentDelegationPoolHash
    )

    return {
      upcoming: nextRewardDetailsWithMetaData,
      nearest: nearestRewardDetails,
      currentDelegation: currentDelegationRewardDetails,
    }
  }

  function getPoolRecommendation(
    _poolHash: string,
    _stakeAmount: Lovelace
  ): Promise<PoolRecommendationResponse> {
    // ⚠️ WARN
    // this gives invalid data
    return Promise.resolve({
      recommendedPoolHash: '',
      isInRecommendedPoolSet: true,
      status: 'GivedPoolOk',
      isInPrivatePoolSet: false,
      isRecommendationPrivate: false,
    } as unknown as PoolRecommendationResponse)
  }

  async function getStakingInfo(stakingKeyHashHex: HexString): Promise<StakingInfoResponse> {
    const client = await _getQueryClient()
    const currentEpoch = await client.currentEpoch()
    const stakingHash = stakingKeyHashHex.substring(2) // header
    const stakeInfo = (await client.delegationsAndRewards([stakingHash]))[stakingHash]
    if (stakeInfo && stakeInfo.delegate) {
      const poolParams = (await client.poolParameters([stakeInfo.delegate]))[stakeInfo.delegate]
      const poolInfo = poolParams.metadata ? await getPoolInfo(poolParams.metadata?.url) : {}
      return {
        currentEpoch,
        nextRewardDetails: [],
        rewards: String(stakeInfo.rewards || '0'),
        delegation: {...poolInfo} as StakingInfoResponse['delegation'],
        hasStakingKey: true,
      }
    }
    return {
      currentEpoch,
      delegation: {} as StakingInfoResponse['delegation'],
      hasStakingKey: false,
      nextRewardDetails: [],
      rewards: '0',
    }
  }

  async function getBestSlot(): Promise<BestSlotResponse> {
    const client = await _getQueryClient()
    const chainTip = await client.chainTip()
    return {
      Right: {
        bestSlot: typeof chainTip === 'string' ? 0 : chainTip.slot,
      },
    }
  }

  async function getStakepoolDataProvider(): Promise<StakepoolDataProvider> {
    // TODO add stake pool information

    const client = await _getQueryClient()
    const poolIds = await client.poolIds()
    const poolInfoByHash = await client.poolParameters(poolIds)

    return {
      getPoolInfoByPoolHash(poolHash: string): Stakepool | null {
        const params = poolInfoByHash[poolHash]
        if (!params) {
          return null
        }
        return {
          fixedCost: params.cost.toString(),
          homepage: params.metadata?.url || params.id,
          margin: Number(params.margin),
          name: params.metadata?.hash || '',
          pledge: params.pledge.toString(),
          poolHash: params.id,
          ticker: '',
          url: params.metadata?.url || '',
        }
      },
      getPoolInfoByTicker(ticker) {
        return null
      },
      hasTickerMapping: false,
    }
  }

  function invalidateCache() {
    invalidateUtxoCache()
  }

  return {
    getTxHistory,
    fetchUnspentTxOutputs,
    isSomeAddressUsed,
    submitTxRaw,
    getBalance,
    fetchTxInfo,
    filterUsedAddresses,
    getPoolInfo,
    getStakingHistory,
    getRewardDetails,
    getPoolRecommendation,
    getStakingInfo,
    getBestSlot,
    getStakepoolDataProvider,
    invalidateCache,
  }
}

export default blockchainExplorer
