import { USER_SET_DATA } from '../actions/user'

const user = (state = {}, action) => {
  switch (action.type) {
    case USER_SET_DATA:
      return Object.assign({}, state, action.userData)
    default:
      return state
  }
}

export default user
