import { getPermissions } from '../auth/get-permissions.js'
import { getSignOutUrl } from '../auth/get-sign-out-url.js'
import { validateState } from '../auth/state.js'
import { verifyToken } from '../auth/verify-token.js'
import { getSafeRedirect } from '../utils/get-safe-redirect.js'

const routes = [{
  method: 'GET',
  path: '/auth/sign-in',
  options: {
    auth: 'strava'
  },
  handler: function (_request, h) {
    return h.redirect('/home')
  }
}, {
  method: 'GET',
  path: '/auth/sign-in-oidc',
  options: {
    auth: { strategy: 'strava', mode: 'try' }
  },
  handler: async function (request, h) {
    if (!request.auth.isAuthenticated) {
      return h.view('unauthorised')
    }

    const { profile, token, refreshToken } = request.auth.credentials

    await verifyToken(token)

    await request.server.app.cache.set(profile.sessionId, {
      isAuthenticated: true,
      ...profile,
      token,
      refreshToken
    })

    request.cookieAuth.set({ sessionId: profile.sessionId })

    const redirect = request.yar.get('redirect') ?? '/home'
    request.yar.clear('redirect')

    const safeRedirect = getSafeRedirect(redirect)
    return h.redirect(safeRedirect)
  }
}, {
  method: 'GET',
  path: '/auth/sign-out',
  options: {
    auth: { mode: 'try' }
  },
  handler: async function (request, h) {
    if (request.auth.isAuthenticated) {
      if (request.auth.credentials?.sessionId) {
        await request.server.app.cache.drop(request.auth.credentials.sessionId)
      }

      request.cookieAuth.clear()

      const signOutUrl = await getSignOutUrl(request, request.auth.credentials.token)
      return h.redirect(signOutUrl)
    }

    return h.redirect('/')
  }
}, {
  method: 'GET',
  path: '/auth/sign-out-oidc',
  options: {
    auth: { mode: 'try' }
  },
  handler: async function (request, h) {
    if (request.auth.isAuthenticated) {
      validateState(request, request.query.state)

      if (request.auth.credentials?.sessionId) {
        await request.server.app.cache.drop(request.auth.credentials.sessionId)
      }

      request.cookieAuth.clear()
    }

    return h.redirect('/')
  }
}]

export default routes
