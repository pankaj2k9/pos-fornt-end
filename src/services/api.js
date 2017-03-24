import feathers from 'feathers-client'
import authentication from 'feathers-authentication-client'

import 'whatwg-fetch'

if (!global.fetch) {
  global.fetch = require('whatwg-fetch')
}

const api = (function () {
  let instance
  // const host = process.env.API_URL
  const host = 'https://uat-pos.theodbocare.com/api/'
  // const host = 'http://192.168.0.103:3030'
  // setup feathers client
  function setupClient () {
    const app = feathers()
      .configure(feathers.rest(host).fetch(global.fetch))
      .configure(feathers.hooks())
      .configure(authentication({ storage: window.localStorage }))

    return app
  }

  return instance || setupClient()
})()

window.api = api

export default api
