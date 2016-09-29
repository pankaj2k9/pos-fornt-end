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
      $eager: '[items, items.product]',
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
    const query = {
      id: orderId,
      $eager: '[items, items.product]'
    }
    return ordersService.find({ query })
  }
}

export default orders
