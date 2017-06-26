import { formatCurrency } from '../string'

export const compItemsSum = (data) => {
  let total = 0
  let totalOdbo = 0
  let totalQuantity = 0
  for (var i = 0; i < data.length; i++) {
    total = total + data[i].subTotalPrice
    totalOdbo = totalOdbo + data[i].subTotalOdboPrice
    totalQuantity = totalQuantity + data[i].qty
  }
  return {
    total: total,
    totalOdbo: totalOdbo,
    totalQuantity: totalQuantity
  }
}

export const compDiscount = (pct, amount) => {
  let price = Number(amount)
  let discPCT = Number(pct || 0)
  return price - Math.floor((discPCT / 100) * price)
}

export const compDiscSum = (data) => {
  let totalDisc = 0
  let totalOdboDisc = 0
  data.forEach(x => {
    let discPCT = x.overallDiscount === 0
      ? x.isDiscounted
        ? x.priceDiscount // isDiscounted, then use priceDiscount
        : x.customDiscount // not discounted, use custom if there is
      : x.overallDiscount // use overallDiscount
    let odboDiscPCT = x.overallDiscount === 0
      ? x.isDiscounted
        ? x.odboPriceDiscount // isDiscounted ? then use odboPriceDiscount
        : x.customDiscount // not discounted ? then use custom if there is
      : x.overallDiscount // use overallDiscount
    totalDisc = totalDisc + compDiscount(discPCT, x.price) * x.qty
    totalOdboDisc = totalOdboDisc + compDiscount(odboDiscPCT, Number(x.odboPrice)) * x.qty
  })
  return {
    totalDisc: totalDisc,
    totalOdboDisc: totalOdboDisc
  }
}

export const compPaymentsSum = (data, noVoucher) => {
  let totalPayments = 0
  if (data && data.length > 0) {
    data.forEach(x => {
      if (x.type !== 'odbo') {
        if (x.type === 'voucher' && !noVoucher) {
          totalPayments = totalPayments + Number(x.deduction)
        } else {
          totalPayments = totalPayments + Number(x.amount)
        }
      }
    })
  }
  return totalPayments
}

export const compPaymentsSumByType = (data, mode) => {
  let totalPayments = 0
  if (data && data.length > 0) {
    data.forEach(x => {
      if (mode === x.type) {
        if (x.type !== 'odbo') {
          if (x.type === 'voucher') {
            totalPayments = totalPayments + x.deduction
          } else {
            totalPayments = totalPayments + x.amount
          }
        }
      }
    })
  }
  return totalPayments
}

export const compCashChange = (data) => {
  let cashChange
  if (data && data.length > 0) {
    data.forEach(x => {
      if (x.type === 'cash') {
        cashChange = x.change
      }
    })
  }
  return cashChange || 0
}

export const processProducts = (data, currency) => {
  let products = data.map(item => {
    return {
      productId: Number(item.id),
      quantity: item.qty,
      itemCost: currency === 'sgd' ? item.finalPR : item.finalOdboPR,
      totalCost: currency === 'sgd' ? item.subTotalPrice : item.subTotalOdboPrice,
      discount: item.overallDiscount === 0
        ? item.customDiscount === 0
          ? item.isDiscounted
            ? currency === 'sgd'
              ? item.priceDiscount // isDiscounted and sgd
              : item.odboPriceDiscount // isDiscounted and odbo
            : 0 // overall and item is not discount
          : item.customDiscount // customDiscount is not 0
        : item.overallDiscount // overallDiscount is not 0
    }
  })
  return products
}

export const processReceiptProducts = (data, currency) => {
  let products = data.map(item => {
    let discount = item.overallDiscount === 0
      ? item.customDiscount === 0
        ? item.isDiscounted
          ? currency === 'sgd'
            ? item.priceDiscount // isDiscounted and sgd
            : item.odboPriceDiscount // isDiscounted and odbo
          : 0 // overall and item is not discount
        : item.customDiscount // customDiscount is not 0
      : item.overallDiscount // overallDiscount is not 0
    let discountLbl = discount !== 0
      ? `(less ${discount}%)`
      : ''
    let name = `${item.nameEn}\n${item.barcodeInfo || ''}\n${discountLbl}`
    return {
      productId: Number(item.id),
      name: name,
      quantity: item.qty,
      itemCost: currency === 'sgd' ? formatCurrency(item.finalPR) : item.finalOdboPR,
      totalCost: currency === 'sgd' ? formatCurrency(item.subTotalPrice) : item.subTotalOdboPrice
    }
  })
  return products
}

export const processOrderSearchReceipt = (type, data, storeAddress, lastId) => {
  let currency = data.currency
  let products = data.items.map(item => {
    let name = `${item.product.nameEn}\n${item.product.barcodeInfo || ''}`
    return {
      productId: Number(item.productId),
      name: name,
      quantity: item.quantity,
      itemCost: currency === 'sgd' ? formatCurrency(item.itemCost) : item.itemCost,
      totalCost: currency === 'sgd' ? formatCurrency(item.totalCost) : item.totalCost
    }
  })
  return {
    duplicate: data.duplicate,
    type: type,
    storeAddress,
    items: products,
    extraInfo: {
      id: data.id,
      customer: data.users,
      refundId: data.refundId,
      date: data.dateOrdered,
      dateRefunded: data.dateRefunded,
      staff: `STAFF ID#${data.adminId}`
    },
    paymentInfo: {
      currency: data.currency,
      payments: data.payments,
      subtotal: data.total,
      vouchers: data.vouchers,
      orderTotal: data.total,
      refundId: lastId || data.refundId,
      refundAmt: compPaymentsSum(data.payments, 'noVoucher'),
      dateRefunded: data.dateRefunded || undefined,
      odbo: processOdbo(data.users, data.total, data.bonusPoints),
      notes: data.remarks
    }
  }
}

export const getNextOrderId = (prefix, lastId) => {
  if (!lastId) {
    return `${prefix}0000001`
  }
  let newId = String(lastId + 1)
  return formatOrderId(prefix, newId)
}

export const formatOrderId = (prefix, id) => {
  if (!id) {
    return undefined
  }
  let newId = String(id)
  while (newId.length !== 7) {
    newId = '0' + newId
  }
  newId = prefix + newId
  return newId
}

export const processOdboID = (odboId) => {
  let zeroes = ''
  for (var i = odboId.toString().length; i < 7; i++) {
    zeroes = zeroes + '0'
  }
  return `${zeroes}${odboId}`
}

export const processPayments = (data, currency) => {
  let payments = []
  if (data && data.length > 0) {
    data.forEach(x => {
      if (currency === 'sgd') {
        if (x.type !== 'odbo' && x.type !== 'voucher') { payments.push(x) }
      } else if (currency === 'voucher') {
        if (x.type === 'voucher') { payments.push(x) }
      } else if (currency === 'odbo') {
        if (x.type === 'odbo') { payments.push(x) }
      }
    })
  }
  return payments
}

export const processStoreAddress = (data) => {
  let addr = data.address ? data.address.split('\\n') : ['200 Victoria Street']
  let storeAddress = [
    data.name,
    ...addr
  ]
  return storeAddress
}

export const processOdbo = (customer, orderTotal, multiplier) => {
  let bonus = multiplier ? orderTotal + (orderTotal * multiplier / 100) : orderTotal
  let odbo = customer
    ? {
      prevCoins: customer.odboCoins,
      earnedPts: bonus,
      newCoins: customer.odboCoins + orderTotal,
      newCoins2: customer.odboCoins - orderTotal,
      bonus: multiplier ? `x${1 + (multiplier / 100)}` : null
    }
    : undefined
  return odbo
}

export const processCustomers = (data, filterKey, searchKey) => {
  let newData
  let numberKey = String(Number(searchKey))
  let nameKey = searchKey.toLowerCase()
  if (searchKey !== '') { // if searchKey not an empty string, filter data
    newData = data.filter((x, index, array) => {
      let phoneNumSearch = x.phoneNumber && x.phoneNumber.match(searchKey) // some phoneNumber value is undefined or null
      /**
       * filter items by 'filterKey' which are: 'byId', 'byName', 'bySurName' or 'byContactNum'
       * fuzzy search using javascript filter
       * javascript filter || foreach returns duplicate results from operator/method 'str.match(regexp)'
       * fixed this by using map to validate items by its property 'id'
       */
      if (filterKey === 'byId' && numberKey.match(x.odboId)) {
        return array.map(x => x['id']).indexOf(x['id']) === index
      } else if (filterKey === 'byName' && x.combinedName.match(nameKey)) {
        return array.map(x => x['id']).indexOf(x['id']) === index
      } else if (filterKey === 'bySurName' && x.combinedName.match(nameKey)) {
        return array.map(x => x['id']).indexOf(x['id']) === index
      } else if (filterKey === 'byContactNum' && phoneNumSearch) {
        return array.map(x => x['id']).indexOf(x['id']) === index
      }
    })
  } else {
    newData = data // if searchKey is an empty string, just return the default data
  }
  return newData
}
