import { useCallback, useEffect, useReducer, useRef, useState } from "react"

export type StoreInitializer<T = any> = (options: {
  get: () => T,
  set: (setter: (s: T) => Partial<T>) => void
}) => T

export type StoreState = Record<string, any>

/**
 * react state store
 * @param initializer
 * @example ```typescript
 *  // outside the component
 *  const commonStore = createStore<StoreState>(({ get, set }) => ({
      counter: 0,
      setCounter: (counter: number) => set(() => ({ counter })),
    })) 
    // in react functional component
    const counter = commonStore.useStore(s => s.counter)
 * ```
 * @returns { getState, setState, useStore }
 */
export function createStore<T = StoreState>(initializer: StoreInitializer<T>) {
  type StateType = ReturnType<StoreInitializer<T>>
  type ListenerFnType = (state: StateType, prev?: StateType) => void

  let state: StateType

  const listeners = new Set<ListenerFnType>()

  const getState: () => StateType = () => state

  const setState = (setter: (s: StateType) => Partial<StateType>) => {
    const currentState = getState()
    const setterResult = setter(currentState)
    state = { ...currentState, ...setterResult }
    listeners.forEach(listener => listener(state, currentState))
  }

  const subscribe = (fn: ListenerFnType) => {
    listeners.add(fn)
    return () => {
      listeners.delete(fn)
    }
  }

  const useStore = createReadStoreHook(
    getState,
    subscribe
  )

  state = initializer({
    get: getState,
    set: setState
  })

  return {
    getState,
    setState,
    useStore,
  }
}

function createReadStoreHook <
  StateType = StoreState,
  SubscribeFn = (...args: any) => void
>(getState: () => StateType, subscribe: SubscribeFn) {
  function useStore(): StateType;
  function useStore<Selected = any>(selector: (s: StateType) => Selected): Selected;
  function useStore<Selected = any>(
    selector: (s: StateType) => Selected,
    equalizer?: (current: Selected, prev: Selected) => boolean | undefined
  ): Selected;
  function useStore<Selected = any>(
    selector?: (s: StateType) => Selected,
    equalizer?: (current: Selected, prev: Selected) => boolean | undefined
  ) {
    const currentRef = useRef(
      selector ? selector(getState()) : getState()
    )

    const [, forceUpdate] = useReducer(version => version + 1, 0)

    const selectorRef = useRef<typeof selector>()
    const equalizerRef = useRef<typeof equalizer>()

    selectorRef.current = selector
    equalizerRef.current = equalizer

    const dispatch = useCallback((newState: StateType) => {
      const selectorFn = selectorRef.current

      if (!selectorFn) {
        currentRef.current = newState
        forceUpdate()
        return
      }

      const selectedState = selectorFn(newState)

      if (!Object.is(selectedState, currentRef.current)) {
        // custom equalizer
        const equalizerFn = equalizerRef.current
        if (
          typeof equalizerFn === 'function' &&
          !equalizerFn(selectedState, currentRef.current as Selected)
        ) {
          return
        }
        currentRef.current = selectedState
        forceUpdate()
      }
    }, [])

    useEffect(() => {
      if (typeof subscribe === 'function') {
        return subscribe(dispatch)
      }
      return (() => {})
    }, [dispatch])

    return currentRef.current
  }

  return useStore
}