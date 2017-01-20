import { browserHistory } from 'react-router'

import storesService from '../services/stores'
import dailyDataService from '../services/dailyData'
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
export function setActiveModal (activeModalId, inputToFocus) {
  return {
    type: SET_ACTIVE_MODAL,
    activeModalId,
    inputToFocus
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

export const SET_ACTIVE_CASHDRAWER = 'SET_ACTIVE_CASHDRAWER'
export function setActiveCashdrawer (cashdrawer) {
  return {
    type: SET_ACTIVE_CASHDRAWER,
    cashdrawer
  }
}

export const VALIDATE_STOREPIN_REQUEST = 'VALIDATE_STOREPIN_REQUEST'
export const VALIDATE_STOREPIN_SUCCESS = 'VALIDATE_STOREPIN_SUCCESS'
export const VALIDATE_STOREPIN_FAILURE = 'VALIDATE_STOREPIN_FAILURE'

export function validateStorepinRequest () {
  return {
    type: VALIDATE_STOREPIN_REQUEST
  }
}

export function validateStorepinSuccess (data, posMode) {
  return {
    type: VALIDATE_STOREPIN_SUCCESS,
    data,
    posMode
  }
}

export function validateStorepinFailure (error) {
  return {
    type: VALIDATE_STOREPIN_FAILURE,
    error
  }
}

export function validateAndUpdateCashdrawer (query, staff, data) {
  return (dispatch) => {
    dispatch(validateStorepinRequest())
    return noSalesService.find(query)
      .then(response => {
        dispatch(updateCashDrawer(staff, data))
      })
      .catch(error => {
        document.getElementById('storePinCode2').value = ''
        dispatch(validateStorepinFailure(error.message))
      })
  }
}

export const UPDATE_CASHDRAWER_REQUEST = 'UPDATE_CASHDRAWER_REQUEST'
export const UPDATE_CASHDRAWER_SUCCESS = 'UPDATE_CASHDRAWER_SUCCESS'
export const UPDATE_CASHDRAWER_FAILURE = 'UPDATE_CASHDRAWER_FAILURE'

export function updateCashDrawerRequest () {
  return {
    type: UPDATE_CASHDRAWER_REQUEST
  }
}

export function updateCashDrawerSuccess (data) {
  return {
    type: UPDATE_CASHDRAWER_SUCCESS,
    data
  }
}

export function updateCashDrawerFailure (error) {
  return {
    type: UPDATE_CASHDRAWER_FAILURE,
    error
  }
}

export function updateCashDrawer (data, receipt) {
  return (dispatch) => {
    dispatch(updateCashDrawerRequest())
    if (data.posMode === 'online') {
      return dailyDataService.patch(data)
        .then(response => {
          dispatch(updateCashDrawerSuccess(data, data.posMode))
          if (receipt) {
            print(receipt)
            dispatch(closeActiveModal())
          }
        })
        .catch(error => {
          dispatch(updateCashDrawerFailure(error.message))
        })
    } else if (data.posMode === 'offline') {
      dispatch(updateCashDrawerSuccess(data, data.posMode))
      if (receipt) {
        print(receipt)
        dispatch(closeActiveModal())
      }
    }
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
          dispatch(storeSetActive(firstStore))
        }
      })
      .catch(error => {
        dispatch(storeGetIdsFailure(error))
      })
  }
}

export const DAILYDATA_CREATE_REQUEST = 'DAILYDATA_CREATE_REQUEST'
export const DAILYDATA_CREATE_SUCCESS = 'DAILYDATA_CREATE_SUCCESS'
export const DAILYDATA_CREATE_FAILURE = 'DAILYDATA_CREATE_FAILURE'
export function dailyDataCreateRequest () {
  return { type: DAILYDATA_CREATE_REQUEST }
}
export function dailyDataCreateSuccess (data, mode) {
  return { type: DAILYDATA_CREATE_SUCCESS, data, mode }
}
export function dailyDataCreateFailure (error) {
  return { type: DAILYDATA_CREATE_FAILURE, error }
}

export function createDailyData (storeId, posMode) {
  return (dispatch) => {
    dispatch(dailyDataCreateRequest())
    let initial = {
      storeId: storeId,
      date: new Date().toISOString().slice(0, 10),
      cashDrawerOpenCount: 0,
      float: 0
    }
    if (posMode === 'online') {
      return dailyDataService.create(initial)
        .then(response => {
          dispatch(dailyDataCreateSuccess(response, 'online'))
          dispatch(setActiveCashdrawer(response))
        })
        .catch(error => {
          dispatch(dailyDataCreateFailure(error))
        })
    } else {
      dispatch(dailyDataCreateSuccess(initial, 'offline'))
    }
  }
}

export const DAILYDATA_FETCH_REQUEST = 'DAILYDATA_FETCH_REQUEST'
export const DAILYDATA_FETCH_SUCCESS = 'DAILYDATA_FETCH_SUCCESS'
export const DAILYDATA_FETCH_FAILURE = 'DAILYDATA_FETCH_FAILURE'
export function dailyDataFetchDataRequest () {
  return { type: DAILYDATA_FETCH_REQUEST }
}

export function dailyDataFetchDataSuccess (storeDailyData) {
  return { type: DAILYDATA_FETCH_SUCCESS, storeDailyData }
}

export function dailyDataFetchDataFailure (error) {
  return { type: DAILYDATA_FETCH_FAILURE, error }
}

export function storeGetDailyData (storeId, cashdrawer, staff, posMode) {
  return (dispatch) => {
    dispatch(dailyDataFetchDataRequest())
    function validateCashdrawer (data) {
      let matchedDrawer
      data.find(function (drawer) {
        let date1 = new Date(drawer.date).toISOString().slice(0, 10)
        let date2 = new Date().toISOString().slice(0, 10)
        if (date1 === date2) {
          matchedDrawer = drawer
        }
      })
      if (!matchedDrawer) {
        dispatch(createDailyData(storeId, posMode))
        dispatch(setActiveModal('updateCashDrawer'))
      } else {
        dispatch(setActiveCashdrawer(matchedDrawer))
        if (Number(matchedDrawer.float) === 0) {
          dispatch(setActiveModal('updateCashDrawer'))
        }
      }
    }
    if (posMode === 'online') {
      return dailyDataService.find({query: { storeId: storeId }})
        .then(response => {
          // set store id with the first item
          if (response.data.length > 0) {
            validateCashdrawer(response.data)
            dispatch(dailyDataFetchDataSuccess(response.data))
          } else if (response.data.length === 0) {
            validateCashdrawer(cashdrawer)
          }
        })
        .catch(error => {
          dispatch(dailyDataFetchDataFailure(error))
        })
    } else {
      validateCashdrawer(cashdrawer)
    }
  }
}

export function authCashierStaff (details) {
  return (dispatch) => {
    dispatch(authStaffRequest())
    return authStaffService.create(details)

      .then(response => {
        dispatch(authStaffSuccess(response.token))
        dispatch(setActiveModal(''))
        browserHistory.push('store')
      })
      .catch(error => {
        if (error) {
          dispatch(authStaffFailure('Invalid login. Try again'))
        }
      })
  }
}
