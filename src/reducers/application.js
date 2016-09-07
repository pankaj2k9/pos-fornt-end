import {
  HAMBURGER_TOGGLE,
  HAMBURGER_CLOSE,
  SET_ACTIVE_MODAL,
  CLOSE_ACTIVE_MODAL,
  SET_STAFF_LOGGED_IN,
  SET_CASHIER_LOGGED_IN,
  STORE_GET_IDS_REQUEST,
  STORE_GET_IDS_SUCCESS,
  STORE_GET_IDS_FAILURE,
  STORE_SET_ID,
  AUTH_STAFF_SUCCESS,
  AUTH_STAFF_REQUEST,
  AUTH_STAFF_FAILURE,
  RESET_STAFF_STATE
} from '../actions/application'

function application (state = {
  searchAutofocus: false,
  activeModalId: null,
  isHamburgerOpen: false,
  isFetchingStoreIds: false,
  storeIds: [],
  storeIdsError: null,
  storeId: null,
  staff: null,
  activeCashier: null,
  adminToken: null,
  shouldUpdate: false,
  error: null
}, action) {
  switch (action.type) {
    case HAMBURGER_TOGGLE:
      return Object.assign({}, state, {
        isHamburgerOpen: !state.isHamburgerOpen
      })
    case HAMBURGER_CLOSE:
      return Object.assign({}, state, {
        isHamburgerOpen: false
      })
    case SET_ACTIVE_MODAL:
      return Object.assign({}, state, {
        activeModalId: action.activeModalId
      })
    case CLOSE_ACTIVE_MODAL:
      return Object.assign({}, state, {
        activeModalId: null
      })
    case SET_STAFF_LOGGED_IN:
      return Object.assign({}, state, {
        staff: action.userData
      })
    case SET_CASHIER_LOGGED_IN:
      return Object.assign({}, state, {
        activeCashier: action.cashier
      })
    case STORE_SET_ID:
      return Object.assign({}, state, {
        storeId: action.storeId
      })
    case STORE_GET_IDS_SUCCESS:
      return Object.assign({}, state, {
        storeIds: action.storeIds,
        isFetchingStoreIds: false
      })
    case STORE_GET_IDS_FAILURE:
      return Object.assign({}, state, {
        storeIdsError: action.error,
        isFetchingStoreIds: false
      })
    case STORE_GET_IDS_REQUEST:
      return Object.assign({}, state, {
        isFetchingStoreIds: true
      })
    case AUTH_STAFF_REQUEST:
      return Object.assign({}, state, {
        shouldUpdate: true
      })
    case AUTH_STAFF_SUCCESS:
      return Object.assign({}, state, {
        shouldUpdate: false,
        adminToken: action.token
      })
    case AUTH_STAFF_FAILURE:
      return Object.assign({}, state, {
        shouldUpdate: false,
        error: action.error
      })
    case RESET_STAFF_STATE:
      return Object.assign({}, state, {
        shouldUpdate: false,
        error: null,
        adminToken: null,
        activeCashier: null
      })
    default:
      return state
  }
}

export default application
