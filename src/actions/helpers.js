import moment from 'moment'

import {
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
  setCashTendered,
  setPaymentMode
} from './app/storeUI'

import {
  orderStateReset
} from './orders'

export function cancelOrder () {
  return (dispatch) => {
    dispatch(resetOrderData())
    dispatch(setFieldsDefault())
    dispatch(setCashTendered(0))
    dispatch(setPaymentMode('cash'))
  }
}

export function validateCashdrawers (cashdrawers) {
  return (dispatch) => {
    let matchedDrawer
    cashdrawers.forEach(drawer => {
      let drawerDate = moment(drawer.date).format('L')
      let currentDate = moment(new Date()).format('L')
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
