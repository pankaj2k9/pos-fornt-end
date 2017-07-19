import {
  CURRENTLY_EDITING,
  SET_ACTIVE_CUSTOMER,
  SET_CURRENCY_TYPE,
  SET_ORDER_ITEM_QTY,
  SET_CUSTOM_DISCOUNT,
  SET_OVERALL_DISCOUNT,
  SET_CURRENT_CASHIER,
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
  compDiscSum,
  compPaymentsSum
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
    case SET_CURRENT_CASHIER:
      return Object.assign({}, state, {
        currentCashier: action.cashier
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
    case SET_CUSTOM_DISCOUNT: {
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
          const finalPR = itemPR - compDiscount(discPCT, itemPR)
          const finalOdboPR = itemOdboPR - compDiscount(odboDiscPCT, itemOdboPR, true)

          item.finalPR = item.finalPR + finalPR
          item.finalOdboPR = item.finalOdboPR + finalOdboPR
          item.subTotalPrice = finalPR * item.qty
          item.subTotalOdboPrice = finalOdboPR * item.qty
        }
      })

      const newTotal = compItemsSum(orderItems).total
      const newPayments = state.payments.map((payment) => Object.assign({}, payment))
      recalculateChange(newTotal, newPayments)

      return Object.assign({}, state, {
        payments: newPayments,
        isEditing: false,
        orderItems,
        total: newTotal,
        totalDisc: compDiscSum(orderItems).totalDisc,
        totalOdbo: compItemsSum(orderItems).totalOdbo,
        totalOdboDisc: compDiscSum(orderItems).totalOdboDisc
      })
    }
    case SET_OVERALL_DISCOUNT: {
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
        const finalPR = itemPR - compDiscount(discPCT, itemPR)
        const finalOdboPR = itemOdboPR - compDiscount(odboDiscPCT, itemOdboPR, true)

        item.overallDiscount = oaDiscFrmAtn
        item.finalPR = finalPR
        item.finalOdboPR = finalOdboPR
        item.subTotalPrice = finalPR * item.qty
        item.subTotalOdboPrice = finalOdboPR * item.qty
      })

      const newTotal = compItemsSum(orderItems).total
      const newPayments = state.payments.map((payment) => Object.assign({}, payment))
      recalculateChange(newTotal, newPayments)

      return Object.assign({}, state, {
        payments: newPayments,
        isEditing: false,
        items: orderItems,
        overallDiscount: oaDiscFrmAtn,
        total: newTotal,
        totalDisc: compDiscSum(orderItems).totalDisc,
        totalOdbo: compItemsSum(orderItems).totalOdbo,
        totalOdboDisc: compDiscSum(orderItems).totalOdboDisc
      })
    }
    case ADD_ORDER_ITEM: {
      let itemToAdd = [action.product]
      itemToAdd.forEach(function (newItem) {
        let existing = orderItems.filter((oldItem) => { return oldItem.id === newItem.id })

        let discPCT = 0
        if (oaDisc === 0) {
          if (newItem.isDiscounted) {
            discPCT = newItem.priceDiscount
          } else if (newItem.customDiscount === 0) {
            discPCT = 0
          } else {
            discPCT = newItem.customDiscount
          }
        } else {
          discPCT = oaDisc
        }

        let odboDiscPCT = 0
        if (oaDisc === 0) {
          if (newItem.isDiscounted) {
            odboDiscPCT = newItem.odboPriceDiscount
          } else if (newItem.customDiscount === 0) {
            odboDiscPCT = 0
          } else {
            odboDiscPCT = newItem.customDiscount
          }
        } else {
          odboDiscPCT = oaDisc
        }
        if (existing.length) {
          let x = orderItems.indexOf(existing[0]) // index
          orderItems[x].qty = orderItems[x].qty + 1
          orderItems[x].subTotalPrice = orderItems[x].subTotalPrice + newItem.finalPR
          orderItems[x].subTotalOdboPrice = orderItems[x].subTotalOdboPrice + newItem.finalOdboPR
        } else {
          const qtyAndTotal = {
            qty: 1,
            finalPR: newItem.price - compDiscount(discPCT, newItem.price),
            finalOdboPR: newItem.odboPrice - compDiscount(odboDiscPCT, newItem.odboPrice, true),
            subTotalPrice: newItem.price - compDiscount(discPCT, newItem.price),
            subTotalOdboPrice: newItem.odboPrice - compDiscount(odboDiscPCT, newItem.odboPrice, true),
            customDiscount: 0,
            overallDiscount: oaDisc === 0 ? 0 : oaDisc
          }
          let item = Object.assign(newItem, qtyAndTotal)
          orderItems.push(item)
        }
      })

      const newTotal = compItemsSum(orderItems).total
      const newPayments = state.payments.map((payment) => Object.assign({}, payment))
      recalculateChange(newTotal, newPayments)

      return Object.assign({}, state, {
        payments: newPayments,
        isEditing: false,
        orderItems,
        overallDiscount: oaDisc,
        total: newTotal,
        totalDisc: compDiscSum(orderItems).totalDisc,
        totalOdbo: compItemsSum(orderItems).totalOdbo,
        totalOdboDisc: compDiscSum(orderItems).totalOdboDisc
      })
    }
    case SET_ORDER_ITEM_QTY: {
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

      const newTotal = compItemsSum(orderItems).total
      const newPayments = state.payments.map((payment) => Object.assign({}, payment))
      recalculateChange(newTotal, newPayments)

      return Object.assign({}, state, {
        isEditing: false,
        orderItems,
        total: newTotal,
        totalDisc: compDiscSum(orderItems).totalDisc,
        totalOdbo: compItemsSum(orderItems).totalOdbo,
        totalOdboDisc: compDiscSum(orderItems).totalOdboDisc,
        payments: newPayments
      })
    }
    case SET_ORDER_INFO:
      return Object.assign({}, state, {
        orderInfo: action.orderInfo,
        receipt: action.receipt
      })
    case REMOVE_ORDER_ITEM: {
      orderItems.forEach(function (item, index, object) {
        if (item.id === action.orderItemID) {
          object.splice(index, 1)
        }
      })

      const newTotal = compItemsSum(orderItems).total
      const newPayments = state.payments.map((payment) => Object.assign({}, payment))
      recalculateChange(newTotal, newPayments)

      return Object.assign({}, state, {
        payments: newPayments,
        orderItems,
        isEditing: false,
        total: newTotal,
        totalDisc: compDiscSum(orderItems).totalDisc,
        totalOdbo: compItemsSum(orderItems).totalOdbo,
        totalOdboDisc: compDiscSum(orderItems).totalOdboDisc
      })
    }
    case ADD_PAYMENT_TYPE:
      let payment = action.payment
      let prevPayments = state.payments
      let newPayments = prevPayments.slice()

      if (prevPayments.length > 0) {
        if (payment.type === 'cash') {
          let isPutted = false
          prevPayments.forEach((prevPay, index) => {
            const newPayment = Object.assign({}, prevPayments[index])
            newPayments[index] = newPayment

            if (payment.type === 'cash' && prevPay.type === 'cash') {
              newPayment.amount = payment.amount
              newPayment.cash = payment.cash
              newPayment.change = payment.change
              isPutted = true
            } else if (payment.type === 'odbo') {
              newPayment.amount = payment.amount
            }
          })

          if (!isPutted) {
            newPayments.push(payment)
          }
        }
        if (payment.type !== 'cash' && payment.type !== 'odbo') { newPayments.push(payment) }
      } else {
        newPayments.push(payment)
      }

      recalculateChange(action.total, newPayments)
      return Object.assign({}, state, {
        payments: newPayments,
        isEditing: false
      })
    case REMOVE_PAYMENT_TYPE: {
      var filteredPayments = state.payments.filter(payment => {
        if (action.key) {
          return state.payments.indexOf(payment) !== action.key
        } else if (action.paymentType !== 'voucher') {
          return payment.type !== action.paymentType
        } else if (action.paymentType === 'voucher') {
          return !payment.deduction
        }
      })

      recalculateChange(action.total, filteredPayments)
      return Object.assign({}, state, {
        payments: filteredPayments
      })
    }
    case REMOVE_PAYMENT_BYKEY: {
      let updatedPayments = state.payments.filter((payment, index, arr) => {
        return arr.indexOf(payment) !== action.key
      })

      recalculateChange(action.total, updatedPayments)

      return Object.assign({}, state, {
        payments: updatedPayments
      })
    }
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
        bonusPoints: undefined,
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

function recalculateChange (orderTotal, payments) {
  const totalPayment = compPaymentsSum(payments)

  payments.forEach((payment) => {
    if (payment.change > 0) {
      payment.change = 0
    }
  })

  if (totalPayment > orderTotal) {
    payments.forEach((payment) => {
      if (payment.type === 'cash') {
        payment.change = totalPayment - orderTotal
      }
    })
  }
}

export default orderData
