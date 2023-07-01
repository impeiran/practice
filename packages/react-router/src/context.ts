import { createContext, useContext } from "react"
import { LocationContext, RouterHistory } from "./types"

export type RouterContextType = {
  location: LocationContext
  history: RouterHistory
}

export const RouterContext = createContext<RouterContextType>(null!)

export function useRouter() {
  return useContext(RouterContext)
}

