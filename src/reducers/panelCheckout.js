import {
  SET_PAYMENT_MODE,
  SET_CASH_TENDERED,
  SET_TRANS_NUMBER,
  SET_CARD_TYPE,
  SET_CARD_PROVIDER,
  SET_PIN_CODE,
  SET_ORDER_NOTE,
  PANEL_CHECKOUT_RESET,
  CHECKOUT_FIELDS_RESET,

  VERIFY_VOUCHER_REQUEST,
  VERIFY_VOUCHER_SUCCESS,
  VERIFY_VOUCHER_FAILURE
} from '../actions/panelCheckout'

function checkout (state = {
  paymentMode: 'cash',
  cashTendered: 0,
  card: {
    type: 'credit',
    provider: 'master'
  },
  voucher: {
    verifying: false,
    retry: false,
    discount: null,
    code: null
  },
  customDiscount: null,
  transNumber: '',
  pincode: '',
  orderNote: []
}, action) {
  switch (action.type) {
    case SET_PAYMENT_MODE:
      return Object.assign({}, state, {
        paymentMode: action.mode
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
    case PANEL_CHECKOUT_RESET:
      return Object.assign({}, state, {
        isProcessing: false,
        paymentMode: 'cash',
        cashTendered: 0,
        transNumber: '',
        pincode: '',
        orderNote: ''
      })
    case CHECKOUT_FIELDS_RESET:
      return Object.assign({}, state, {
        isProcessing: false,
        cashTendered: 0,
        transNumber: '',
        pincode: '',
        card: {}
      })
    case VERIFY_VOUCHER_REQUEST:
      return Object.assign({}, state, {
        voucher: {
          verifying: true,
          retry: false,
          discount: null
        }
      })
    case VERIFY_VOUCHER_SUCCESS:
      return Object.assign({}, state, {
        voucher: {
          verifying: false,
          retry: false,
          discount: action.discount,
          code: action.vc
        }
      })
    case VERIFY_VOUCHER_FAILURE:
      return Object.assign({}, state, {
        voucher: {
          verifying: false,
          retry: true,
          discount: null,
          code: null
        }
      })
    default:
      return state
  }
}

export default checkout
