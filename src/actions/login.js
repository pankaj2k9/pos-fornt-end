import loginService from '../services/login'

import {setStaffLoggedIn} from './application'

export const LOGIN_FIELD_SET_VALUE = 'LOGIN_FIELD_SET_VALUE'
export const LOGIN_FIELD_SET_ERROR = 'LOGIN_FIELD_SET_ERROR'
export function loginSetFieldValue (field, value) {
  return {
    type: LOGIN_FIELD_SET_VALUE,
    field,
    value
  }
}

export function loginSetFieldError (field, error) {
  return {
    type: LOGIN_FIELD_SET_ERROR,
    field,
    error
  }
}

export const LOGIN_SUCCESS = 'LOGIN_SUCCESS'
export const LOGIN_REQUEST = 'LOGIN_REQUEST'
export const LOGIN_ERROR = 'LOGIN_ERROR'

export function loginRequest () {
  return { type: LOGIN_REQUEST }
}
export function loginSuccess (userData) {
  return { type: LOGIN_SUCCESS, userData }
}
export function loginError (error) {
  return { type: LOGIN_ERROR, error }
}

export function login (details, browserHistory) {
  return (dispatch) => {
    dispatch(loginRequest())
    return loginService.login(details)

      .then(response => {
        dispatch(loginSuccess(response))
        dispatch(setStaffLoggedIn(response))
        if (response.data.role === 'master') {
          browserHistory.push('store')
        } else {
          browserHistory.push('settings')
        }
      })
      .catch(error => {
        if (error) {
          dispatch(loginError('Invalid login. Try again'))
        }
      })
  }
}

export const LOGOUT_SUCCESS = 'LOGOUT_SUCCESS'
export const LOGOUT_REQUEST = 'LOGOUT_REQUEST'
export const LOGOUT_FAILURE = 'LOGOUT_FAILURE'

export function logoutRequest () {
  return { type: LOGOUT_REQUEST }
}
export function logoutSuccess () {
  return { type: LOGOUT_SUCCESS }
}
export function logoutFailure (error) {
  return { type: LOGOUT_FAILURE, error }
}

export function logout (browserHistory) {
  return (dispatch) => {
    dispatch(logoutRequest())

    return loginService.logout(browserHistory)
      .then(() => {
        dispatch(logoutSuccess())
        browserHistory.push('/')
      })
      .catch(error => {
        dispatch(logoutFailure(error))
      })
  }
}
