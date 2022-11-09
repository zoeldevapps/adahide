import createDefaultStore from 'unistore'
import {initialState} from './state'

const createStore = () => createDefaultStore(initialState)

export {createStore, initialState}
