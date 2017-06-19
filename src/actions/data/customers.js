export const CUSTOMERS_FETCH_REQUEST = 'CUSTOMERS_FETCH_REQUEST'
export const CUSTOMERS_FETCH_SUCCESS = 'CUSTOMERS_FETCH_SUCCESS'
export const CUSTOMERS_FETCH_FAILURE = 'CUSTOMERS_FETCH_FAILURE'

export const CUSTOMERS_SET_ACTIVE_PAGE = 'CUSTOMERS_SET_ACTIVE_PAGE'

export const CUSTOMER_SEARCH_REQUEST = 'CUSTOMER_SEARCH_REQUEST'
export const CUSTOMER_SEARCH_SUCCESS = 'CUSTOMER_SEARCH_SUCCESS'
export const CUSTOMER_SEARCH_FAILURE = 'CUSTOMER_SEARCH_FAILURE'

export const CUSTOMERS_SET_FILTER = 'CUSTOMERS_SET_FILTER'
export const CUSTOMERS_RESET_STATE = 'CUSTOMERS_RESET_STATE'
import customerService from '../../services/customers'

export function customersSetFilter (filter, key) {
  let searchKey = key.replace(/[^\w\s]/gi, '') // removes any special characters
  return {
    type: CUSTOMERS_SET_FILTER,
    filter,
    searchKey
  }
}

export function customersResetState () {
  return {
    type: CUSTOMERS_RESET_STATE
  }
}

export function customersFetchRequest () {
  return {
    type: CUSTOMERS_FETCH_REQUEST
  }
}

export function customersFetchSuccess (response) {
  return {
    type: CUSTOMERS_FETCH_SUCCESS,
    response
  }
}

export function customersFetchFailure (error) {
  return {
    type: CUSTOMERS_FETCH_FAILURE,
    error
  }
}

export function customerSearchRequest () {
  return {
    type: CUSTOMER_SEARCH_REQUEST
  }
}

export function customerSearchSuccess (data) {
  return {
    type: CUSTOMER_SEARCH_SUCCESS,
    data
  }
}

export function customerSearchFailure (error) {
  return {
    type: CUSTOMER_SEARCH_FAILURE,
    error
  }
}

export function customersSetActivePage (page) {
  return (dispatch) => {
    dispatch({ type: CUSTOMERS_SET_ACTIVE_PAGE, page })
    dispatch(fetchCustomers())
  }
}

export function fetchCustomers () {
  return (dispatch, getState) => {
    dispatch(customersFetchRequest())

    const state = getState()
    const page = state.data.customers.page
    const limit = state.data.customers.limit
    const skip = (page - 1) * limit
    const params = {
      query: {
        $skip: skip,
        $limit: limit,
        $sort: {
          odboID: 1
        }
      }
    }

    const filter = state.data.customers.customerFilter
    const searchKey = state.data.customers.customerSearchKey
    let filterData = {}

    if (filter === 'byId') {
      filterData.odboID = Number(searchKey)
    } else if (filter === 'byName') {
      filterData.firstName = { $like: `%${searchKey}%` }
    } else if (filter === 'bySurName') {
      filterData.lastName = { $like: `%${searchKey}%` }
    } else if (filter === 'byContactNum') {
      filterData.phoneNumber = { $like: `%${searchKey}%` }
    }

    params.query = Object.assign({}, params.query, filterData)
    return customerService.fetch(params)
      .then(customers => {
        dispatch(customersFetchSuccess(customers))
      })
      .catch(error => {
        dispatch(customersFetchFailure(error))
        // return error.response.json()
      })
  }
}

export function fetchCustomerByFilter (filter, key) {
  return (dispatch) => {
    dispatch(customerSearchRequest())
    let query
    if (filter === 'byId') {
      query = {query: { odboID: Number(key) }}
    } else if (filter === 'byName') {
      query = {query: { firstName: { $like: `%${key}%` } }}
    } else if (filter === 'bySurName') {
      query = {query: { lastName: { $like: `%${key}%` } }}
    } else if (filter === 'byContactNum') {
      query = {query: { phoneNumber: { $like: `%${key}%` } }}
    }
    return customerService.fetch(query)
    .then(response => {
      dispatch(customerSearchSuccess(response.data))
    })
    .catch(error => {
      dispatch(customerSearchFailure(error.message))
    })
  }
}
