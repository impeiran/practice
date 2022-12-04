import { useState } from 'react'
import reactLogo from './assets/react.svg'
import { createStore } from './utils/state'
import './App.css'

type StoreState = {
  counter: number
  quantity: number
  price: number,
  setCounter: (counter: number) => void
  setQuantity: () => void,
  setPrice: () => void
}

const commonStore = createStore<StoreState>(({ get, set }) => ({
  counter: 0,
  quantity: 1,
  price: 10,
  setCounter: (counter: number) => set(() => ({ counter })),
  setQuantity: () => set((s) => ({ quantity: s.quantity + 1 })),
  setPrice: () => set((s) => ({ price: s.price + 1 })),
}))

function Counter() {
  const { counter } = commonStore.useStore()
  const setCounter = commonStore.useStore(s => s.setCounter)

  console.log('render counter')

  return (<button onClick={() => setCounter(counter + 1)}>
        count is {counter}
      </button>)
}

function PriceButton() {
  const price = commonStore.useStore(s => s.price)
  const setPrice = commonStore.useStore(s => s.setPrice)

  return (
    <button onClick={() => setPrice()}>
      price is {price}
    </button>
  )
}

function QuantityButton() {
  const quantity = commonStore.useStore(s => s.quantity)
  const setQuantity = commonStore.useStore(s => s.setQuantity)

  return (
    <button onClick={() => setQuantity()}>
      quantity is {quantity}
    </button>
  )
}

function Total() {
  const total = commonStore.useStore<number>(s => s.price * s.quantity)
  console.log('render total')

  return (
    <span>{total as number}</span>
  )
}

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="App">
      <Counter />
      <QuantityButton />
      <PriceButton />
      <Total />
    </div>
  )
}

export default App
