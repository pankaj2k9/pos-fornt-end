export const SET_CASHIER_LOGGED_IN = 'SET_CASHIER_LOGGED_IN'
export function setCashierLoggedIn (cashier) {
  return {
    type: SET_CASHIER_LOGGED_IN,
    cashier
  }
}

export const SET_STAFF_LOGGED_IN = 'SET_STAFF_LOGGED_IN'
export function setStaffLoggedIn (result) {
  return {
    type: SET_STAFF_LOGGED_IN,
    result
  }
}

export const SET_ACTIVE_CASHDRAWER = 'SET_ACTIVE_CASHDRAWER'
export function setActiveCashdrawer (cashdrawer) {
  return {
    type: SET_ACTIVE_CASHDRAWER,
    cashdrawer
  }
}

export const SET_ACTIVE_MODAL = 'SET_ACTIVE_MODAL'
export function setActiveModal (activeModalId, inputToFocus) {
  return {
    type: SET_ACTIVE_MODAL,
    activeModalId,
    inputToFocus
  }
}

export const STORE_SET_ACTIVE = 'STORE_SET_ACTIVE'
export function storeSetActive (store) {
  return {
    type: STORE_SET_ACTIVE,
    store
  }
}

export const SET_ERROR = 'SET_ERROR'
export function setError (error) {
  return {
    type: SET_ERROR,
    error
  }
}

export const CLOSE_ACTIVE_MODAL = 'CLOSE_ACTIVE_MODAL'
export function closeActiveModal (inputToFocus) {
  return {
    type: CLOSE_ACTIVE_MODAL,
    inputToFocus
  }
}

export const TOGGLE_NETWORK_STATUS = 'TOGGLE_NETWORK_STATUS'
export function toggleNetworkStatus (netStat) {
  return {
    type: TOGGLE_NETWORK_STATUS,
    netStat
  }
}

export const TOGGLE_POS_MODE = 'TOGGLE_POS_MODE'
export function togglePosMode (mode) {
  return {
    type: TOGGLE_POS_MODE,
    mode
  }
}

export const RESET_STAFF_STATE = 'RESET_STAFF_STATE'
export function resetStaffState () {
  return {
    type: RESET_STAFF_STATE
  }
}

export const RESET_ERROR_STATE = 'RESET_ERROR_STATE'
export function resetErrorState () {
  return {
    type: RESET_ERROR_STATE
  }
}

export const HAMBURGER_TOGGLE = 'HAMBURGER_TOGGLE'
export function hamburgerToggle () {
  return {
    type: HAMBURGER_TOGGLE
  }
}

export const RESET_APP_STATE = 'RESET_APP_STATE'
export function resetAppState () {
  return {
    type: RESET_APP_STATE
  }
}

export const CURRENTLY_EDITING = 'CURRENTLY_EDITING'
export function currentlyEditing (value) {
  return {
    type: CURRENTLY_EDITING,
    value
  }
}
