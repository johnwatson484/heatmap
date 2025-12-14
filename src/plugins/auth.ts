import Jwt from '@hapi/jwt'
import { refreshTokens } from '../auth/refresh-tokens.js'
import { getSafeRedirect } from '../utils/get-safe-redirect.js'
import config from '../config.js'

export default {
  plugin: {
    name: 'auth',
    register: async (server) => {
      server.auth.strategy('strava', 'bell', getBellOptions())
      server.auth.strategy('session', 'cookie', getCookieOptions())
      server.auth.default('session')
    }
  }
}

function getBellOptions () {
  return {
    provider: {
      name: 'strava',
      protocol: 'oauth2',
      useParamsAuth: true,
      auth: config.get('strava.authorizationEndpoint'),
      token: config.get('strava.tokenEndpoint'),
      scope: ['openid', 'offline_access', config.get('strava.clientId')],
      profile: function (credentials, _params, _get) {
        const payload = Jwt.token.decode(credentials.token).decoded.payload

        credentials.profile = {
          ...payload,
        }
      }
    },
    clientId: config.get('strava.clientId'),
    clientSecret: config.get('strava.clientSecret'),
    password: config.get('cookie.password'),
    isSecure: config.get('isProd'),
    location: function (request) {
      if (request.query.redirect) {
        const safeRedirect = getSafeRedirect(request.query.redirect)
        request.yar.set('redirect', safeRedirect)
      }

      return config.get('strava.redirectUrl')
    },
    providerParams: function (_request) {
      const params = {
        response_mode: 'query'
      }

      return params
    }
  }
}

function getCookieOptions () {
  return {
    cookie: {
      password: config.get('cookie.password'),
      path: '/',
      isSecure: config.get('isProd'),
      isSameSite: 'Lax'
    },
    redirectTo: function (request) {
      return `/auth/sign-in?redirect=${request.url.pathname}${request.url.search}`
    },
    validate: async function (request, session) {
      const userSession = await request.server.app.cache.get(session.sessionId)

      if (!userSession) {
        return { isValid: false }
      }

      try {
        const decoded = Jwt.token.decode(userSession.token)
        // Allow 60 second tolerance for clock skew between servers
        Jwt.token.verifyTime(decoded, { timeSkewSec: 60 })
      } catch {
        if (!config.get('strava.refreshTokens')) {
          return { isValid: false }
        }
        const { access_token: token, refresh_token: refreshToken } = await refreshTokens(userSession.refreshToken)
        userSession.token = token
        userSession.refreshToken = refreshToken
        await request.server.app.cache.set(session.sessionId, userSession)
      }

      return { isValid: true, credentials: userSession }
    }
  }
}

export { getBellOptions, getCookieOptions }
