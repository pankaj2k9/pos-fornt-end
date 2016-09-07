export const SET_ORDER_SEARCH_KEY = 'SET_SEARCH_KEY'
export const HOLD_ORDER = 'HOLD_ORDER'
export const RECALL_ORDER = 'RECALL_ORDER'

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

export function recallOrder (key) {
  return {
    type: RECALL_ORDER,
    key
  }
}
