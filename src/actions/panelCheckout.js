export const SET_PAYMENT_MODE = 'SET_PAYMENT_MODE'
export const SET_DISCOUNT = 'SET_DISCOUNT'
export const ADD_PAYMENT_TYPE = 'ADD_PAYMENT_TYPE'
export const REMOVE_PAYMENT_TYPE = 'REMOVE_PAYMENT_TYPE'
export const SET_CASH_TENDERED = 'SET_CASH_TENDERED'
export const SET_TRANS_NUMBER = 'SET_TRANS_NUMBER'
export const SET_ORDER_NOTE = 'SET_ORDER_NOTE'
export const SET_PIN_CODE = 'SET_PIN_CODE'
export const SET_CARD_TYPE = 'SET_CARD_TYPE'
export const SET_PAYMENT_AMOUNT = 'SET_PAYMENT_AMOUNT'
export const SET_CARD_PROVIDER = 'SET_CARD_PROVIDER'
export const REMOVE_NOTE = 'REMOVE_NOTE'
export const PANEL_CHECKOUT_SHOULD_UPDATE = ' PANEL_CHECKOUT_SHOULD_UPDATE'
export const PANEL_CHECKOUT_RESET = 'PANEL_CHECKOUT_RESET'
export const CHECKOUT_FIELDS_RESET = 'CHECKOUT_FIELDS_RESET'
export const TOGGLE_BONUS_POINTS = 'TOGGLE_BONUS_POINTS'
export const PRINT_PREVIEW_TOTAL = 'PRINT_PREVIEW_TOTAL'

export const VERIFY_VOUCHER_REQUEST = 'VERIFY_VOUCHER_REQUEST'
export const VERIFY_VOUCHER_SUCCESS = 'VERIFY_VOUCHER_SUCCESS'
export const VERIFY_VOUCHER_FAILURE = 'VERIFY_VOUCHER_FAILURE'

import voucherService from '../services/voucher'
import {setVoucherDiscount} from './panelCart'
import {setActiveModal} from './app/mainUI'

export function printPreviewTotal (print, shouldUpdate) {
  return {
    type: PRINT_PREVIEW_TOTAL,
    print,
    shouldUpdate
  }
}

export function setPaymentMode (mode) {
  return {
    type: SET_PAYMENT_MODE,
    mode
  }
}

export function removeNote (message) {
  return {
    type: REMOVE_NOTE,
    message
  }
}

export function setPaymentAmount (amount) {
  return {
    type: SET_PAYMENT_AMOUNT,
    amount
  }
}

export function setCashTendered (cash) {
  return {
    type: SET_CASH_TENDERED,
    cash
  }
}

export function addPaymentType (payment) {
  return {
    type: ADD_PAYMENT_TYPE,
    payment
  }
}

export function removePaymentType (paymentType, key) {
  return {
    type: REMOVE_PAYMENT_TYPE,
    paymentType,
    key
  }
}

export function setDiscount (discountValue) {
  return {
    type: SET_DISCOUNT,
    discountValue
  }
}

export function setCardType (cardType) {
  return {
    type: SET_CARD_TYPE,
    cardType: cardType
  }
}

export function setCardProvider (cardProvider) {
  return {
    type: SET_CARD_PROVIDER,
    cardProvider: cardProvider
  }
}

export function setTransNumber (transNumber) {
  return {
    type: SET_TRANS_NUMBER,
    transNumber
  }
}

export function setOrderNote (note) {
  return {
    type: SET_ORDER_NOTE,
    note
  }
}

export function setPinCode (pincode) {
  return {
    type: SET_PIN_CODE,
    pincode: pincode === '' ? undefined : pincode
  }
}

export function panelCheckoutShouldUpdate (value) {
  return {
    type: PANEL_CHECKOUT_SHOULD_UPDATE,
    value
  }
}

export function panelCheckoutReset () {
  return {
    type: PANEL_CHECKOUT_RESET
  }
}

export function checkoutFieldsReset () {
  return {
    type: CHECKOUT_FIELDS_RESET
  }
}

export function toggleBonusPoints () {
  return {
    type: TOGGLE_BONUS_POINTS
  }
}

export function verifyVoucherRequest () {
  return {
    type: VERIFY_VOUCHER_REQUEST
  }
}

export function verifyVoucherSuccess () {
  return {
    type: VERIFY_VOUCHER_SUCCESS
  }
}

export function verifyVoucherFailure (error) {
  return {
    type: VERIFY_VOUCHER_FAILURE,
    error
  }
}

export function verifyVoucherCode (query) {
  return (dispatch) => {
    dispatch(verifyVoucherRequest())
    return voucherService.fetch(query)

    .then(voucher => {
      if (voucher.total === '1') {
        dispatch(setVoucherDiscount(voucher.data[0]))
        dispatch(setActiveModal(''))
      } else {
        let x = query.query
        dispatch(verifyVoucherFailure(`no voucher found with ${x.code}`))
      }
    })
    .catch(error => {
      dispatch(verifyVoucherFailure(error.message))
    })
  }
}
