import { effect, observable, watch } from '..'

const data = observable({ name: 'jack' })

const untrack = effect(() => {
  console.log('[autoRun] name is: ' + data.name)
})

data.name = 'ryan'

const unwatch = watch(() => data.name, (current) => {
  console.log('[watch] name is: ', current)
}, {
  immediate: true
})

data.name = 'micky'

unwatch()

untrack()

data.name = 'end'