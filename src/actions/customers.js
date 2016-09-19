export const CUSTOMERS_FETCH_REQUEST = 'CUSTOMERS_FETCH_REQUEST'
export const CUSTOMERS_FETCH_SUCCESS = 'CUSTOMERS_FETCH_SUCCESS'
export const CUSTOMERS_FETCH_FAILURE = 'CUSTOMERS_FETCH_FAILURE'

export const CUSTOMER_FETCH_REQUEST = 'CUSTOMER_FETCH_REQUEST'
export const CUSTOMER_FETCH_SUCCESS = 'CUSTOMER_FETCH_SUCCESS'
export const CUSTOMER_FETCH_FAILURE = 'CUSTOMER_FETCH_FAILURE'

import customerService from '../services/customers'
import {
  panelCartShouldUpdate,
  setActiveCustomer,
  setCustomerInputDisabled
} from '../actions/panelCart'

export function customersFetchRequest () {
  return {
    type: CUSTOMERS_FETCH_REQUEST
  }
}

export function customersFetchSuccess (customers) {
  return {
    type: CUSTOMERS_FETCH_SUCCESS,
    customers
  }
}

export function customersFetchFailure (error) {
  return {
    type: CUSTOMERS_FETCH_FAILURE,
    error
  }
}

export function customerFetchRequest () {
  return {
    type: CUSTOMERS_FETCH_REQUEST
  }
}

export function customerFetchSuccess (customer) {
  return (dispatch) => {
    dispatch(setActiveCustomer(customer))
  }
}

export function customerFetchFailure (error) {
  return {
    type: CUSTOMERS_FETCH_FAILURE,
    error
  }
}

export function fetchCustomers (query) {
  return (dispatch) => {
    dispatch(customersFetchRequest())
    return customerService.fetch(query)
    .then(customers => {
      dispatch(customersFetchSuccess(customers.data))
    })
    .catch(error => {
      dispatch(customersFetchFailure())
      return error.response.json()
    })
  }
}

export function fetchCustomerByOdboId (searchKey) {
  return (dispatch) => {
    dispatch(panelCartShouldUpdate())
    dispatch(customerFetchRequest())
    const query = {query: { odboId: searchKey }}
    return customerService.fetch(query)
    .then(customer => {
      customer.length !== 0
      ? dispatch(customerFetchSuccess(customer.data[0]))
      : dispatch(customerFetchFailure())
      dispatch(setCustomerInputDisabled())
    })
    .catch(error => {
      dispatch(customerFetchFailure(error.message))
    })
  }
}
