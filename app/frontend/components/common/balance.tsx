import printAda from '../../helpers/printAda'
import Conversions from './conversions'
import {AdaIcon} from './svg'
import actions from '../../actions'
import {useSelector, useActions} from '../../helpers/connect'
import styles from './balance.module.scss'
import {useActiveAccount} from '../../selectors'

const Balance = () => {
  const {debouncedReloadWalletInfo} = useActions(actions)
  const {balance} = useActiveAccount()
  const {conversionRates} = useSelector((state) => ({
    conversionRates: state.conversionRates?.data,
  }))
  return (
    <div className="balance card">
      <h2 className={`card-title ${styles.balanceTitle}`}>Available balance</h2>
      <div className={styles.balanceRow}>
        <div className="balance-amount" data-cy="SendBalanceAmount">
          <>
            {isNaN(Number(balance)) ? balance : `${printAda(balance)}`}
            <AdaIcon />
          </>
        </div>
        <button className={'button secondary balance refresh'} onClick={debouncedReloadWalletInfo}>
          Refresh
        </button>
      </div>
      {conversionRates && <Conversions balance={balance} conversionRates={conversionRates} />}
      <div className="buy-ada-partner-wrapper">
        <a className="button primary outline buy-ada-partner-link" href="/exchange" target="_blank">
          Buy/Sell ADA
        </a>
        <span className="buy-ada-partner-logo">
          <div>Powered by</div>
          <div>
            <strong>Changelly</strong>
          </div>
        </span>
      </div>
    </div>
  )
}

export default Balance
