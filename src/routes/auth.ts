import { Request, ResponseObject, ResponseToolkit, ServerRoute } from '@hapi/hapi'
import { getSafeRedirect } from '../utils/get-safe-redirect.js'

const routes: ServerRoute[] = [{
  method: 'GET',
  path: '/auth/sign-in',
  options: {
    auth: 'strava'
  },
  handler: function (_request: Request, h: ResponseToolkit): ResponseObject {
    return h.redirect('/heatmap')
  }
}, {
  method: 'GET',
  path: '/auth/sign-in-oidc',
  options: {
    auth: { strategy: 'strava', mode: 'try' }
  },
  handler: async function (request: Request, h: ResponseToolkit): Promise<ResponseObject> {
    if (!request.auth.isAuthenticated) {
      return h.view('unauthorised')
    }

    const { profile, token, refreshToken } = request.auth.credentials

    await request.server.app.cache.set(profile.sessionId, {
      isAuthenticated: true,
      ...profile,
      token,
      refreshToken
    })

    request.cookieAuth.set({ sessionId: profile.sessionId })

    const redirect: string = request.yar.get('redirect') ?? '/heatmap'
    request.yar.clear('redirect')

    const safeRedirect: string = getSafeRedirect(redirect)
    return h.redirect(safeRedirect)
  }
}]

export default routes
