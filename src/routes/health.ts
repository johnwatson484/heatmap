import { ServerRoute, Request, ResponseToolkit, ResponseObject } from '@hapi/hapi'

const routes: ServerRoute[] = [{
  method: 'GET',
  path: '/healthy',
  options: {
    auth: false,
  },
  handler: (_request: Request, h: ResponseToolkit): ResponseObject => {
    return h.response('ok')
  },
}, {
  method: 'GET',
  path: '/healthz',
  options: {
    auth: false,
  },
  handler: (_request: Request, h: ResponseToolkit): ResponseObject => {
    return h.response('ok')
  },
}]

export default routes
