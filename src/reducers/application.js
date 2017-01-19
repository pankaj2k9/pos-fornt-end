import {
  HAMBURGER_TOGGLE,
  HAMBURGER_CLOSE,
  SET_ACTIVE_MODAL,
  CLOSE_ACTIVE_MODAL,
  SET_STAFF_LOGGED_IN,
  ADD_CASHDRAWER_DATA,
  ADD_CASHDRAWER_OPENCOUNT,
  VALIDATE_STOREPIN_REQUEST,
  VALIDATE_STOREPIN_SUCCESS,
  VALIDATE_STOREPIN_FAILURE,
  UPDATE_CASHDRAWER_REQUEST,
  UPDATE_CASHDRAWER_SUCCESS,
  UPDATE_CASHDRAWER_FAILURE,
  SET_ACTIVE_CASHDRAWER,
  SET_CASHIER_LOGGED_IN,
  SET_ERROR,
  STORE_GET_IDS_REQUEST,
  STORE_GET_IDS_SUCCESS,
  STORE_GET_IDS_FAILURE,
  STORE_SET_ID,
  STORE_SET_ACTIVE,
  AUTH_STAFF_SUCCESS,
  AUTH_STAFF_REQUEST,
  AUTH_STAFF_FAILURE,
  DAILYDATA_FETCH_REQUEST,
  DAILYDATA_FETCH_SUCCESS,
  DAILYDATA_FETCH_FAILURE,
  DAILYDATA_CREATE_REQUEST,
  DAILYDATA_CREATE_SUCCESS,
  DAILYDATA_CREATE_FAILURE,
  RESET_STAFF_STATE,
  RESET_ERROR_STATE,
  RESET_APP_STATE,
  TOGGLE_NETWORK_STATUS,
  TOGGLE_POS_MODE
} from '../actions/application'

function application (state = {
  cashdrawer: [],
  activeCashdrawer: null,
  activeModalId: null,
  focusedInput: null,
  isHamburgerOpen: false,
  isProcessing: false,
  isFetchingStoreIds: false,
  networkStatus: 'online',
  store: null,
  storeIds: [],
  storeIdsError: null,
  storeId: null,
  staff: null,
  activeCashier: null,
  adminToken: null,
  posMode: 'online',
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
          toUpdate[key].cashDrawerOpenCount += 1
          updatedCount = toUpdate[key]
        }
      })
      return Object.assign({}, state, {
        cashdrawer: toUpdate,
        activeCashdrawer: updatedCount,
        shouldUpdate: false,
        error: null
      })
    case TOGGLE_NETWORK_STATUS:
      return Object.assign({}, state, {
        networkStatus: action.netStat
      })
    case TOGGLE_POS_MODE:
      return Object.assign({}, state, {
        posMode: action.mode
      })
    case VALIDATE_STOREPIN_REQUEST:
      return Object.assign({}, state, {
        isProcessing: true,
        shouldUpdate: true,
        error: null
      })
    case VALIDATE_STOREPIN_SUCCESS:
      return Object.assign({}, state, {
        isProcessing: false,
        shouldUpdate: false,
        error: null
      })
    case VALIDATE_STOREPIN_FAILURE:
      return Object.assign({}, state, {
        isProcessing: false,
        shouldUpdate: false,
        error: action.error
      })
    case UPDATE_CASHDRAWER_REQUEST:
      return Object.assign({}, state, {
        isProcessing: true,
        shouldUpdate: true,
        error: null
      })
    case UPDATE_CASHDRAWER_SUCCESS:
      let output = state.cashdrawer
      let newData = [{
        storeId: state.activeCashdrawer.storeId,
        date: state.activeCashdrawer.date,
        cashDrawerOpenCount: state.activeCashdrawer.cashDrawerOpenCount,
        float: action.data.amount
      }]
      let newActiveCD
      newData.forEach(function (newData) {
        var existing = output.filter(function (oldData, i) {
          return oldData.date === newData.date
        })
        if (existing.length) {
          var key = output.indexOf(existing[0])
          output[key].cashDrawerOpenCount = newData.cashDrawerOpenCount
          output[key].float = newData.float
          newActiveCD = output[key]
        }
      })
      return Object.assign({}, state, {
        isProcessing: false,
        cashdrawer: output,
        activeCashdrawer: newActiveCD,
        shouldUpdate: false,
        error: null
      })
    case UPDATE_CASHDRAWER_FAILURE:
      return Object.assign({}, state, {
        isProcessing: false,
        shouldUpdate: false,
        error: action.error
      })
    case SET_ACTIVE_CASHDRAWER:
      return Object.assign({}, state, {
        activeCashdrawer: action.cashdrawer
      })
    case SET_ACTIVE_MODAL:
      return Object.assign({}, state, {
        activeModalId: action.activeModalId,
        focusedInput: action.inputToFocus
      })
    case SET_ERROR:
      return Object.assign({}, state, {
        error: action.error
      })
    case CLOSE_ACTIVE_MODAL:
      return Object.assign({}, state, {
        activeModalId: null,
        focusedInput: action.inputToFocus,
        error: null
      })
    case SET_STAFF_LOGGED_IN:
      return Object.assign({}, state, {
        staff: action.userData,
        focusedInput: 'productsSearch'
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
        isProcessing: false,
        storeIds: action.storeIds,
        isFetchingStoreIds: false
      })
    case STORE_GET_IDS_FAILURE:
      return Object.assign({}, state, {
        isProcessing: false,
        storeIdsError: action.error,
        isFetchingStoreIds: false
      })
    case STORE_GET_IDS_REQUEST:
      return Object.assign({}, state, {
        isProcessing: true,
        isFetchingStoreIds: true
      })
    case AUTH_STAFF_REQUEST:
      return Object.assign({}, state, {
        isProcessing: true,
        shouldUpdate: true
      })
    case AUTH_STAFF_SUCCESS:
      return Object.assign({}, state, {
        isProcessing: false,
        shouldUpdate: false,
        adminToken: action.token
      })
    case AUTH_STAFF_FAILURE:
      return Object.assign({}, state, {
        isProcessing: false,
        shouldUpdate: false,
        error: action.error
      })
    case DAILYDATA_FETCH_REQUEST:
      return Object.assign({}, state, {
        shouldUpdate: true
      })
    case DAILYDATA_FETCH_SUCCESS:
      return Object.assign({}, state, {
        shouldUpdate: false,
        cashdrawer: action.storeDailyData
      })
    case DAILYDATA_FETCH_FAILURE:
      return Object.assign({}, state, {
        isProcessing: false,
        shouldUpdate: false,
        error: action.error
      })
    case DAILYDATA_CREATE_REQUEST:
      return Object.assign({}, state, {
        isProcessing: true,
        shouldUpdate: true
      })
    case DAILYDATA_CREATE_SUCCESS:
      return Object.assign({}, state, {
        shouldUpdate: false,
        activeCashdrawer: action.data,
        focusedInput: 'productsSearch'
      })
    case DAILYDATA_CREATE_FAILURE:
      return Object.assign({}, state, {
        isProcessing: false,
        shouldUpdate: false,
        error: action.error
      })
    case RESET_STAFF_STATE:
      return Object.assign({}, state, {
        isProcessing: false,
        shouldUpdate: false,
        error: null,
        adminToken: null,
        activeCashier: null
      })
    case RESET_ERROR_STATE:
      return Object.assign({}, state, {
        isProcessing: false,
        shouldUpdate: false,
        error: null
      })
    case RESET_APP_STATE:
      return Object.assign({}, state, {
        activeCashdrawer: null,
        activeModalId: null,
        isProcessing: false,
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
