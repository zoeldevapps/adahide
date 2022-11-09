const config = `{
  "ADAHIDE_SERVER_URL": "https://localhost:3000",
  "ADAHIDE_BLOCKCHAIN_EXPLORER_URL": "https://test-test.adalite.io",
  "ADAHIDE_DEFAULT_ADDRESS_COUNT": 10,
  "ADAHIDE_GAP_LIMIT": 20,
  "ADAHIDE_DEMO_WALLET_MNEMONIC": "quit gloom sell coil mosquito capital silk climb around fabric drink hood patient more whip",
  "ADAHIDE_APP_VERSION": "3.7.0",
  "ADAHIDE_LOGOUT_AFTER": "900",
  "ADAHIDE_TREZOR_CONNECT_URL": "",
  "ADAHIDE_FIXED_DONATION_VALUE": "40",
  "ADAHIDE_MIN_DONATION_VALUE": "1",
  "ADAHIDE_STAKE_POOL_ID": "f61c42cbf7c8c53af3f520508212ad3e72f674f957fe23ff0acb49733c37b8f6",
  "ADAHIDE_ENV": "local",
  "ADAHIDE_DEVEL_AUTO_LOGIN": "false"
}`

document.body.setAttribute('data-config', config)
