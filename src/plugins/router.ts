import { Server, ServerOptions, Plugin } from '@hapi/hapi'
import heatmap from '../routes/heatmap.js'
import assets from '../routes/assets.js'
import health from '../routes/health.js'
import auth from '../routes/auth.js'

const plugin: Plugin<ServerOptions> = {
  name: 'router',
  register: (server: Server, _options: ServerOptions) => {
    server.route([heatmap, assets, health, auth].flat())
  },
}

export default plugin
