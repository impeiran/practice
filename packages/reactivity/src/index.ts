export interface ReactionFnContext {
  __deps__?: Set<Set<ReactionFn>>
}

export interface ReactionFn<T = any> extends ReactionFnContext {
  (currentValue?: T): any;
}

export type KeyReactionMap = Map<string | Symbol, Set<ReactionFn>>

const reactionStack: ReactionFn[] = []

const observableReactionMap: WeakMap<any, KeyReactionMap> = new WeakMap()

function trackTargetAndReaction(target: unknown, key: string | Symbol) {
  if (!reactionStack.length) {
    return
  }

  const currentReaction = reactionStack[reactionStack.length - 1]

  let targetKeyReactionMap: KeyReactionMap | undefined = observableReactionMap.get(target)

  if (!targetKeyReactionMap) {
    targetKeyReactionMap = new Map()
    targetKeyReactionMap.set(
      key,
      new Set<ReactionFn>([])
    )
    observableReactionMap.set(target, targetKeyReactionMap)
  }

  const reactionSet = targetKeyReactionMap.get(key)
  
  if (reactionSet) {
    reactionSet.add(currentReaction)

    currentReaction.__deps__ = currentReaction.__deps__ ?? new Set()
    currentReaction.__deps__.add(reactionSet)
  }
}

function notifyReactionByTargetAndKey<T>(target: unknown, key: string | Symbol, value: T) {
  const reactionSet = observableReactionMap.get(target)?.get(key)
  // use new set to avoid infinite loop
  const reactionToRun = new Set<ReactionFn>([])

  const currentReaction = reactionStack[reactionStack.length - 1]

  reactionSet?.forEach(reactionFn => {
    if (reactionFn !== currentReaction) {
      reactionToRun.add(reactionFn)
    }
  })

  reactionToRun.forEach(fn => fn(value))
}

function removeTracker(fn: ReactionFn) {
  fn.__deps__?.forEach(depSet => {
    if (depSet.has(fn)) {
      depSet.delete(fn)
    }
  })
  fn.__deps__ = new Set()
}

export function observable<T extends Record<string, any>>(value: T) {
  const proxy = new Proxy(value, {
    get(target, key, receiver) {
      trackTargetAndReaction(target, key)
      return Reflect.get(target, key, receiver)
    },
    set(target, key, newValue, receiver) {
      const result = Reflect.set(target, key, newValue, receiver)
      notifyReactionByTargetAndKey(target, key, newValue)
      return result
    }
  })
  return proxy
}

export function effect(fn: () => void) {
  const effectFn = () => {
    if (!reactionStack.includes(effectFn)) {
      removeTracker(effectFn)
      reactionStack.push(effectFn)
      fn()
      reactionStack.pop()
    } 
  }

  removeTracker(effectFn)

  effectFn()

  return () => removeTracker(effectFn)
}

export type WatchOptions = {
  immediate?: boolean
}

export function watch<T>(
  expression: () => T,
  callback: (current: T, previous: T | undefined) => void,
  options?: WatchOptions
) {
  let previous: T | undefined = undefined 

  const makeExpressionTrack = (triggerCallback: (currentValue: T) => void) => {
    reactionStack.push(reactionFn)
    const currentValue = expression()
    reactionStack.pop()
    triggerCallback(currentValue)
    previous = currentValue
    return currentValue
  }

  const reactionFn = () => {
    removeTracker(reactionFn)
    makeExpressionTrack((currentValue) => {
      if (currentValue !== previous) {
        callback(currentValue, previous)
      }
    })
  }

  if (options?.immediate) {
    makeExpressionTrack((currentValue) => {
      callback(currentValue, previous)
    })
  } else {
    reactionFn()
  }

  return () => removeTracker(reactionFn)
}