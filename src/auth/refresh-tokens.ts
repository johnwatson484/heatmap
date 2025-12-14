import Wreck from '@hapi/wreck'
import config from '../config.js'

async function refreshTokens (refreshToken) {
  const query = [
    `client_id=${config.get('strava.clientId')}`,
    `client_secret=${config.get('strava.clientSecret')}`,
    'grant_type=refresh_token',
    `scope=openid offline_access ${config.get('strava.clientId')}`,
    `refresh_token=${refreshToken}`,
    `redirect_uri=${config.get('strava.redirectUrl')}`
  ].join('&')

  const { payload } = await Wreck.post(`${config.get('strava.token_endpoint')}?${query}`, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    json: true
  })

  return payload
}

export { refreshTokens }
