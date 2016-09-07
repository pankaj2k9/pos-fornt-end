import api from './api'

const storesService = api.service('/stores')

const stores = {
  find () {
    return storesService.find()
  },

  get (storeId) {
    return storesService.get(storeId)
  }
}

export default stores
