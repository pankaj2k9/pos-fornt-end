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
      noNullRefundId,
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
    let idRange = {}
    let refundIdRange = {}

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

    if (idFrom || idTo) {
      if (idFrom) {
        idRange.$gte = buildOrderId(storeId, idFrom, null, stores)
        refundIdRange.$gte = buildOrderId(storeId, idFrom, null, stores)
      }
      if (idTo) {
        idRange.$lte = buildOrderId(storeId, idTo, null, stores)
        refundIdRange.$lte = buildOrderId(storeId, idTo, null, stores)
      }
    }

    if (idFrom || idTo) {
      query.$or = [
        {
          id: idRange,
          source: store
        },
        {
          refundId: refundIdRange,
          source: store
        }
      ]
    } else if (noNullRefundId) {
      query.$or = [
        {
          refundId: { $ne: null },
          source: store
        }
      ]
    } else {
      query.$or = [
        {
          adminId: staff,
          dateOrdered: dateParam,
          id: orderId,
          source: store
        },
        {
          adminId: staff,
          dateRefunded: dateParam,
          id: orderId,
          source: store
        },
        {
          adminId: staff,
          dateRefunded: dateParam,
          refundId: orderId,
          source: store
        }
      ]
    }

    return ordersService.find({ query })
  }
}

export default orders
