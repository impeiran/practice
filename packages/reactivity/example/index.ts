import { effect, observable, watch } from '..'

/** effect demo */
// console.log('[autoRun] demo start')

// const effectData = observable({
//   name: 'jack',
//   address: {
//     country: 'china'
//   }
// })

// const untrackName = effect(() => {
//   console.log('[autoRun] name is: ' + effectData.name)
// })

// effect(() => {
//   console.log('[autoRun] country is: ' + effectData.address?.country)
// })

// effectData.name = 'ryan'
// effectData.address.country = 'America'

// console.log('[autoRun] demo end')

// untrackName()

// effectData.name = 'end'
/** end demo */



/** watch demo */
const watchData = observable(['0', '1', '2'])

const unwatch = watch(() => watchData, (current) => {
  console.log('[watch] list is:', current.join())
}, {
  immediate: true
})

// watchData.push('3')

// FIXME: 同步执行时，会有问题
watchData.unshift('-1')

unwatch()

/** end demo */


