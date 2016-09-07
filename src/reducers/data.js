import { combineReducers } from 'redux'

import products from './products'
import customers from './customers'

export default combineReducers({
  products,
  customers
})
