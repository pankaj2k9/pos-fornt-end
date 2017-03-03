import {
  SET_ORDER_SEARCH_KEY,
  HOLD_ORDER,
  REMOVE_ORDER
} from '../actions/ordersOnHold'

function ordersOnHold (state = {
  items: [],
  orderSearchKey: ''
}, action) {
  switch (action.type) {
    case SET_ORDER_SEARCH_KEY:
      return Object.assign({}, state, {
        searchKey: action.value
      })
    case HOLD_ORDER:
      state.items.push(action.orderData)
      return Object.assign({}, state, {
        items: state.items
      })
    case REMOVE_ORDER:
      state.items.forEach(function (item, index, object) {
        if (index === action.key) {
          object.splice(index, 1)
        }
      })
      return Object.assign({}, state, {
        items: state.items
      })
    default:
      return state
  }
}

export default ordersOnHold
