import refundService from '../services/refund'

import {
  setError,
  setActiveModal,
  setNewLastID
} from './app/mainUI'
import { updateSavedReceipt, updateSavedOrders } from './data/offlineData'
import { setActiveOrderDetails, storeOrderFetch } from './settings'
import { storeOrdersSetActiveOrder } from './reports'

// import print from '../utils/printReceipt/print'

import { compPaymentsSum, compCashChange } from '../utils/computations'

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
  return (dispatch, getState) => {
    dispatch(refundRequest())
    return refundService.create(refundData)
      .then(response => {
        orderData.refundId = response.refundId
        orderData.dateRefunded = response.dateRefunded

        dispatch(refundSuccess())
        dispatch(setNewLastID())
        if (orderData.storeAddress) {
          orderData.type = 'refund'
          orderData.paymentInfo.refundId = refundData.refundId
          orderData.paymentInfo.refundAmt = compPaymentsSum(orderData.paymentInfo.payments, false, orderData.vouchers) - compCashChange(orderData.paymentInfo.payments)
          orderData.paymentInfo.dataRefunded = new Date()
          dispatch(updateSavedReceipt(orderData))
        }

        const duplicateOrder = Object.assign({}, orderData, {duplicate: true})
        if (currentPath === 'settings' ||
            currentPath === '/settings') {
          dispatch(setActiveOrderDetails(duplicateOrder))
        } else {
          dispatch(storeOrdersSetActiveOrder(duplicateOrder))
        }
        dispatch(setActiveModal('refundSuccess'))
        dispatch(updateSavedOrders())

        const state = getState()
        const mainUI = state.app.mainUI
        const settings = state.settings

        let query = {
          id: settings.orderSearchKey,
          refundId: settings.orderSearchKey,
          storeId: mainUI.activeStore.source
        }

        dispatch(storeOrderFetch(query))
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
