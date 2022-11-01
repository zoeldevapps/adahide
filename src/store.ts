import devtools from 'unistore/devtools'
import createDefaultStore from 'unistore'
import {ADAHIDE_CONFIG} from './config'
import {initialState} from './state'

const createStore = () =>
  ADAHIDE_CONFIG.ADAHIDE_ENABLE_DEBUGGING === 'true'
    ? devtools(createDefaultStore(initialState))
    : createDefaultStore(initialState)

export {createStore, initialState}
