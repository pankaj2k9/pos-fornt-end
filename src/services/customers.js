import api from './api'

const customers = api.service('/customers')

export default {
  /**
   * fetchAll
   * @return {promise}
   */
  fetch (query) {
    const params = (query !== undefined) ? query : {}
    return customers.find(params)
  }
}
