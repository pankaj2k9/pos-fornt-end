import {
  ORDER_REQUEST,
  ORDER_SUCCESS,
  ORDER_FAILURE,
  ORDER_STATE_RESET,
  TEMPORARY_RECEIPT_DATA,
  REPRINTING_RECEIPT
} from '../actions/orders'

function orders (state = {
  isProcessing: false,
  orderSuccess: false,
  orderError: null,
  receipt: null,
  reprinting: false
}, action) {
  switch (action.type) {
    case ORDER_REQUEST:
      return Object.assign({}, state, {
        isProcessing: true
      })
    case ORDER_SUCCESS:
      return Object.assign({}, state, {
        isProcessing: false,
        orderSuccess: true,
        orderError: null
      })
    case ORDER_FAILURE:
      return Object.assign({}, state, {
        isProcessing: false,
        orderError: action.error,
        orderSuccess: false
      })
    case TEMPORARY_RECEIPT_DATA:
      return Object.assign({}, state, {
        receipt: action.receipt
      })
    case REPRINTING_RECEIPT:
      return Object.assign({}, state, {
        reprinting: action.reprint
      })
    case ORDER_STATE_RESET:
      return Object.assign({}, state, {
        isProcessing: false,
        orderError: null,
        orderSuccess: false,
        receipt: null
      })
    default:
      return state
  }
}

export default orders
