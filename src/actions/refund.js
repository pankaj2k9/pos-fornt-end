export const REFUND_REQUEST = 'REFUND REQUEST'
export const REFUND_SUCCESS = 'REFUND_SUCCESS'
export const REFUND_FAILURE = 'REFUND_FAILURE'

import refundService from '../services/refund'
import { setError } from './application'

import {
  printPreviewTotalReceipt
} from '../actions/helpers'

export function refundRequest () {
  return {
    type: REFUND_REQUEST
  }
}

export function refundSuccess () {
  return {
    type: REFUND_SUCCESS
  }
}

export function refundFailure () {
  return {
    type: REFUND_FAILURE
  }
}

export function refund (orderId, refundRemarks, storeId, details) {
  return (dispatch) => {
    dispatch(refundRequest())
    return refundService.create({id: orderId, refundRemarks: refundRemarks, storeId: storeId})
      .then(response => {
        details.trans.refundId = response.refundId
        dispatch(refundSuccess(response))
        dispatch(setError(null))
        dispatch(printPreviewTotalReceipt(details))
      })
      .catch(error => {
        dispatch(refundFailure())
        if (!refundRemarks) {
          dispatch(setError('Specify the reason of refund before refunding'))
        } else {
          dispatch(setError(error.message))
        }
      })
  }
}
