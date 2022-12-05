import { useCallback, useEffect, useReducer, useRef } from "react";
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
export function createStore(initializer) {
    let state;
    const listeners = new Set();
    const getState = () => state;
    const setState = (setter) => {
        const currentState = getState();
        const setterResult = setter(currentState);
        state = Object.assign(Object.assign({}, currentState), setterResult);
        listeners.forEach(listener => listener(state, currentState));
    };
    const subscribe = (fn) => {
        listeners.add(fn);
        return () => {
            listeners.delete(fn);
        };
    };
    const useStore = createReadStoreHook(getState, subscribe);
    state = initializer({
        get: getState,
        set: setState
    });
    return {
        getState,
        setState,
        useStore,
    };
}
function createReadStoreHook(getState, subscribe) {
    function useStore(selector, equalizer) {
        const currentRef = useRef(selector ? selector(getState()) : getState());
        const [, forceUpdate] = useReducer(version => version + 1, 0);
        const selectorRef = useRef();
        const equalizerRef = useRef();
        selectorRef.current = selector;
        equalizerRef.current = equalizer;
        const dispatch = useCallback((newState) => {
            const selectorFn = selectorRef.current;
            if (!selectorFn) {
                currentRef.current = newState;
                forceUpdate();
                return;
            }
            const selectedState = selectorFn(newState);
            if (!Object.is(selectedState, currentRef.current)) {
                // custom equalizer
                const equalizerFn = equalizerRef.current;
                if (typeof equalizerFn === 'function' &&
                    !equalizerFn(selectedState, currentRef.current)) {
                    return;
                }
                currentRef.current = selectedState;
                forceUpdate();
            }
        }, []);
        useEffect(() => {
            if (typeof subscribe === 'function') {
                return subscribe(dispatch);
            }
            return (() => { });
        }, [dispatch]);
        return currentRef.current;
    }
    return useStore;
}
//# sourceMappingURL=index.js.map