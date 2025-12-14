import { ServerRoute, Request, ResponseToolkit, ResponseObject } from '@hapi/hapi'

const routes: ServerRoute[] = [{
  method: 'GET',
  path: '/',
  options: {
    auth: { mode: 'try' }
  },
  handler: (request: Request, h: ResponseToolkit): ResponseObject => {
    if (request.auth.isAuthenticated) {
      return h.redirect('/home')
    }

    return h.view('index')
  },
}, {
  method: 'GET',
  path: '/home',
  handler: (_request: Request, h: ResponseToolkit): ResponseObject => {
    return h.view('home')
  },
}]

export default routes
