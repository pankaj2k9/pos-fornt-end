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
    return reportsService.find({
      query: {
        $eager: '[items, items.product, payments]',
        source,
        from,
        to
      }
    })
  },

  findCompleteSales (source, date) {
    return reportsService.find({ query: {type: 'order.sales.endOfDay', date, source} })
  }
}

export default reports
