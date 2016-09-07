import {
  SET_SETTINGS_ACTIVE_TAB,
  CUSTOMERS_SET_SEARCH_KEY,
  CUSTOMERS_SET_FILTER,
  CUSTOMERS_SET_ACTIVE_ID,
  STOREORDER_SET_SEARCH_KEY,
  STOREORDER_FETCH_REQUEST,
  STOREORDER_FETCH_SUCCESS,
  STOREORDER_FETCH_FAILURE,
  RESET_SETTINGS_STATE,
  ACCOUNT_CHANGEPW_TOGGLE_VIEW,
  ACCOUNT_CHANGEPW_REQUEST,
  ACCOUNT_CHANGEPW_SUCCESS,
  ACCOUNT_CHANGEPW_FAILURE,
  ACCOUNT_CHANGEPW_NEWPW_SET_VALUE,
  ACCOUNT_CHANGEPW_CONFIRMPW_SET_VALUE,
  ACCOUNT_CHANGEPW_CLEAR_MESSAGES
} from '../actions/settings'

import {
  REFUND_REQUEST,
  REFUND_SUCCESS,
  REFUND_FAILURE
} from '../actions/refund'

function account (state, action) {
  switch (action.type) {
    case ACCOUNT_CHANGEPW_TOGGLE_VIEW:
      return Object.assign({}, state, {
        isChangePwActive: !state.isChangePwActive
      })
    case ACCOUNT_CHANGEPW_REQUEST:
      return Object.assign({}, state, {
        isChangingPw: true
      })
    case ACCOUNT_CHANGEPW_SUCCESS:
      return Object.assign({}, state, {
        isChangingPw: false,
        successMessage: action.message
      })
    case ACCOUNT_CHANGEPW_FAILURE:
      return Object.assign({}, state, {
        isChangingPw: false,
        errorMessage: action.message
      })
    case ACCOUNT_CHANGEPW_NEWPW_SET_VALUE:
      return Object.assign({}, state, {
        newPw: action.newPw
      })
    case ACCOUNT_CHANGEPW_CONFIRMPW_SET_VALUE:
      return Object.assign({}, state, {
        confirmPw: action.confirmPw
      })
    case ACCOUNT_CHANGEPW_CLEAR_MESSAGES:
      return Object.assign({}, state, {
        successMessage: null,
        errorMessage: null
      })
    default:
      return state
  }
}

function settings (state = {
  orderFromGet: null,
  activeTab: 'main',
  activeCustomerId: null,
  tabs: [
    {name: 'app.page.settings.tabMain', value: 'main'},
    {name: 'app.page.settings.tabOrders', value: 'orders'},
    {name: 'app.page.settings.tabCustomers', value: 'customers'},
    {name: 'app.page.settings.tabAccount', value: 'account'}
  ],
  error: false,
  orderSearchKey: '',
  customerSearchKey: '',
  customerFilter: '',
  refundSuccess: false,
  reprintSuccess: null,
  isProcessing: 'false',
  account: {
    isChangePwActive: false,
    isChangingPw: false,
    newPw: '',
    confirmPw: '',
    errorMessage: '',
    successMessage: ''
  }
}, action) {
  switch (action.type) {
    case SET_SETTINGS_ACTIVE_TAB:
      return Object.assign({}, state, {
        activeTab: action.tabName
      })
    case CUSTOMERS_SET_SEARCH_KEY:
      return Object.assign({}, state, {
        customerSearchKey: action.customerKey
      })
    case CUSTOMERS_SET_FILTER:
      return Object.assign({}, state, {
        customerFilter: action.filter
      })
    case CUSTOMERS_SET_ACTIVE_ID: {
      return Object.assign({}, state, {
        activeCustomerId: action.odboId
      })
    }
    case REFUND_REQUEST:
      return Object.assign({}, state, {
        refundSuccess: null,
        isProcessing: true
      })
    case REFUND_SUCCESS:
      return Object.assign({}, state, {
        refundSuccess: true,
        isProcessing: false
      })
    case REFUND_FAILURE:
      return Object.assign({}, state, {
        refundSuccess: false,
        isProcessing: false
      })
    case STOREORDER_SET_SEARCH_KEY:
      return Object.assign({}, state, {
        orderSearchKey: action.orderKey
      })
    case STOREORDER_FETCH_REQUEST:
    case STOREORDER_FETCH_SUCCESS:
      return Object.assign({}, state, {
        orderFromGet: action.response
      })
    case STOREORDER_FETCH_FAILURE:
    case RESET_SETTINGS_STATE: {
      return Object.assign({}, state, {
        orderFromGet: null,
        error: false,
        orderSearchKey: '',
        refundSuccess: null,
        reprintSuccess: null,
        isProcessing: false
      })
    }
    case ACCOUNT_CHANGEPW_TOGGLE_VIEW:
    case ACCOUNT_CHANGEPW_REQUEST:
    case ACCOUNT_CHANGEPW_SUCCESS:
    case ACCOUNT_CHANGEPW_FAILURE:
    case ACCOUNT_CHANGEPW_NEWPW_SET_VALUE:
    case ACCOUNT_CHANGEPW_CONFIRMPW_SET_VALUE:
    case ACCOUNT_CHANGEPW_CLEAR_MESSAGES:
      return Object.assign({}, state, {
        account: account(state.account, action)
      })
    default:
      return state
  }
}

export default settings
