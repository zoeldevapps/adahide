import {Fragment, useState, useEffect, useRef, useCallback} from 'react'
import {useActions, useSelector} from '../../../helpers/connect'
import actions from '../../../actions'
import tooltip from '../../common/tooltip'
import printAda from '../../../helpers/printAda'
import {AdaIcon} from '../../common/svg'
import {getErrorMessage} from '../../../errors'
import {getSourceAccountInfo} from '../../../state'
import Accordion from '../../common/accordion'
import {StakePoolInfo} from './stakePoolInfo'
import DelegateInput from './delegateInput'
import {ADAHIDE_CONFIG} from '../../../config'
import {StakepoolDataProvider} from '../../../helpers/dataProviders/types'
import {shouldDisableSendingButton} from '../../../helpers/common'
import assert from 'assert'

const CalculatingFee = (): JSX.Element => <div className="validation-message send">Calculating fee...</div>

type DelegationValidationProps = {
  delegationValidationError: any
  txSuccessTab: string
}

// REFACTOR: "txSuccessTab", what about using "success notification" instead?
const DelegationValidation = ({
  delegationValidationError,
  txSuccessTab,
}: DelegationValidationProps): JSX.Element =>
  txSuccessTab === 'stake' && !delegationValidationError ? (
    <div className="validation-message transaction-success">Transaction successful!</div>
  ) : (
    delegationValidationError && (
      <div className="validation-message error">{getErrorMessage(delegationValidationError.code)}</div>
    )
  )

// REFACTOR: (Untyped errors): move to types
// is "hasTickerMapping" something specific or general?
type Error = {
  code: string
  params?: {hasTickerMapping: boolean}
}

type ValidatedInput = {
  poolHash: string | null
  error: Error | null
}

const validateInput = (
  fieldValue: string,
  validStakepoolDataProvider: StakepoolDataProvider
): ValidatedInput => {
  const pool =
    validStakepoolDataProvider.getPoolInfoByPoolHash(fieldValue) ||
    validStakepoolDataProvider.getPoolInfoByTicker(fieldValue)
  if (pool) return {poolHash: pool.poolHash, error: null}

  const hasTickerMapping = validStakepoolDataProvider.hasTickerMapping
  const isTickerString = fieldValue.length <= 5 && fieldValue.toUpperCase() === fieldValue
  const poolHash = null
  if (!hasTickerMapping && isTickerString) {
    return {poolHash, error: {code: 'TickerSearchDisabled'}}
  }
  return {poolHash, error: {code: 'InvalidStakepoolIdentifier', params: {hasTickerMapping}}}
}

// TODO: we may create general util from this
const useHandleOnStopTyping = () => {
  const debouncedHandleInputValidation = useRef(0)

  useEffect(() => {
    debouncedHandleInputValidation.current && clearTimeout(debouncedHandleInputValidation.current)
  }, [])

  return (fn: Function, timeout = 200) => {
    clearTimeout(debouncedHandleInputValidation.current)
    debouncedHandleInputValidation.current = window.setTimeout(fn, timeout)
  }
}

interface Props {
  withAccordion: boolean
  title: string
}

const Delegate = ({withAccordion, title}: Props): JSX.Element => {
  const {
    txSuccessTab,
    stakePool,
    currentDelegation,
    calculatingDelegationFee,
    delegationFee,
    delegationValidationError,
    gettingPoolInfo,
    isShelleyCompatible,
    poolRecommendation,
    validStakepoolDataProvider,
    walletOperationStatusType,
  } = useSelector((state) => ({
    // REFACTOR: (Untyped errors)
    delegationValidationError: state.delegationValidationError,
    stakePool: state.shelleyDelegation?.selectedPool,
    currentDelegation: getSourceAccountInfo(state).shelleyAccountInfo.delegation,
    calculatingDelegationFee: state.calculatingDelegationFee,
    delegationFee: state.shelleyDelegation?.delegationFee,
    txSuccessTab: state.txSuccessTab,
    gettingPoolInfo: state.gettingPoolInfo,
    isShelleyCompatible: state.isShelleyCompatible,
    poolRecommendation: getSourceAccountInfo(state).poolRecommendation,
    validStakepoolDataProvider: state.validStakepoolDataProvider,
    walletOperationStatusType: state.walletOperationStatusType,
  }))
  const {delegate, updateStakePoolIdentifier, resetStakePoolIndentifier} = useActions(actions)
  const handleOnStopTyping = useHandleOnStopTyping()

  const [fieldValue, setFieldValue] = useState('')
  const [error, setError] = useState<Error | null>(null)

  const handleInputValidation = useCallback(
    (value: string) => {
      if (!value) {
        resetStakePoolIndentifier()
        setError(null)
      } else {
        assert(validStakepoolDataProvider != null)
        const {poolHash, error} = validateInput(value, validStakepoolDataProvider)
        if (!error) {
          assert(poolHash != null)
          updateStakePoolIdentifier(poolHash)
        } else {
          resetStakePoolIndentifier()
        }
        setError(error)
      }
      /*
      Relates to REFACTOR (calculateFee):
      This component should store all `txPlan` and `error` states & render confirmation modal
      when user clicks on "Delegate". This could greatly simplify global state flow. For now
      using hybrid solution involving `updateStakePoolIdentifier` (should be later removed)
      */
    },
    [validStakepoolDataProvider, updateStakePoolIdentifier, resetStakePoolIndentifier]
  )

  const handleOnInput = (event: any): void => {
    const newValue: string = event?.target?.value
    setFieldValue(newValue)
    handleOnStopTyping(() => handleInputValidation(newValue), 100)
  }

  // init "stake pool input" and refresh it when "currentDelegation" changes
  useEffect(() => {
    const poolHash = currentDelegation?.poolHash

    if (poolHash) {
      setFieldValue(poolHash)
      handleInputValidation(poolHash)
    }
  }, [currentDelegation, handleInputValidation, poolRecommendation])

  const delegationHandler = async (): Promise<void> => await delegate()

  const validationError = !!delegationValidationError || !!error || !stakePool

  const delegationHeader = <h2 className="card-title no-margin">{title}</h2>
  const delegationContent = (
    <Fragment>
      <div>
        <ul className="stake-pool-list">
          <li className="stake-pool-item">
            <DelegateInput
              disabled={shouldDisableSendingButton(walletOperationStatusType)}
              value={fieldValue}
              onChange={handleOnInput}
            />
            <StakePoolInfo pool={stakePool} gettingPoolInfo={gettingPoolInfo} validationError={error} />
            <div />
          </li>
        </ul>
      </div>

      <div className="delegation-info-row">
        <label className="fee-label">
          Fee
          <AdaIcon />
        </label>
        <div className="delegation-fee" data-cy="DelegateFeeAmount">
          {delegationFee ? printAda(delegationFee) : ''}
        </div>
      </div>
      <div className="validation-row">
        <button
          {...tooltip(
            'Cannot delegate funds while transaction is pending or reloading',
            shouldDisableSendingButton(walletOperationStatusType)
          )}
          className="button primary medium"
          disabled={
            !isShelleyCompatible ||
            validationError ||
            calculatingDelegationFee ||
            !stakePool?.poolHash ||
            shouldDisableSendingButton(walletOperationStatusType)
          }
          data-cy="DelegateButton"
          onClick={delegationHandler}
          {...tooltip(
            'You are using Shelley incompatible wallet. To delegate your ADA, follow the instructions to convert your wallet.',
            !isShelleyCompatible
          )}
        >
          Delegate
        </button>
        {[
          calculatingDelegationFee ? (
            <CalculatingFee />
          ) : (
            <DelegationValidation
              delegationValidationError={delegationValidationError}
              txSuccessTab={txSuccessTab}
            />
          ),
        ]}
      </div>
    </Fragment>
  )

  return (
    <div className="delegate card">
      {withAccordion ? (
        <Accordion
          initialVisibility={
            poolRecommendation.shouldShowSaturatedBanner || !Object.keys(currentDelegation).length
          }
          header={delegationHeader}
          body={delegationContent}
        />
      ) : (
        <Fragment>
          {delegationHeader}
          {delegationContent}
        </Fragment>
      )}
    </div>
  )
}

Delegate.defaultProps = {
  withAccordion: true,
  title: 'Delegate Stake',
}

export default Delegate
