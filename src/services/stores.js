import api from './api'

const storesService = api.service('/stores')

const stores = {
  find () {
    const query = {$sort: { source: 1 }, source: {$ne: 'ecomm'}}
    return storesService.find({query})
  },

  get (storeId) {
    return storesService.get(storeId)
  }
}

export default stores
