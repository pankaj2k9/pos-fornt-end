import api from './api'

const dailyDataService = api.service('/store-daily-data')

const dailyData = {
  create (dailyData) {
    return dailyDataService.create(dailyData)
  },

  patch (data) {
    return dailyDataService.patch(data.id, {float: data.amount, cashDrawerOpen: data.count})
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
