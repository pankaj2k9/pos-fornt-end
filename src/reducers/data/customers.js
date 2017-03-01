import {
  CUSTOMERS_FETCH_REQUEST,
  CUSTOMERS_FETCH_SUCCESS,
  CUSTOMERS_FETCH_FAILURE,
  CUSTOMERS_SET_FILTER
} from '../../actions/data/customers'

function customers (state = {
  customersArray: [],
  customersById: {},
  customerFilter: '',
  customerSearchKey: '',
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
