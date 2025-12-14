import { randomUUID } from 'node:crypto'
import { Request, ServerRegisterPluginObject } from '@hapi/hapi'
import { refreshTokens } from '../auth/refresh-tokens.js'
import { getSafeRedirect } from '../utils/get-safe-redirect.js'
import config from '../config.js'

const plugin: ServerRegisterPluginObject<any> = {
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
      scope: ['read'],
      profile: async function (credentials: any, _params: any, get: any) {
        const profile = await get('https://www.strava.com/api/v3/athlete')

        credentials.profile = {
          sessionId: randomUUID(),
          id: profile.id,
          username: profile.username,
          firstname: profile.firstname,
          lastname: profile.lastname
        }
      }
    },
    clientId: config.get('strava.clientId'),
    clientSecret: config.get('strava.clientSecret'),
    password: config.get('cookie.password'),
    isSecure: config.get('isProd'),
    location: function (request: Request) {
      if (request.query.redirect) {
        const safeRedirect = getSafeRedirect(request.query.redirect)
        request.yar.set('redirect', safeRedirect)
      }

      return config.get('strava.redirectUrl')
    },
    providerParams: function (_request: Request) {
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
    redirectTo: function (request: Request) {
      return `/auth/sign-in?redirect=${request.url.pathname}${request.url.search}`
    },
    validate: async function (request: Request, session: any) {
      const userSession = await request.server.app.cache.get(session.sessionId)

      if (!userSession) {
        return { isValid: false }
      }

      // Check if token has expired (with 60 second buffer)
      const isExpired = userSession.expiresAt && (Date.now() + 60000) >= userSession.expiresAt

      if (isExpired) {
        if (!config.get('strava.refreshTokens')) {
          return { isValid: false }
        }
        const { access_token: token, refresh_token: refreshToken, expires_in: expiresIn } = await refreshTokens(userSession.refreshToken)
        userSession.token = token
        userSession.refreshToken = refreshToken
        userSession.expiresAt = Date.now() + (expiresIn * 1000)
        await request.server.app.cache.set(session.sessionId, userSession)
      }

      return { isValid: true, credentials: userSession }
    }
  }
}

export default plugin

export { getBellOptions, getCookieOptions }
