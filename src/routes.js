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
function requireAuth (nextState, replace) {
  if (!api.get('token')) {
    replace({ pathname: '/' })
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
