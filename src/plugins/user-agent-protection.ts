/**
 * User-Agent protection plugin to mitigate ReDoS attacks
 * Protects against GHSA-mgfv-m47x-4wqp vulnerability in useragent package
 * Truncates User-Agent headers to prevent malicious payloads
 */

import { Plugin, Request, ResponseToolkit, Server, ServerOptions } from '@hapi/hapi'

const MAX_USER_AGENT_LENGTH: number = 150

const plugin: Plugin<ServerOptions> = {
  name: 'userAgentProtection',
  version: '1.0.0',
  register: async function (server: Server, _options: ServerOptions) {
    server.ext('onRequest', (request: Request, h: ResponseToolkit) => {
      const userAgent: string | undefined = request.headers['user-agent']

      if (userAgent && userAgent.length > MAX_USER_AGENT_LENGTH) {
        // Truncate the User-Agent header to prevent ReDoS attacks
        request.headers['user-agent'] = userAgent.substring(0, MAX_USER_AGENT_LENGTH)
        server.log(['security', 'user-agent'], `Truncated User-Agent from ${userAgent.length} to ${MAX_USER_AGENT_LENGTH} chars`)
      }

      return h.continue
    })
  }
}

export default plugin
