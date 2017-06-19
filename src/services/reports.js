import api from './api'

const reportsService = api.service('/reports')

const reports = {
  /**
   * @param {string} source id of store
   * @param {Date} from query date
   * @param {Date} to query date
   * @return {Promise}
   */
  findProductSales (source, from, to) {
    return reportsService.find({ query: { source, from, to } })
  },

  findCompleteSales (source, date) {
    return reportsService.find({ query: {type: 'order.sales.endOfDay', date, source} })
  },

  sendXZReport (date, storeId, masterId) {
    let _date = new Date(date)
    _date.setMilliseconds(0)
    _date.setSeconds(0)
    _date.set
    _date.setHours(0)
    return reportsService.find({ query: {type: 'order.sales.sendXZReport', date, source: storeId, masterId} })
  }
}

export default reports
