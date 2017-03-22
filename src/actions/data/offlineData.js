import ordersService from '../../services/orders'

import {
  updateDailyData
} from './cashdrawers'

import {
  resetOrderData
} from './orderData'

import {
  setNewLastID,
  setActiveModal
} from '../app/mainUI'

export const PROCESS_OFFLINE_ORDER = 'PROCESS_OFFLINE_ORDER'
export function processOfflineOrder (orderInfo) {
  return {
    type: PROCESS_OFFLINE_ORDER,
    orderInfo
  }
}

export function makeOfflineOrder (orderInfo, receipt, activeDrawer) {
  return (dispatch) => {
    dispatch(setActiveModal('processingOrder'))
    setTimeout(e => {
      dispatch(processOfflineOrder(orderInfo))
      dispatch(setActiveModal('orderSuccess'))
      dispatch(setNewLastID())
      dispatch(updateDailyData(activeDrawer))
      dispatch(resetOrderData())
    }, 1000)
  }
}

export const SYNC_ORDERS_REQUEST = 'SYNC_ORDERS_REQUEST'
export function syncOrdersRequest () {
  return {
    type: SYNC_ORDERS_REQUEST
  }
}

export const SYNC_ORDER_SUCCESS = 'SYNC_ORDER_SUCCESS'
export function syncOrderSuccess () {
  return {
    type: SYNC_ORDER_SUCCESS
  }
}

export const SYNC_ORDERS_DONE = 'SYNC_ORDERS_DONE'
export function syncOrdersDone () {
  return {
    type: SYNC_ORDERS_DONE
  }
}

export const SYNC_ORDER_FAILED = 'SYNC_ORDER_FAILED'
export function syncOrderFailed (error, failedOrder) {
  return {
    type: SYNC_ORDER_FAILED,
    error,
    failedOrder
  }
}

export const SAVE_RECEIPT = 'SAVE_RECEIPT'
export function saveReceipt (receipt) {
  return {
    type: SAVE_RECEIPT,
    receipt
  }
}

export const UPDATE_SAVED_RECEIPT = 'UPDATE_SAVED_RECEIPT'
export function updateSavedReceipt (receipt) {
  return {
    type: UPDATE_SAVED_RECEIPT,
    receipt
  }
}

export const UPDATE_SYNC_LOG = 'UPDATE_SYNC_LOG'
export function updateSyncLog (syncLog) {
  var elem = document.getElementById('syncLog')
  elem.scrollTop = elem.scrollHeight
  return {
    type: UPDATE_SYNC_LOG,
    syncLog
  }
}

export const CLEAR_SYNC_LOG = 'CLEAR_SYNC_LOG'
export function clearSyncLog (syncLog) {
  return {
    type: CLEAR_SYNC_LOG
  }
}

export const SAVE_FAILED_DRAWER_UPDATE = 'SAVE_FAILED_DRAWER_UPDATE'
export function saveFailedDrawerUpdate (drawer) {
  return {
    type: SAVE_FAILED_DRAWER_UPDATE,
    drawer
  }
}

export const CLEAR_SAVED_RECEIPTS = 'CLEAR_SAVED_RECEIPTS'
export function clearSavedReceipts () {
  return {
    type: CLEAR_MESSAGES
  }
}

export const CLEAR_MESSAGES = 'CLEAR_MESSAGES'
export function clearMessages () {
  return {
    type: CLEAR_MESSAGES
  }
}

export function syncOfflineOrders (offlineOrders) {
  return (dispatch) => {
    dispatch(syncOrdersRequest())
    dispatch(updateSyncLog({start: 'Syncing Orders Started'}))
    let processCount = 0
    offlineOrders.forEach(offlineOrder => {
      return ordersService.create(offlineOrder)
      .then(response => {
        processCount++
        dispatch(updateSyncLog({id: offlineOrder.id}))
        dispatch(syncOrderSuccess(offlineOrder))
        if (processCount === offlineOrders.length) {
          setTimeout(function () {
            dispatch(updateSyncLog({end: 'Syncing Orders Finished'}))
            dispatch(syncOrdersDone())
          }, 2000)
        }
      })
      .catch(error => {
        dispatch(syncOrderFailed(error.message, offlineOrder))
      })
    })
  }
}
