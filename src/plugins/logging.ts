import { ServerRegisterPluginObject } from '@hapi/hapi'
import HapiPino from 'hapi-pino'

const plugin: ServerRegisterPluginObject<any> = {
  plugin: HapiPino,
  options: {
    logPayload: true,
    level: 'warn',
  },
}

export default plugin
