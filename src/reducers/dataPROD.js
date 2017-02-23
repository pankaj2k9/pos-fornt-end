import {
  PRODUCTS_FETCH_REQUEST,
  PRODUCTS_FETCH_SUCCESS,
  PRODUCTS_FETCH_FAILURE,
  PRODUCTS_SHOULD_UPDATE,
  PRODUCTS_SET_DATA
} from '../actions/dataPROD'

function dataPROD (state = {
  error: null,
  isFetching: false,
  productsArray: [],
  productsById: null,
  shouldUpdate: true
}, action) {
  switch (action.type) {
    case PRODUCTS_FETCH_REQUEST:
      return Object.assign({}, state, {
        isFetching: true,
        shouldUpdate: false
      })
    case PRODUCTS_FETCH_SUCCESS:
      return Object.assign({}, state, {
        isFetching: false,
        shouldUpdate: false
      })
    case PRODUCTS_FETCH_FAILURE:
      return Object.assign({}, state, {
        isFetching: false,
        shouldUpdate: true
      })
    case PRODUCTS_SHOULD_UPDATE:
      return Object.assign({}, state, {
        isFetching: true,
        shouldUpdate: true
      })
    case PRODUCTS_SET_DATA:
      const productById = {}
      action.productsArray.forEach(product => {
        product['locale'] = action.locale
        product['filter'] = action.productsFilter
        product['searchKey'] = action.productsSearchKey
        productById[product.id] = product
      })
      return Object.assign({}, state, {
        isFetching: true,
        shouldUpdate: true,
        productsArray: action.productsArray,
        productsById: productById
      })
    default:
      return state
  }
}

export default dataPROD
