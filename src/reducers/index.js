// Set up your root reducer here...
import { combineReducers } from 'redux'

import { intlReducer } from 'react-intl-redux'
import { addLocaleData } from 'react-intl'
import enLocaleData from 'react-intl/locale-data/en'
import zhLocaleData from 'react-intl/locale-data/zh'

import application from './application'
import login from './login'
import data from './data'
import panelProducts from './panelProducts'
import panelCart from './panelCart'
import panelCheckout from './panelCheckout'
import orders from './orders'
import reports from './reports'
import ordersOnHold from './ordersOnHold'
import settings from './settings'

addLocaleData([
  ...enLocaleData,
  ...zhLocaleData
])

const rootReducer = combineReducers({
  application,
  login,
  data,
  intl: intlReducer,
  panelCart,
  panelProducts,
  panelCheckout,
  orders,
  ordersOnHold,
  reports,
  settings
})

export default rootReducer
