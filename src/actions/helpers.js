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

export function validateCashdrawers (cashdrawers, lastClosedDay) {
  return (dispatch, getState) => {
    let matchedDrawer
    let currentDateStr = moment(new Date()).format('L')

    cashdrawers.forEach(drawer => {
      let drawerDate = new Date(drawer.dateCreated)
      let drawerDateStr = moment(drawer.date).format('L')

      if (lastClosedDay) {
        if (drawerDateStr === currentDateStr && drawerDate > lastClosedDay) {
          matchedDrawer = drawer
        }
      } else {
        if (drawerDateStr === currentDateStr) {
          matchedDrawer = drawer
        }
      }
    })
    if (matchedDrawer) {
      dispatch(setActiveCashdrawer(matchedDrawer))
    } else {
      dispatch(setActiveCashdrawer(undefined))
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
