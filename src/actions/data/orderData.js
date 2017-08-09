import shortid from 'shortid'

import {
  compItemsSum,
  processProducts,
  processReceiptProducts,
  getNextOrderId,
  processPayments,
  processStoreAddress,
  processOdbo
} from '../../utils/computations'

export const SET_ACTIVE_CUSTOMER = 'SET_ACTIVE_CUSTOMER'
export function setActiveCustomer (customer) {
  return {
    type: SET_ACTIVE_CUSTOMER,
    customer
  }
}

export const SET_CURRENCY_TYPE = 'SET_CURRENCY_TYPE'
export function setCurrencyType (currency) {
  return {
    type: SET_CURRENCY_TYPE,
    currency
  }
}

export const SET_ORDER_ITEM_QTY = 'SET_ORDER_ITEM_QTY'
export function setOrderItemQty (orderItemID, opperand) {
  return {
    type: SET_ORDER_ITEM_QTY,
    orderItemID,
    opperand
  }
}

export const SET_CUSTOM_DISCOUNT = 'SET_CUSTOM_DISCOUNT'
export function setCustomDiscount (discount, orderItemID) {
  return {
    type: SET_CUSTOM_DISCOUNT,
    discount: Number(!discount || discount === '' ? 0 : discount),
    orderItemID
  }
}

export const SET_OVERALL_DISCOUNT = 'SET_OVERALL_DISCOUNT'
export function setOverallDiscount (discount) {
  return {
    type: SET_OVERALL_DISCOUNT,
    discount: Number(!discount || discount === '' ? 0 : discount)
  }
}

export const SET_CURRENT_CASHIER = 'SET_CURRENT_CACHIER'
export function setCurrentCashier (cashier) {
  return {
    type: SET_CURRENT_CASHIER,
    cashier: cashier
  }
}

export const SET_ORDER_INFO = 'SET_ORDER_INFO'
export function setOrderInfo (data, otherData) {
  let { orderData, appData } = data
  let { total, totalOdbo, totalDisc, totalOdboDisc, orderItems, orderNote, currentCashier, overallDiscount } = orderData
  let { activeStore, lastOrderId } = appData
  let { source, code } = activeStore

  let currency = (otherData && otherData.currency) || orderData.currency
  let activeCustomer = (otherData && otherData.customer) || orderData.activeCustomer
  let bonusPoints = (otherData && otherData.bonus) || orderData.bonusPoints

  let payments = currency === 'odbo'
    ? [{type: 'odbo', amount: totalOdbo}]
    : orderData.payments
  let orderTotal = currency === 'sgd' ? total : totalOdbo
  let orderDisccount = currency === 'sgd' ? totalDisc : totalOdboDisc
  let pincodeInput = document.getElementById('custCodeInput') || undefined
  let pincode = pincodeInput ? pincodeInput.value : undefined
  let odbo = processOdbo(currency, activeCustomer, orderTotal, bonusPoints, activeCustomer ? activeCustomer.odboCoins : 0)
  let randomId = shortid.generate()

  const orderInfo = {
    items: processProducts(orderItems, currency),
    id: getNextOrderId(code, lastOrderId),
    adminId: currentCashier ? currentCashier.id : undefined,
    bonusPoints: bonusPoints,
    dateOrdered: new Date(),
    source: source,
    subtotal: orderTotal,
    total: orderTotal,
    totalQuantity: compItemsSum(orderItems).totalQuantity,
    currency: currency,
    userPrevCoins: odbo && odbo.prevCoins,
    payments: processPayments(payments, currency),
    randId: randomId,
    redemptionPoints: currency === 'sgd' ? odbo && odbo.earnedPts : undefined,
    pinCode: pincode,
    vouchers: currency === 'sgd' && processPayments(payments, 'voucher'),
    odboId: activeCustomer ? activeCustomer.odboId : undefined,
    discountPercentOverall: overallDiscount || 0,
    discount: orderDisccount
  }

  const receipt = {
    type: 'order',
    storeAddress: processStoreAddress(activeStore),
    items: processReceiptProducts(orderItems, currency),
    extraInfo: {
      id: getNextOrderId(code, lastOrderId),
      randId: randomId,
      customer: activeCustomer,
      date: new Date(),
      staff: currentCashier ? `${currentCashier.firstName || ''} ${currentCashier.lastName || ''}` : undefined
    },
    paymentInfo: {
      currency: currency,
      payments: payments,
      vouchers: processPayments(payments, 'voucher'),
      subtotal: orderTotal + orderDisccount,
      odbo: odbo,
      orderTotal: orderTotal,
      orderDisccount: orderDisccount,
      notes: orderNote
    }
  }

  return {
    type: SET_ORDER_INFO,
    orderInfo,
    receipt
  }
}

export const ADD_BONUS_MULTIPLIER = 'ADD_BONUS_MULTIPLIER'
export function addBonusMultiplier (amount) {
  return {
    type: ADD_BONUS_MULTIPLIER,
    amount
  }
}

export const ADD_ORDER_ITEM = 'ADD_ORDER_ITEM'
export function addOrderItem (product) {
  return {
    type: ADD_ORDER_ITEM,
    product
  }
}

export const ADD_ORDER_NOTE = 'ADD_ORDER_NOTE'
export function addOrderNote (note) {
  return {
    type: ADD_ORDER_NOTE,
    note
  }
}

export const ADD_PAYMENT_TYPE = 'ADD_PAYMENT_TYPE'
export function addPaymentType (total, payment) {
  return {
    type: ADD_PAYMENT_TYPE,
    payment,
    total
  }
}
export const REMOVE_NOTE = 'REMOVE_NOTE'
export function removeNote (key) {
  return {
    type: REMOVE_NOTE,
    key
  }
}

export const REMOVE_BONUS_MULTIPLIER = 'REMOVE_BONUS_MULTIPLIER'
export function removeBonusMultiplier () {
  return {
    type: REMOVE_BONUS_MULTIPLIER
  }
}

export const REMOVE_PAYMENT_TYPE = 'REMOVE_PAYMENT_TYPE'
export function removePaymentType (total, paymentType, key) {
  return {
    type: REMOVE_PAYMENT_TYPE,
    paymentType,
    key,
    total
  }
}

export const REMOVE_PAYMENT_BYKEY = 'REMOVE_PAYMENT_BYKEY'
export function removePaymentByKey (total, key) {
  return {
    type: REMOVE_PAYMENT_BYKEY,
    key,
    total
  }
}

export const REMOVE_ORDER_ITEM = 'REMOVE_ORDER_ITEM'
export function removeOrderItem (orderItemID) {
  // document.getElementById('barcodeInput').focus()
  return {
    type: REMOVE_ORDER_ITEM,
    orderItemID
  }
}

export const RESET_ORDER_DATA = 'RESET_ORDER_DATA'
export function resetOrderData () {
  return {
    type: RESET_ORDER_DATA
  }
}

export const RECALL_ORDER = 'RECALL_ORDER'
export function recallOrder (data) {
  return {
    type: RECALL_ORDER,
    data
  }
}
