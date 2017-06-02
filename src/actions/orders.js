export const ORDER_REQUEST = 'ORDER_REQUEST'
export const ORDER_SUCCESS = 'ORDER_SUCCESS'
export const ORDER_FAILURE = 'ORDER_FAILURE'
export const ORDER_STATE_RESET = 'ORDER_STATE_RESET'
export const FETCH_LAST_ID_REQUEST = 'FETCH_LAST_ID_REQUEST'
export const FETCH_LAST_ID_SUCCESS = 'FETCH_LAST_ID_SUCCESS'
export const FETCH_LAST_ID_FAILURE = 'FETCH_LAST_ID_FAILURE'

import {
  setActiveModal,
  setLastID,
  setNewLastID
} from './app/mainUI'

import {
  setCashTendered,
  setPaymentMode
} from './app/storeUI'

import {
  saveReceipt
} from './data/offlineData'

import {
  updateDailyData
} from './data/cashdrawers'

import ordersService from '../services/orders'

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

export function fetchLastIdRequest () {
  return {
    type: FETCH_LAST_ID_REQUEST
  }
}
export function fetchLastIdSuccess () {
  return {
    type: FETCH_LAST_ID_SUCCESS
  }
}

export function fetchLastIdFailure (error) {
  return {
    type: FETCH_LAST_ID_FAILURE,
    error
  }
}

export function fetchLastOrderId (storeId) {
  return (dispatch) => {
    // fetch and sort by orderId
    const byOrderId = new Promise((resolve, reject) => {
      ordersService.find({storeId: storeId, limit: 1, sort: {id: -1}})
        .then((response) => {
          let orderID = Number(response.data[0].id.replace(/[^\d.]/g, ''))
          resolve(orderID)
        }).catch(error => { reject(error.message) })
    })
    // fetch and sort by refundId
    const byRefundId = new Promise((resolve, reject) => {
      ordersService.find({storeId: storeId, limit: 1, sort: {refundId: -1}, noNullRefundId: true})
        .then((response) => {
          if (response.data.length > 0) {
            let refundId = Number(response.data[0].refundId.replace(/[^\d.]/g, ''))
            resolve(refundId)
          } else {
            resolve(undefined)
          }
        }).catch(error => { reject(error.message) })
    })
    return global.Promise.all([byOrderId, byRefundId])
      .then((response) => {
        response = response.filter((value) => value !== undefined)
        // compare orderId and refundId
        // highest value is the lastId
        let lastId = Math.max(...response)
        dispatch(fetchLastIdSuccess())
        dispatch(setLastID(lastId))
      })
      .catch(error => {
        dispatch(fetchLastIdFailure(error))
      })
  }
}

export function orderStateReset () {
  return {
    type: ORDER_STATE_RESET
  }
}

export function processOrder (orderInfo, receipt, activeDrawer) {
  return (dispatch) => {
    dispatch(setActiveModal('processingOrder'))
    return ordersService.create(orderInfo)
    .then(order => {
      dispatch(setActiveModal('orderSuccess'))
      dispatch(orderSuccess())
      dispatch(setNewLastID())
      dispatch(updateDailyData(activeDrawer))
      dispatch(saveReceipt(receipt))
      dispatch(setCashTendered(0))
      dispatch(setPaymentMode('cash'))
    })
    .catch(error => {
      dispatch(setActiveModal('orderFailed'))
      dispatch(orderFailure(error.message))
    })
  }
}
