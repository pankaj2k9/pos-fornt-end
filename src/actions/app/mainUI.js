import {syncWorkHistory, offlineLogoutAllCashiers, offlineToggleWorkState, updateSavedOrders} from '../data/offlineData'
import {customerAddResetData} from '../data/customers'

export const SET_CASHIER_LOGGED_IN = 'SET_CASHIER_LOGGED_IN'
export function setCashierLoggedIn (cashier) {
  return {
    type: SET_CASHIER_LOGGED_IN,
    cashier
  }
}

export const START_QUICK_LOGIN = 'START_QUICK_LOGIN'
export function startQuickLogin (cashier) {
  return (dispatch) => {
    dispatch(setQuickLoginCashier(cashier))
    dispatch(setActiveModal('quickLoginPinCode'))
  }
}

export const SET_QUICK_LOGIN_CASHIER = 'SET_QUICK_LOGIN_CASHIER'
export function setQuickLoginCashier (cashier) {
  return { type: SET_QUICK_LOGIN_CASHIER, cashier }
}

export const SET_QUICK_LOGIN_PIN_CODE = 'SET_QUICK_LOGIN_PIN_CODE'
export function setQuickLoginPinCode (pinCode) {
  return { type: SET_QUICK_LOGIN_PIN_CODE, pinCode }
}

export const SET_INVALID_QUICK_LOGIN_PIN_CODE = 'SET_INVALID_QUICK_LOGIN_PIN_CODE'
export function setInvalidQuickLoginPinCode (value) {
  return { type: SET_INVALID_QUICK_LOGIN_PIN_CODE, value }
}

export const TOGGLE_CASHIER_WORK_STATUS_REQUEST = 'TOGGLE_CASHIER_WORK_STATUS_REQUEST'
export const TOGGLE_CASHIER_WORK_STATUS_SUCCESS = 'TOGGLE_CASHIER_WORK_STATUS_SUCCESS'
export const TOGGLE_CASHIER_WORK_STATUS_ERROR = 'TOGGLE_CASHIER_WORK_STATUS_ERROR'
export const LOGOUT_ALL_CASHIERS = 'LOGOUT_ALL_CASHIERS'

export function logoutAllCashiers () {
  return (dispatch, getState) => {
    dispatch(offlineLogoutAllCashiers())
    dispatch(syncWorkHistory())
  }
}
export function toggleCashierWorkStatusRequest () {
  return { type: TOGGLE_CASHIER_WORK_STATUS_REQUEST }
}
export function toggleCashierWorkStatusSuccess () {
  return { type: TOGGLE_CASHIER_WORK_STATUS_SUCCESS }
}
export function toggleCashierWorkStatusError (error) {
  return { type: TOGGLE_CASHIER_WORK_STATUS_ERROR, error }
}

export function toggleCashierWorkStatus (masterId, cashierId, storeId, pinCode) {
  return (dispatch, getState) => {
    dispatch(offlineToggleWorkState(masterId, cashierId, storeId, pinCode))
    return syncWorkHistory()(dispatch, getState)
  }
}

export const SET_STORE_CASHIERS = 'SET_STORE_CASHIERS'
export function setStoreCashiers (result) {
  return {
    type: SET_STORE_CASHIERS,
    cashiers: result
  }
}

export const UPDATE_CASHIER_WORK_STATUS = 'UPDATE_CASHIER_WORK_STATUS'
export function updateCashierWorkStatus (cashierId, newWorkStatus) {
  return {
    type: UPDATE_CASHIER_WORK_STATUS,
    cashierId,
    newWorkStatus
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

export const SET_TEMPORARY_CASHDRAWER = 'SET_TEMPORARY_CASHDRAWER'
export function setTemporaryCashdrawer (cashdrawer) {
  return {
    type: SET_TEMPORARY_CASHDRAWER,
    cashdrawer
  }
}

export const SET_ACTIVE_MODAL = 'SET_ACTIVE_MODAL'
export function setActiveModal (activeModalId, inputToFocus, options) {
  return (dispatch) => {
    dispatch(customerAddResetData())
    dispatch({
      type: SET_ACTIVE_MODAL,
      activeModalId,
      inputToFocus,
      options
    })
  }
}

export const STORE_SET_ACTIVE = 'STORE_SET_ACTIVE'
export function storeSetActive (store) {
  return (dispatch) => {
    dispatch({
      type: STORE_SET_ACTIVE,
      store
    })
    dispatch(updateSavedOrders())
  }
}

export const SET_ERROR = 'SET_ERROR'
export function setError (error) {
  return {
    type: SET_ERROR,
    error
  }
}

export const SET_CASHDRAWER_INPUT = 'SET_CASHDRAWER_INPUT'
export function setCashdrawerInput (amount) {
  return {
    type: SET_CASHDRAWER_INPUT,
    amount
  }
}

export const SET_LAST_ID = 'SET_LAST_ID'
export function setLastID (lastId) {
  return {
    type: SET_LAST_ID,
    lastId
  }
}

export const SET_NEW_LAST_ID = 'SET_NEW_LAST_ID'
export function setNewLastID () {
  return {
    type: SET_NEW_LAST_ID
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
  return (dispatch, getState) => {
    dispatch({
      type: RESET_ERROR_STATE
    })

    dispatch(updateSavedOrders())
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
