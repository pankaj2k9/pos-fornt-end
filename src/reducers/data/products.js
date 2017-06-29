import {
  PRODUCTS_FETCH_REQUEST,
  PRODUCTS_FETCH_SUCCESS,
  PRODUCTS_FETCH_FAILURE,
  PRODUCTS_SHOULD_UPDATE,
  PRODUCTS_SET_DATA,
  // PRODUCTS_INCREASE,
  PRODUCTS_DECREASE
} from '../../actions/data/products'

function addToStock (stocks, storeId, quantity) {
  for (let i = 0; i < stocks.length; i++) {
    const stockItem = stocks[i]
    if (stockItem.storeId === storeId) {
      stocks[i] = Object.assign({}, stockItem)
      stocks[i].stock = stocks[i].stock + quantity
      break
    }
  }
}

function products (state = {
  error: null,
  isFetching: false,
  productsArray: [],
  productsById: null,
  shouldUpdate: true
}, action) {
  switch (action.type) {
    case PRODUCTS_DECREASE:
      const {products, storeId} = action
      const newProductsById = Object.assign({}, state.productsById)
      const newProductsArray = state.productsArray.slice()

      products.forEach((product) => {
        const productId = product.productId

        newProductsById[productId] = Object.assign({}, newProductsById[productId])
        let newProduct = newProductsById[productId]
        newProduct.stock = newProduct.stock.slice()

        let stocks = newProduct.stock
        addToStock(stocks, storeId, product.quantity * -1)

        newProduct = undefined
        newProductsArray.forEach((productData, index) => {
          if (productData.id === String(productId)) {
            newProductsArray[index] = Object.assign({}, productData)
            newProduct = newProductsArray[index]
          }
        })

        newProduct.stock = newProduct.stock.slice()
        stocks = newProduct.stock

        addToStock(stocks, storeId, -1 * product.quantity)
      })
      return Object.assign({}, state, {
        productsArray: newProductsArray,
        productsById: newProductsById
      })
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
        product['customDiscount'] = 0
        product['overallDiscount'] = 0
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

export default products
