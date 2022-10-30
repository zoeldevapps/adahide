import {Fragment} from 'react'
import {useSelector} from '../../../helpers/connect'
import {ADALITE_CONFIG} from '../../../config'
import assert from 'assert'

type StakePoolLabelProps = {
  isTicker: boolean
  isPoolHash: boolean
  tickerSearchEnabled: boolean
}

const StakePoolLabel = ({isTicker, isPoolHash, tickerSearchEnabled}: StakePoolLabelProps): JSX.Element => (
  <Fragment>
    {tickerSearchEnabled && (
      <Fragment>
        <span className={isTicker ? 'highlight' : ''}>Ticker</span>
        {' or '}
      </Fragment>
    )}
    <span className={isPoolHash ? 'highlight' : ''}>Stake Pool ID</span>
  </Fragment>
)

type Props = {
  disabled: boolean
  value: string
  onChange: (event: any) => any
}

const DelegateInput = ({disabled, value, onChange}: Props): JSX.Element => {
  const {validStakepoolDataProvider} = useSelector((state) => ({
    validStakepoolDataProvider: state.validStakepoolDataProvider,
  }))
  assert(validStakepoolDataProvider != null)

  const isTicker = !!(value && !!validStakepoolDataProvider.getPoolInfoByTicker(value))
  const isPoolHash = !!(value && !!validStakepoolDataProvider.getPoolInfoByPoolHash(value))
  const tickerSearchEnabled = !!(
    ADALITE_CONFIG.ADALITE_ENABLE_SEARCH_BY_TICKER && validStakepoolDataProvider?.hasTickerMapping
  )

  return (
    <Fragment>
      <div className={`stake-pool-input-label ${tickerSearchEnabled ? '' : 'stake-pool-id-only'}`}>
        <StakePoolLabel
          isTicker={isTicker}
          isPoolHash={isPoolHash}
          tickerSearchEnabled={tickerSearchEnabled}
        />
      </div>
      <input
        disabled={disabled}
        type="text"
        className="input stake-pool-id"
        name={'pool'}
        data-cy="PoolDelegationTextField"
        value={value}
        onInput={onChange}
        autoComplete="off"
      />
    </Fragment>
  )
}

export default DelegateInput
