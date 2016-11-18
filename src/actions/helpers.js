import {
  panelCheckoutReset,
  checkoutFieldsReset,
  printPreviewTotal
} from './panelCheckout'
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
  setActiveModal,
  addCashdrawerOpenCount,
  resetAppState,
  setError
} from './application'

import {
  reprintingReceipt,
  orderStateReset
} from './orders'

import {
  resetSettingsState,
  customersSetSearchKey
} from './settings'

import print from '../utils/printReceipt/print'

const focusProductSearch = 'productsSearch'

export function printPreviewTotalReceipt (receipt, activeCustomer) {
  return (dispatch) => {
    /**
     * reprintingReceipt sets reprinting state
     * when reprinting state is set to true value, it diplays a loading text
     * when reprinting state is set to false value, it hides the loading text
     * print() function does not detect the printing state so setTimeout is used
     * setTimeout() is used to emulate the change in reprinting state
     */
    if (activeCustomer) {
      let newPoints = {
        points: receipt.trans.computations.total,
        newOdbo: Number(receipt.trans.previousOdbo) + Number(receipt.trans.computations.total)
      }
      receipt.trans = Object.assign(receipt.trans, newPoints)
    }
    receipt.info = { date: new Date() }
    print(receipt)
    setTimeout(function () {
      let print = false
      let shouldUpdate = false
      dispatch(printPreviewTotal(print, shouldUpdate))
      dispatch(setError(null))
      dispatch(closeActiveModal())
    }, 2000)
  }
}

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
    dispatch(closeActiveModal(focusProductSearch))
    dispatch(orderStateReset())
    dispatch(fetchAllProducts(locale))
    dispatch(fetchCustomers())
  }
}

export function resetCheckoutModal () {
  return (dispatch) => {
    dispatch(checkoutFieldsReset())
    dispatch(orderStateReset())
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
    dispatch(panelCartReset())
    dispatch(panelCheckoutReset())
    dispatch(orderStateReset())
    dispatch(closeActiveModal(focusProductSearch))
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
    dispatch(closeActiveModal(focusProductSearch))
  }
}

export function setActiveCustomerAndFocus (dispatch, customer, key) {
  return () => {
    dispatch(setActiveCustomer(customer))
    dispatch(closeActiveModal(focusProductSearch))
  }
}

export function searchCustomer (query) {
  return (dispatch) => {
    dispatch(fetchCustomers(query))
  }
}

export function onLogout () {
  return (dispatch) => {
    dispatch(reportsStateReset())
    dispatch(orderStateReset())
    dispatch(resetAppState())
  }
}

export function closeAndResetRecallModal (dispatch) {
  return () => {
    dispatch(closeActiveModal(focusProductSearch))
    dispatch(setOrderSearchKey(''))
  }
}

export function closeAndResetCustomerModal (dispatch) {
  return () => {
    dispatch(closeActiveModal(focusProductSearch))
    dispatch(customersSetSearchKey(null))
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
    dispatch(setError(null))
    document.getElementById('orderSearch').value = ''
  }
}
