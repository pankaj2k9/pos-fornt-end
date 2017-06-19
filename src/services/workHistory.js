import api from './api'

const workHistoryService = api.service('/work-history')

const workHistory = {
  toggleWorkStatus (masterId, cashierId, storeId, pinCode) {
    return workHistoryService.find({
      query: {
        type: 'workHistory.toggleWorkStatus',
        masterId: masterId,
        cashierId: cashierId,
        storeId: storeId,
        pinCode: pinCode
      }
    })
  },
  create (data) {
    return workHistoryService.create(data)
  }
}

export default workHistory
