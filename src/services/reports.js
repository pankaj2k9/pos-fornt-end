import api from './api'

const reportsService = api.service('/reports')

const reports = {
  /**
   * @param {string} source id of store
   * @param {Date} from query date
   * @param {Date} to query date
   * @return {Promise}
   */
  find (source, from, to) {
    const query = { source, from, to }

    return reportsService.find({ query })
  }
}

export default reports
