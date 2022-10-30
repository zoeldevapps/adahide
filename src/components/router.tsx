import {connect} from 'unistore/react'

import DashboardPage from './pages/dashboard/dashboardPage'
import MyAddresses from './pages/receiveAda/myAddresses'
import SendPage from './pages/sendAda/sendAdaPage'
import LoginPage from './pages/login/loginPage'
import ExportWalletPage from './pages/exportWallet/exportWalletPage'
import {State} from '../state'

const TopLevelRouter = connect((state: State) => ({
  pathname: state.router.pathname,
  walletIsLoaded: state.walletIsLoaded,
}))(({pathname, walletIsLoaded}) => {
  // unlock not wrapped in main
  const currentTab = pathname.split('/')[1]
  if (!walletIsLoaded && currentTab !== 'staking') {
    window.history.pushState({}, '/', '/')
    return <LoginPage />
  }
  let content
  switch (currentTab) {
    case 'txHistory':
      content = <DashboardPage />
      break
    case 'receive':
      content = <MyAddresses />
      break
    case 'send':
      content = <SendPage />
      break
    case 'exportWallet':
      content = <ExportWalletPage />
      break
    default:
      window.history.pushState({}, 'txHistory', 'txHistory')
      content = <DashboardPage />
  }
  // TODO is Alert used anywhere? if so add here
  return content
})

export {TopLevelRouter}
