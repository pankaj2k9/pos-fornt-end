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
  saveReceipt,
  updateSavedOrders
} from './data/offlineData'

import {
  updateDailyData
} from './data/cashdrawers'

import {
  productsDecrease
} from '../actions/data/products'

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

export function fetchLastOrderId (storeId, storeCode) {
  return (dispatch) => {
    // fetch and sort by orderId
    const byOrderId = new Promise((resolve, reject) => {
      ordersService.find({storeId: storeId, limit: 1, sort: {id: -1}})
        .then((response) => {
          if (response.data.length > 0) {
            let orderID = Number(response.data[0].id.replace(/[^\d.]/g, ''))
            resolve(orderID)
          } else {
            resolve(0)
          }
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
            resolve(0)
          }
        }).catch(error => { reject(error.message) })
    })
    return global.Promise.all([byOrderId, byRefundId])
      .then((response) => {
        response = response.filter((value) => value !== undefined)
        // compare orderId and refundId
        // highest value is the lastId
        let lastId
        if (response.length > 0) {
          lastId = Math.max(...response)
        }
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
    const errors = []
    if (orderInfo.currency === 'odbo') {
      const pinCode = orderInfo.pinCode

      if (!pinCode || pinCode.length !== 4 || pinCode.match(/^[0-9]+$/) === null) {
        errors.push('WrongPincodeFormat')
      }
    }
    if (!orderInfo.adminId) {
      errors.push('NoCashier')
    }
    if (errors.length > 0) {
      dispatch(setActiveModal('custPincode', undefined, {
        errors
      }))
      return
    }
    dispatch(setActiveModal('processingOrder'))
    return ordersService.create(orderInfo)
    .then(order => {
      console.log('order', order)
      dispatch(setActiveModal('orderSuccess'))
      dispatch(orderSuccess())
      dispatch(setNewLastID())
      dispatch(updateDailyData(activeDrawer))
      dispatch(saveReceipt(receipt))
      dispatch(setCashTendered(0))
      dispatch(setPaymentMode('cash'))
      dispatch(productsDecrease(order.source, order.items))
      dispatch(updateSavedOrders())
    })
    .catch(error => {
      if (error && error.message === 'Pin code does not match.') {
        dispatch(setActiveModal('custPincode', undefined, {
          errors: ['WrongPincode']
        }))
      } else {
        dispatch(setActiveModal('orderFailed'))
        dispatch(orderFailure(error.message))
      }
    })
  }
}
