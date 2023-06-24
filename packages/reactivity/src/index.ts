import { isArray, isPlainObject } from "./utils";

let shouldTrigger = true

const arrayInstrumentations: Record<string, any> = {}

;['push', 'pop', 'shift', 'unshift', 'splice'].forEach((method: any) => {
  const originMethod = Array.prototype[method]
  arrayInstrumentations[method] = function (...args: any[]) {
    shouldTrigger = false
    const res = originMethod.apply(this, args)
    shouldTrigger = true
    return res
  }
})

export type ObservableType = Record<string | symbol | number, any>
export interface ReactionFnContext {
  __deps__?: Set<Set<ReactionFn>>
}
export interface ReactionFn<T = any> extends ReactionFnContext {
  (): any;
}
export type KeyReactionMap = Map<string | Symbol, Set<ReactionFn>>

export const ITERATE_KEY = Symbol()

export enum OperationSetterEnum {
  ITERATE,
  ADD,
  SET,
}

const reactionStack: ReactionFn[] = []
const observableReactionMap: WeakMap<any, KeyReactionMap> = new WeakMap()
const proxyMap: WeakMap<any, any> = new WeakMap()

function trackTarget(target: unknown, key: string | Symbol) {
  if (!reactionStack.length || !shouldTrigger) {
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

function notifyReactionByTargetAndKey<T>(
  target: unknown,
  key: string | Symbol,
  type: OperationSetterEnum
) {
  debugger
  const exactKey = type === OperationSetterEnum.ADD
    ? 'length'
    : key

  const reactionSet = observableReactionMap.get(target)?.get(exactKey)

  // use new set to avoid infinite loop
  const reactionToRun = new Set<ReactionFn>([])

  const currentReaction = reactionStack[reactionStack.length - 1]

  reactionSet?.forEach(reactionFn => {
    if (reactionFn !== currentReaction) {
      reactionToRun.add(reactionFn)
    }
  })

  reactionToRun.forEach(fn => fn())
}

function removeTracker(fn: ReactionFn) {
  fn.__deps__?.forEach(depSet => {
    if (depSet.has(fn)) {
      depSet.delete(fn)
    }
  })
  fn.__deps__ = new Set()
}

export function observable<T extends ObservableType>(value: T): T {
  if (!isPlainObject(value) && !isArray(value)) {
    return value
  }

  const existProxy = proxyMap.get(value)
  if (existProxy) {
    return existProxy
  }

  // TODO: need define delete/has/ownKeys handlers
  const proxy = new Proxy(value, {
    get(target, key, receiver) {
      const currentValue = Array.isArray(target) && arrayInstrumentations.hasOwnProperty(key)
        ? Reflect.get(arrayInstrumentations, key, receiver)
        : Reflect.get(target, key, receiver)

      trackTarget(target, key)

      if (currentValue) {
        return observable(currentValue)
      }

      return currentValue
    },
    set(target, key, value, receiver) {
      console.log(observableReactionMap)
      debugger
      const type = Array.isArray(target)
        ? Number(key) < target.length
          ? OperationSetterEnum.SET
          : OperationSetterEnum.ADD
        : !Object.prototype.hasOwnProperty.call(target, key)
          ? OperationSetterEnum.ADD
          : OperationSetterEnum.SET

      const newValue = observable(value)
      const oldValue = target[key]

      Reflect.set(target, key, newValue, receiver)

      if (value !== oldValue) {
        notifyReactionByTargetAndKey(target, key, type)
      }

      return true
    },
    ownKeys(target) {
      const key = Array.isArray(target) ? 'length' : ITERATE_KEY
      notifyReactionByTargetAndKey(target, key, OperationSetterEnum.ITERATE)
      return Reflect.ownKeys(target)
    },
  })

  proxyMap.set(value, proxy)

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

function traverseDeep(target: any, recordSet = new Set<any>()) {
  if (typeof target !== 'object' || target === null || recordSet.has(target)) {
    return
  }
  recordSet.add(target)
  if (Array.isArray(target) && target.length) {
    // do nothing to track length
  }
  for(const key in target) {
    traverseDeep(target[key], recordSet)
  }
}

export function watch<T>(
  expression: () => T,
  callback: (current: T, previous: T | undefined) => void,
  options?: WatchOptions
) {
  let previous: T | undefined = undefined 

  const makeExpressionTrack = (triggerCallback?: (currentValue: T) => void) => {
    reactionStack.push(reactionFn)
    const currentValue = expression()
    traverseDeep(currentValue)
    reactionStack.pop()
    triggerCallback?.(currentValue)
    previous = currentValue
  }

  const reactionFn = () => {
    removeTracker(reactionFn)
    makeExpressionTrack((currentValue) => {
      callback(currentValue, previous)
    })
  }

  if (options?.immediate) {
    makeExpressionTrack((currentValue) => {
      callback(currentValue, previous)
    })
  } else {
    makeExpressionTrack()
  }

  return () => removeTracker(reactionFn)
}