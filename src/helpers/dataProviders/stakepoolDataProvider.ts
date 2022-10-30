import {StakePoolInfo, StakePoolInfosByPoolHash} from '../../wallet/backend-types'
import {Stakepool} from '../../types'
import {StakepoolDataProvider} from './types'

const createStakepoolDataProvider = (validStakepools: StakePoolInfosByPoolHash): StakepoolDataProvider => {
  const [tickerMapping, poolHashMapping] = Object.entries(validStakepools).reduce(
    ([tickerMapping, poolHashMapping], entry) => {
      const [key, value]: [string, StakePoolInfo] = entry
      const stakepool = {
        ...value,
        poolHash: key,
      }
      if (stakepool.ticker) tickerMapping[stakepool.ticker] = stakepool
      if (stakepool.poolHash) poolHashMapping[stakepool.poolHash] = stakepool
      return [tickerMapping, poolHashMapping]
    },
    [{}, {}]
  )

  const getPoolInfoByTicker = (ticker: string): Stakepool | null => tickerMapping[ticker] ?? null
  const getPoolInfoByPoolHash = (poolHash: string): Stakepool | null => poolHashMapping[poolHash] ?? null
  const hasTickerMapping = Object.keys(tickerMapping).length !== 0

  return {
    getPoolInfoByTicker,
    getPoolInfoByPoolHash,
    hasTickerMapping,
  }
}

export {createStakepoolDataProvider}
