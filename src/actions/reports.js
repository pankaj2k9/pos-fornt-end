import reportsService from '../services/reports'
import ordersService from '../services/orders'

export const REPORTS_SET_TAB = 'REPORTS_SET_TAB'
export function reportsSetTab (tab) {
  return { type: REPORTS_SET_TAB, tab }
}

export const REPORTS_STATE_RESET = 'REPORTS_STATE_RESET'
export function reportsStateReset () {
  return { type: REPORTS_STATE_RESET }
}

export const SALESREPORT_FETCH_REQUEST = 'SALESREPORT_FETCH_REQUEST'
export const SALESREPORT_FETCH_SUCCESS = 'SALESREPORT_FETCH_SUCCESS'
export const SALESREPORT_FETCH_FAILURE = 'SALESREPORT_FETCH_FAILURE'
export function salesReportFetchRequest () {
  return { type: SALESREPORT_FETCH_REQUEST }
}
export function salesReportFetchSuccess (productSales) {
  return { type: SALESREPORT_FETCH_SUCCESS, productSales }
}
export function salesReportFetchFailure (error) {
  return { type: SALESREPORT_FETCH_REQUEST, error }
}
export function salesReportFetch (source, from, to) {
  return (dispatch) => {
    dispatch(salesReportFetchRequest())

    return reportsService.find(source, from, to)
      .then(response => {
        dispatch(salesReportFetchSuccess(response))
      })
      .catch(error => {
        dispatch(salesReportFetchFailure(error))
      })
  }
}

export const STOREORDERS_SET_ACTIVE_ID = 'STOREORDERS_SET_ACTIVE_ID'
export function storeOrdersSetActiveId (orderId) {
  return { type: STOREORDERS_SET_ACTIVE_ID, orderId }
}

export const STOREORDERS_SET_PAGE = 'STOREORDERS_SET_PAGE'
export function storeOrdersSetPage (page) {
  return { type: STOREORDERS_SET_PAGE, page }
}

export const STOREORDERS_FETCH_REQUEST = 'STOREORDERS_FETCH_REQUEST'
export const STOREORDERS_FETCH_SUCCESS = 'STOREORDERS_FETCH_SUCCESS'
export const STOREORDERS_FETCH_FAILURE = 'STOREORDERS_FETCH_FAILURE'

export function storeOrdersFetchRequest () {
  return { type: STOREORDERS_FETCH_REQUEST }
}
export function storeOrdersFetchSuccess (response) {
  return { type: STOREORDERS_FETCH_SUCCESS, response }
}
export function storeOrdersFetchFailure (error) {
  return { type: STOREORDERS_FETCH_REQUEST, error }
}
export function storeOrdersFetch (params) {
  return (dispatch) => {
    dispatch(storeOrdersFetchRequest())

    return ordersService.find(params)
      .then(response => {
        dispatch(storeOrdersFetchSuccess(response))
      })
      .catch(error => {
        dispatch(storeOrdersFetchFailure(error))
      })
  }
}
