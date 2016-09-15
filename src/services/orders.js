import api from './api'

const ordersService = api.service('/orders')

const orders = {
  create (orderData) {
    return ordersService.create(orderData)
  },

  find (params) {
    const { storeId, to, from, limit, skip } = params
    const query = {
      $sort: { dateOrdered: -1 },
      source: storeId,
      dateCreated: {
        $lte: to,
        $gte: from
      },
      $limit: limit,
      $skip: skip
    }

    return ordersService.find({ query })
  },
  get (orderId) {
    return ordersService.get(orderId)
  }
}

export default orders
