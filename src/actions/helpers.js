import {panelCheckoutReset, checkoutFieldsReset} from './panelCheckout'
import {
  panelCartReset,
  setWalkinCustomer,
  setActiveCustomer,
  recallCartItems
} from './panelCart'

import {
  reportsStateReset
} from './reports'

import {
  holdOrder,
  recallOrder,
  setOrderSearchKey
} from './ordersOnHold'

import {
  fetchCustomers
} from './customers'

import {
  fetchAllProducts
} from './products'

import {
  closeActiveModal,
  addCashdrawerOpenCount,
  resetAppState
} from './application'

import {
  reprintingReceipt,
  orderStateReset
} from './orders'

import {
  resetSettingsState
} from './settings'

import print from '../utils/printReceipt/print'

export function reprintReceipt (receiptData) {
  return (dispatch) => {
    /**
     * reprintingReceipt sets reprinting state
     * when reprinting state is set to true value, it diplays a loading text
     * when reprinting state is set to false value, it hides the loading text
     * print() function does not detect the printing state so setTimeout is used
     * setTimeout() is used to emulate the change in reprinting state
     */
    dispatch(addCashdrawerOpenCount())
    dispatch(reprintingReceipt(true))
    print(receiptData)
    setTimeout(function () {
      dispatch(reprintingReceipt(false))
    }, 3000)
  }
}

export function resetStore (locale) {
  return (dispatch) => {
    dispatch(panelCheckoutReset())
    dispatch(panelCartReset())
    dispatch(closeActiveModal(''))
    dispatch(orderStateReset())
    dispatch(fetchAllProducts(locale))
  }
}

export function resetCheckoutModal () {
  return (dispatch) => {
    dispatch(checkoutFieldsReset())
    dispatch(orderStateReset())
  }
}

export function holdOrderAndReset (orderData) {
  return (dispatch) => {
    dispatch(holdOrder(orderData))
    dispatch(panelCartReset())
    dispatch(panelCheckoutReset())
    dispatch(orderStateReset())
    document.getElementById('productsSearch').focus()
  }
}

export function recallOrderOnHold (dispatch, cartData, key) {
  return () => {
    dispatch(setWalkinCustomer(cartData.walkinCustomer))
    dispatch(setActiveCustomer(cartData.activeCustomer))
    dispatch(
      recallCartItems(
      cartData.cartItemsArray,
      cartData.totalPrice,
      cartData.totalOdboPrice)
    )
    dispatch(recallOrder(key))
    dispatch(closeActiveModal(''))
    document.getElementById('productsSearch').focus()
  }
}

export function searchCustomer (query) {
  return (dispatch) => {
    dispatch(fetchCustomers(query))
  }
}

export function onLogout () {
  return (dispatch) => {
    dispatch(panelCartReset())
    dispatch(panelCheckoutReset())
    dispatch(reportsStateReset())
    dispatch(orderStateReset())
    dispatch(resetAppState())
  }
}

export function closeAndResetRecallModal (dispatch) {
  return () => {
    dispatch(closeActiveModal())
    dispatch(setOrderSearchKey(''))
    document.getElementById('productsSearch').focus()
  }
}

export function setSearchKeyInOrders (dispatch, value) {
  return () => {
    dispatch(setOrderSearchKey(value))
  }
}

export function closeAndResetUtilitytModal (dispatch) {
  return () => {
    dispatch(closeActiveModal())
    dispatch(resetSettingsState())
    document.getElementById('orderSearch').value = ''
  }
}
