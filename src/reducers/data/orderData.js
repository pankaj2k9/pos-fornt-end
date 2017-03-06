import {
  CURRENTLY_EDITING,
  SET_ACTIVE_CUSTOMER,
  SET_CURRENCY_TYPE,
  SET_ORDER_ITEM_QTY,
  SET_CUSTOM_DISCOUNT,
  SET_OVERALL_DISCOUNT,
  SET_ORDER_INFO,
  ADD_ORDER_ITEM,
  ADD_ORDER_NOTE,
  ADD_PAYMENT_TYPE,
  ADD_BONUS_MULTIPLIER,
  REMOVE_BONUS_MULTIPLIER,
  REMOVE_NOTE,
  REMOVE_PAYMENT_TYPE,
  REMOVE_PAYMENT_BYKEY,
  REMOVE_ORDER_ITEM,
  RESET_ORDER_DATA,
  RECALL_ORDER
} from '../../actions/data/orderData'

import {
  compDiscount,
  compItemsSum,
  compDiscSum
} from '../../utils/computations'

function orderData (state = {
  activeCustomer: null,
  currency: 'sgd',
  bonusPoints: undefined,
  total: 0,
  totalDisc: 0,
  totalOdbo: 0,
  totalOdboDisc: 0,
  totalPayments: 0,
  overallDiscount: 0,
  orderItems: [],
  payments: [],
  orderNote: [],
  orderInfo: null,
  receipt: null,
  isEditing: false,
  isProcessing: false
}, action) {
  let orderItems = state.orderItems
  let oaDisc = state.overallDiscount || 0
  switch (action.type) {
    case CURRENTLY_EDITING:
      return Object.assign({}, state, {
        isEditing: true
      })
    case SET_ACTIVE_CUSTOMER:
      return Object.assign({}, state, {
        isEditing: false,
        activeCustomer: action.customer
      })
    case SET_CURRENCY_TYPE:
      return Object.assign({}, state, {
        isEditing: false,
        currency: action.currency
      })
    case SET_CUSTOM_DISCOUNT:
      let customDiscount = action.discount
      orderItems.forEach(item => {
        if (item.id === action.orderItemID) {
          item.customDiscount = customDiscount
          let itemPR = Number(item.price || 0)
          let itemOdboPR = Number(item.odboPrice || 0)
          let discPCT = customDiscount === 0
            ? item.isDiscounted ? item.priceDiscount : 0
            : item.customDiscount
          let odboDiscPCT = customDiscount === 0
            ? item.isDiscounted ? item.odboPriceDiscount : 0
            : item.customDiscount
          const finalPR = compDiscount(discPCT, itemPR)
          const finalOdboPR = compDiscount(odboDiscPCT, itemOdboPR)

          item.finalPR = item.finalPR + finalPR
          item.finalOdboPR = item.finalOdboPR + finalOdboPR
          item.subTotalPrice = finalPR * item.qty
          item.subTotalOdboPrice = finalOdboPR * item.qty
        }
      })
      return Object.assign({}, state, {
        isEditing: false,
        orderItems,
        total: compItemsSum(orderItems).total,
        totalDisc: compDiscSum(orderItems).totalDisc,
        totalOdbo: compItemsSum(orderItems).totalOdbo,
        totalOdboDisc: compDiscSum(orderItems).totalOdboDisc
      })
    case SET_OVERALL_DISCOUNT:
      let oaDiscFrmAtn = action.discount
      orderItems.forEach(item => {
        let itemPR = Number(item.price || 0)
        let itemOdboPR = Number(item.odboPrice || 0)
        let discPCT = oaDiscFrmAtn === 0
          ? item.isDiscounted ? item.priceDiscount
            : item.customDiscount === 0 ? 0 : item.customDiscount
          : oaDiscFrmAtn
        let odboDiscPCT = oaDiscFrmAtn === 0
          ? item.isDiscounted ? item.odboPriceDiscount
            : item.customDiscount === 0 ? 0 : item.customDiscount
          : oaDiscFrmAtn
        const finalPR = compDiscount(discPCT, itemPR)
        const finalOdboPR = compDiscount(odboDiscPCT, itemOdboPR)

        item.overallDiscount = oaDiscFrmAtn
        item.finalPR = finalPR
        item.finalOdboPR = finalOdboPR
        item.subTotalPrice = finalPR * item.qty
        item.subTotalOdboPrice = finalOdboPR * item.qty
      })
      return Object.assign({}, state, {
        isEditing: false,
        items: orderItems,
        overallDiscount: oaDiscFrmAtn,
        total: compItemsSum(orderItems).total,
        totalDisc: compDiscSum(orderItems).totalDisc,
        totalOdbo: compItemsSum(orderItems).totalOdbo,
        totalOdboDisc: compDiscSum(orderItems).totalOdboDisc
      })
    case ADD_ORDER_ITEM:
      let itemToAdd = [action.product]
      itemToAdd.forEach(function (newItem) {
        let existing = orderItems.filter((oldItem) => { return oldItem.id === newItem.id })
        let discPCT = oaDisc === 0
          ? newItem.isDiscounted ? newItem.priceDiscount
            : newItem.customDiscount === 0 ? 0 : newItem.customDiscount
          : oaDisc
        let odboDiscPCT = oaDisc === 0
          ? newItem.isDiscounted ? newItem.odboPriceDiscount
            : newItem.customDiscount === 0 ? 0 : newItem.customDiscount
          : oaDisc
        if (existing.length) {
          let x = orderItems.indexOf(existing[0]) // index
          orderItems[x].qty = orderItems[x].qty + 1
          orderItems[x].subTotalPrice = orderItems[x].subTotalPrice + newItem.finalPR
          orderItems[x].subTotalOdboPrice = orderItems[x].subTotalOdboPrice + newItem.finalOdboPR
        } else {
          const qtyAndTotal = {
            qty: 1,
            finalPR: compDiscount(discPCT, newItem.price),
            finalOdboPR: compDiscount(odboDiscPCT, newItem.odboPrice),
            subTotalPrice: compDiscount(discPCT, newItem.price),
            subTotalOdboPrice: compDiscount(odboDiscPCT, newItem.odboPrice),
            customDiscount: 0,
            overallDiscount: oaDisc === 0 ? 0 : oaDisc
          }
          let item = Object.assign(newItem, qtyAndTotal)
          orderItems.push(item)
        }
      })
      return Object.assign({}, state, {
        isEditing: false,
        orderItems,
        overallDiscount: oaDisc,
        total: compItemsSum(orderItems).total,
        totalDisc: compDiscSum(orderItems).totalDisc,
        totalOdbo: compItemsSum(orderItems).totalOdbo,
        totalOdboDisc: compDiscSum(orderItems).totalOdboDisc
      })
    case SET_ORDER_ITEM_QTY:
      orderItems.forEach(item => {
        let {
          qty,
          subTotalPrice,
          subTotalOdboPrice,
          finalPR,
          finalOdboPR
        } = item

        if (item.id === action.orderItemID) {
          if (action.opperand === 'plus') {
            item.qty = qty + 1
            item.subTotalPrice = subTotalPrice + finalPR
            item.subTotalOdboPrice = subTotalOdboPrice + finalPR
          } else {
            if (qty > 1) {
              item.qty = qty - 1
              item.subTotalPrice = subTotalPrice - finalPR
              item.subTotalOdboPrice = subTotalOdboPrice - finalOdboPR
            }
          }
        }
      })
      return Object.assign({}, state, {
        isEditing: false,
        orderItems,
        total: compItemsSum(orderItems).total,
        totalDisc: compDiscSum(orderItems).totalDisc,
        totalOdbo: compItemsSum(orderItems).totalOdbo,
        totalOdboDisc: compDiscSum(orderItems).totalOdboDisc
      })
    case SET_ORDER_INFO:
      return Object.assign({}, state, {
        orderInfo: action.orderInfo,
        receipt: action.receipt
      })
    case REMOVE_ORDER_ITEM:
      orderItems.forEach(function (item, index, object) {
        if (item.id === action.orderItemID) {
          object.splice(index, 1)
        }
      })
      return Object.assign({}, state, {
        orderItems,
        isEditing: false,
        total: compItemsSum(orderItems).total,
        totalDisc: compDiscSum(orderItems).totalDisc,
        totalOdbo: compItemsSum(orderItems).totalOdbo,
        totalOdboDisc: compDiscSum(orderItems).totalOdboDisc
      })
    case ADD_PAYMENT_TYPE:
      let payment = action.payment
      let payments = state.payments
      if (payments.length > 0) {
        if (payment.type === 'cash') {
          payments.forEach(prevPay => {
            if (payment.type === 'cash' && prevPay.type === 'cash') {
              prevPay.amount = payment.amount
              prevPay.cash = payment.cash
              prevPay.change = payment.change
            } else if (payment.type === 'odbo') {
              prevPay.amount = payment.amount
            }
          })
        }
        if (payment.type !== 'cash' && payment.type !== 'odbo') { payments.push(payment) }
      } else {
        payments.push(payment)
      }
      return Object.assign({}, state, {
        payments: payments,
        isEditing: false
      })
    case REMOVE_PAYMENT_TYPE:
      var filteredPayments = state.payments.filter(payment => {
        if (action.key) {
          return state.payments.indexOf(payment) !== action.key
        } else if (action.paymentType !== 'voucher') {
          return payment.type !== action.paymentType
        } else if (action.paymentType === 'voucher') {
          return !payment.deduction
        }
      })
      return Object.assign({}, state, {
        payments: filteredPayments
      })
    case REMOVE_PAYMENT_BYKEY:
      let updatedPayments = state.payments.filter((payment, index, arr) => {
        return arr.indexOf(payment) !== action.key
      })
      return Object.assign({}, state, {
        payments: updatedPayments
      })
    case ADD_ORDER_NOTE:
      let orderNote = state.orderNote
      orderNote.push(action.note)
      return Object.assign({}, state, {
        orderNote: orderNote,
        isEditing: false
      })
    case ADD_BONUS_MULTIPLIER:
      return Object.assign({}, state, {
        bonusPoints: action.amount || 100
      })
    case REMOVE_BONUS_MULTIPLIER:
      return Object.assign({}, state, {
        bonusPoints: undefined
      })
    case REMOVE_NOTE:
      state.orderNote.forEach(function (item, index, object) {
        if (index === action.key) {
          object.splice(index, 1)
        }
      })
      return Object.assign({}, state, {
        orderNote: state.orderNote,
        isEditing: false
      })
    case RESET_ORDER_DATA:
      return Object.assign({}, state, {
        activeCustomer: null,
        currency: 'sgd',
        total: 0,
        totalDisc: 0,
        totalOdbo: 0,
        totalOdboDisc: 0,
        totalPayments: 0,
        overallDiscount: 0,
        orderItems: [],
        payments: [],
        orderNote: [],
        orderInfo: null,
        receipt: null,
        isEditing: false,
        isProcessing: false
      })
    case RECALL_ORDER:
      state = action.data
      return state
    default:
      return state
  }
}

export default orderData
