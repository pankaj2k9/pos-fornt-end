import {
  PROCESS_OFFLINE_ORDER,
  SYNC_CASHDRAWERS_REQUEST,
  SYNC_CASHDRAWER_SUCCESS,
  SYNC_CASHDRAWER_FAILED,
  SYNC_CASHDRAWERS_DONE,
  SYNC_ORDERS_REQUEST,
  SYNC_ORDER_SUCCESS,
  SYNC_ORDER_FAILED,
  SYNC_ORDERS_DONE,
  UPDATE_SYNC_LOG,
  CLEAR_SYNC_LOG,
  SAVE_RECEIPT,
  SAVE_CREATE_FAILED_DRAWER,
  SAVE_UPDATE_FAILED_DRAWER,
  UPDATE_SAVED_RECEIPT,
  CLEAR_SAVED_RECEIPTS,
  CLEAR_MESSAGES
} from '../../actions/data/offlineData'

function offlineData (state = {
  createFailedDrawers: [],
  offlineOrders: [],
  failedOrders: [],
  successOrders: [],
  printedReceipts: [],
  failedDrawers: [],
  successDrawers: [],
  offlineDrawers: [],
  syncOrderSuccess: null,
  syncDrawerSuccess: null,
  syncLog: [],
  isProcessing: false
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
        syncOrderSuccess: true,
        failedOrders: state.failedOrders.filter(item => { return item.id !== action.successOrder.id })
      })
    case SYNC_ORDER_FAILED:
      state.failedOrders.push(action.failedOrder)
      return Object.assign({}, state, {
        isProcessing: false,
        failedOrders: state.failedOrders
      })
    case SYNC_ORDERS_DONE:
      const noFailedOrders = state.failedOrders.length === 0
      return Object.assign({}, state, {
        isProcessing: false,
        offlineOrders: [],
        syncOrderSuccess: noFailedOrders
      })
    case SYNC_CASHDRAWERS_REQUEST:
      return Object.assign({}, state, {
        isProcessing: true
      })
    case SYNC_CASHDRAWER_SUCCESS:
      state.successDrawers.push(action.successOrder)
      return Object.assign({}, state, {
        successDrawers: state.successDrawers,
        syncDrawerSuccess: true,
        failedDrawers: state.failedDrawers.filter(item => { return item.id !== action.successDrawer.id })
      })
    case SYNC_CASHDRAWER_FAILED:
      state.failedDrawers.push(action.failedDrawer)
      return Object.assign({}, state, {
        isProcessing: false,
        failedDrawers: state.failedDrawers
      })
    case SYNC_CASHDRAWERS_DONE:
      const noFailedCD = state.failedDrawers.length === 0
      return Object.assign({}, state, {
        isProcessing: false,
        offlineDrawers: [],
        syncDrawerSuccess: noFailedCD
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
    case SAVE_UPDATE_FAILED_DRAWER:
      let filteredDrawers = state.failedDrawers.filter(drawer => { return drawer && drawer.id !== action.drawer.id })
      filteredDrawers.push(action.drawer)
      return Object.assign({}, state, {
        failedDrawers: filteredDrawers
      })
    case SAVE_CREATE_FAILED_DRAWER:
      state.createFailedDrawers.push(action.drawer)
      return Object.assign({}, state, {
        createFailedDrawers: state.createFailedDrawers
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
