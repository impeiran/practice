export type LocationContext = {
  path: string
  search?: string
  hash?: string
}

export type RouterHistory = {
  push: (to: To) => void
  replace: (to: To) => void
  go: (delta?: number) => void
  listen: () => () => void;
}

export type To = string | LocationContext

export enum HistoryActionEnum {
  POP = 'POP',
  REPLACE = 'REPLACE',
  PUSH = 'PUSH',
}