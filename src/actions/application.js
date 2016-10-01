import storesService from '../services/stores'
import authStaffService from '../services/authStaff'
import noSalesService from '../services/noSales'

import print from '../utils/printReceipt/print'

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

export const RESET_ERROR_STATE = 'RESET_ERROR_STATE'
export function resetErrorState () {
  return {
    type: RESET_ERROR_STATE
  }
}

export const RESET_APP_STATE = 'RESET_APP_STATE'
export function resetAppState () {
  return {
    type: RESET_APP_STATE
  }
}

export const ADD_CASHDRAWER_DATA = 'ADD_CASHDRAWER_DATA'
export function addCashdrawerData (cashdrawer) {
  return {
    type: ADD_CASHDRAWER_DATA,
    cashdrawer
  }
}

export const ADD_CASHDRAWER_OPENCOUNT = 'ADD_CASHDRAWER_OPENCOUNT'
export function addCashdrawerOpenCount () {
  return {
    type: ADD_CASHDRAWER_OPENCOUNT
  }
}

export const SET_CASHDRAWER_REQUEST = 'SET_CASHDRAWER_REQUEST'
export function setCashdrawerRequest () {
  return {
    type: SET_CASHDRAWER_REQUEST
  }
}

export const SET_CASHDRAWER_SUCCESS = 'SET_CASHDRAWER_SUCCESS'
export function setCashdrawerSuccess (data) {
  return {
    type: SET_CASHDRAWER_SUCCESS,
    data
  }
}

export const SET_CASHDRAWER_FAILURE = 'SET_CASHDRAWER_FAILURE'
export function setCashdrawerFailure (error) {
  return {
    type: SET_CASHDRAWER_FAILURE,
    error
  }
}

export const SET_ACTIVE_CASHDRAWER = 'SET_ACTIVE_CASHDRAWER'
export function setActiveCashdrawer (cashdrawer) {
  return {
    type: SET_ACTIVE_CASHDRAWER,
    cashdrawer
  }
}

export function validateAndUpdateCashdrawer (query, staff, data) {
  return (dispatch) => {
    dispatch(setCashdrawerRequest(data))
    return noSalesService.find(query)
      .then(response => {
        const receipt = {
          info: {
            date: new Date(),
            staff: `${staff.lastName || ''}, ${staff.firstName || ''}`
          },
          footerText: ['No sales']
        }
        print(receipt)
        dispatch(setActiveModal(''))
        dispatch(setCashdrawerSuccess(data))
      })
      .catch(error => {
        document.getElementById('storePinCode2').value = ''
        dispatch(setCashdrawerFailure(error.message))
      })
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
