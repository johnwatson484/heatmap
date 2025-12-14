import { ServerRoute, Request, ResponseToolkit, ResponseObject } from '@hapi/hapi'

const routes: ServerRoute[] = [{
  method: 'GET',
  path: '/',
  handler: (request: Request, h: ResponseToolkit): ResponseObject => {
    return h.redirect('/heatmap')
  },
}, {
  method: 'GET',
  path: '/heatmap',
  handler: (_request: Request, h: ResponseToolkit): ResponseObject => {
    return h.view('heatmap')
  },
}]

export default routes
