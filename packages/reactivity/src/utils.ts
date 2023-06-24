export function isPlainObject (target: unknown) {
  return Object.prototype.toString.call(target) === '[object Object]'
}

export function isArray (target: unknown) {
  return Array.isArray(target)
}