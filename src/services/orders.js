import moment from 'moment'

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
      id,
      idTo,
      idFrom,
      dateCreated,
      limit,
      skip,
      sort,
      option,
      eager
    } = params

    const query = {
      $sort: sort || { dateOrdered: -1 },
      $eager: eager || '[users, items, items.product, payments, vouchers]',
      $limit: limit || undefined,
      $skip: skip || undefined
    }

    let orderId
    let staff
    let store
    let dateParam

    if (id) { orderId = id }
    if (staffId) { staff = staffId }
    if (storeId) {
      const storeIds = stores ? stores.map((store) => { return store.source }) : []
      const storeIn = storeId ? [storeId] : storeIds
      store = { $in: storeIn }
    }
    if (dateCreated || (to && from)) {
      dateParam = {
        $gte: moment(dateCreated || from).startOf('day').toDate(),
        $lte: moment(dateCreated || to).endOf('day').toDate()
      }
    }

    query.$or = [
      {
        adminId: staff,
        dateOrdered: dateParam,
        id: orderId,
        refundId: option === 'noNullRefundId' ? { $ne: null } : undefined,
        source: store
      },
      {
        adminId: staff,
        dateRefunded: dateParam,
        id: orderId,
        refundId: option === 'noNullRefundId' ? { $ne: null } : undefined,
        source: store
      }
    ]

    if (idFrom || idTo) {
      query.id = {}
      if (idFrom) { query.id.$gte = buildOrderId(storeId, idFrom, null, stores) }
      if (idTo) { query.id.$lte = buildOrderId(storeId, idTo, null, stores) }
    }

    return ordersService.find({ query })
  }
}

export default orders
