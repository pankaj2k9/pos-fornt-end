import {
  CUSTOMERS_FETCH_REQUEST,
  CUSTOMERS_FETCH_SUCCESS,
  CUSTOMERS_FETCH_FAILURE,
  CUSTOMER_SEARCH_REQUEST,
  CUSTOMER_SEARCH_SUCCESS,
  CUSTOMER_SEARCH_FAILURE,
  CUSTOMERS_SET_FILTER
} from '../../actions/data/customers'

function customers (state = {
  customersArray: [],
  customersById: {},
  customerFilter: '',
  customerSearchKey: '',
  customerSearch: [],
  customerSearchById: {},
  isFetching: false,
  shouldUpdate: false,
  error: null
}, action) {
  switch (action.type) {
    case CUSTOMERS_FETCH_REQUEST:
      return Object.assign({}, state, {
        isFetching: true,
        shouldUpdate: false
      })
    case CUSTOMERS_FETCH_SUCCESS:
      const customerById = {}
      let customers = []
      action.customers.forEach(customer => {
        customerById[customer.odboId] = customer
        let cName = `${customer.firstName} ${customer.lastName || ''}`.toLowerCase()
        customer.combinedName = cName.replace(/\s+/g, '')
        customers.push(customer)
      })
      return Object.assign({}, state, {
        customersArray: customers,
        customersById: customerById,
        isFetching: false
      })
    case CUSTOMERS_FETCH_FAILURE:
      return Object.assign({}, state, {
        isFetching: false,
        shouldUpdate: true
      })
    case CUSTOMER_SEARCH_REQUEST:
      return Object.assign({}, state, {
        isFetching: true,
        shouldUpdate: false
      })
    case CUSTOMER_SEARCH_SUCCESS:
      const customerSearchById = {}
      let searchResults = []
      action.data.forEach(customer => {
        customerSearchById[customer.odboId] = customer
        let cName = `${customer.firstName} ${customer.lastName || ''}`.toLowerCase()
        customer.combinedName = cName.replace(/\s+/g, '')
        searchResults.push(customer)
      })
      return Object.assign({}, state, {
        customerSearch: searchResults,
        customerSearchById: customerSearchById,
        isFetching: false
      })
    case CUSTOMER_SEARCH_FAILURE:
      return Object.assign({}, state, {
        error: action.error,
        isFetching: false
      })
    case CUSTOMERS_SET_FILTER:
      return Object.assign({}, state, {
        customerFilter: action.filter,
        customerSearchKey: action.searchKey
      })
    default:
      return state
  }
}

export default customers
