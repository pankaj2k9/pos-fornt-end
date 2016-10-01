import {
  HAMBURGER_TOGGLE,
  HAMBURGER_CLOSE,
  SET_ACTIVE_MODAL,
  CLOSE_ACTIVE_MODAL,
  SET_STAFF_LOGGED_IN,
  ADD_CASHDRAWER_DATA,
  ADD_CASHDRAWER_OPENCOUNT,
  SET_CASHDRAWER_REQUEST,
  SET_CASHDRAWER_SUCCESS,
  SET_CASHDRAWER_FAILURE,
  SET_ACTIVE_CASHDRAWER,
  SET_CASHIER_LOGGED_IN,
  STORE_GET_IDS_REQUEST,
  STORE_GET_IDS_SUCCESS,
  STORE_GET_IDS_FAILURE,
  STORE_SET_ID,
  STORE_SET_ACTIVE,
  AUTH_STAFF_SUCCESS,
  AUTH_STAFF_REQUEST,
  AUTH_STAFF_FAILURE,
  RESET_STAFF_STATE,
  RESET_ERROR_STATE,
  RESET_APP_STATE
} from '../actions/application'

function application (state = {
  cashdrawer: [],
  activeCashdrawer: null,
  activeModalId: null,
  isHamburgerOpen: false,
  isFetchingStoreIds: false,
  store: null,
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
    case ADD_CASHDRAWER_DATA:
      state.cashdrawer.push(action.cashdrawer)
      return Object.assign({}, state, {
        cashdrawer: state.cashdrawer,
        shouldUpdate: false,
        error: null
      })
    case ADD_CASHDRAWER_OPENCOUNT:
      let toUpdate = state.cashdrawer
      let current = [state.activeCashdrawer]
      let updatedCount
      current.forEach(function (newData) {
        var existing = toUpdate.filter(function (oldData, i) {
          return oldData.date === newData.date
        })
        if (existing.length) {
          var key = toUpdate.indexOf(existing[0])
          toUpdate[key].openCount += 1
          updatedCount = toUpdate[key]
        }
      })
      return Object.assign({}, state, {
        cashdrawer: toUpdate,
        activeCashdrawer: updatedCount,
        shouldUpdate: false,
        error: null
      })
    case SET_CASHDRAWER_REQUEST:
      return Object.assign({}, state, {
        shouldUpdate: true,
        error: null
      })
    case SET_CASHDRAWER_SUCCESS:
      let output = state.cashdrawer
      let newData = [{
        source: state.activeCashdrawer.source,
        date: state.activeCashdrawer.date,
        openCount: state.activeCashdrawer.openCount + 1,
        initialAmount: action.data.amount
      }]
      let newActiveCD
      newData.forEach(function (newData) {
        var existing = output.filter(function (oldData, i) {
          return oldData.date === newData.date
        })
        if (existing.length) {
          var key = output.indexOf(existing[0])
          output[key].openCount = newData.openCount
          output[key].initialAmount = newData.initialAmount
          newActiveCD = output[key]
        }
      })
      return Object.assign({}, state, {
        cashdrawer: output,
        activeCashdrawer: newActiveCD,
        shouldUpdate: false,
        error: null
      })
    case SET_CASHDRAWER_FAILURE:
      return Object.assign({}, state, {
        shouldUpdate: false,
        error: action.error
      })
    case SET_ACTIVE_CASHDRAWER:
      return Object.assign({}, state, {
        activeCashdrawer: action.cashdrawer
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
    case STORE_SET_ACTIVE:
      return Object.assign({}, state, {
        store: action.store
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
    case RESET_ERROR_STATE:
      return Object.assign({}, state, {
        shouldUpdate: false,
        error: null
      })
    case RESET_APP_STATE:
      return Object.assign({}, state, {
        activeCashdrawer: null,
        activeModalId: null,
        isHamburgerOpen: false,
        isFetchingStoreIds: false,
        storeIds: [],
        storeIdsError: null,
        storeId: null,
        activeCashier: null,
        adminToken: null,
        shouldUpdate: false,
        error: null,
        store: null
      })
    default:
      return state
  }
}

export default application
