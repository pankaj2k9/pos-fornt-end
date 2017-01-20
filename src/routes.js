import React from 'react'
import { Route, IndexRoute } from 'react-router'
import api from '../src/services/api'

import App from './components/App'
import Login from './containers/Login'
import NotFound from './components/NotFound'
import Store from './containers/Store'
import Settings from './containers/Settings'
import Reports from './containers/Reports'

/**
 * requireAuth
 *
 * Is called right before a route is entered.
 */
function requireAuth (nextState, replace, callback) {
  let appState = JSON.parse(window.localStorage.getItem('state'))
  const posMode = appState.application.posMode
  if (window.localStorage.getItem('feathers-jwt') && posMode === 'offline') {
    callback()
  } else if (!api.get('token')) {
    api.passport.verifyJWT(window.localStorage.getItem('feathers-jwt'))
    .then(token => {
      return api.authenticate({ strategy: 'jwt', store: token.storeId })
    }).then(response => {
      callback()
    }).catch(error => {
      let noTokenError = 'NotAuthenticated: Could not find stored JWT and no authentication type was given'
      if (noTokenError === String(error)) {
        replace({ pathname: '/' })
        callback()
      } // add fallback if needed
    })
  } else {
    callback()
  }
}

export default (
  <Route path='/' component={App}>
    <IndexRoute component={Login} />
    <Route path='store' component={Store} onEnter={requireAuth} />
    <Route path='settings' component={Settings} onEnter={requireAuth} />
    <Route path='reports' component={Reports} onEnter={requireAuth} />
    <Route path='*' component={NotFound} />
  </Route>
)
