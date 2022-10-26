import {Account} from './account'
import {CryptoProvider, CryptoProviderFeature} from '../types'
import blockchainExplorer from './blockchain-explorer'
import {UnexpectedError, UnexpectedErrorReason} from '../errors'

type AccountManagerParams = {
  config: any
  cryptoProvider: CryptoProvider
  blockchainExplorer: ReturnType<typeof blockchainExplorer>
  maxAccountIndex: number
}

const AccountManager = ({
  config,
  cryptoProvider,
  blockchainExplorer,
  maxAccountIndex,
}: AccountManagerParams) => {
  const accounts: Array<ReturnType<typeof Account>> = []

  function getAccount(accountIndex: number) {
    return accounts[accountIndex]
  }

  function discoverNextAccount() {
    return Account({
      config,
      cryptoProvider,
      blockchainExplorer,
      accountIndex: accounts.length,
    })
  }

  async function addNextAccount(account) {
    await account.ensureXpubIsExported() // To ensure user exported pubkey
    const isLastAccountUsed = accounts.length > 0 ? await accounts[accounts.length - 1].isAccountUsed() : true
    if (
      account.accountIndex !== accounts.length ||
      !isLastAccountUsed ||
      account.accountIndex > maxAccountIndex
    ) {
      throw new UnexpectedError(UnexpectedErrorReason.AccountExplorationError)
    }
    accounts.push(account)
  }

  async function discoverAccounts() {
    const isBulkExportSupported = cryptoProvider.isFeatureSupported(CryptoProviderFeature.BULK_EXPORT)
    const shouldExplore = config.shouldExportPubKeyBulk && config.isShelleyCompatible && isBulkExportSupported
    async function _discoverNextAccount(accountIndex: number) {
      const newAccount = accounts[accountIndex] || discoverNextAccount()
      const isAccountUsed = await newAccount.isAccountUsed()
      if (accountIndex === accounts.length) await addNextAccount(newAccount)

      return (
        shouldExplore &&
        isAccountUsed &&
        accountIndex < maxAccountIndex &&
        (await _discoverNextAccount(accountIndex + 1))
      )
    }
    await _discoverNextAccount(Math.max(0, accounts.length - 1))
    return accounts
  }

  async function exploreNextAccount() {
    const nextAccount = discoverNextAccount()
    await addNextAccount(nextAccount)
    return nextAccount
  }

  return {
    getAccount,
    discoverAccounts,
    exploreNextAccount,
  }
}

export {AccountManager}
