import {
  PROCESS_OFFLINE_ORDER,
  SYNC_ORDERS_REQUEST,
  SYNC_ORDER_SUCCESS,
  SYNC_ORDER_FAILED,
  SYNC_ORDERS_DONE,
  UPDATE_SYNC_LOG,
  CLEAR_SYNC_LOG,
  SAVE_RECEIPT,
  SAVE_FAILED_DRAWER_UPDATE,
  UPDATE_SAVED_RECEIPT,
  CLEAR_SAVED_RECEIPTS,
  CLEAR_MESSAGES
} from '../../actions/data/offlineData'

import moment from 'moment'

function offlineData (state = {
  offlineOrders: [],
  failedOrders: [],
  successOrders: [],
  printedReceipts: [],
  failedDrawers: [],
  successDrawers: [],
  offlineDrawers: [],
  syncSuccess: null,
  syncLog: [],
  isProcessing: false,
  connectionError: null
}, action) {
  let printedReceipts = state.printedReceipts
  switch (action.type) {
    case PROCESS_OFFLINE_ORDER:
      state.offlineOrders.push(action.orderInfo)
      return Object.assign({}, state, {
        offlineOrders: state.offlineOrders
      })
    case SYNC_ORDERS_REQUEST:
      return Object.assign({}, state, {
        isProcessing: true
      })
    case SYNC_ORDER_SUCCESS:
      state.successOrders.push(action.successOrder)
      return Object.assign({}, state, {
        successOrders: state.successOrders,
        syncOrderSuccess: true
      })
    case SYNC_ORDER_FAILED:
      let updatedFailedOrders = state.failedOrders.push(action.failedOrder)
      return Object.assign({}, state, {
        isProcessing: false,
        failedOrders: updatedFailedOrders
      })
    case SYNC_ORDERS_DONE:
      const noFailedOrders = state.failedOrders.length === 0
      return Object.assign({}, state, {
        isProcessing: false,
        offlineOrders: [],
        connectionError: !noFailedOrders ? 'syncError' : undefined,
        syncOrderSuccess: noFailedOrders
      })
    case UPDATE_SYNC_LOG:
      state.syncLog.push(action.syncLog)
      return Object.assign({}, state, {
        syncLog: state.syncLog
      })
    case CLEAR_SYNC_LOG:
      return Object.assign({}, state, {
        syncLog: []
      })
    case SAVE_RECEIPT:
      printedReceipts.push(action.receipt)
      return Object.assign({}, state, {
        printedReceipts: printedReceipts
      })
    case UPDATE_SAVED_RECEIPT:
      let newReceipt = action.receipt
      let updatedData = printedReceipts.filter(receipt => { return receipt.extraInfo.id !== newReceipt.extraInfo.id })
      updatedData.push(newReceipt)
      return Object.assign({}, state, {
        printedReceipts: updatedData
      })
    case SAVE_FAILED_DRAWER_UPDATE:
      state.failedDrawers.filter(drawer => {
        let drawerDate = moment(drawer.date).format('L')
        let drawerDate2 = moment(action.drawer.date).format('L')
        return drawerDate !== drawerDate2
      })
      state.failedDrawers.push(action.drawer)
      return Object.assign({}, state, {
        failedDrawers: state.failedDrawers
      })
    case CLEAR_SAVED_RECEIPTS:
      return Object.assign({}, state, {
        printedReceipts: []
      })
    case CLEAR_MESSAGES:
      return Object.assign({}, state, {
        isProcessing: false,
        connectionError: false,
        syncOrderSuccess: null
      })
    default:
      return state
  }
}

export default offlineData
