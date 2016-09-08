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
    ordersOnHold: store.getState().ordersOnHold
  })
})

render(
  <Provider store={store} >
    <Router history={browserHistory} routes={routes} />
  </Provider>, document.getElementById('app')
)
