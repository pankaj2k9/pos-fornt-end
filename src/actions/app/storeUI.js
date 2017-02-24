export const SET_PAYMENT_MODE = 'SET_PAYMENT_MODE'
export function setPaymentMode (mode) {
  return {
    type: SET_PAYMENT_MODE,
    mode
  }
}

export const SET_ACTIVE_CARD = 'SET_ACTIVE_CARD'
export function setActiveCard (cardType, cardProv) {
  return {
    type: SET_ACTIVE_CARD,
    cardType,
    cardProv
  }
}

export const SET_AMOUNT_TENDERED = 'SET_AMOUNT_TENDERED'
export function setAmountTendered (amount) {
  let tenderedAmt = `$${Number(amount)}`
  return {
    type: SET_AMOUNT_TENDERED,
    amount: tenderedAmt
  }
}

export const SET_CASH_TENDERED = 'SET_CASH_TENDERED'
export function setCashTendered (amount) {
  let tenderedAmt = `$${Number(amount)}`
  return {
    type: SET_CASH_TENDERED,
    amount: tenderedAmt
  }
}

export const SET_TRANS_CODE = 'SET_TRANS_CODE'
export function setTransCode (code, mode) {
  return {
    type: SET_TRANS_CODE,
    code,
    mode
  }
}

export const SET_FIELDS_DEFAULT = 'SET_FIELDS_DEFAULT'
export function setFieldsDefault () {
  return {
    type: SET_FIELDS_DEFAULT
  }
}
