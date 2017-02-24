import {
  PROCESS_OFFLINE_ORDER,
  SYNC_ORDERS_REQUEST,
  SYNC_ORDER_SUCCESS,
  SYNC_ORDER_FAILED,
  SYNC_ORDERS_DONE,
  CLEAR_MESSAGES
} from '../../actions/data/offlineOrders'

function offlineOrders (state = {
  processedOfflineOrders: [],
  failedOrders: [],
  successOrders: [],
  syncSuccess: undefined,
  isProcessing: false,
  syncError: undefined
}, action) {
  switch (action.type) {
    case PROCESS_OFFLINE_ORDER:
      state.processedOfflineOrders.push(action.orderInfo)
      return Object.assign({}, state, {
        processedOfflineOrders: state.processedOfflineOrders
      })
    case SYNC_ORDERS_REQUEST:
      return Object.assign({}, state, {
        isProcessing: true
      })
    case SYNC_ORDER_SUCCESS:
      state.successOrders.push(action.successOrder)
      return Object.assign({}, state, {
        successOrders: state.successOrders
      })
    case SYNC_ORDER_FAILED:
      state.failedOrders.push(action.failedOrder)
      return Object.assign({}, state, {
        syncError: action.error,
        failedOrders: state.failedOrders
      })
    case SYNC_ORDERS_DONE:
      const noFailedOrders = state.failedOrders.length === 0
      return Object.assign({}, state, {
        isProcessing: false,
        processedOfflineOrders: [],
        syncError: !noFailedOrders ? 'syncError' : undefined,
        syncSuccess: noFailedOrders
      })
    case CLEAR_MESSAGES:
      return Object.assign({}, state, {
        isProcessing: false,
        syncError: undefined,
        syncSuccess: undefined
      })
    default:
      return state
  }
}

export default offlineOrders
