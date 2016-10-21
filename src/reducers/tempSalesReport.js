import {
  SALES_REPORT_FETCH_REQUEST,
  SALES_REPORT_FETCH_SUCCESS,
  SALES_REPORT_FETCH_FAILURE
} from '../actions/tempSalesReport'

function tempSalesReport (state = {
  isProcessing: false,
  error: undefined,
  orders: [],
  from: new Date(),
  to: new Date(),
  idFrom: undefined,
  idTo: undefined
}, action) {
  switch (action.type) {
    case SALES_REPORT_FETCH_REQUEST:
      return Object.assign({}, state, {
        isProcessing: true
      })
    case SALES_REPORT_FETCH_SUCCESS:
      return Object.assign({}, state, {
        orders: action.orders.data,
        isProcessing: false
      })
    case SALES_REPORT_FETCH_FAILURE:
      return Object.assign({}, state, {
        isProcessing: false,
        error: action.error
      })
    default:
      return state
  }
}

export default tempSalesReport
