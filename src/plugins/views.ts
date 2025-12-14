import path from 'path'
import { fileURLToPath } from 'url'
import nunjucks, { Template } from 'nunjucks'
import Vision from '@hapi/vision'
import { ServerRegisterPluginObject, Request } from '@hapi/hapi'
import config from '../config.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const plugin: ServerRegisterPluginObject<any> = {
  plugin: Vision,
  options: {
    engines: {
      njk: {
        compile: (src: string, options: any) => {
          const template: Template = nunjucks.compile(src, options.environment)

          return (context: any) => {
            return template.render(context)
          }
        },
        prepare: (options: any, next: (err?: Error) => void) => {
          options.compileOptions.environment = nunjucks.configure(path.join(options.relativeTo || process.cwd(), options.path), {
            autoescape: true,
            watch: config.get('isDev'),
          })

          return next()
        },
      },
    },
    path: '../../src/views',
    relativeTo: __dirname,
    isCached: !config.get('isDev'),
    context: async (request: Request) => {
      const context = request.response.source?.context || {}

      context.assetPath = '/assets'
      context.appName = config.get('appName')

      if (!request.auth.isAuthenticated || !request.auth.credentials?.sessionId) {
        return context
      }

      try {
        const auth = await request.server.app.cache.get(request.auth.credentials.sessionId)
        return {
          ...context,
          auth
        }
      } catch (error) {
        // If cache lookup fails, return context without auth to prevent circular errors
        request.log(['warn', 'views'], `Failed to get auth from cache: ${error.message}`)
        return context
      }
    }
  }
}

export default plugin
