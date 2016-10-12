import reportsService from '../services/reports'
import ordersService from '../services/orders'

export const REPORTS_SET_TAB = 'REPORTS_SET_TAB'
export function reportsSetTab (tab) {
  return { type: REPORTS_SET_TAB, tab }
}

export const REPORTS_SET_DATE = 'REPORTS_SET_DATE'
export function reportsSetDate (date) {
  return { type: REPORTS_SET_DATE, date }
}

export const REPORTS_STATE_RESET = 'REPORTS_STATE_RESET'
export function reportsStateReset () {
  return { type: REPORTS_STATE_RESET }
}

export const PRODUCTSALES_FETCH_REQUEST = 'PRODUCTSALES_FETCH_REQUEST'
export const PRODUCTSALES_FETCH_SUCCESS = 'PRODUCTSALES_FETCH_SUCCESS'
export const PRODUCTSALES_FETCH_FAILURE = 'PRODUCTSALES_FETCH_FAILURE'
export function productSalesFetchRequest () {
  return { type: PRODUCTSALES_FETCH_REQUEST }
}
export function productSalesFetchSuccess (productSales) {
  return { type: PRODUCTSALES_FETCH_SUCCESS, productSales }
}
export function productSalesFetchFailure (error) {
  return { type: PRODUCTSALES_FETCH_REQUEST, error }
}
export function productSalesFetch (source, from, to) {
  return (dispatch) => {
    dispatch(productSalesFetchRequest())

    return reportsService.findProductSales(source, from, to)
      .then(response => {
        dispatch(productSalesFetchSuccess(response))
      })
      .catch(error => {
        dispatch(productSalesFetchFailure(error))
      })
  }
}

export const COMPLETESALES_FETCH_REQUEST = 'COMPLETESALES_FETCH_REQUEST'
export const COMPLETESALES_FETCH_SUCCESS = 'COMPLETESALES_FETCH_SUCCESS'
export const COMPLETESALES_FETCH_FAILURE = 'COMPLETESALES_FETCH_FAILURE'
export function completeSalesFetchRequest () {
  return { type: COMPLETESALES_FETCH_REQUEST }
}
export function completeSalesFetchSuccess (completeSales, date) {
  return { type: COMPLETESALES_FETCH_SUCCESS, completeSales, date }
}
export function completeSalesFetchFailure (error) {
  return { type: COMPLETESALES_FETCH_REQUEST, error }
}
export function completeSalesFetch (source, date) {
  return (dispatch) => {
    dispatch(completeSalesFetchRequest())
    return reportsService.findCompleteSales(source, date)
      .then(response => {
        dispatch(completeSalesFetchSuccess(response, date))
      })
      .catch(error => {
        dispatch(completeSalesFetchFailure(error))
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
