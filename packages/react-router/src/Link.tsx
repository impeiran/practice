import React, { useCallback } from 'react'
import { useMemo } from "react"
import { useRouter } from "./context"
import { To } from "./types"
import { createUrl } from "./utils"

export type LinkProps = {
  to: To,
  replace?: boolean
  children?: React.ReactNode
}

export function Link(props: LinkProps) {
  const { to, replace, children } = props
  const { history } = useRouter()

  const href = useMemo(() => createUrl(to), [to])

  const handleClick = useCallback<React.MouseEventHandler<HTMLAnchorElement>>((e) => {
    e.preventDefault()
    replace ? history.replace(to) : history.push(to)
  }, [to, replace, history])

  return (
    <a href={href} onClick={handleClick}>{children}</a>
  )
}