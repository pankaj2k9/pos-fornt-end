import {
  addPaymentType,
  resetOrderData
} from './data/orderData'

import {
  reportsStateReset
} from './reports'

import {
  holdOrder
} from './ordersOnHold'

import {
  closeActiveModal,
  setActiveModal,
  setActiveCashdrawer,
  resetAppState
} from './app/mainUI'

import {
  setFieldsDefault,
  setCashTendered
} from './app/storeUI'

import {
  orderStateReset
} from './orders'

export function addOdboPayment (total) {
  return (dispatch) => {
    dispatch(setActiveModal('custPincode'))
    dispatch(addPaymentType({type: 'odbo', amount: total}))
  }
}

export function cancelOrder () {
  return (dispatch) => {
    dispatch(resetOrderData())
    dispatch(setFieldsDefault())
    dispatch(setCashTendered(0))
  }
}

export function validateCashdrawers (cashdrawers) {
  return (dispatch) => {
    let matchedDrawer
    cashdrawers.forEach(drawer => {
      let drawerDate = new Date(drawer.date).toISOString().slice(0, 10)
      let currentDate = new Date().toISOString().slice(0, 10)
      if (drawerDate === currentDate) {
        matchedDrawer = drawer
      }
    })
    if (matchedDrawer && Number(matchedDrawer.float) > 0) {
      dispatch(setActiveCashdrawer(matchedDrawer))
    } else if (matchedDrawer && Number(matchedDrawer.float) === 0) {
      dispatch(setActiveCashdrawer(matchedDrawer))
      dispatch(setActiveModal('updateCashdrawer'))
    } else if (!matchedDrawer) {
      dispatch(setActiveModal('updateCashdrawer'))
    }
  }
}

export function afterOrderProcessed () {
  return (dispatch) => {
    dispatch(closeActiveModal())
    dispatch(setActiveModal('orderProcessed'))
  }
}

export function holdOrderAndReset (orderData) {
  return (dispatch) => {
    dispatch(holdOrder(orderData))
    dispatch(resetOrderData())
  }
}

export function onLogout () {
  return (dispatch) => {
    dispatch(reportsStateReset())
    dispatch(orderStateReset())
    dispatch(resetAppState())
  }
}
