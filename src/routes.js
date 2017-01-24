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
  let nextRoute = nextState.location.pathname
  let notStore = nextRoute !== 'store' ? nextRoute : null
  const posMode = appState ? appState.application.posMode : undefined
  const netStat = appState ? appState.application.networkStatus : undefined
  if (window.localStorage.getItem('feathers-jwt') && appState && netStat === 'offline' && notStore) {
    replace({ pathname: 'store' })
    callback()
  } else if (window.localStorage.getItem('feathers-jwt') && appState && posMode === 'offline' && notStore) {
    replace({ pathname: 'store' })
    callback()
  } else if (!api.get('token')) {
    api.passport.verifyJWT(window.localStorage.getItem('feathers-jwt'))
    .then(token => {
      return api.authenticate({ strategy: 'jwt', store: token.storeId })
    }).then(response => {
      callback()
    }).catch(error => {
      let errorMsg = error.message
      let error1 = 'NotAuthenticated: Could not find stored JWT and no authentication type was given'
      let error2 = 'Token provided to verifyJWT is missing or not a string'
      let error3 = 'Failed to fetch'
      if (window.localStorage.getItem('feathers-jwt') && notStore) {
        replace({ pathname: 'store' })
        callback()
      } else if (errorMsg === error1) {
        replace({ pathname: '/' })
        callback()
      } else if (errorMsg === error2) {
        replace({ pathname: '/' })
        callback()
      } else if (errorMsg === error3) {
        callback()
      }// add fallback if needed
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
