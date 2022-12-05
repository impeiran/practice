export type StoreInitializer<T = any> = (options: {
    get: () => T;
    set: (setter: (s: T) => Partial<T>) => void;
}) => T;
export type StoreState = Record<string, any>;
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
export declare function createStore<T = StoreState>(initializer: StoreInitializer<T>): {
    getState: () => T;
    setState: (setter: (s: T) => Partial<T>) => void;
    useStore: {
        (): T;
        <Selected = any>(selector: (s: T) => Selected): Selected;
        <Selected_1 = any>(selector: (s: T) => Selected_1, equalizer?: ((current: Selected_1, prev: Selected_1) => boolean | undefined) | undefined): Selected_1;
    };
};
