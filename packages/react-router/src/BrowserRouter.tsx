import React, { PropsWithChildren, createContext, useEffect, useMemo, useRef, useState } from 'react'
import { HistoryActionEnum, LocationContext, RouterHistory, To } from './types'
import { RouterContext } from './context'
import { createUrl } from './utils'

export type BrowserRouterProps = PropsWithChildren<{}>

function createHistory(
  options?: {
    onChange?: (action: HistoryActionEnum) => void
  }
) {
  const onChange = options?.onChange
  const globalHistory = window.history

  const history: RouterHistory = {
    push(to) {
      const url = createUrl(to)
      globalHistory.pushState(null, '', url)
      onChange?.(HistoryActionEnum.PUSH)
    },

    replace(to) {
      const url = createUrl(to)
      globalHistory.replaceState(null, '', url)
      onChange?.(HistoryActionEnum.REPLACE)
    },

    go(delta?: number) {
      return globalHistory.go(delta)
    },

    listen() {
      const pop = () => {
        onChange?.(HistoryActionEnum.POP)
      }
      window.addEventListener('popstate', pop)
      return () => window.removeEventListener('popstate', pop)
    }
  }

  return history
}

function getCurrentLocationContext(): LocationContext {
  return {
    path: window.location.pathname,
    search: window.location.search,
    hash: window.location.hash,
  }
}

export function BrowserRouter(props: BrowserRouterProps) {
  const [locationContext, setLocationContext] = useState<LocationContext>(getCurrentLocationContext)

  const historyRef = useRef(
    createHistory({
      onChange() {
        setLocationContext(getCurrentLocationContext)
      },
    })
  )

  const routerContextValue = useMemo(() => ({
    location: locationContext,
    history: historyRef.current,
  }), [locationContext, historyRef.current])

  useEffect(() => {
    return historyRef.current?.listen()
  }, [])

  return (
    <RouterContext.Provider value={routerContextValue}>
      {props.children}
    </RouterContext.Provider>
  )
}

