import {connect} from 'unistore/react'
import {useStore as _useStore, useSelector as _useSelector} from '../libs/unistore-hooks'
import {mapActions} from 'unistore/src/util'
// (eslint is confused with types)
// eslint-disable-next-line
import {State} from '../state'
import {useMemo} from 'react'

// Note(ppershing): Enjoy generic insanity!

type StripStateArg<Fn> = Fn extends (state: State, ...rest: infer T) => any
  ? (...rest: T) => ReturnType<Fn>
  : never

type BindActions<UnboundActions> = {[K in keyof UnboundActions]: StripStateArg<UnboundActions[K]>}

const useStore: any = _useStore

type UseSelector = <T>(selector: (state: State) => T, isEqual?: (a: Object, b: Object) => boolean) => T
const useSelector: UseSelector = _useSelector

type UseActions = <T>(actions: (store: any) => T) => BindActions<T>
const useActions: UseActions = (actions) => {
  const store = useStore()
  return useMemo(() => mapActions(actions, store), [actions, store])
}

export {useStore, useSelector, useActions, connect}
