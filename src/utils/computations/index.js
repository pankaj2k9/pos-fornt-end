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

export const compDiscount = (pct, amount, roundResult) => {
  let price = Number(amount)
  let discPCT = Number(pct || 0)

  if (roundResult) {
    return Math.floor(discPCT * price / 100)
  } else {
    let value = discPCT * price / 100
    value = Number(value.toFixed(2))

    return value
  }
}

export const compDiscSum = (data) => {
  let totalDisc = 0
  let totalOdboDisc = 0
  data.forEach(x => {
    let discPCT = 0
    if (x.overallDiscount === 0) {
      if (x.isDiscounted) {
        discPCT = x.priceDiscount
      } else if (x.customDiscount === 0) {
        discPCT = 0
      } else {
        discPCT = x.customDiscount
      }
    } else {
      discPCT = x.overallDiscount
    }

    let odboDiscPCT = 0
    if (x.overallDiscount === 0) {
      if (x.isDiscounted) {
        odboDiscPCT = x.odboPriceDiscount
      } else if (x.customDiscount === 0) {
        odboDiscPCT = 0
      } else {
        odboDiscPCT = x.customDiscount
      }
    } else {
      odboDiscPCT = x.overallDiscount
    }
    totalDisc = totalDisc + compDiscount(discPCT, Number(x.price)) * x.qty
    totalOdboDisc = totalOdboDisc + compDiscount(odboDiscPCT, Number(x.odboPrice), true) * x.qty
  })
  return {
    totalDisc: totalDisc,
    totalOdboDisc: totalOdboDisc
  }
}

export const compPaymentsSum = (data, noVoucher, vouchers) => {
  let totalPayments = 0
  let isVoucherExist = false
  if (data && data.length > 0) {
    data.forEach(x => {
      if (x.type !== 'odbo') {
        if (x.type === 'voucher' && !noVoucher) {
          isVoucherExist = true
          totalPayments = totalPayments + Number(x.deduction)
        } else if (x.type === 'cash') {
          totalPayments = totalPayments + Number(x.cash)
        } else {
          totalPayments = totalPayments + Number(x.amount)
        }
      }
    })
  }

  if (!isVoucherExist && vouchers) {
    vouchers.forEach(x => {
      totalPayments += Number(x.deduction)
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
          } else if (mode === 'cash') {
            totalPayments = totalPayments + x.cash
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
        cashChange = Number(x.change)
      }
    })
  }
  return cashChange || 0
}

export const processProducts = (data, currency) => {
  let products = data.map(item => {
    return {
      discount: item.discount,
      discountPercent: item.discountPercent,
      product: item,
      barcodeInfo: item.barcodeInfo,
      productId: Number(item.id),
      quantity: item.qty,
      itemCost: currency === 'sgd' ? Number(item.price) : Number(item.odboPrice),
      totalCost: currency === 'sgd' ? item.subTotalPrice : item.subTotalOdboPrice
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

  let isRefund = false
  if (data.duplicate && data.refundId) {
    isRefund = true
  }
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
      orderDisccount: data.discount || 0,
      currency: data.currency,
      payments: data.payments,
      subtotal: data.total,
      vouchers: data.vouchers,
      orderTotal: data.total,
      refundId: lastId || data.refundId,
      refundAmt: compPaymentsSum(data.payments, false, data.vouchers) - compCashChange(data.payments),
      dateRefunded: data.dateRefunded || undefined,
      odbo: isRefund ? processRefundOdbo(data.currency, data.users, data.total, data.bonusPoints, data.userPrevCoins)
            : processOdbo(data.currency, data.users, data.total, data.bonusPoints, data.userPrevCoins),
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

export const processRefundOdbo = (currency, customer, orderTotal, multiplier, userPrevCoins) => {
  orderTotal = Number(orderTotal)
  if (!customer) {
    return undefined
  }

  if (currency.toUpperCase() === 'SGD') {
    const earnedPoints = multiplier ? (orderTotal + orderTotal * multiplier / 100) : orderTotal

    return {
      prevCoins: userPrevCoins + earnedPoints,
      earnedPts: earnedPoints,
      bonus: multiplier ? `x${1 + (multiplier / 100)}` : null,
      newCoins: userPrevCoins,
      newCoins2: userPrevCoins
    }
  } else {
    return {
      prevCoins: userPrevCoins - orderTotal,
      earnedPts: 0,
      bonus: null,
      newCoins: userPrevCoins,
      newCoins2: userPrevCoins
    }
  }
}

export const processOdbo = (currency, customer, orderTotal, multiplier, userPrevCoins) => {
  orderTotal = Number(orderTotal)
  if (!customer) {
    return undefined
  }

  if (currency.toUpperCase() === 'SGD') {
    let earnedPoints = multiplier ? (orderTotal + orderTotal * multiplier / 100) : orderTotal
    earnedPoints = Math.floor(earnedPoints)

    return {
      prevCoins: userPrevCoins,
      earnedPts: earnedPoints,
      bonus: multiplier ? `x${1 + (multiplier / 100)}` : null,
      newCoins: userPrevCoins + earnedPoints,
      newCoins2: userPrevCoins + earnedPoints
    }
  } else {
    return {
      prevCoins: userPrevCoins,
      earnedPts: 0,
      bonus: null,
      newCoins: userPrevCoins - orderTotal,
      newCoins2: userPrevCoins - orderTotal
    }
  }
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
