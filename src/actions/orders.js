export const ORDER_REQUEST = 'ORDER_REQUEST'
export const ORDER_SUCCESS = 'ORDER_SUCCESS'
export const ORDER_FAILURE = 'ORDER_FAILURE'
export const ORDER_STATE_RESET = 'ORDER_STATE_RESET'
export const TEMPORARY_RECEIPT_DATA = 'TEMPORARY_RECEIPT_DATA'
export const REPRINTING_RECEIPT = 'REPRINTING_RECEIPT'

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
    dispatch(orderRequest())
    return ordersService.create(orderInfo)
    .then(order => {
      dispatch(orderSuccess())
      dispatch(temporaryReceiptData(receipt))
      print(receipt)
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
      dispatch(orderFailure(error))
    })
  }
}
