import api from './api'

const customers = api.service('/customers')

export default {
  /**
   * fetchAll
   * @return {promise}
   */
  fetch (query) {
    const params = (query !== undefined) ? query : {}

    if (!params.query) { params.query = {} }
    if (!params.query.$sort) { params.query.$sort = { odboId: 1 } }

    return customers.find(params)
  },
  patch (id, data) {
    return customers.patch(id, data)
  },
  create (params) {
    return customers.create(params)
  }
}
