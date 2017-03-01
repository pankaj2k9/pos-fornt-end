import { combineReducers } from 'redux'

import customers from './data/customers'
import cashdrawers from './data/cashdrawers'
import products from './data/products'
import stores from './data/stores'
import orderData from './data/orderData'
import offlineData from './data/offlineData'

export default combineReducers({
  customers,
  cashdrawers,
  offlineData,
  products,
  stores,
  orderData
})
