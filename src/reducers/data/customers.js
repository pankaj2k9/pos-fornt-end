import {
  CUSTOMERS_FETCH_REQUEST,
  CUSTOMERS_FETCH_SUCCESS,
  CUSTOMERS_FETCH_FAILURE
} from '../../actions/data/customers'

function customers (state = {
  customersArray: [],
  customersById: {},
  isFetching: false,
  shouldUpdate: false
}, action) {
  switch (action.type) {
    case CUSTOMERS_FETCH_REQUEST:
      return Object.assign({}, state, {
        isFetching: true,
        shouldUpdate: false
      })
    case CUSTOMERS_FETCH_SUCCESS:
      const customerById = {}
      action.customers.forEach(customer => {
        customerById[customer.odboId] = customer
      })
      return Object.assign({}, state, {
        customersArray: action.customers,
        customersById: customerById,
        isFetching: false
      })
    case CUSTOMERS_FETCH_FAILURE:
      return Object.assign({}, state, {
        isFetching: false,
        shouldUpdate: true
      })
    default:
      return state
  }
}

export default customers
