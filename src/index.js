// No `Intl`, so use and load the polyfill.
if (!global.Intl) {
  global.Intl = require('intl')
}

import React from 'react'
import { render } from 'react-dom'
import { Router, browserHistory } from 'react-router'
import { Provider } from 'react-intl-redux'
import routes from './routes'
import './styles/styles.scss'
import 'font-awesome/css/font-awesome.css'

import { loadState, saveState } from './utils/localStorage'

import configureStore from './store/configureStore'
import messages from './utils/i18n/en'
console.log('API_URL = ' + process.env.API_URL)
const persistedState = loadState()

const intl = {
  intl: {
    locale: 'en',
    messages
  }
}

const initialState = Object.assign(intl, persistedState)

const store = configureStore(
  initialState
)

store.subscribe(() => {
  saveState({
    ordersOnHold: store.getState().ordersOnHold,
    app: store.getState().app,
    data: store.getState().data
  })
})

render(
  <Provider store={store} >
    <Router history={browserHistory} routes={routes} />
  </Provider>, document.getElementById('app')
)

// Install ServiceWorker and AppCache in the end since
// it's not most important operation and if main code fails,
// we do not want it installed
import { install } from 'offline-plugin/runtime'
install()
