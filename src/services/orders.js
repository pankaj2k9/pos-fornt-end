import api from './api'
import { buildOrderId } from '../utils/string'

const ordersService = api.service('/orders')

const orders = {
  create (orderData) {
    return ordersService.create(orderData)
  },

  find (params) {
    const {
      storeId,
      stores,
      staffId,
      to,
      from,
      idTo,
      idFrom,
      limit,
      skip,
      sort,
      eager
    } = params

    const query = {
      $sort: sort || { dateOrdered: -1 },
      $eager: eager || '[users, items, items.product, payments, vouchers]',
      $limit: limit,
      $skip: skip
    }

    if (staffId) {
      query.adminId = staffId
    }

    if (storeId) {
      const storeIds = stores ? stores.map((store) => { return store.source }) : []
      const storeIn = storeId ? [storeId] : storeIds

      query.source = { $in: storeIn }
    }

    if (to && from) {
      query.dateCreated = {
        $lte: to,
        $gte: from
      }
    }

    if (idFrom || idTo) {
      query.id = {}
      if (idFrom) { query.id.$gte = buildOrderId(storeId, idFrom, null, stores) }
      if (idTo) { query.id.$lte = buildOrderId(storeId, idTo, null, stores) }
    }

    console.log('from-to', idFrom, idTo, query)
    // console.log('QUERY', query)

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
