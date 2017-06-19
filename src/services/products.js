import api from './api'

const productsService = api.service('/products')

const products = {
  fetchAllProducts () {
    return productsService.find({
      query: {
        $limit: 5000,
        $eager: '[stock]',
        enabled: true
      }
    })
  },
  fetchProductById (productId) {
    return productsService.get(productId)
  },
  create (data, params) {
    return productsService.create(data, params || {})
  },
  update (id, params) {
    return productsService.patch(id, params || {})
  },
  remove (id, params) {
    return productsService.remove(id, params || {})
  }
}

export default products
