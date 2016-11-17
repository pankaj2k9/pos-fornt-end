import {
  SET_PAYMENT_MODE,
  SET_DISCOUNT,
  SET_CASH_TENDERED,
  ADD_PAYMENT_TYPE,
  REMOVE_PAYMENT_TYPE,
  SET_TRANS_NUMBER,
  SET_CARD_TYPE,
  SET_PAYMENT_AMOUNT,
  SET_CARD_PROVIDER,
  SET_PIN_CODE,
  SET_ORDER_NOTE,
  REMOVE_NOTE,
  PANEL_CHECKOUT_SHOULD_UPDATE,
  PANEL_CHECKOUT_RESET,
  CHECKOUT_FIELDS_RESET,
  TOGGLE_BONUS_POINTS,
  PRINT_PREVIEW_TOTAL,

  VERIFY_VOUCHER_REQUEST,
  VERIFY_VOUCHER_SUCCESS,
  VERIFY_VOUCHER_FAILURE
} from '../actions/panelCheckout'

function panelCheckout (state = {
  paymentMode: null,
  paymentAmount: null,
  cashTendered: 0,
  payments: [
    { type: 'cash', amount: null, cash: 0, remarks: 'Without change' },
    { type: 'voucher', total: 0, vouchers: [] }
  ],
  card: {
    type: 'credit',
    provider: null
  },
  printPreviewTotal: false,
  bonusPoints: false,
  customDiscount: 0,
  transNumber: '',
  pincode: '',
  orderNote: [],
  shouldUpdate: false,
  error: null
}, action) {
  switch (action.type) {
    case PRINT_PREVIEW_TOTAL:
      return Object.assign({}, state, {
        printPreviewTotal: action.print,
        shouldUpdate: action.shouldUpdate
      })
    case SET_PAYMENT_MODE:
      return Object.assign({}, state, {
        paymentMode: action.mode,
        shouldUpdate: true
      })
    case SET_DISCOUNT:
      state.shouldUpdate = true
      return Object.assign({}, state, {
        customDiscount: action.discountValue,
        shouldUpdate: false
      })
    case SET_PAYMENT_AMOUNT:
      return Object.assign({}, state, {
        paymentAmount: action.amount
      })
    case SET_CASH_TENDERED:
      const cash = (action.cash === '') ? 0 : action.cash
      return Object.assign({}, state, {
        cashTendered: cash
      })
    case ADD_PAYMENT_TYPE:
      state.shouldUpdate = true
      const paymentToCompare = [action.payment]
      const currentPayments = state.payments
      paymentToCompare.forEach(function (payment) {
        var existing = currentPayments.filter(function (prev, i) {
          return prev.type === payment.type
        })
        if (existing.length) {
          var key = currentPayments.indexOf(existing[0])
          if (currentPayments[key].type === 'cash') {
            currentPayments[key].amount = Number(action.payment.amount).toFixed(2)
            currentPayments[key].cash = Number(action.payment.cash).toFixed(2)
          } else if (currentPayments[key].type === 'credit') {
            currentPayments.push(action.payment)
          } else if (currentPayments[key].type === 'nets') {
            currentPayments.push(action.payment)
          } else if (currentPayments[key].type === 'voucher') {
            let vouchers = currentPayments[key].vouchers
            vouchers.push(action.payment.voucher)
            currentPayments[key].total = Number(currentPayments[key].total) + Number(action.payment.voucher.deduction)
          }
        } else {
          currentPayments.push(action.payment)
        }
      })
      return Object.assign({}, state, {
        payments: state.payments,
        shouldUpdate: false
      })
    case REMOVE_PAYMENT_TYPE:
      state.payments.forEach(function (payment) {
        if (payment.type === action.paymentType) {
          if (payment.type === 'cash') {
            payment.amount = null
            payment.cash = 0
          } else if (payment.type === 'voucher') {
            payment.total = 0
            payment.vouchers = []
          } else if (payment.type === 'credit') {
            payment.amount = null
            payment.transNumber = null
            payment.provider = null
          } else if (payment.type === 'nets') {
            payment.amount = null
            payment.transNumber = null
            payment.provider = null
          }
        }
      })
      return Object.assign({}, state, {
        payment: state.payments,
        shouldUpdate: false
      })
    case SET_CARD_TYPE:
      return Object.assign({}, state, {
        card: {
          type: action.cardType,
          provider: state.card.provider
        }
      })
    case SET_CARD_PROVIDER:
      return Object.assign({}, state, {
        card: {
          type: state.card.type,
          provider: action.cardProvider
        }
      })
    case SET_TRANS_NUMBER:
      return Object.assign({}, state, {
        transNumber: action.transNumber
      })
    case SET_PIN_CODE:
      return Object.assign({}, state, {
        pincode: action.pincode
      })
    case SET_ORDER_NOTE:
      return Object.assign({}, state, {
        orderNote: action.note
      })
    case REMOVE_NOTE:
      state.orderNote.forEach(function (item, index, object) {
        if (item.message === action.message) {
          object.splice(index, 1)
          state.shouldUpdate = true
        }
      })
      return Object.assign({}, state, {
        orderNote: state.orderNote,
        shouldUpdate: false
      })
    case PANEL_CHECKOUT_SHOULD_UPDATE:
      return Object.assign({}, state, {
        shouldUpdate: action.value
      })
    case PANEL_CHECKOUT_RESET:
      return Object.assign({}, state, {
        bonusPoints: false,
        isProcessing: false,
        paymentMode: null,
        cashTendered: 0,
        card: { type: 'credit', provider: null },
        customDiscount: 0,
        transNumber: '',
        pincode: '',
        payments: [
          { type: 'cash', amount: null, cash: 0, remarks: 'Without change' },
          { type: 'voucher', total: 0, vouchers: [] }
        ],
        orderNote: []
      })
    case CHECKOUT_FIELDS_RESET:
      return Object.assign({}, state, {
        isProcessing: false,
        cashTendered: 0,
        transNumber: '',
        pincode: '',
        card: { type: 'credit', provider: null },
        orderNote: []
      })
    case TOGGLE_BONUS_POINTS:
      let boolVal = !state.bonusPoints
      return Object.assign({}, state, {
        bonusPoints: boolVal
      })
    case VERIFY_VOUCHER_REQUEST:
      return Object.assign({}, state, {
        error: null
      })
    case VERIFY_VOUCHER_SUCCESS:
      return Object.assign({}, state, {
        error: null
      })
    case VERIFY_VOUCHER_FAILURE:
      return Object.assign({}, state, {
        error: action.error
      })
    default:
      return state
  }
}

export default panelCheckout
