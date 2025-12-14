import { Server, ServerRegisterPluginObject } from '@hapi/hapi'
import Inert from '@hapi/inert'
import Crumb from '@hapi/crumb'
import Scooter from '@hapi/scooter'
import csp from './content-security-policy.js'
import headers from './headers.js'
import logging from './logging.js'
import errors from './errors.js'
import views from './views.js'
import router from './router.js'
import userAgentProtection from './user-agent-protection.js'
import config from '../config.js'

async function registerPlugins (server: Server): Promise<void> {
  const plugins: ServerRegisterPluginObject<any>[] = [
    Inert,
    Crumb,
    Scooter,
    csp,
    logging,
    errors,
    headers,
    views,
    router,
    userAgentProtection,
  ]

  if (config.get('isDev')) {
    const Blipp: ServerRegisterPluginObject<any> = await import('blipp')
    plugins.push(Blipp)
  }

  await server.register(plugins)
}

export { registerPlugins }
