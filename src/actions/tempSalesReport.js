import ordersService from '../services/orders'
import printTransactionReport from '../utils/printDailyReport/print'

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

export const SALES_REPORT_STORE_ORDERS = 'SALES_REPORT_STORE_ORDERS'
export function salesReportStoreOrders (response) {
  return { type: SALES_REPORT_STORE_ORDERS, response }
}
export const SALES_REPORT_FETCH_REQUEST = 'SALES_REPORT_FETCH_REQUEST'
export const SALES_REPORT_FETCH_SUCCESS = 'SALES_REPORT_FETCH_SUCCESS'
export const SALES_REPORT_FETCH_FAILURE = 'SALES_REPORT_FETCH_FAILURE'
export function salesReportFetchRequest () {
  return { type: SALES_REPORT_FETCH_REQUEST }
}
export function salesReportFetchSuccess () {
  return { type: SALES_REPORT_FETCH_SUCCESS }
}
export function salesReportFetchFailure (error) {
  return { type: SALES_REPORT_FETCH_FAILURE, error }
}
export function salesReportFetch (source, dateFrom, dateTo, idFrom, idTo) {
  return (dispatch) => {
    dispatch(salesReportFetchRequest())

    const params = {
      storeId: source,
      from: dateFrom,
      to: dateTo,
      idFrom,
      idTo
    }

    return ordersService.find(params)
      .then(response => {
        // Store first fetch
        let allOrders = [...response.data]

        const { total, data, limit } = response
        const firstResponseCount = data.length
        const goal = Number(total)

        // If not all orders are fetched, run server queries until complete
        if (goal > firstResponseCount) {
          const firstLimit = limit
          let ordersFetchArray = []
          let newSkip = firstResponseCount

          while (newSkip < goal) {
            const nextParams = params

            nextParams.limit = firstLimit
            nextParams.skip = newSkip
            newSkip += firstLimit

            const ordersFetch = new Promise((resolve, reject) => {
              return ordersService.find(nextParams)
                .then((response) => { resolve(response) })
                .catch(() => { reject('Failed fetching order') })
            })
            ordersFetchArray.push(ordersFetch)
          }

          // Run all order fetch
          global.Promise.all(ordersFetchArray)
            .then((response) => {
              response.forEach((fetchResponse) => {
                allOrders = [...allOrders, ...fetchResponse.data]
              })

              dispatch(salesReportStoreOrders({ data: allOrders }))
              dispatch(salesReportFetchSuccess())
              printTransactionReport({ orders: allOrders })
            })
            .catch((error) => {
              dispatch(salesReportFetchFailure(error))
            })
        } else {
          // End if all orders are fetched
          dispatch(salesReportFetchSuccess())
          printTransactionReport({ orders: allOrders })
        }
      })
      .catch(error => {
        dispatch(salesReportFetchFailure(error))
      })
  }
}

