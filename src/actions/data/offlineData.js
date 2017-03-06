import ordersService from '../../services/orders'

import {
  updateDailyData
} from './cashdrawers'

import {
  resetOrderData
  // setCashTendered
} from './orderData'

import {
  setNewLastID,
  setActiveModal
} from '../app/mainUI'

import print from '../../utils/printReceipt/print'

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
      print(receipt)
      dispatch(setNewLastID())
      dispatch(updateDailyData())
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
    let processCount = 0
    offlineOrders.forEach(offlineOrder => {
      return ordersService.create(offlineOrder)
      .then(response => {
        processCount++
        dispatch(syncOrderSuccess(offlineOrder))
        if (processCount === offlineOrders.length) {
          setTimeout(function () {
            dispatch(syncOrdersDone())
          }, 2000)
        }
      })
      .catch(error => {
        dispatch(syncOrderFailed(error.message, offlineOrder))
        dispatch(syncOrdersDone())
      })
    })
  }
}
