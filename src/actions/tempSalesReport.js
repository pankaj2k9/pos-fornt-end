import ordersService from '../services/orders'

export const SALES_REPORT_CH_TYPE = 'SALES_REPORT_CH_TYPE'
export function changeReportType (reportType) {
  return { type: SALES_REPORT_CH_TYPE, reportType }
}

export const SALES_REPORT_CH_DATEPICKER_TO = 'SALES_REPORT_CH_DATEPICKER_TO'
export function changeDatepickerTo (date) {
  return { type: SALES_REPORT_CH_DATEPICKER_TO, date }
}
export const SALES_REPORT_CH_DATEPICKER_FR = 'SALES_REPORT_CH_DATEPICKER_FR'
export function changeDatepickerFr (date) {
  return { type: SALES_REPORT_CH_DATEPICKER_FR, date }
}

export const SALES_REPORT_CH_INPUT_IDTO = 'SALES_REPORT_CH_INPUT_IDTO'
export function changeInputIdTo (value) {
  return { type: SALES_REPORT_CH_INPUT_IDTO, value }
}
export const SALES_REPORT_CH_INPUT_IDFR = 'SALES_REPORT_CH_INPUT_IDFR'
export function changeInputIdFr (value) {
  return { type: SALES_REPORT_CH_INPUT_IDFR, value }
}

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

