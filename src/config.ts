import convict from 'convict'
import convictFormatWithValidator from 'convict-format-with-validator'

convict.addFormats(convictFormatWithValidator)

const config = convict({
  env: {
    doc: 'The application environment.',
    format: ['production', 'development', 'test'],
    default: 'development',
    env: 'NODE_ENV',
  },
  isDev: {
    doc: 'True if the application is in development mode.',
    format: Boolean,
    default: process.env.NODE_ENV === 'development',
  },
  isProd: {
    doc: 'True if the application is in production mode.',
    format: Boolean,
    default: process.env.NODE_ENV === 'production',
  },
  host: {
    doc: 'The host to bind.',
    format: 'ipaddress',
    default: '0.0.0.0',
    env: 'HOST',
  },
  port: {
    doc: 'The port to bind.',
    format: 'port',
    default: 3000,
    env: 'PORT',
    arg: 'port',
  },
  appName: {
    doc: 'The name of the application.',
    format: String,
    default: 'Heatmap',
    env: 'APP_NAME',
  },
  strava: {
    clientId: {
      doc: 'The Strava client ID.',
      format: String,
      default: null,
      env: 'STRAVA_CLIENT_ID'
    },
    clientSecret: {
      doc: 'The Strava client secret.',
      format: String,
      default: null,
      env: 'STRAVA_CLIENT_SECRET'
    },
    tokenEndpoint: {
      doc: 'The Strava token endpoint.',
      format: String,
      default: 'https://www.strava.com/oauth/token',
      env: 'STRAVA_TOKEN_ENDPOINT'
    },
    authorizationEndpoint: {
      doc: 'The Strava authorization endpoint.',
      format: String,
      default: 'https://www.strava.com/oauth/authorize',
      env: 'STRAVA_AUTHORIZATION_ENDPOINT'
    },
    redirectUrl: {
      doc: 'The Strava redirect URl.',
      format: String,
      default: null,
      env: 'STRAVA_REDIRECT_URL'
    },
    refreshTokens: {
      doc: 'True if Strava refresh tokens are enabled.',
      format: Boolean,
      default: true,
      env: 'STRAVA_REFRESH_TOKENS'
    }
  },
  cookie: {
    password: {
      doc: 'The cookie password.',
      format: String,
      default: null,
      env: 'COOKIE_PASSWORD'
    }
  },
  cache: {
    name: {
      doc: 'The cache name.',
      format: String,
      default: 'redis'
    },
    host: {
      doc: 'The Redis cache host.',
      format: String,
      default: null,
      env: 'REDIS_HOST'
    },
    port: {
      doc: 'The Redis cache port.',
      format: 'port',
      default: 6379,
      env: 'REDIS_PORT'
    },
    password: {
      doc: 'The Redis cache password.',
      format: String,
      default: process.env.NODE_ENV === 'production' ? null : undefined,
      env: 'REDIS_PASSWORD'
    },
    tls: {
      doc: 'True if the Redis cache is using TLS.',
      format: Object,
      default: process.env.NODE_ENV === 'production' ? {} : undefined
    },
    segment: {
      doc: 'The cache segment.',
      format: String,
      default: 'session'
    },
    ttl: {
      doc: 'The cache TTL.',
      format: Number,
      default: 1000 * 60 * 60 * 24,
      env: 'REDIS_TTL'
    }
  }
})

config.validate({ allowed: 'strict' })

export default config
