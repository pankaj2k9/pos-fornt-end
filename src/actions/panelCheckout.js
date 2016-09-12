export const SET_PAYMENT_MODE = 'SET_PAYMENT_MODE'
export const SET_DISCOUNT = 'SET_DISCOUNT'
export const SET_CASH_TENDERED = 'SET_CASH_TENDERED'
export const SET_TRANS_NUMBER = 'SET_TRANS_NUMBER'
export const SET_ORDER_NOTE = 'SET_ORDER_NOTE'
export const SET_PIN_CODE = 'SET_PIN_CODE'
export const SET_CARD_TYPE = 'SET_CARD_TYPE'
export const SET_CARD_PROVIDER = 'SET_CARD_PROVIDER'
export const REMOVE_NOTE = 'REMOVE_NOTE'
export const PANEL_CHECKOUT_SHOULD_UPDATE = ' PANEL_CHECKOUT_SHOULD_UPDATE'
export const PANEL_CHECKOUT_RESET = 'PANEL_CHECKOUT_RESET'
export const CHECKOUT_FIELDS_RESET = 'CHECKOUT_FIELDS_RESET'

export const VERIFY_VOUCHER_REQUEST = 'VERIFY_VOUCHER_REQUEST'
export const VERIFY_VOUCHER_SUCCESS = 'VERIFY_VOUCHER_SUCCESS'
export const VERIFY_VOUCHER_FAILURE = 'VERIFY_VOUCHER_FAILURE'

import voucherService from '../services/voucher'
import {setVoucherDiscount} from './panelCart'
import {setActiveModal} from './application'

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

export function setCashTendered (cash) {
  return {
    type: SET_CASH_TENDERED,
    cash
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
    pincode
  }
}

export function panelCheckoutShouldUpdate () {
  return {
    type: PANEL_CHECKOUT_SHOULD_UPDATE
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

export function verifyVoucherFailure () {
  return {
    type: VERIFY_VOUCHER_FAILURE
  }
}

export function verifyVoucherCode (query) {
  return (dispatch) => {
    dispatch(verifyVoucherRequest())
    return voucherService.fetch(query)

    .then(voucher => {
      dispatch(setVoucherDiscount(voucher.data[0]))
      dispatch(setActiveModal(''))
    })
  }
}
