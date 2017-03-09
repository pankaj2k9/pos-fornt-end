export const CUSTOMERS_FETCH_REQUEST = 'CUSTOMERS_FETCH_REQUEST'
export const CUSTOMERS_FETCH_SUCCESS = 'CUSTOMERS_FETCH_SUCCESS'
export const CUSTOMERS_FETCH_FAILURE = 'CUSTOMERS_FETCH_FAILURE'

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

export function fetchCustomers (query) {
  return (dispatch) => {
    dispatch(customersFetchRequest())
    return customerService.fetch(query)
      .then(customers => {
        const { total, data, limit } = customers

        // Store first fetch
        let allCust = [...data]

        const firstResponseCount = data.length
        const goal = Number(total)

        // If not all customers are fetched, run server queries until complete
        if (goal > firstResponseCount) {
          const firstLimit = limit
          let custFetchArray = []
          let newSkip = firstResponseCount

          while (newSkip < goal) {
            const nextParams = query || {}

            nextParams.limit = firstLimit
            nextParams.skip = newSkip
            newSkip += firstLimit

            const custFetch = new Promise((resolve, reject) => {
              return customerService.fetch(nextParams)
                .then((response) => { resolve(response) })
                .catch(() => { reject('Failed fetching all customers') })
            })
            custFetchArray.push(custFetch)
          }

          // Run all cust fetch
          global.Promise.all(custFetchArray)
            .then((response) => {
              response.forEach((fetchResponse) => {
                allCust = [...allCust, ...fetchResponse.data]
              })
              dispatch(customersFetchSuccess(allCust))
            })
            .catch((error) => {
              dispatch(customersFetchFailure(error))
            })
        } else {
          dispatch(customersFetchSuccess(allCust))
        }
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
