import api from './api'
import { buildOrderId } from '../utils/string'

const ordersService = api.service('/orders')

const orders = {
  create (orderData) {
    return ordersService.create(orderData)
  },

  find (params) {
    const { storeId, to, from, idTo, idFrom, limit, skip, sort, eager } = params

    const query = {
      $sort: sort || { dateOrdered: -1 },
      $eager: eager || '[users, items, items.product, payments, vouchers]',
      source: {
        $in: [storeId] || ['s1', 's2', 's3']
      },
      $limit: limit,
      $skip: skip
    }

    if (to && from) {
      query.dateCreated = {
        $lte: to,
        $gte: from
      }
    }

    if (idFrom && idTo) {
      query.id = {
        $gte: buildOrderId(storeId, idFrom),
        $lte: buildOrderId(storeId, idTo)
      }
    }

    return ordersService.find({ query })
  },
  get (orderId) {
    const query = {
      id: orderId,
      $eager: '[users, items, items.product]'
    }
    return ordersService.find({ query })
  }
}

export default orders
