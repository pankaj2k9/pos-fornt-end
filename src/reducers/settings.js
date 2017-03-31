import {
  SET_SETTINGS_ACTIVE_TAB,
  SET_ACTIVE_ORDER_DETAILS,
  CUSTOMERS_SET_SEARCH_KEY,
  CUSTOMERS_SET_FILTER,
  CUSTOMERS_SET_ACTIVE_ID,
  CUSTOMERS_SET_CONTACT_FILTER,
  CUSTOMERS_SET_SEARCH_KEY_ODBOID_FR,
  CUSTOMERS_SET_SEARCH_KEY_ODBOID_TO,
  STOREORDER_SET_SEARCH_KEY,
  STOREORDER_FETCH_REQUEST,
  STOREORDER_FETCH_SUCCESS,
  STOREORDER_FETCH_FAILURE,
  RESET_SETTINGS_STATE,
  VERIFY_STORE_PIN_REQUEST,
  VERIFY_STORE_PIN_SUCCESS,
  VERIFY_STORE_PIN_FAILURE,
  SETTINGS_ERROR,
  SET_PROCESSING_STATUS,
  CLEAR_MESSAGES,

  SET_ACTIVE_CUSTOMER,
  UPDATE_CUSTOMER_REQUEST,
  UPDATE_CUSTOMER_SUCCESS,
  UPDATE_CUSTOMER_FAILURE,

  ACCOUNT_CHANGEPW_TOGGLE_VIEW,
  ACCOUNT_CHANGEPW_REQUEST,
  ACCOUNT_CHANGEPW_SUCCESS,
  ACCOUNT_CHANGEPW_FAILURE,
  ACCOUNT_CHANGEPW_OLDPW_SET_VALUE,
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
    case ACCOUNT_CHANGEPW_OLDPW_SET_VALUE:
      return Object.assign({}, state, {
        oldPw: action.oldPw
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
  searchedOrders: [],
  activeTab: 'main',
  activeCustomer: null,
  activeOrderDetails: undefined,
  tabs: [
    {name: 'app.page.settings.tabMain', value: 'main'},
    {name: 'app.page.settings.tabOrders', value: 'orders'},
    {name: 'app.page.settings.tabCustomers', value: 'customers'},
    {name: 'app.page.settings.tabAccount', value: 'account'}
  ],
  error: null,
  orderSearchKey: '',
  orderSearchKeyAlt: '',
  customerSearchKey: '',
  customerSearchKeyOIDFR: '',
  customerSearchKeyOIDTO: '',
  customerFilter: 'odbo id',
  customerContactFilter: '',
  isProcessing: false,
  updateSuccess: false,
  account: {
    isChangePwActive: false,
    isChangingPw: false,
    oldPw: '',
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
    case CUSTOMERS_SET_SEARCH_KEY_ODBOID_FR:
      return Object.assign({}, state, {
        customerSearchKeyOIDFR: action.odboId
      })
    case CUSTOMERS_SET_SEARCH_KEY_ODBOID_TO:
      return Object.assign({}, state, {
        customerSearchKeyOIDTO: action.odboId
      })
    case CUSTOMERS_SET_FILTER:
      return Object.assign({}, state, {
        customerFilter: action.filter
      })
    case CUSTOMERS_SET_CONTACT_FILTER:
      return Object.assign({}, state, {
        customerContactFilter: action.contactFilter
      })
    case CUSTOMERS_SET_ACTIVE_ID: {
      return Object.assign({}, state, {
        activeCustomerId: action.odboId
      })
    }
    case SET_ACTIVE_ORDER_DETAILS: {
      return Object.assign({}, state, {
        activeOrderDetails: action.order
      })
    }
    case SET_PROCESSING_STATUS:
      return Object.assign({}, state, {
        isProcessing: false
      })
    case REFUND_REQUEST:
      return Object.assign({}, state, {
        refundSuccess: false,
        isProcessing: true
      })
    case REFUND_SUCCESS:
      return Object.assign({}, state, {
        refundSuccess: true,
        isProcessing: false,
        orderSearchKey: ''
      })
    case REFUND_FAILURE:
      return Object.assign({}, state, {
        refundSuccess: false,
        isProcessing: false
      })
    case STOREORDER_SET_SEARCH_KEY:
      return Object.assign({}, state, {
        orderSearchKey: action.orderKey,
        orderSearchKeyAlt: action.altKey
      })
    case STOREORDER_FETCH_REQUEST:
      return Object.assign({}, state, {
        isProcessing: true
      })
    case STOREORDER_FETCH_SUCCESS:
      return Object.assign({}, state, {
        searchedOrders: action.response,
        isProcessing: false
      })
    case STOREORDER_FETCH_FAILURE:
    case RESET_SETTINGS_STATE: {
      return Object.assign({}, state, {
        searchedOrders: null,
        error: false,
        orderSearchKey: '',
        refundSuccess: null,
        reprintSuccess: null,
        isProcessing: false
      })
    }
    case VERIFY_STORE_PIN_REQUEST:
      return Object.assign({}, state, {
        isProcessing: true
      })
    case VERIFY_STORE_PIN_SUCCESS:
      return Object.assign({}, state, {
        isProcessing: false,
        error: null
      })
    case VERIFY_STORE_PIN_FAILURE:
      return Object.assign({}, state, {
        error: action.error,
        orderSearchKey: '',
        isProcessing: false
      })
    case SETTINGS_ERROR:
      return Object.assign({}, state, {
        error: true
      })
    case SET_ACTIVE_CUSTOMER:
      return Object.assign({}, state, {
        activeCustomer: action.customer,
        isProcessing: false,
        updateSuccess: false,
        error: null
      })
    case UPDATE_CUSTOMER_REQUEST:
      return Object.assign({}, state, {
        isProcessing: true
      })
    case UPDATE_CUSTOMER_SUCCESS:
      return Object.assign({}, state, {
        activeCustomer: action.response || state.activeCustomer,
        isProcessing: false,
        updateSuccess: true,
        error: null
      })
    case UPDATE_CUSTOMER_FAILURE:
      return Object.assign({}, state, {
        isProcessing: false,
        updateSuccess: false,
        error: action.error
      })
    case ACCOUNT_CHANGEPW_TOGGLE_VIEW:
    case ACCOUNT_CHANGEPW_REQUEST:
    case ACCOUNT_CHANGEPW_SUCCESS:
    case ACCOUNT_CHANGEPW_FAILURE:
    case ACCOUNT_CHANGEPW_OLDPW_SET_VALUE:
    case ACCOUNT_CHANGEPW_NEWPW_SET_VALUE:
    case ACCOUNT_CHANGEPW_CONFIRMPW_SET_VALUE:
    case ACCOUNT_CHANGEPW_CLEAR_MESSAGES:
      return Object.assign({}, state, {
        account: account(state.account, action)
      })
    case CLEAR_MESSAGES:
      return Object.assign({}, state, {
        isProcessing: false,
        updateSuccess: false,
        error: null
      })
    default:
      return state
  }
}

export default settings
