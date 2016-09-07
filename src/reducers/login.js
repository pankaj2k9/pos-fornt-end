import {
  LOGIN_SUCCESS,
  LOGIN_REQUEST,
  LOGIN_ERROR,
  LOGOUT_SUCCESS,
  LOGOUT_REQUEST,
  LOGOUT_FAILURE,
  LOGIN_FIELD_SET_VALUE,
  LOGIN_FIELD_SET_ERROR
} from '../actions/login.js'

function login (state = {
  isLoggingIn: false,
  isLoggingOut: false,
  errorMessage: null,
  username: null,
  usernameError: null,
  password: null,
  passwordError: null
}, action) {
  switch (action.type) {
    case LOGIN_REQUEST:
      return Object.assign({}, state, {
        isLoggingIn: true
      })
    case LOGIN_SUCCESS:
      return Object.assign({}, state, {
        isLoggingIn: false
      })
    case LOGIN_ERROR:
      return Object.assign({}, state, {
        isLoggingIn: false,
        errorMessage: action.error
      })
    case LOGOUT_REQUEST:
      return Object.assign({}, state, {
        isLoggingOut: true
      })
    case LOGOUT_SUCCESS:
      return Object.assign({}, state, {
        isLoggingOut: false
      })
    case LOGOUT_FAILURE:
      return Object.assign({}, state, {
        isLoggingOut: false,
        errorMessage: action.error
      })
    case LOGIN_FIELD_SET_VALUE: {
      const { field, value } = action
      const fieldValue = {}
      fieldValue[field] = value

      return Object.assign({}, state, fieldValue)
    }
    case LOGIN_FIELD_SET_ERROR: {
      const { field, error } = action

      const fieldError = {}
      fieldError[`${field}Error`] = error

      return Object.assign({}, state, fieldError)
    }
    default:
      return state
  }
}

export default login
