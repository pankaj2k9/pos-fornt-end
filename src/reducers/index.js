// Set up your root reducer here...
import { combineReducers } from 'redux'

import { intlReducer } from 'react-intl-redux'
import { addLocaleData } from 'react-intl'
import enLocaleData from 'react-intl/locale-data/en'
import zhLocaleData from 'react-intl/locale-data/zh'

import app from './app'
import login from './login'
import data from './data'
import orders from './orders'
import reports from './reports'
import ordersOnHold from './ordersOnHold'
import settings from './settings'

addLocaleData([
  ...enLocaleData,
  ...zhLocaleData
])

const rootReducer = combineReducers({
  app,
  login,
  data,
  intl: intlReducer,
  orders,
  ordersOnHold,
  reports,
  settings
})

export default rootReducer
