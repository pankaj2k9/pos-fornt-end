import {
  CURRENTLY_EDITING,
  HAMBURGER_TOGGLE,
  SET_ACTIVE_MODAL,
  CLOSE_ACTIVE_MODAL,
  SET_NEW_LAST_ID,
  SET_STAFF_LOGGED_IN,
  SET_ACTIVE_CASHDRAWER,
  SET_CASHIER_LOGGED_IN,
  SET_ERROR,
  STORE_SET_ACTIVE,
  RESET_STAFF_STATE,
  RESET_ERROR_STATE,
  RESET_APP_STATE,
  TOGGLE_NETWORK_STATUS,
  TOGGLE_POS_MODE
} from '../../actions/app/mainUI'

function mainUI (state = {
  activeCashier: null,
  activeDrawer: {
    date: new Date(),
    float: 0,
    initialAmount: 0,
    cashDrawerOpenCount: 0
  },
  activeDrawerOffline: null,
  activeModalId: null,
  activeStaff: null,
  activeStore: null,
  adminToken: null,
  isEditing: false,
  error: null,
  isProcessing: false,
  isHamburgerOpen: false,
  networkStatus: 'online',
  posMode: 'online',
  shouldUpdate: false
}, action) {
  switch (action.type) {
    case CURRENTLY_EDITING:
      return Object.assign({}, state, {
        isEditing: true
      })
    case SET_CASHIER_LOGGED_IN:
      return Object.assign({}, state, {
        activeCashier: action.cashier,
        isEditing: false
      })
    case SET_ACTIVE_CASHDRAWER:
      return Object.assign({}, state, {
        activeCashdrawer: action.cashdrawer,
        isEditing: false
      })
    case SET_ACTIVE_MODAL:
      return Object.assign({}, state, {
        activeModalId: action.activeModalId,
        isEditing: true
      })
    case SET_NEW_LAST_ID:
      let lastId = state.activeStore['lastId'] += 1
      return Object.assign({}, state, {
        activeStore: Object.assign(state.activeStore, {lastId: lastId})
      })
    case CLOSE_ACTIVE_MODAL:
      return Object.assign({}, state, {
        activeModalId: null,
        error: null,
        isEditing: false
      })
    case SET_STAFF_LOGGED_IN:
      return Object.assign({}, state, {
        activeStaff: action.result.user,
        adminToken: action.result.accessToken,
        isEditing: false
      })
    case STORE_SET_ACTIVE:
      return Object.assign({}, state, {
        activeStore: action.store,
        isEditing: false
      })
    case SET_ERROR:
      return Object.assign({}, state, {
        error: action.error,
        isEditing: false
      })
    case HAMBURGER_TOGGLE:
      return Object.assign({}, state, {
        isHamburgerOpen: !state.isHamburgerOpen
      })
    case TOGGLE_NETWORK_STATUS:
      let newMode
      if (action.netStat === 'offline' && state.posMode === 'online') {
        newMode = 'offline'
      } else {
        newMode = 'offline'
      }
      return Object.assign({}, state, {
        networkStatus: action.netStat,
        posMode: newMode
      })
    case TOGGLE_POS_MODE:
      return Object.assign({}, state, {
        posMode: action.mode
      })
    case RESET_STAFF_STATE:
      return Object.assign({}, state, {
        isProcessing: false,
        shouldUpdate: false,
        error: null,
        adminToken: null,
        activeCashier: null,
        isEditing: false
      })
    case RESET_ERROR_STATE:
      return Object.assign({}, state, {
        isEditing: false,
        isProcessing: false,
        shouldUpdate: false,
        error: null
      })
    case RESET_APP_STATE:
      return Object.assign({}, state, {
        activeCashier: null,
        activeDrawer: null,
        activeDrawerOffline: null,
        activeModalId: null,
        activeStaff: null,
        activeStore: null,
        adminToken: null,
        isEditing: false,
        error: null,
        isProcessing: false,
        isHamburgerOpen: false,
        shouldUpdate: false
      })
    default:
      return state
  }
}

export default mainUI
