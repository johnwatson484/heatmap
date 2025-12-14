import type { Policy } from '@hapi/catbox'

declare module '@hapi/hapi' {
  interface ServerApplicationState {
    cache: Policy<unknown>
  }
}
