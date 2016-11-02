import api from './api'
import { buildOrderId } from '../utils/string'

const ordersService = api.service('/orders')

const orders = {
  create (orderData) {
    return ordersService.create(orderData)
  },

  find (params) {
    const { storeId, stores, to, from, idTo, idFrom, limit, skip, sort, eager } = params

    const storeIds = stores.map((store) => { return store.source })
    const storeIn = storeId ? [storeId] : storeIds

    const query = {
      $sort: sort || { dateOrdered: -1 },
      $eager: eager || '[users, items, items.product, payments, vouchers]',
      source: {
        $in: storeIn
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
        $gte: buildOrderId(storeId, idFrom, null, stores),
        $lte: buildOrderId(storeId, idTo, null, stores)
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
