import {
  PANEL_PRODUCTS_SHOULD_UPDATE,
  PRODUCT_SET_ACTIVE,
  PRODUCT_SET_ACTIVE_ID,
  PRODUCTS_SET_FILTER,
  PRODUCTS_SET_SEARCHKEY,
  RESET_PRODUCTS_PANEL
} from '../actions/panelProducts'

function panelProducts (state = {
  activeProduct: null,
  previousProductId: null,
  autofocusSearchInput: true,
  panelShouldUpdate: false,
  productsFilter: 'all',
  productsSearchKey: '',
  filters: [
    {name: 'app.tabs.ctgAll', value: 'all'},
    {name: 'app.tabs.ctgSkin', value: 'skin'},
    {name: 'app.tabs.ctgLotion', value: 'lotion'},
    {name: 'app.tabs.ctgEssence', value: 'esssence'},
    {name: 'app.tabs.ctgEye', value: 'eye cream'},
    {name: 'app.tabs.ctgCream', value: 'cream'},
    {name: 'app.tabs.ctgBasic', value: 'basic line'},
    {name: 'app.tabs.ctgSun', value: 'sun'},
    {name: 'app.tabs.ctgCleanse', value: 'cleanse'},
    {name: 'app.tabs.ctgMask', value: 'mask'},
    {name: 'app.tabs.ctgSet', value: 'set'},
    {name: 'app.tabs.ctgCosme', value: 'osmeceutical'},
    {name: 'app.tabs.ctgEtc', value: 'etc'}
  ]
}, action) {
  switch (action.type) {
    case PANEL_PRODUCTS_SHOULD_UPDATE:
      return Object.assign({}, state, {
        panelShouldUpdate: true,
        productsSearchKey: ' '
      })
    case PRODUCTS_SET_FILTER:
      return Object.assign({}, state, {
        productsFilter: action.productsFilter
      })
    case PRODUCTS_SET_SEARCHKEY:
      return Object.assign({}, state, {
        productsSearchKey: action.productsSearchKey
      })
    case PRODUCT_SET_ACTIVE:
      return Object.assign({}, state, {
        activeProduct: action.product
      })
    case PRODUCT_SET_ACTIVE_ID:
      return Object.assign({}, state, {
        activeProductId: action.productId
      })
    case RESET_PRODUCTS_PANEL:
      return Object.assign({}, state, {
        productsSearchKey: '',
        activeProductId: null,
        activeProduct: null,
        panelShouldUpdate: false
      })
    default:
      return state
  }
}

export default panelProducts
