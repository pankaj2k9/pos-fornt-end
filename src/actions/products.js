
export const PRODUCTS_FETCH_REQUEST = 'PRODUCTS_FETCH_REQUEST'
export const PRODUCTS_FETCH_SUCCESS = 'PRODUCTS_FETCH_SUCCESS'
export const PRODUCTS_FETCH_FAILURE = 'PRODUCTS_FETCH_FAILURE'
export const PRODUCTS_SHOULD_UPDATE = 'PRODUCTS_SHOULD_UPDATE'
export const PRODUCTS_SET_DATA = 'PRODUCTS_SET_DATA'

import productsService from '../services/products'

export function productsFetchRequest () {
  return {
    type: PRODUCTS_FETCH_REQUEST
  }
}

export function productsFetchSuccess () {
  return {
    type: PRODUCTS_FETCH_SUCCESS
  }
}

export function productsFetchFailure (error) {
  return {
    type: PRODUCTS_FETCH_FAILURE,
    error
  }
}

export function productsShouldUpdate (error) {
  return {
    type: PRODUCTS_SHOULD_UPDATE,
    error
  }
}

export function productsSetData (productsArray, locale, productsFilter, productsSearchKey) {
  return {
    type: PRODUCTS_SET_DATA,
    productsArray,
    productsFilter,
    productsSearchKey,
    locale
  }
}

export function fetchAllProducts (locale, productsFilter, storeId) {
  return (dispatch) => {
    dispatch(productsFetchRequest())
    return productsService.fetchAllProducts()

    .then(productItems => {
      dispatch(productsSetData(productItems.data, locale, productsFilter))
      dispatch(productsFetchSuccess())
    })

    .catch(error => {
      return error.response.json()
    })
    .then((error) => {
      console.log(error)
    })
    .catch(() => {})
  }
}
