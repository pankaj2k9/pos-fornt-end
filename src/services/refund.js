import api from './api'

const refundService = api.service('/refund')

const refund = {
  create (id) {
    return refundService.create(id)
  }
}

export default refund
