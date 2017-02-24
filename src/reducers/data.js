import { combineReducers } from 'redux'

import customers from './data/customers'
// import dataDWR from './dataDWR'
import products from './data/products'
import stores from './data/stores'
import orderData from './data/orderData'
import offlineOrders from './data/offlineOrders'

export default combineReducers({
  customers,
  // dataDWR,
  offlineOrders,
  products,
  stores,
  orderData
})
