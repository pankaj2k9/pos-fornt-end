import {
  DAILYDATA_FETCH_REQUEST,
  DAILYDATA_FETCH_SUCCESS,
  DAILYDATA_FETCH_FAILURE,
  DAILYDATA_CREATE_REQUEST,
  DAILYDATA_CREATE_SUCCESS,
  DAILYDATA_CREATE_FAILURE
} from '../../actions/data/cashdrawers'

function cashdrawers (state = {
  cdList: [],
  isProcessing: false,
  error: null
}, action) {
  switch (action.type) {
    case DAILYDATA_FETCH_REQUEST:
      return Object.assign({}, state, {
        isProcessing: true,
        error: null
      })
    case DAILYDATA_FETCH_SUCCESS:
      return Object.assign({}, state, {
        cdList: action.cashdrawers,
        error: null
      })
    case DAILYDATA_FETCH_FAILURE:
      return Object.assign({}, state, {
        error: action.error
      })
    case DAILYDATA_CREATE_REQUEST:
      return Object.assign({}, state, {
        isProcessing: true,
        error: null
      })
    case DAILYDATA_CREATE_SUCCESS:
      return Object.assign({}, state, {
        error: null
      })
    case DAILYDATA_CREATE_FAILURE:
      return Object.assign({}, state, {
        error: action.error
      })
    default:
      return state
  }
}

export default cashdrawers
