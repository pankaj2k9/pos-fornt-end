import ordersService from '../services/orders'

export const SALES_REPORT_FETCH_REQUEST = 'SALES_REPORT_FETCH_REQUEST'
export const SALES_REPORT_FETCH_SUCCESS = 'SALES_REPORT_FETCH_SUCCESS'
export const SALES_REPORT_FETCH_FAILURE = 'SALES_REPORT_FETCH_FAILURE'
export function salesReportFetchRequest () {
  return { type: SALES_REPORT_FETCH_REQUEST }
}
export function salesReportFetchSuccess (orders) {
  return { type: SALES_REPORT_FETCH_SUCCESS, orders }
}
export function salesReportFetchFailure (error) {
  return { type: SALES_REPORT_FETCH_FAILURE, error }
}
export function salesReportFetch (source, dateFrom, dateTo, idFrom, idTo) {
  return (dispatch) => {
    dispatch(salesReportFetchRequest())

    const params = {
      storeId: source,
      to: dateTo,
      from: dateFrom,
      idTo: idTo,
      idFrom: idFrom
    }

    return ordersService.find(params)
      .then(response => {
        dispatch(salesReportFetchSuccess(response))
        console.log('SUCCESS FETCH ORDERS', response)
      })
      .catch(error => {
        console.log('FAILURE FETCH ORDERS', error)
        dispatch(salesReportFetchFailure(error))
      })
  }
}

