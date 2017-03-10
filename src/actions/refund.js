import refundService from '../services/refund'

import {
  setError,
  setActiveModal,
  setNewLastID
} from './app/mainUI'
import { updateSavedReceipt } from './data/offlineData'
import { setActiveOrderDetails } from './settings'
import { storeOrdersSetActiveOrder } from './reports'

import print from '../utils/printReceipt/print'

import {
  processOrderSearchReceipt,
  processStoreAddress,
  compPaymentsSum
} from '../utils/computations'

export const REFUND_REQUEST = 'REFUND REQUEST'
export function refundRequest () {
  return {
    type: REFUND_REQUEST
  }
}

export const REFUND_SUCCESS = 'REFUND_SUCCESS'
export function refundSuccess () {
  return {
    type: REFUND_SUCCESS
  }
}

export const REFUND_FAILURE = 'REFUND_FAILURE'
export function refundFailure () {
  return {
    type: REFUND_FAILURE
  }
}

export function refund (refundData, storeData, orderData, currentPath) {
  return (dispatch) => {
    dispatch(refundRequest())
    return refundService.create(refundData)
      .then(response => {
        if (currentPath === '/settings') {
          dispatch(setActiveOrderDetails(response))
        } else {
          dispatch(storeOrdersSetActiveOrder(response))
        }
        dispatch(setActiveModal('orderDetails'))
        dispatch(refundSuccess(response))
        dispatch(setNewLastID())
        if (!orderData.storeAddress) {
          let storeAddress = processStoreAddress(storeData)
          let receipt = processOrderSearchReceipt('refund', orderData, storeAddress, refundData.refundId)
          print(receipt)
        } else {
          orderData.type = 'refund'
          orderData.paymentInfo.refundId = refundData.refundId
          orderData.paymentInfo.refundAmt = compPaymentsSum(orderData.paymentInfo.payments, 'noVoucher')
          orderData.paymentInfo.dataRefunded = new Date()
          dispatch(updateSavedReceipt(orderData))
          print(orderData)
        }
      })
      .catch(error => {
        dispatch(refundFailure())
        if (!refundData.refundRemarks) {
          dispatch(setError('app.error.noRemark'))
        } else {
          dispatch(setError(error.message))
        }
      })
  }
}
