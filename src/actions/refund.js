export const REFUND_REQUEST = 'REFUND REQUEST'
export const REFUND_SUCCESS = 'REFUND_SUCCESS'
export const REFUND_FAILURE = 'REFUND_FAILURE'

import refundService from '../services/refund'

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

export function refund (orderId, refundRemarks, storeId) {
  return (dispatch) => {
    dispatch(refundRequest())

    return refundService.create({id: orderId, refundRemarks: refundRemarks, storeId: storeId})
      .then(response => {
        dispatch(refundSuccess(response))
      })
      .catch(error => {
        dispatch(refundFailure(error))
      })
  }
}
