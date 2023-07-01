import React from 'react'
import { useMemo } from "react"
import { useRouter } from "./context"
import { To } from "./types"
import { isMatchLocation } from "./utils"

export type RouteProps = {
  to: To,
  element: React.ReactNode
}

export function Route(props: RouteProps) {
  const { to, element } = props
  const { location } = useRouter()

  const isMatch = useMemo(() => {
    return isMatchLocation(location, to)
  }, [location, to])

  if (!isMatch) {
    return null
  }

  return (
    <>{element}</>
  )
}