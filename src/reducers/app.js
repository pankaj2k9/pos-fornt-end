import { combineReducers } from 'redux'

import mainUI from './app/mainUI'
import storeUI from './app/storeUI'

export default combineReducers({
  mainUI,
  storeUI
})
