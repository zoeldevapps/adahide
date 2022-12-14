import inject from '@rollup/plugin-inject'
import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'
import dotenv from 'dotenv'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import {visualizer} from 'rollup-plugin-visualizer'

// TODO add production envvars
dotenv.config()

const APP_VERSION = '0.0.1'

const CSP_DIRECTIVES = {
  'default-src': ["'self'"],
  'frame-src': [
    "'self'",
    'https://connect.trezor.io/*',
    'https://connect.trezor.io/',
    'https://widget.changelly.com/',
    'https://www.youtube.com/',
  ],
  // Forbid rendering of our page in <iframe /> in order to prevent clickjacking attack
  // Note, it is not supported by IE, but IE is already officially deprecated
  'frame-ancestors': ["'none'"],
  // advised for backwards compatibility of `frame-ancestors`
  'child-src': ["'none'"],
  'form-action': ['https://formspree.io'],
  // `base-uri` prevents the injection of unauthorized <base /> tags which can be used to redirect
  // all relative URLs (like scripts) to an attacker-controlled domain.
  'base-uri': ["'none'"],
  'connect-src': ['*'],
  'img-src': ["'self'", 'data:'],
  'script-src': [
    "'self' 'unsafe-eval'",
    /*
     * hash of the inline script used to test browser compatibility
     * you need to update it manually if it changes.
     * Google Chrome displays the proper hash in the console
     * if you try to load the page and the hash does not match.
     */
    "'sha256-hnF01G4lUcBRBGAqTTfng1Jl9ifL4iDk3r3e9AKUsoU='",
    "'unsafe-inline'", // for backwards compatibility; unsafe-inline is ignored if a nonce or a hash is present. (CSP2 and above)
  ],
  'style-src': ["'self'", "'unsafe-inline'"],
  'object-src': ["'none'"],
  'worker-src': ["'none'"],
}
const CSP_CONTENT = Object.entries(CSP_DIRECTIVES)
  .map(([key, value]) => `${key} ${value.join(' ')};`)
  .join(' ')
const {
  OGMIOS_HOST,
  OGMIOS_PORT,
  EXPLORER,
  ASSET_SERVER_URL,
  ADAHIDE_DEMO_WALLET_MNEMONIC,
  ADAHIDE_LOGOUT_AFTER,
  ADAHIDE_TREZOR_CONNECT_URL,
  ADAHIDE_SENTRY_DSN,
  ADAHIDE_NETWORK,
  ADAHIDE_ENABLE_BITBOX02,
  ADAHIDE_ENABLE_TREZOR,
  ADAHIDE_ENABLE_LEDGER,
  ADAHIDE_NEXT_VOTING_START,
  ADAHIDE_NEXT_VOTING_END,
  ADAHIDE_NEXT_VOTING_ROUND_NAME,
} = process.env

// TODO clean these up
// or move under VITE_ flags
const DATA_CONFIG = JSON.stringify({
  OGMIOS_HOST,
  OGMIOS_PORT,
  EXPLORER,
  ASSET_SERVER_URL,
  ADAHIDE_DEMO_WALLET_MNEMONIC,
  ADAHIDE_APP_VERSION: APP_VERSION,
  ADAHIDE_LOGOUT_AFTER,
  ADAHIDE_TREZOR_CONNECT_URL,
  ADAHIDE_SENTRY_DSN,
  ADAHIDE_NETWORK,
  ADAHIDE_ENABLE_BITBOX02: ADAHIDE_ENABLE_BITBOX02 === 'true',
  ADAHIDE_ENABLE_TREZOR: ADAHIDE_ENABLE_TREZOR === 'true',
  ADAHIDE_ENABLE_LEDGER: ADAHIDE_ENABLE_LEDGER === 'true',
  ADAHIDE_NEXT_VOTING_START: Date.parse(ADAHIDE_NEXT_VOTING_START || ''),
  ADAHIDE_NEXT_VOTING_END: Date.parse(ADAHIDE_NEXT_VOTING_END || ''),
  ADAHIDE_NEXT_VOTING_ROUND_NAME,
})

const htmlPlugin = () => {
  return {
    name: 'html-replace-vars',
    transformIndexHtml(html) {
      return html
        .replace(/APP_VERSION/g, APP_VERSION)
        .replace(/CSP_CONTENT/g, CSP_CONTENT)
        .replace(/TREZOR_CONNECT_URL/g, process.env.ADAHIDE_TREZOR_CONNECT_URL)
        .replace(/DATA_CONFIG/g, DATA_CONFIG)
    },
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: Number(process.env.PORT || 3000),
    https: true,
  },
  plugins: [htmlPlugin(), react(), basicSsl(), visualizer()],
  build: {
    manifest: true, // used to detect build changes
    rollupOptions: {
      plugins: [
        inject({
          Buffer: ['buffer', 'Buffer'],
          process: 'process',
        }),
      ],
    },
  },
  resolve: {
    alias: {
      path: 'path-browserify',
      stream: 'stream-browserify',
      'babel-runtime': '@babel/runtime', // so both ledger and trezor-connect use the same library for babel runtime
      bip39: 'bip39-light',
    },
  },
})
