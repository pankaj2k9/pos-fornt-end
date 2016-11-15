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
    type: CUSTOMER_FETCH_REQUEST
  }
}

export function customerFetchSuccess (customer) {
  return (dispatch) => {
    dispatch(setActiveCustomer(customer))
  }
}

export function customerFetchFailure (error) {
  return {
    type: CUSTOMER_FETCH_FAILURE,
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

export function fetchCustomerByOdboId (searchKey) {
  return (dispatch) => {
    let odboId = Number(searchKey)
    dispatch(panelCartShouldUpdate(true))
    dispatch(customerFetchRequest())
    const query = {query: { odboId: odboId }}
    return customerService.fetch(query)
    .then(response => {
      if (response) {
        if (!response.data[0]) {
          dispatch(customerFetchFailure('No Results'))
          dispatch(panelCartShouldUpdate(false))
        } else {
          dispatch(customerFetchSuccess(response.data[0]))
        }
      } else {
        dispatch(customerFetchFailure('No Results'))
        dispatch(panelCartShouldUpdate(false))
      }
      dispatch(setCustomerInputDisabled())
    })
    .catch(error => {
      dispatch(customerFetchFailure(error.message))
    })
  }
}
