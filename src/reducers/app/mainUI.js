import {
  CURRENTLY_EDITING,
  HAMBURGER_TOGGLE,
  SET_ACTIVE_MODAL,
  CLOSE_ACTIVE_MODAL,
  SET_QUICK_LOGIN_PIN_CODE,
  SET_QUICK_LOGIN_CASHIER,
  SET_INVALID_QUICK_LOGIN_PIN_CODE,
  UPDATE_CASHIER_WORK_STATUS,
  SET_LAST_ID,
  SET_NEW_LAST_ID,
  SET_STAFF_LOGGED_IN,
  SET_ACTIVE_CASHDRAWER,
  SET_TEMPORARY_CASHDRAWER,
  SET_STORE_CASHIERS,
  SET_CASHDRAWER_INPUT,
  SET_ERROR,
  STORE_SET_ACTIVE,
  RESET_STAFF_STATE,
  RESET_ERROR_STATE,
  RESET_APP_STATE,
  TOGGLE_NETWORK_STATUS,
  TOGGLE_POS_MODE
} from '../../actions/app/mainUI'

function mainUI (state = {
  activeDrawer: null,
  activeDrawerOffline: {
    date: new Date().toISOString().slice(0, 10),
    float: 0,
    cashDrawerOpenCount: 0
  },
  activeModalId: null,
  activeStaff: null,
  activeStore: null,
  adminToken: null,
  cashdrawerInput: '',
  isEditing: false,
  error: null,
  isProcessing: false,
  isHamburgerOpen: false,
  lastOrderId: null,
  networkStatus: 'online',
  posMode: 'online',
  shouldUpdate: false,
  quickLoginPinCode: undefined,
  quickLoginCashier: undefined,
  invalidQuickLoginPinCode: false,
  options: undefined
}, action) {
  switch (action.type) {
    case CURRENTLY_EDITING:
      return Object.assign({}, state, {
        isEditing: true
      })
    case SET_STORE_CASHIERS:
      return Object.assign({}, state, {
        activeStaff: Object.assign({}, state.activeStaff, {
          staffs: action.cashiers
        })
      })
    case UPDATE_CASHIER_WORK_STATUS:
      const cashierId = action.cashierId
      const newWorkStatus = action.newWorkStatus

      let staffs = state.activeStaff ? state.activeStaff.staffs : []
      let newStaffs = []
      staffs.forEach((staff) => {
        if (staff.id !== cashierId) {
          newStaffs.push(staff)
        } else {
          let newStaff = Object.assign({}, staff, {
            workStatus: newWorkStatus
          })
          return newStaffs.push(newStaff)
        }
      })
      return Object.assign({}, state, {
        activeStaff: Object.assign({}, state.activeStaff, {
          staffs: newStaffs
        })
      })
    case SET_INVALID_QUICK_LOGIN_PIN_CODE:
      return Object.assign({}, state, {
        invalidQuickLoginPinCode: action.value
      })
    case SET_QUICK_LOGIN_PIN_CODE:
      return Object.assign({}, state, {
        quickLoginPinCode: action.pinCode
      })
    case SET_QUICK_LOGIN_CASHIER:
      return Object.assign({}, state, {
        quickLoginCashier: action.cashier
      })
    case SET_ACTIVE_CASHDRAWER:
      return Object.assign({}, state, {
        activeDrawer: action.cashdrawer,
        isEditing: false
      })
    case SET_CASHDRAWER_INPUT: {
      return Object.assign({}, state, {
        cashdrawerInput: action.amount
      })
    }
    case SET_TEMPORARY_CASHDRAWER:
      return Object.assign({}, state, {
        activeDrawerOffline: action.cashdrawer,
        isEditing: false
      })
    case SET_ACTIVE_MODAL:
      return Object.assign({}, state, {
        activeModalId: action.activeModalId,
        options: action.options,
        isEditing: true
      })
    case SET_LAST_ID:
      return Object.assign({}, state, {
        lastOrderId: action.lastId
      })
    case SET_NEW_LAST_ID:
      let lastId = state.lastOrderId += 1
      return Object.assign({}, state, {
        lastOrderId: lastId
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
        activeDrawer: null,
        activeDrawerOffline: null,
        activeModalId: null,
        options: undefined,
        activeStaff: null,
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
