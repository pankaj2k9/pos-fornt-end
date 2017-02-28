import { combineReducers } from 'redux'

import customers from './data/customers'
import cashdrawers from './data/cashdrawers'
import products from './data/products'
import stores from './data/stores'
import orderData from './data/orderData'
import offlineOrders from './data/offlineOrders'

export default combineReducers({
  customers,
  cashdrawers,
  offlineOrders,
  products,
  stores,
  orderData
})
