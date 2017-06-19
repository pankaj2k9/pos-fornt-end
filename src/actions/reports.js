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

export const COMPLETESALES_CH_SOURCE = 'COMPLETESALES_CH_SOURCE'
export function completeSalesChSource (source) {
  return { type: COMPLETESALES_CH_SOURCE, source }
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

export const VIEW_BILLS_CH_TYPE = 'VIEW_BILLS_CH_TYPE'
export function changeReportType (reportType) {
  return { type: VIEW_BILLS_CH_TYPE, reportType }
}

export const VIEW_BILLS_CH_DATEPICKER_TO = 'VIEW_BILLS_CH_DATEPICKER_TO'
export function changeDatepickerTo (date) {
  return { type: VIEW_BILLS_CH_DATEPICKER_TO, date }
}
export const VIEW_BILLS_CH_DATEPICKER_FR = 'VIEW_BILLS_CH_DATEPICKER_FR'
export function changeDatepickerFr (date) {
  return { type: VIEW_BILLS_CH_DATEPICKER_FR, date }
}

export const VIEW_BILLS_CH_INPUT_IDTO = 'VIEW_BILLS_CH_INPUT_IDTO'
export function changeInputIdTo (value) {
  return { type: VIEW_BILLS_CH_INPUT_IDTO, value }
}
export const VIEW_BILLS_CH_INPUT_IDFR = 'VIEW_BILLS_CH_INPUT_IDFR'
export function changeInputIdFr (value) {
  return { type: VIEW_BILLS_CH_INPUT_IDFR, value }
}

export const VIEW_BILLS_STORE_ORDERS = 'VIEW_BILLS_STORE_ORDERS'
export function viewBillsStoreOrders (response) {
  return { type: VIEW_BILLS_STORE_ORDERS, response }
}
export const VIEW_BILLS_FETCH_REQUEST = 'VIEW_BILLS_FETCH_REQUEST'
export const VIEW_BILLS_FETCH_SUCCESS = 'VIEW_BILLS_FETCH_SUCCESS'
export const VIEW_BILLS_FETCH_FAILURE = 'VIEW_BILLS_FETCH_FAILURE'
export function viewBillsFetchRequest () {
  return { type: VIEW_BILLS_FETCH_REQUEST }
}
export function viewBillsFetchSuccess () {
  return { type: VIEW_BILLS_FETCH_SUCCESS }
}
export function viewBillsFetchFailure (error) {
  return { type: VIEW_BILLS_FETCH_FAILURE, error }
}
export function viewBillsFetch (source, dateFrom, dateTo, idFrom, idTo, stores) {
  return (dispatch) => {
    dispatch(viewBillsFetchRequest())

    const params = {
      from: dateFrom,
      to: dateTo,
      idFrom,
      idTo,
      storeId: source,
      stores,
      eager: '[payments, staff, users, vouchers, items, items.product]'
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

              dispatch(viewBillsStoreOrders({ data: allOrders }))
              dispatch(viewBillsFetchSuccess())
            })
            .catch((error) => {
              dispatch(viewBillsFetchFailure(error))
            })
        } else {
          // End if all orders are fetched
          dispatch(viewBillsStoreOrders({ data: allOrders }))
          dispatch(viewBillsFetchSuccess())
        }
      })
      .catch(error => {
        dispatch(viewBillsFetchFailure(error))
      })
  }
}

export const OUTLET_STOCKS_CH_SOURCE = 'OUTLET_STOCKS_CH_SOURCE'
export function outletStocksChSource (source) {
  return { type: OUTLET_STOCKS_CH_SOURCE, source }
}

export const STAFF_SALES_CH_STAFF = 'STAFF_SALES_CH_STAFF'
export function staffSalesStaff (staffId) {
  return { type: STAFF_SALES_CH_STAFF, staffId }
}

export const STAFF_SALES_CH_INPUT_TO = 'STAFF_SALES_CH_INPUT_TO'
export function staffSalesChangeInputTo (date) {
  return { type: STAFF_SALES_CH_INPUT_TO, date }
}
export const STAFF_SALES_CH_INPUT_FR = 'STAFF_SALES_CH_INPUT_FR'
export function staffSalesChangeInputFr (date) {
  return { type: STAFF_SALES_CH_INPUT_FR, date }
}

export const STAFF_SALES_STORE_ORDERS = 'STAFF_SALES_STORE_ORDERS'
export function staffSalesStoreOrders (response) {
  return { type: STAFF_SALES_STORE_ORDERS, response }
}
export const STAFF_SALES_FETCH_REQUEST = 'STAFF_SALES_FETCH_REQUEST'
export const STAFF_SALES_FETCH_SUCCESS = 'STAFF_SALES_FETCH_SUCCESS'
export const STAFF_SALES_FETCH_FAILURE = 'STAFF_SALES_FETCH_FAILURE'
export function staffSalesFetchRequest () {
  return { type: STAFF_SALES_FETCH_REQUEST }
}
export function staffSalesFetchSuccess () {
  return { type: STAFF_SALES_FETCH_SUCCESS }
}
export function staffSalesFetchFailure (error) {
  return { type: STAFF_SALES_FETCH_FAILURE, error }
}
export function staffSalesFetch (staffId, dateFrom, dateTo) {
  return (dispatch) => {
    dispatch(staffSalesFetchRequest())

    const params = {
      from: dateFrom,
      to: dateTo,
      staffId,
      eager: '[payments, staff, users, items, items.product]'
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

              dispatch(staffSalesStoreOrders({ data: allOrders }))
              dispatch(staffSalesFetchSuccess())
            })
            .catch((error) => {
              dispatch(staffSalesFetchFailure(error))
            })
        } else {
          // End if all orders are fetched
          dispatch(staffSalesStoreOrders({ data: allOrders }))
          dispatch(staffSalesFetchSuccess())
        }
      })
      .catch(error => {
        dispatch(staffSalesFetchFailure(error))
      })
  }
}

export const EXPORT_SALES_CH_DATE = 'EXPORT_SALES_CH_DATE'
export function exportSalesChDate (date) {
  return { type: EXPORT_SALES_CH_DATE, date }
}

export const EXPORT_SALES_SET_ERROR_MSG = 'EXPORT_SALES_SET_ERROR_MSG'
export function exportSalesSetErrorMsg (errorId) {
  return { type: EXPORT_SALES_SET_ERROR_MSG, errorId }
}

export const EXPORT_SALES_FETCH_REQUEST = 'EXPORT_SALES_FETCH_REQUEST'
export const EXPORT_SALES_FETCH_SUCCESS = 'EXPORT_SALES_FETCH_SUCCESS'
export const EXPORT_SALES_FETCH_FAILURE = 'EXPORT_SALES_FETCH_FAILURE'
export function exportSalesFetchRequest () {
  return { type: EXPORT_SALES_FETCH_REQUEST }
}
export function exportSalesFetchSuccess (orders) {
  return { type: EXPORT_SALES_FETCH_SUCCESS, orders }
}
export function exportSalesFetchFailure (error) {
  return { type: EXPORT_SALES_FETCH_FAILURE, error }
}
export function exportSalesFetch (date, storeId) {
  return (dispatch) => {
    const params = {
      dateCreated: date,
      storeId
    }

    const cbSuccess = (orders, response) => {
      dispatch(exportSalesFetchSuccess(orders))
    }

    const cbFailure = (error) => {
      dispatch(exportSalesFetchFailure(error))
    }

    dispatch(exportSalesFetchRequest())
    return allOrdersFetch(params, cbSuccess, cbFailure)
  }
}

const allOrdersFetch = (params, cbSuccess, cbFailure) => {
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

            cbSuccess(allOrders, response)
          })
          .catch((error) => {
            cbFailure(error)
          })
      } else {
        // End if all orders are fetched
        cbSuccess(allOrders, response)
      }
    })
    .catch(error => {
      cbFailure(error)
    })
}

export const SEND_XZ_REPORT_SUCCESS = 'SEND_XZ_REPORT_SUCCESS'
export const SEND_XZ_REPORT_REQUEST = 'SEND_XZ_REPORT_REQUEST'
export const SEND_XZ_REPORT_ERROR = 'SEND_XZ_REPORT_ERROR'

export function sendXZReportRequest () {
  return { type: SEND_XZ_REPORT_REQUEST }
}
export function sendXZReportSuccess () {
  return { type: SEND_XZ_REPORT_SUCCESS }
}
export function sendXZReportError (error) {
  return { type: SEND_XZ_REPORT_ERROR, error }
}

export function sendXZReport (date, storeId, masterId) {
  return (dispatch) => {
    dispatch(sendXZReportRequest())
    return reportsService.sendXZReport(date, storeId, masterId)
      .then(result => {
        dispatch(sendXZReportSuccess())
        dispatch(completeSalesChSource(storeId))
      })
      .catch(error => {
        if (error) {
          dispatch(sendXZReportError('Can\'t send report. Try again'))
        }
      })
  }
}
