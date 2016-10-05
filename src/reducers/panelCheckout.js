import {
  SET_PAYMENT_MODE,
  SET_DISCOUNT,
  SET_CASH_TENDERED,
  SET_TRANS_NUMBER,
  SET_CARD_TYPE,
  SET_CARD_PROVIDER,
  SET_PIN_CODE,
  SET_ORDER_NOTE,
  REMOVE_NOTE,
  PANEL_CHECKOUT_SHOULD_UPDATE,
  PANEL_CHECKOUT_RESET,
  CHECKOUT_FIELDS_RESET,
  TOGGLE_BONUS_POINTS,

  VERIFY_VOUCHER_REQUEST,
  VERIFY_VOUCHER_SUCCESS,
  VERIFY_VOUCHER_FAILURE
} from '../actions/panelCheckout'

function checkout (state = {
  paymentMode: 'cash',
  cashTendered: 0,
  card: {
    type: 'credit',
    provider: null
  },
  bonusPoints: false,
  customDiscount: undefined,
  transNumber: '',
  pincode: '',
  orderNote: [],
  shouldUpdate: false,
  error: null
}, action) {
  switch (action.type) {
    case SET_PAYMENT_MODE:
      return Object.assign({}, state, {
        paymentMode: action.mode
      })
    case SET_DISCOUNT:
      state.shouldUpdate = true
      return Object.assign({}, state, {
        customDiscount: action.discountValue,
        shouldUpdate: false
      })
    case SET_CASH_TENDERED:
      const cash = (action.cash === '') ? 0 : action.cash
      return Object.assign({}, state, {
        cashTendered: cash
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
        orderNote: state.orderNote,
        shouldUpdate: true
      })
    case PANEL_CHECKOUT_RESET:
      return Object.assign({}, state, {
        bonusPoints: false,
        isProcessing: false,
        paymentMode: 'cash',
        cashTendered: 0,
        card: { type: 'credit', provider: null },
        customDiscount: undefined,
        transNumber: '',
        pincode: '',
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
      return Object.assign({}, state, {
        bonusPoints: action.value
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

export default checkout
