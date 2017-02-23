import {
  STORE_GET_IDS_REQUEST,
  STORE_GET_IDS_SUCCESS,
  STORE_GET_IDS_FAILURE
} from '../actions/dataSTRInfo'

function dataSTRInfo (state = {
  error: null,
  isProcessing: false,
  stores: []
}, action) {
  switch (action.type) {
    case STORE_GET_IDS_SUCCESS:
      return Object.assign({}, state, {
        isProcessing: false,
        stores: action.storeIds
      })
    case STORE_GET_IDS_FAILURE:
      return Object.assign({}, state, {
        isProcessing: false,
        error: action.error
      })
    case STORE_GET_IDS_REQUEST:
      return Object.assign({}, state, {
        isProcessing: true
      })
    default:
      return state
  }
}

export default dataSTRInfo
