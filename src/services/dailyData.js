import api from './api'

const dailyDataService = api.service('/store-daily-data')

const dailyData = {
  create (dailyData) {
    return dailyDataService.create(dailyData)
  },

  patch (data) {
    let params = {}
    if (data.float) {
      params.float = data.float
    }
    if (data.count) {
      params.cashDrawerOpenCount = data.count
    }
    return dailyDataService.patch(data.id, params)
  },

  find (query) {
    return dailyDataService.find(query || {})
  },

  get (storeId) {
    const query = {
      storeId: storeId
    }
    return dailyDataService.find({ query })
  }
}

export default dailyData
