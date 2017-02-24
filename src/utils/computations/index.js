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
    totalOdbo: totalOdbo
  }
}

export const compDiscount = (pct, price) => {
  return price - (pct / 100) * price
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
    totalDisc = totalDisc + (discPCT / 100) * (Number(x.price) * x.qty)
    totalOdboDisc = totalOdboDisc + (odboDiscPCT / 100) * (Number(x.odboPrice) * x.qty)
  })
  return {
    totalDisc: totalDisc,
    totalOdboDisc: totalOdboDisc
  }
}

export const compPaymentsSum = (data) => {
  let totalPayments = 0
  if (data && data.length > 0) {
    data.forEach(x => {
      if (x.type !== 'odbo') {
        if (x.type === 'voucher') {
          totalPayments = totalPayments + x.deduction
        } else {
          totalPayments = totalPayments + x.amount
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
        cashChange = x.cash - x.amount
      } else {
        cashChange = 0
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

export const processOrdID = (str, lastId) => {
  let zeroes = ''
  let id = lastId + 1
  for (var i = id.toString().length; i < 7; i++) {
    zeroes = zeroes + '0'
  }
  return `${str}${zeroes}${id}`
}

export const processPayments = (data, currency) => {
  let payments = []
  if (data && data.length > 0) {
    data.forEach(x => {
      if (currency === 'sgd') {
        if (x.type !== 'odbo' && x.type !== 'voucher') { payments.push(x) }
      } else if (currency === 'voucher') {
        if (x.type === 'voucher') { payments.push(x) }
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
