import api from './api'

const cashiersService = api.service('/cashiers')

const cashiers = {
  toggleWorkStatus (masterId, cashierId, storeId) {
    return cashiersService.find({
      query: {
        type: 'cashiers.getCashiersWithStatuses',
        masterId: masterId,
        cashierId: cashierId,
        storeId: storeId
      }
    })
  }
}

export default cashiers
