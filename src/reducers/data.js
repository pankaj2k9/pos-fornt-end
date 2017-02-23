import { combineReducers } from 'redux'

import dataCUST from './dataCUST'
// import dataDWR from './dataDWR'
import dataPROD from './dataPROD'
import dataSTRInfo from './dataSTRInfo'
import dataORDinfo from './dataORDinfo'

export default combineReducers({
  dataCUST,
  // dataDWR,
  dataPROD,
  dataSTRInfo,
  dataORDinfo
})
