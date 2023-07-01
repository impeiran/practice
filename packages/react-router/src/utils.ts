import { LocationContext, To } from "./types";

export function createUrl(to: To) {
  if (typeof to === 'string') {
    return to
  }

  const search = to.search?.includes('?')
    ? to.search
    : to.search ? `?${to.search}` : ''

  return `${to.path}${search}${to.hash || ''}`
}

export function isMatchLocation(currentLocation: LocationContext, to: To) {
  if (typeof to === 'string') {
    const url = new URL(to, location.origin)
    return url.pathname === currentLocation.path
  }

  return to.path === currentLocation.path
}