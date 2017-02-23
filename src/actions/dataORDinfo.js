import {
  compItemsSum,
  processProducts,
  processOrdID,
  processPayments
} from '../utils/computations'

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

export const SET_ORDER_INFO = 'SET_ORDER_INFO'
export function setOrderInfo (data) {
  console.log('data: ', data)
  let { currency, orderData, appData } = data
  let { total, pincode, activeCustomer, orderItems, payments } = orderData
  let { activeCashier, activeStore } = appData
  let { source, code, lastId } = activeStore
  let { odboId, odboCoins } = activeCustomer || {}
  console.log('orderData: ', orderData)
  console.log('appData: ', appData)
  const orderInfo = {
    items: processProducts(orderItems, currency),
    id: processOrdID(code, lastId),
    adminId: activeCashier.id,
    dataOrdered: new Date(),
    source: source,
    subtotal: total,
    total: total,
    totalQuantity: compItemsSum(orderItems).totalQuantity,
    currency,
    userPrevCoins: Number(odboCoins) || undefined,
    payments: processPayments(payments, currency),
    redemptionPoints: activeCustomer ? total : undefined,
    pinCode: pincode,
    // vouchers: processPayments(payments, 'voucher'),
    odboId: odboId || undefined
  }
  console.log('orderInfo', orderInfo)
  // return {
  //   type: SET_ORDER_INFO,
  //   orderInfo
  // }
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
export function addPaymentType (payment) {
  return {
    type: ADD_PAYMENT_TYPE,
    payment
  }
}
export const REMOVE_NOTE = 'REMOVE_NOTE'
export function removeNote (message) {
  return {
    type: REMOVE_NOTE,
    message
  }
}

export const REMOVE_PAYMENT_TYPE = 'REMOVE_PAYMENT_TYPE'
export function removePaymentType (paymentType, key) {
  return {
    type: REMOVE_PAYMENT_TYPE,
    paymentType,
    key
  }
}

export const REMOVE_ORDER_ITEM = 'REMOVE_ORDER_ITEM'
export function removeOrderItem (orderItemID) {
  return {
    type: REMOVE_ORDER_ITEM,
    orderItemID
  }
}

export const RESET_ORDER_INFO = 'RESET_ORDER_INFO'
export function resetOrderInfo () {
  return {
    type: RESET_ORDER_INFO
  }
}

export const RECALL_ORDER = 'RECALL_ORDER'
export function recallOrder (data) {
  return {
    data
  }
}
