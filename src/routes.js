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
  const posMode = appState ? appState.app.mainUI.posMode : undefined
  const netStat = appState ? appState.app.mainUI.networkStatus : undefined
  const token = window.localStorage.getItem('feathers-jwt')

  if (!token && nextRoute !== '/') {
    replace({ pathname: '/' })
    callback()
  } else if (!token && nextRoute === '/') {
    callback()
  } else if (token && appState && netStat === 'offline' && posMode === 'offline' && nextRoute !== 'store') {
    replace({ pathname: 'store' })
    callback()
  } else if (!api.get('token')) {
    api.passport.verifyJWT(token)
    .then(token => {
      if (token && appState && netStat === 'online') {
        callback()
        return api.authenticate({ strategy: 'jwt', store: token.storeId })
        .then(response => {
          if (token && nextRoute === '/') {
            replace({ pathname: 'store' })
          } else if (token && appState && posMode === 'offline' && nextRoute !== 'store') {
            replace({ pathname: 'store' })
          }
          callback()
        })
      } else if (token && appState && posMode === 'offline' && nextRoute !== 'store') {
        replace({ pathname: 'store' })
        callback()
      }
    }).then(response => {
      if (token && nextRoute === '/') {
        replace({ pathname: 'store' })
      } else if (token && appState && posMode === 'offline' && nextRoute !== 'store') {
        replace({ pathname: 'store' })
      }
      callback()
    }).catch(error => {
      let errorMsg = error.message
      let error1 = 'NotAuthenticated: Could not find stored JWT and no authentication type was given'
      let error2 = 'Token provided to verifyJWT is missing or not a string'
      let error3 = 'Failed to fetch'
      if (token) {
        replace({ pathname: nextRoute })
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
    <IndexRoute component={Login} onEnter={requireAuth} />
    <Route path='store' component={Store} onEnter={requireAuth} />
    <Route path='settings' component={Settings} onEnter={requireAuth} />
    <Route path='reports' component={Reports} onEnter={requireAuth} />
    <Route path='*' component={NotFound} />
  </Route>
)
