// eslint-disable-next-line import/no-restricted-paths
const {JSDOM} = require('jsdom')

global.window = new JSDOM(`
<html>
<head>
  <meta charset="utf-8">
  <title>AdaLite Test Suite</title>
<body data-config='{"ADAHIDE_SERVER_URL":"https://adalite.io","ADAHIDE_BLOCKCHAIN_EXPLORER_URL":"https://explorer.adalite.io","ADAHIDE_DEFAULT_ADDRESS_COUNT":10,"ADAHIDE_GAP_LIMIT":20,"ADAHIDE_DEMO_WALLET_MNEMONIC":"hill safe victory sun tired fetch police radio sport output buyer deny april fringe stumble","ADAHIDE_APP_VERSION":"6.10.9","ADAHIDE_LOGOUT_AFTER":"900","ADAHIDE_BACKEND_TOKEN":"EhZQChlZHvaPDLqyU","ADAHIDE_FIXED_DONATION_VALUE":"40","ADAHIDE_MIN_DONATION_VALUE":"1","ADAHIDE_STAKE_POOL_ID":"d785ff6a030ae9d521770c00f264a2aa423e928c85fc620b13d46eda","ADAHIDE_ENV":"production","ADAHIDE_SENTRY_DSN":"https://d77d3bf9d9364597badab9c00fa59a31@sentry.io/1501383","ADAHIDE_DEVEL_AUTO_LOGIN":"false","ADAHIDE_ERROR_BANNER_CONTENT":"BEWARE, THERE ARE MULTIPLE WEBSITES LOOKING EXACTLY AS ADAHIDE THAT WILL STEAL YOUR FUNDS. ALWAYS MAKE SURE YOU ARE VISITING https://adalite.io","ADAHIDE_NETWORK":"MAINNET","ADAHIDE_ENABLE_BITBOX02":true,"ADAHIDE_ENABLE_TREZOR":true,"ADAHIDE_ENABLE_LEDGER":true,"ADAHIDE_ENFORCE_STAKEPOOL":false,"ADAHIDE_ENABLE_SEARCH_BY_TICKER":false,"ADAHIDE_NEXT_VOTING_START":1654858800000,"ADAHIDE_NEXT_VOTING_END":1659610800000,"ADAHIDE_NEXT_VOTING_ROUND_NAME":"Fund9"}'>
</body>
</html>
`).window

global.document = global.window.document
