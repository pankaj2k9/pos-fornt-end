import feathers from 'feathers-client'
import 'whatwg-fetch'

if (!global.fetch) {
  global.fetch = require('whatwg-fetch')
}

const api = (function () {
  let instance
  const host = process.env.API_URL
  // setup feathers client
  function setupClient () {
    const app = feathers()
      .configure(feathers.rest(host).fetch(global.fetch))
      .configure(feathers.hooks())
      .configure(feathers.authentication({ storage: window.localStorage }))

    return app
  }

  return instance || setupClient()
})()

export default api
