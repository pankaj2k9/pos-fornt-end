import api from './api'

const refundService = api.service('/refund')

const refund = {
  create (params) {
    return refundService.create(params)
  }
}

export default refund
