import api from './api'

const dailyDataService = api.service('/store-daily-data')

const dailyData = {
  create (dailyData) {
    return dailyDataService.create(dailyData)
  },

  patch (data) {
    return dailyDataService.patch(data.id, {
      float: data.float, cashDrawerOpenCount: data.cashDrawerOpenCount
    })
  },

  find (query) {
    return dailyDataService.find(query || {})
      .then((response) => {
        response.data.forEach((item) => {
          item.float = Number(item.float)
        })
        return Promise.resolve(response)
      })
  },

  get (storeId) {
    const query = {
      storeId: storeId
    }
    return dailyDataService.find({ query }).then((response) => {
      console.log('response2', response)
    })
  }
}

export default dailyData
