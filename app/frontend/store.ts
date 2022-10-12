import devtools from 'unistore/devtools'
import createDefaultStore from 'unistore'
import {ADALITE_CONFIG} from './config'
import {initialState} from './state'

const createStore = () =>
  ADALITE_CONFIG.ADALITE_ENABLE_DEBUGGING === 'true'
    ? devtools(createDefaultStore(initialState))
    : createDefaultStore(initialState)

export {createStore, initialState}
