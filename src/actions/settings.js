import ordersService from '../services/orders'
import usersService from '../services/users'
import noSalesService from '../services/noSales'
import customers from '../services/customers'

import {storeOrderFetchOffline} from './data/offlineData'

import {
  setActiveModal,
  addCashdrawerOpenCount,
  updateCashDrawer,
  setError
} from './app/mainUI'

import { fetchCustomers } from './data/customers'

export const SET_PROCESSING_STATUS = 'SET_PROCESSING_STATUS'
export function setProcessingStatus (value) {
  return { type: SET_PROCESSING_STATUS, value }
}

export const RESET_SETTINGS_STATE = 'RESET_SETTINGS_STATE'
export function resetSettingsState () {
  return { type: RESET_SETTINGS_STATE }
}

export const SETTINGS_ERROR = 'SETTINGS_ERROR'
export function settingsError () {
  return { type: SETTINGS_ERROR }
}

export const STOREORDER_SET_SEARCH_KEY = 'STOREORDER_SET_SEARCH_KEY'
export function storeOrdersSetSearchKey (orderKey, altKey) {
  return { type: STOREORDER_SET_SEARCH_KEY, orderKey, altKey }
}

export const SET_ACTIVE_ORDER_DETAILS = 'SET_ACTIVE_ORDER_DETAILS'
export function setActiveOrderDetails (order) {
  return { type: SET_ACTIVE_ORDER_DETAILS, order }
}

export const CUSTOMERS_SET_SEARCH_KEY = 'CUSTOMERS_SET_SEARCH_KEY'
export function customersSetSearchKey (customerKey) {
  return { type: CUSTOMERS_SET_SEARCH_KEY, customerKey }
}

export const CUSTOMERS_SET_SEARCH_KEY_ODBOID_FR = 'CUSTOMERS_SET_SEARCH_KEY_ODBOID_FR'
export function customersSetSearchKeyOIDFR (odboId) {
  return { type: CUSTOMERS_SET_SEARCH_KEY_ODBOID_FR, odboId }
}

export const CUSTOMERS_SET_SEARCH_KEY_ODBOID_TO = 'CUSTOMERS_SET_SEARCH_KEY_ODBOID_TO'
export function customersSetSearchKeyOIDTO (odboId) {
  return { type: CUSTOMERS_SET_SEARCH_KEY_ODBOID_TO, odboId }
}

export const CUSTOMERS_SET_FILTER = 'CUSTOMERS_SET_FILTER'
export function customersSetFilter (filter) {
  return { type: CUSTOMERS_SET_FILTER, filter }
}

export const CUSTOMERS_SET_CONTACT_FILTER = 'CUSTOMERS_SET_CONTACT_FILTER'
export function customersSetContactFilter (contactFilter) {
  return { type: CUSTOMERS_SET_CONTACT_FILTER, contactFilter }
}

export const CUSTOMERS_SET_ACTIVE_ID = 'CUSTOMERS_SET_ACTIVE_ID'
export function customersSetActiveId (odboId) {
  return {
    type: CUSTOMERS_SET_ACTIVE_ID,
    odboId
  }
}

export const SET_SETTINGS_ACTIVE_TAB = 'SET_SETTINGS_ACTIVE_TAB'
export function setSettingsActiveTab (tabName) {
  return (dispatch, getState) => {
    dispatch({
      type: SET_SETTINGS_ACTIVE_TAB,
      tabName
    })

    switch (tabName) {
      case 'orderSearch':
        let state = getState()
        let query = {
          storeId: state.app.mainUI.activeStore.source
        }
        if (state.app.mainUI.posMode === 'offline') {
          dispatch(storeOrderFetchOffline(query))
        } else {
          dispatch(storeOrderFetch(query))
        }
        break
    }
  }
}

export const STOREORDER_FETCH_REQUEST = 'STOREORDER_FETCH_REQUEST'
export const STOREORDER_FETCH_SUCCESS = 'STOREORDER_FETCH_SUCCESS'
export const STOREORDER_FETCH_FAILURE = 'STOREORDER_FETCH_FAILURE'

export function storeOrderFetchRequest () {
  return { type: STOREORDER_FETCH_REQUEST }
}
export function storeOrderFetchSuccess (response) {
  return {
    type: STOREORDER_FETCH_SUCCESS,
    response
  }
}
export function storeOrderFetchFailure (error) {
  return { type: STOREORDER_FETCH_FAILURE, error }
}
export function storeOrderFetch (params) {
  return (dispatch, getState) => {
    dispatch(storeOrderFetchRequest())

    return ordersService.find(params)
      .then(response => {
        let orderSearchResults = []
        response.data.forEach(order => {
          let original = order
          orderSearchResults.push(original)
          if (order.refundId) {
            let duplicate = Object.assign({duplicate: true}, order)
            orderSearchResults.push(duplicate)
          }
        })
        orderSearchResults.sort(function (a, b) {
          let aValue = a.duplicate ? a.refundId : a.id
          let bValue = b.duplicate ? b.refundId : b.id

          if (aValue > bValue) {
            return -1
          }

          if (aValue < bValue) {
            return 1
          }

          return 0
        })
        dispatch(storeOrderFetchSuccess(orderSearchResults))
      })
      .catch(error => {
        dispatch(storeOrderFetchFailure(error))
        dispatch(setError(error.message === 'Failed to fetch' ? 'Connection Problem, Try again' : error.message))
      })
  }
}

export const VERIFY_STORE_PIN_REQUEST = 'VERIFY_STORE_PIN_REQUEST'
export const VERIFY_STORE_PIN_SUCCESS = 'VERIFY_STORE_PIN_SUCCESS'
export const VERIFY_STORE_PIN_FAILURE = 'VERIFY_STORE_PIN_FAILURE'
export function verifyStorePinRequest () {
  return { type: VERIFY_STORE_PIN_REQUEST }
}

export function verifyStorePinSuccess () {
  return { type: VERIFY_STORE_PIN_SUCCESS }
}

export function verifyStorePinFailure (error) {
  return { type: VERIFY_STORE_PIN_FAILURE, error }
}

export function verifyStorePin (query, staff, data) {
  return (dispatch) => {
    dispatch(verifyStorePinRequest())
    return noSalesService.find(query)
      .then(response => {
        dispatch(setActiveModal(''))
        dispatch(addCashdrawerOpenCount())
        dispatch(updateCashDrawer(staff, data))
        dispatch(resetSettingsState())
        document.getElementById('storePinCode').value = ''
      })
      .catch(error => {
        document.getElementById('storePinCode').value = ''
        dispatch(verifyStorePinFailure(error.message))
        dispatch(settingsError())
      })
  }
}

export const SET_ACTIVE_CUSTOMER = 'SET_ACTIVE_CUSTOMER'
export function setActiveCustomer (customer) {
  return {
    type: SET_ACTIVE_CUSTOMER,
    customer
  }
}

export const UPDATE_CUSTOMER_REQUEST = 'UPDATE_CUSTOMER_REQUEST'
export function updateCustomerRequest () {
  return {
    type: UPDATE_CUSTOMER_REQUEST
  }
}

export const UPDATE_CUSTOMER_SUCCESS = 'UPDATE_CUSTOMER_SUCCESS'
export function updateCustomerSuccess (response) {
  return {
    type: UPDATE_CUSTOMER_SUCCESS,
    response
  }
}

export const UPDATE_CUSTOMER_FAILURE = 'UPDATE_CUSTOMER_FAILURE'
export function updateCustomerFailure (error) {
  return {
    type: UPDATE_CUSTOMER_FAILURE,
    error
  }
}

export function updateCustomer (id, data) {
  return (dispatch) => {
    dispatch(updateCustomerRequest())
    dispatch(setActiveModal('settingsIsProcessing'))
    customers.patch(id, data)
      .then((response) => {
        dispatch(updateCustomerSuccess(response))
        dispatch(setActiveModal('customerDetails'))
        dispatch(fetchCustomers())
      })
      .catch((error) => {
        dispatch(updateCustomerFailure(error.message))
      })
  }
}

export const CLEAR_MESSAGES = 'CLEAR_MESSAGES'
export function clearSettingsMessages () {
  return {
    type: CLEAR_MESSAGES
  }
}

export const ACCOUNT_CHANGEPW_TOGGLE_VIEW = 'ACCOUNT_CHANGEPW_TOGGLE_VIEW'
export function accountChangePwToggleView () {
  return { type: ACCOUNT_CHANGEPW_TOGGLE_VIEW }
}

export const ACCOUNT_CHANGEPW_OLDPW_SET_VALUE = 'ACCOUNT_CHANGEPW_OLDPW_SET_VALUE'
export function accountChangePwOldPwSetValue (oldPw) {
  return { type: ACCOUNT_CHANGEPW_OLDPW_SET_VALUE, oldPw }
}

export const ACCOUNT_CHANGEPW_NEWPW_SET_VALUE = 'ACCOUNT_CHANGEPW_NEWPW_SET_VALUE'
export function accountChangePwNewPwSetValue (newPw) {
  return { type: ACCOUNT_CHANGEPW_NEWPW_SET_VALUE, newPw }
}

export const ACCOUNT_CHANGEPW_CONFIRMPW_SET_VALUE = 'ACCOUNT_CHANGEPW_CONFIRMPW_SET_VALUE'
export function accountChangePwConfirmPwSetValue (confirmPw) {
  return { type: ACCOUNT_CHANGEPW_CONFIRMPW_SET_VALUE, confirmPw }
}

export const ACCOUNT_CHANGEPW_CLEAR_MESSAGES = 'ACCOUNT_CHANGEPW_CLEAR_MESSAGES'
export function accountChangePwClearMessages () {
  return { type: ACCOUNT_CHANGEPW_CLEAR_MESSAGES }
}

export const ACCOUNT_CHANGEPW_REQUEST = 'ACCOUNT_CHANGEPW_REQUEST'
export function accountChangePwRequest () {
  return { type: ACCOUNT_CHANGEPW_REQUEST }
}

export const ACCOUNT_CHANGEPW_SUCCESS = 'ACCOUNT_CHANGEPW_SUCCESS'
export function accountChangePwSuccess (message) {
  return { type: ACCOUNT_CHANGEPW_SUCCESS, message }
}

export const ACCOUNT_CHANGEPW_FAILURE = 'ACCOUNT_CHANGEPW_FAILURE'
export function accountChangePwFailure (message) {
  return { type: ACCOUNT_CHANGEPW_FAILURE, message }
}

export function accountChangePw (id, newPw, oldPw) {
  return (dispatch) => {
    dispatch(accountChangePwRequest())
    dispatch(accountChangePwClearMessages())

    usersService.patch(id, newPw, oldPw)
      .then(() => {
        dispatch(accountChangePwSuccess('app.page.settings.changePwSuccess'))
        dispatch(accountChangePwToggleView())
        dispatch(accountChangePwConfirmPwSetValue(''))
        dispatch(accountChangePwNewPwSetValue(''))
      })
      .catch(() => {
        dispatch(accountChangePwFailure('app.page.settings.changePwError'))
        dispatch(accountChangePwConfirmPwSetValue(''))
        dispatch(accountChangePwNewPwSetValue(''))
      })
  }
}
