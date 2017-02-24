import ordersService from '../../services/orders'

import {
  updateCashDrawer
  // setActiveModal
 } from '../app/mainUI'

import {
  temporaryReceiptData,
  reprintingReceipt
} from '../orders'

import {
  afterOrderProcessed
} from '../helpers'

import print from '../../utils/printReceipt/print'

export const PROCESS_OFFLINE_ORDER = 'PROCESS_OFFLINE_ORDER'
export function processOfflineOrder (orderInfo) {
  return {
    type: PROCESS_OFFLINE_ORDER,
    orderInfo
  }
}

export function makeOfflineOrder (orderInfo, receipt, lastId) {
  return (dispatch) => {
    dispatch(processOfflineOrder(orderInfo))
    print(receipt)
    let data = { count: receipt.cashDrawerOpenCount, posMode: 'offline' }
    dispatch(updateCashDrawer(data))
    dispatch(afterOrderProcessed())
    dispatch(temporaryReceiptData(receipt))
    // dispatch(lastOrderidSuccess(lastId))
    /**
     * reprintingReceipt sets reprinting state
     * when reprinting state is set to true value, it diplays a loading text
     * when reprinting state is set to false value, it hides the loading text
     * print() function does not detect the printing state so setTimeout is used
     * setTimeout() is used to emulate the change in reprinting state
     */
    dispatch(reprintingReceipt(true))
    setTimeout(function () {
      dispatch(reprintingReceipt(false))
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
      })
    })
  }
}
