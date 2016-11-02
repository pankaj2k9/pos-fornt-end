import {
  SALES_REPORT_FETCH_REQUEST,
  SALES_REPORT_FETCH_SUCCESS,
  SALES_REPORT_FETCH_FAILURE,
  SALES_REPORT_STORE_ORDERS,

  SALES_REPORT_CH_DATEPICKER_FR,
  SALES_REPORT_CH_DATEPICKER_TO,

  SALES_REPORT_CH_INPUT_IDTO,
  SALES_REPORT_CH_INPUT_IDFR,

  SALES_REPORT_CH_TYPE
} from '../actions/tempSalesReport'

function tempSalesReport (state = {
  isProcessing: false,
  error: undefined,
  orders: [],
  from: new Date(),
  to: new Date(),
  idFrom: undefined,
  idTo: undefined,
  reportType: 'date'
}, action) {
  switch (action.type) {
    case SALES_REPORT_FETCH_REQUEST:
      return Object.assign({}, state, {
        orders: [],
        isProcessing: true
      })
    case SALES_REPORT_FETCH_SUCCESS:
      return Object.assign({}, state, {
        isProcessing: false
      })
    case SALES_REPORT_FETCH_FAILURE:
      return Object.assign({}, state, {
        isProcessing: false,
        error: action.error
      })
    case SALES_REPORT_STORE_ORDERS:
      let orders = [...state.orders, ...action.response.data]

      return Object.assign({}, state, {
        orders
      })
    case SALES_REPORT_CH_DATEPICKER_FR:
      return Object.assign({}, state, {
        from: action.date
      })
    case SALES_REPORT_CH_DATEPICKER_TO:
      return Object.assign({}, state, {
        to: action.date
      })
    case SALES_REPORT_CH_INPUT_IDTO:
      return Object.assign({}, state, {
        idTo: action.value
      })
    case SALES_REPORT_CH_INPUT_IDFR:
      return Object.assign({}, state, {
        idFrom: action.value
      })
    case SALES_REPORT_CH_TYPE:
      return Object.assign({}, state, {
        reportType: action.reportType
      })
    default:
      return state
  }
}

export default tempSalesReport
