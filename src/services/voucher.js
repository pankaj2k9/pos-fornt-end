import api from './api'

const voucherService = api.service('/vouchers')

export default {
  /**
   * fetchAll
   * @return {promise}
   */
  fetch (query) {
    const params = (query !== undefined) ? query : {}
    return voucherService.find(params)
  }
}
