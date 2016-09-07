import ordersService from '../services/orders'
import usersService from '../services/users'

export const RESET_SETTINGS_STATE = 'RESET_SETTINGS_STATE'
export function resetSettingsState () {
  return { type: RESET_SETTINGS_STATE }
}

export const STOREORDER_SET_SEARCH_KEY = 'STOREORDER_SET_SEARCH_KEY'
export function storeOrdersSetSearchKey (orderKey) {
  return { type: STOREORDER_SET_SEARCH_KEY, orderKey }
}

export const CUSTOMERS_SET_SEARCH_KEY = 'CUSTOMERS_SET_SEARCH_KEY'
export function customersSetSearchKey (customerKey) {
  return { type: CUSTOMERS_SET_SEARCH_KEY, customerKey }
}

export const CUSTOMERS_SET_FILTER = 'CUSTOMERS_SET_FILTER'
export function customersSetFilter (filter) {
  return { type: CUSTOMERS_SET_FILTER, filter }
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
  return {
    type: SET_SETTINGS_ACTIVE_TAB,
    tabName
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
export function storeOrderFetch (orderId) {
  return (dispatch) => {
    dispatch(storeOrderFetchRequest())

    return ordersService.get(orderId)
      .then(response => {
        response.id !== undefined
        ? dispatch(storeOrderFetchSuccess(response))
        : dispatch(storeOrderFetchFailure())
      })
      .catch(error => {
        dispatch(storeOrderFetchFailure(error))
      })
  }
}

export const ACCOUNT_CHANGEPW_TOGGLE_VIEW = 'ACCOUNT_CHANGEPW_TOGGLE_VIEW'
export function accountChangePwToggleView () {
  return { type: ACCOUNT_CHANGEPW_TOGGLE_VIEW }
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

export function accountChangePw (id, newPw) {
  return (dispatch) => {
    dispatch(accountChangePwRequest())
    dispatch(accountChangePwClearMessages())

    usersService.patch(id, { password: newPw })
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
