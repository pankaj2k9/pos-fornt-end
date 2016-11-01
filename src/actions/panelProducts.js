export const PANEL_PRODUCTS_SHOULD_UPDATE = 'PANEL_PRODUCTS_SHOULD_UPDATE'
export const PRODUCTS_SET_FILTER = 'PRODUCTS_SET_FILTER'
export const PRODUCTS_SET_SEARCHKEY = 'PRODUCTS_SET_SEARCHKEY'
export const PRODUCT_SET_ACTIVE = 'PRODUCT_SET_ACTIVE'
export const PRODUCT_SET_ACTIVE_ID = 'PRODUCT_SET_ACTIVE_ID'
export const RESET_PRODUCTS_PANEL = 'RESET_PRODUCTS_PANEL'

import { panelCartShouldUpdate, addCartItem } from './panelCart'

export function panelProductsShouldUpdate () {
  return {
    type: PANEL_PRODUCTS_SHOULD_UPDATE
  }
}

export function productsSetFilter (productsFilter) {
  return {
    type: PRODUCTS_SET_FILTER,
    productsFilter
  }
}

export function productsSetSearchkey (productsSearchKey) {
  return {
    type: PRODUCTS_SET_SEARCHKEY,
    productsSearchKey
  }
}

export function productSetPreviousID (productId) {
  return {
    type: PRODUCT_SET_ACTIVE_ID,
    productId
  }
}

export function productSetActive (product) {
  return {
    type: PRODUCT_SET_ACTIVE,
    product
  }
}

export function resetProductsPanel () {
  return {
    type: RESET_PRODUCTS_PANEL
  }
}

export function addItemToCart (product, currency) {
  return (dispatch) => {
    dispatch(panelProductsShouldUpdate())
    dispatch(panelCartShouldUpdate(true))
    dispatch(addCartItem(product, currency))
    dispatch(resetProductsPanel())
  }
}
