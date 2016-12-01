export const ORDER_REQUEST = 'ORDER_REQUEST'
export const ORDER_SUCCESS = 'ORDER_SUCCESS'
export const ORDER_FAILURE = 'ORDER_FAILURE'
export const ORDER_STATE_RESET = 'ORDER_STATE_RESET'
export const TEMPORARY_RECEIPT_DATA = 'TEMPORARY_RECEIPT_DATA'
export const REPRINTING_RECEIPT = 'REPRINTING_RECEIPT'

import {
  addCashdrawerOpenCount,
  updateCashDrawer,
  setActiveModal
 } from './application'

import {
  afterOrderProcessed
} from './helpers'

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

export function processOrder (orderInfo, receipt, staff) {
  return (dispatch) => {
    dispatch(setActiveModal('orderProcessing'))
    dispatch(orderRequest())
    return ordersService.create(orderInfo)
    .then(order => {
      dispatch(orderSuccess())
      let newPoints = {
        points: order.redemptionPoints,
        newOdbo: Number(receipt.trans.previousOdbo) + Number(order.redemptionPoints)
      }
      const newReceipt = {
        items: receipt.items,
        info: {
          date: new Date(),
          staff,
          orderId: order.id
        },
        // trans: Object.assign(receipt.trans),
        trans: Object.assign(receipt.trans, newPoints),
        headerText: receipt.headerText,
        footerText: receipt.footerText
      }
      let data = { count: receipt.cashDrawerOpenCount }
      dispatch(updateCashDrawer(staff, data, order))
      dispatch(afterOrderProcessed())
      dispatch(temporaryReceiptData(newReceipt))
      if (order.id) {
        print(newReceipt)
        dispatch(addCashdrawerOpenCount())
      }
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
    })
    .catch(error => {
      dispatch(orderFailure(error.message))
      dispatch(afterOrderProcessed())
    })
  }
}
