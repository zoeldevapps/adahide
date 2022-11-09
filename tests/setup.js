// eslint-disable-next-line import/no-restricted-paths
const {JSDOM} = require('jsdom')

global.window = new JSDOM(`
<html>
<head>
  <meta charset="utf-8">
  <title>AdaLite Test Suite</title>
<body data-config='{"ADAHIDE_SERVER_URL":"https://adalite.io","ADAHIDE_BLOCKCHAIN_EXPLORER_URL":"https://explorer.adalite.io","ADAHIDE_APP_VERSION":"6.10.9","ADAHIDE_LOGOUT_AFTER":"900","ADAHIDE_SENTRY_DSN":"https://d77d3bf9d9364597badab9c00fa59a31@sentry.io/1501383","ADAHIDE_NETWORK":"MAINNET","ADAHIDE_ENABLE_BITBOX02":true,"ADAHIDE_ENABLE_TREZOR":true,"ADAHIDE_ENABLE_LEDGER":true,"ADAHIDE_NEXT_VOTING_START":1654858800000,"ADAHIDE_NEXT_VOTING_END":1659610800000,"ADAHIDE_NEXT_VOTING_ROUND_NAME":"Fund9"}'>
</body>
</html>
`).window

global.document = global.window.document
