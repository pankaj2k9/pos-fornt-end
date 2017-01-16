import {
  LAST_ORDERID_REQUEST,
  LAST_ORDERID_SUCCESS,
  LAST_ORDERID_FAILURE,
  PROCESS_OFFLINE_ORDER,
  SYNC_ORDERS_REQUEST,
  SYNC_ORDERS_SUCCESS,
  SYNC_ORDERS_FAILURE
} from '../actions/offlineOrders'

function offlineOrders (state = {
  lastOrderId: undefined,
  processedOfflineOrders: [],
  failedOrders: [],
  successOrders: [],
  isProcessing: false,
  error: undefined
}, action) {
  switch (action.type) {
    case LAST_ORDERID_REQUEST:
      return Object.assign({}, state, {
        isProcessing: true
      })
    case LAST_ORDERID_SUCCESS:
      return Object.assign({}, state, {
        isProcessing: false,
        lastOrderId: action.lastId
      })
    case LAST_ORDERID_FAILURE:
      return Object.assign({}, state, {
        isProcessing: false,
        error: action.error
      })
    case PROCESS_OFFLINE_ORDER:
      state.processedOfflineOrders.push(action.orderInfo)
      return Object.assign({}, state, {
        processedOfflineOrders: state.processedOfflineOrders
      })
    case SYNC_ORDERS_REQUEST:
      return Object.assign({}, state, {
        isProcessing: true
      })
    case SYNC_ORDERS_SUCCESS:
      state.successOrders.push(action.successOrder)
      return Object.assign({}, state, {
        isProcessing: false,
        processedOfflineOrders: [],
        successOrders: state.successOrders
      })
    case SYNC_ORDERS_FAILURE:
      state.failedOrders.push(action.failedOrder)
      return Object.assign({}, state, {
        isProcessing: false,
        error: action.error,
        failedOrders: state.failedOrders
      })
    default:
      return state
  }
}

export default offlineOrders
