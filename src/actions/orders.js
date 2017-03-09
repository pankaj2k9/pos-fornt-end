export const ORDER_REQUEST = 'ORDER_REQUEST'
export const ORDER_SUCCESS = 'ORDER_SUCCESS'
export const ORDER_FAILURE = 'ORDER_FAILURE'
export const ORDER_STATE_RESET = 'ORDER_STATE_RESET'
export const TEMPORARY_RECEIPT_DATA = 'TEMPORARY_RECEIPT_DATA'
export const REPRINTING_RECEIPT = 'REPRINTING_RECEIPT'

import {
  setActiveModal,
  setNewLastID
} from './app/mainUI'

import {
  saveReceipt
} from './data/offlineData'

import ordersService from '../services/orders'
import print from '../utils/printReceipt/print'

export function orderRequest () {
  return {
    type: ORDER_REQUEST
  }
}
export function orderSuccess () {
  return {
    type: ORDER_SUCCESS
  }
}

export function orderFailure (error) {
  return {
    type: ORDER_FAILURE,
    error
  }
}

export function temporaryReceiptData (receipt) {
  return {
    type: TEMPORARY_RECEIPT_DATA,
    receipt
  }
}

export function reprintingReceipt (reprint) {
  return {
    type: REPRINTING_RECEIPT,
    reprint
  }
}

export function orderStateReset () {
  return {
    type: ORDER_STATE_RESET
  }
}

export function processOrder (orderInfo, receipt) {
  return (dispatch) => {
    dispatch(setActiveModal('processingOrder'))
    dispatch(orderRequest())
    return ordersService.create(orderInfo)
    .then(order => {
      dispatch(setActiveModal('orderSuccess'))
      print(receipt)
      dispatch(orderSuccess())
      dispatch(setNewLastID())
      dispatch(saveReceipt(receipt))
    })
    .catch(error => {
      dispatch(setActiveModal('orderFailed'))
      dispatch(setNewLastID())
      dispatch(orderFailure(error.message))
    })
  }
}
