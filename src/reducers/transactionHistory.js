import {
  TRANSACTIONS_REQUEST,
  TRANSACTIONS_SUCCESS,
  TRANSACTIONS_FAILURE,
  TRANSACTIONS_SET_ODBO_ID
} from '../actions/transactionHistory'
const defaultState = {
  isLoading: true,
  odboId: undefined,
  total: 0,
  page: 1,
  limit: 20,
  items: []
}

function transactionHistory (state = defaultState, action) {
  switch (action.type) {
    case TRANSACTIONS_SET_ODBO_ID:
      return Object.assign({}, state, {
        odboId: action.odboId,
        isLoading: true
      })
    case TRANSACTIONS_REQUEST:
      return Object.assign({}, state, {
        isLoading: true
      })
    case TRANSACTIONS_SUCCESS:
      const response = action.response
      const items = []
      response.data.forEach((item) => {
        if (item.refundId) {
          let refundItem = Object.assign({}, item, {isDuplicate: true})
          items.push(refundItem)
        }
        items.push(item)
      })
      items.sort(function (a, b) {
        let valueA = a.isDuplicate ? a.refundId : a.id
        let valueB = b.isDuplicate ? b.refundId : b.id

        if (valueA > valueB) {
          return 1
        }

        if (valueA < valueB) {
          return -1
        }

        return 0
      })
      return Object.assign({}, state, {
        isLoading: false,
        items: response.data,
        total: response.total,
        limit: response.limit
      })
    case TRANSACTIONS_FAILURE:
      return Object.assign({}, state, {
        isLoading: false
      })
    default:
      return state
  }
}

export default transactionHistory
