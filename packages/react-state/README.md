## React-State
react state solution, it's small and efficient :) (implements with 100+ lines code)
### Usage
init the store
```typescript
type StoreState = {
  counter: number
  setCounter: (value: number) => void
}

const commonStore = createStore<StoreState>(({ get, set }) => ({
  counter: 0,
  setCounter: (counter: number) => set(() => ({ counter })),
})) 
```

use the store in function component
```typescript
const { useStore: useCommonStore } = commonStore
function Counter() {
  const counter = useCommonStore(state => state.counter)
  const setCounter = useCommonStore(state => state.setCounter)

  return (
    <button onClick={() => setCounter(counter + 1)}>
      counter is: {counter}
    </button>
  )
}
```