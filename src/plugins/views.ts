import path from 'path'
import { fileURLToPath } from 'url'
import nunjucks, { Template } from 'nunjucks'
import Vision from '@hapi/vision'
import { ServerRegisterPluginObject, Request, ResponseObject } from '@hapi/hapi'
import config from '../config.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

interface ViewContext {
  assetPath?: string
  appName?: string
  auth?: any
  [key: string]: any
}

function getResponseContext (response: ResponseObject): Record<string, any> {
  if (response.source && typeof response.source === 'object' && 'context' in response.source) {
    return (response.source.context as Record<string, any>) || {}
  }
  return {}
}

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
    context: async (request: Request): Promise<ViewContext> => {
      const response = request.response as ResponseObject
      const context: ViewContext = getResponseContext(response)

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
        const errorMessage = error instanceof Error ? error.message : String(error)
        request.log(['warn', 'views'], `Failed to get auth from cache: ${errorMessage}`)
        return context
      }
    }
  }
}

export default plugin
