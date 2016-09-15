import storesService from '../services/stores'
import authStaffService from '../services/authStaff'

export const HAMBURGER_TOGGLE = 'HAMBURGER_TOGGLE'
export function hamburgerToggle () {
  return {
    type: HAMBURGER_TOGGLE
  }
}

export const HAMBURGER_CLOSE = 'HAMBURGER_CLOSE'
export function hamburgerClose () {
  return {
    type: HAMBURGER_CLOSE
  }
}

export const SET_ACTIVE_MODAL = 'SET_ACTIVE_MODAL'
export function setActiveModal (activeModalId) {
  return {
    type: SET_ACTIVE_MODAL,
    activeModalId
  }
}

export const AUTH_STAFF_SUCCESS = 'AUTH_STAFF_SUCCESS'
export function authStaffSuccess (token) {
  return {
    type: AUTH_STAFF_SUCCESS,
    token
  }
}

export const AUTH_STAFF_REQUEST = 'AUTH_STAFF_REQUEST'
export function authStaffRequest () {
  return {
    type: AUTH_STAFF_REQUEST
  }
}

export const AUTH_STAFF_FAILURE = 'AUTH_STAFF_FAILURE'
export function authStaffFailure (error) {
  return {
    type: AUTH_STAFF_FAILURE,
    error
  }
}

export const CLOSE_ACTIVE_MODAL = 'CLOSE_ACTIVE_MODAL'
export function closeActiveModal () {
  return {
    type: CLOSE_ACTIVE_MODAL
  }
}

export const STORE_SET_ID = 'STORE_SET_ID'
export function storeSetId (storeId) {
  return {
    type: STORE_SET_ID,
    storeId
  }
}

export const STORE_SET_ACTIVE = 'STORE_SET_ACTIVE'
export function storeSetActive (store) {
  return {
    type: STORE_SET_ACTIVE,
    store
  }
}

export const SET_STAFF_LOGGED_IN = 'SET_STAFF_LOGGED_IN'

export function setStaffLoggedIn (userData) {
  return {
    type: SET_STAFF_LOGGED_IN,
    userData
  }
}

export const SET_CASHIER_LOGGED_IN = 'SET_CASHIER_LOGGED_IN'

export function setCashierLoggedIn (cashier) {
  return {
    type: SET_CASHIER_LOGGED_IN,
    cashier
  }
}

export const RESET_STAFF_STATE = 'RESET_STAFF_STATE'

export function resetStaffState () {
  return {
    type: RESET_STAFF_STATE
  }
}

export const STORE_GET_IDS_REQUEST = 'STORE_GET_IDS_REQUEST'
export const STORE_GET_IDS_SUCCESS = 'STORE_GET_IDS_SUCCESS'
export const STORE_GET_IDS_FAILURE = 'STORE_GET_IDS_FAILURE'
export function storeGetIdsRequest () {
  return { type: STORE_GET_IDS_REQUEST }
}
export function storeGetIdsSuccess (storeIds) {
  return { type: STORE_GET_IDS_SUCCESS, storeIds }
}
export function storeGetIdsFailure (error) {
  return { type: STORE_GET_IDS_FAILURE, error }
}

export function storeGetIds () {
  return (dispatch) => {
    dispatch(storeGetIdsRequest())

    return storesService.find()
      .then(response => {
        dispatch(storeGetIdsSuccess(response.data))

        // set store id with the first item
        if (response.data.length > 0) {
          const firstStore = response.data[0]
          dispatch(storeSetId(firstStore.source))
        }
      })
      .catch(error => {
        dispatch(storeGetIdsFailure(error))
      })
  }
}

export function authCashierStaff (details) {
  return (dispatch) => {
    dispatch(authStaffRequest())
    return authStaffService.create(details)

      .then(response => {
        dispatch(authStaffSuccess(response.token))
        dispatch(setActiveModal(''))
      })
      .catch(error => {
        if (error) {
          dispatch(authStaffFailure('Invalid login. Try again'))
        }
      })
  }
}
