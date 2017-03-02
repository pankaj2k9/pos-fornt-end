export const SET_ORDER_SEARCH_KEY = 'SET_SEARCH_KEY'
export const HOLD_ORDER = 'HOLD_ORDER'
export const REMOVE_ORDER = 'REMOVE_ORDER'

export function setOrderSearchKey (value) {
  return {
    type: SET_ORDER_SEARCH_KEY,
    value
  }
}

export function holdOrder (orderData) {
  return {
    type: HOLD_ORDER,
    orderData
  }
}

export function removeOrderOnHold (key) {
  return {
    type: REMOVE_ORDER,
    key
  }
}
