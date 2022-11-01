import {useSelector} from '../../helpers/connect'
import Branding from './branding'
import {
  BTC_BLOCKCHAIN_EXPLORER,
  BTC_DONATION_ADDRESS,
  ETH_BLOCKCHAIN_EXPLORER,
  ETH_DONATION_ADDRESS,
} from '../../wallet/constants'
import getDonationAddress from '../../helpers/getDonationAddress'
import {getCardanoscanUrl} from '../../helpers/common'

const showRatesOn = ['/txHistory', '/send']

const Footer = () => {
  const showConversionRates = useSelector(
    (state) => showRatesOn.indexOf(state.router.pathname) !== -1 && state.walletIsLoaded
  )

  return (
    <footer className="footer">
      <div className="footer-wrapper">
        <Branding dark={false} />
        <div className="footer-row">
          <div className="social">
            <a
              href="https://github.com/zoeldevapps/adahide"
              target="_blank"
              rel="noopener"
              className="social-link github"
            >
              View on Github
            </a>
            <a
              href="https://twitter.com/adahideio"
              target="_blank"
              rel="noopener"
              className="social-link twitter"
            >
              Twitter
            </a>

            <a
              href="https://discord.gg/5AJgwkepyUo"
              target="_blank"
              rel="noopener"
              className="social-link discord"
            >
              Discord
            </a>
          </div>
          <div className="donations">
            <h3 className="donations-title">Donations are appreciated</h3>
            <a
              className="donations-item bitcoin"
              href={BTC_BLOCKCHAIN_EXPLORER + BTC_DONATION_ADDRESS}
              target="_blank"
              title="Donate via Bitcoin"
              rel="noopener"
            >
              BTC
            </a>
            <a
              className="donations-item ether"
              href={ETH_BLOCKCHAIN_EXPLORER + ETH_DONATION_ADDRESS}
              target="_blank"
              title="Donate via Ethereum"
              rel="noopener"
            >
              ETH
            </a>
            <a
              className="donations-item ada"
              href={`${getCardanoscanUrl()}/address/${getDonationAddress()}`}
              target="_blank"
              title="Donate via Adahide"
              rel="noopener"
            >
              ADA
            </a>
          </div>
        </div>
        {showConversionRates && (
          <div className="conversion">
            Conversion rates from{' '}
            <a
              className="conversion-link"
              href="https://www.cryptocompare.com/api/"
              target="_blank"
              rel="noopener"
            >
              CryptoCompare
            </a>
          </div>
        )}
      </div>
    </footer>
  )
}

export default Footer
