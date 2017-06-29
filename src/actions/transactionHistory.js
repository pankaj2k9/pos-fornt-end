export const TRANSACTIONS_REQUEST = 'TRANSACTIONS_REQUEST'
export const TRANSACTIONS_SUCCESS = 'TRANSACTIONS_SUCCESS'
export const TRANSACTIONS_FAILURE = 'TRANSACTIONS_FAILURE'
export const TRANSACTIONS_SET_ODBO_ID = 'TRANSACTIONS_SET_ODBO_ID'

import ordersService from '../services/orders'

export function transactionsRequest () {
  return {
    type: TRANSACTIONS_REQUEST
  }
}
export function transactionsSuccess (response) {
  return {
    type: TRANSACTIONS_SUCCESS,
    response
  }
}

export function transactionsFailure (error) {
  return {
    type: TRANSACTIONS_FAILURE,
    error
  }
}

export function transactionsSetOdboId (odboId) {
  return {
    type: TRANSACTIONS_SET_ODBO_ID,
    odboId
  }
}

export function fetchTransactionHistory () {
  return (dispatch, getState) => {
    dispatch(transactionsRequest())
    const state = getState()
    const { transactionHistory } = state
    const { odboId } = transactionHistory
    return ordersService.find({odboId})
      .then((response) => {
        dispatch(transactionsSuccess(response))
      })
      .catch(error => {
        if (error) {
          dispatch(transactionsFailure('Can\'t connect to server'))
        }
      })
  }
}
