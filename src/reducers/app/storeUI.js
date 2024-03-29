import {
  SET_PAYMENT_MODE,
  SET_ACTIVE_CARD,
  SET_AMOUNT_TENDERED,
  SET_CASH_TENDERED,
  SET_TRANS_CODE,
  SET_FIELDS_DEFAULT,
  SET_CASHIER_NOT_SELECTED_WARNING
} from '../../actions/app/storeUI'

function storeUI (state = {
  isEditing: false,
  amountToPay: '',
  cashTendered: '',
  cash: { type: 'cash' },
  card: {
    type: 'credit',
    transNumber: '',
    provider: undefined
  },
  nets: {
    type: 'nets',
    transNumber: ''
  },
  voucher: {
    type: 'voucher',
    remarks: ''
  },
  paymentMode: 'cash'
}, action) {
  switch (action.type) {
    case SET_CASHIER_NOT_SELECTED_WARNING:
      return Object.assign({}, state, {
        cashierNotSelectedWarning: action.show
      })
    case SET_PAYMENT_MODE:
      return Object.assign({}, state, {
        paymentMode: action.mode
      })
    case SET_ACTIVE_CARD:
      return Object.assign({}, state, {
        card: {
          type: action.cardType,
          provider: action.cardProv,
          transNumber: state.card.transNumber
        }
      })
    case SET_AMOUNT_TENDERED:
      return Object.assign({}, state, {
        isEditing: true,
        amountToPay: action.amount
      })
    case SET_CASH_TENDERED:
      return Object.assign({}, state, {
        isEditing: true,
        cashTendered: action.amount
      })
    case SET_TRANS_CODE:
      if (action.mode === 'credit') {
        state.card.transNumber = action.code
      } else if (action.mode === 'nets') {
        state.nets.transNumber = action.code
      } else if (action.mode === 'voucher') {
        state.voucher.remarks = action.code
      }
      return Object.assign({}, state, {
        card: state.card,
        nets: state.nets,
        voucher: state.voucher
      })
    case SET_FIELDS_DEFAULT: {
      return Object.assign({}, state, {
        isEditing: false,
        amountToPay: '',
        card: {
          type: 'credit',
          provider: undefined
        }
      })
    }
    default:
      return state
  }
}

export default storeUI
