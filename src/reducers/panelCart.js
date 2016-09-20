import {
  PANEL_CART_SHOULD_UPDATE,
  SET_WALKIN_CUSTOMER,
  SET_INPUT_ODBO_ID,
  SET_ACTIVE_CUSTOMER,
  SET_ACTIVE_CUSTOMER_ERROR,
  SET_CURRENCY_TYPE,
  SET_CUSTOMER_INPUT_ACTIVE,
  SET_CUSTOMER_INPUT_DISABLED,
  SET_VOUCHER_DISCOUNT,
  ADD_CART_ITEM,
  SET_CART_ITEM_QTY,
  SET_CUSTOM_DISCOUNT,
  REMOVE_CART_ITEM,
  REMOVE_CUSTOMER,
  REMOVE_VOUCHER,
  PANEL_CART_RESET,
  RECALL_CART_ITEMS
} from '../actions/panelCart'

function panelCart (state = {
  activeCustomer: null,
  walkinCustomer: '',
  customerSearchKey: '',
  customerSearchError: null,
  currency: 'sgd',
  items: [],
  itemsById: null,
  voucher: null,
  totalPrice: 0,
  totalCustomPrice: 0,
  totalOdboPrice: 0,
  customerInputActive: false,
  customerInputAction: 'search',
  shouldUpdate: false
}, action) {
  switch (action.type) {
    case PANEL_CART_SHOULD_UPDATE:
      return Object.assign({}, state, {
        shouldUpdate: action.value
      })
    case SET_CUSTOMER_INPUT_ACTIVE:
      return Object.assign({}, state, {
        customerInputActive: true,
        customerInputAction: action.inputAction
      })
    case SET_CUSTOMER_INPUT_DISABLED:
      return Object.assign({}, state, {
        customerInputActive: false,
        customerInputAction: '',
        customerSearchError: null
      })
    case SET_WALKIN_CUSTOMER:
      return Object.assign({}, state, {
        walkinCustomer: action.name
      })
    case SET_INPUT_ODBO_ID:
      return Object.assign({}, state, {
        customerSearchKey: action.odboID
      })
    case SET_ACTIVE_CUSTOMER:
      return Object.assign({}, state, {
        activeCustomer: action.customer,
        customerSearchKey: '',
        customerSearchError: null,
        searchActive: false,
        shouldUpdate: false
      })
    case SET_ACTIVE_CUSTOMER_ERROR:
      return Object.assign({}, state, {
        customerSearchError: action.error
      })
    case SET_CURRENCY_TYPE:
      return Object.assign({}, state, {
        currency: action.currency
      })
    case SET_VOUCHER_DISCOUNT:
      return Object.assign({}, state, {
        voucher: action.data
      })
    case REMOVE_CUSTOMER:
      return Object.assign({}, state, {
        activeCustomer: null,
        walkinCustomer: ''
      })
    case ADD_CART_ITEM:
      state.customerSearchKey = ' '
      let output = state.items // current products in cart
      let productToCompare = [action.product] // product item to be added to the cart
      const itemsById = {}
      productToCompare.forEach(function (product) {
        var existing = output.filter(function (v, i) {
          return v.id === product.id
        })
        let productPrice = Number(product.price).toFixed(2)
        let productOdboPrice = Number(product.odboPrice).toFixed(2)
        if (existing.length) {
          var x = output.indexOf(existing[0]) // index of exiting product
          output[x].qty = Number(output[x].qty) + 1
          output[x].subTotalPrice = Number(output[x].subTotalPrice) + Number(productPrice)
          output[x].subTotalOdboPrice = Number(output[x].subTotalOdboPrice) + Number(productOdboPrice)
          state.totalPrice = Number(state.totalPrice) + Number(productPrice)
          state.totalOdboPrice = Number(state.totalOdboPrice) + Number(productOdboPrice)
        } else {
          const qtyAndTotal = {qty: 1, subTotalPrice: productPrice, subTotalOdboPrice: productOdboPrice, customDiscount: 0.00}
          const items = Object.assign(product, qtyAndTotal)
          output.push(items)
          state.totalPrice = Number(state.totalPrice) + Number(productPrice)
          state.totalOdboPrice = Number(state.totalOdboPrice) + Number(productOdboPrice)
        }
      })
      state.customerSearchKey = ''
      return Object.assign({}, state, {
        items: output,
        shouldUpdate: false,
        itemsById: itemsById,
        totalPrice: state.totalPrice,
        totalOdboPrice: state.totalOdboPrice
      })
    case SET_CART_ITEM_QTY:
      state.shouldUpdate = true
      state.items.forEach(item => {
        let discount = item.customDiscount === 0
          ? item.isDiscounted
            ? (Number(item.priceDiscount) / 100) * item.price
            : 0
          : (Number(item.customDiscount) / 100) * item.price
        if (item.id === action.cartItemId) {
          if (action.opperand === 'plus') {
            item.qty = item.qty + 1
            item.computedDiscount = Number(discount * item.qty)
            item.subTotalPrice = Number(item.subTotalPrice) + Number(item.price)
            item.subTotalOdboPrice = Number(item.subTotalOdboPrice) + Number(item.odboPrice)
            state.totalPrice = Number(state.totalPrice) + Number(item.price)
            state.totalOdboPrice = Number(state.totalOdboPrice) + Number(item.odboPrice)
          } else {
            if (item.qty > 1) {
              item.qty = item.qty - 1
              item.computedDiscount = Number(discount * item.qty)
              item.subTotalPrice = Number(item.subTotalPrice) - Number(item.price)
              item.subTotalOdboPrice = Number(item.subTotalOdboPrice) - Number(item.price)
              state.totalPrice = Number(state.totalPrice) - Number(item.price)
              state.totalOdboPrice = Number(state.totalOdboPrice) - Number(item.price)
            }
          }
        }
      })
      return Object.assign({}, state, {
        customerSearchKey: '',
        items: state.items,
        totalPrice: state.totalPrice,
        totalOdboPrice: state.totalOdboPrice,
        shouldUpdate: false
      })
    case SET_CUSTOM_DISCOUNT:
      let customDiscount = !action.discount || action.discount === ''
        ? 0.00
        : Number(action.discount).toFixed(2)
      state.items.forEach(item => {
        if (item.id === action.cartItemId) {
          item['customDiscount'] = Number(customDiscount)
        }
      })
      return Object.assign({}, state, {
        items: state.items,
        totalPrice: state.totalPrice,
        totalOdboPrice: state.totalOdboPrice,
        shouldUpdate: false
      })
    case REMOVE_CART_ITEM:
      state.items.forEach(function (item, index, object) {
        if (item.id === action.cartItemId) {
          object.splice(index, 1)
          Number(state.totalPrice -= Number(item.subTotalPrice)).toFixed(2)
          Number(state.totalOdboPrice -= Number(item.subTotalOdboPrice)).toFixed(2)
        }
      })
      return Object.assign({}, state, {
        customerSearchKey: '',
        items: state.items,
        totalPrice: state.totalPrice,
        shouldUpdate: false
      })
    case REMOVE_VOUCHER:
      return Object.assign({}, state, {
        voucher: null
      })
    case PANEL_CART_RESET:
      return Object.assign({}, state, {
        activeCustomer: null,
        walkinCustomer: '',
        customerInputActive: false,
        customerInputAction: 'search',
        customerSearchKey: '',
        customerSearchError: null,
        currency: 'sgd',
        items: [],
        itemsById: null,
        totalPrice: 0,
        totalOdboPrice: 0,
        shouldUpdate: false,
        voucher: null
      })
    case RECALL_CART_ITEMS:
      return Object.assign({}, state, {
        items: action.cartItems,
        totalPrice: action.totalPrice,
        totalOdboPrice: action.totalOdboPrice
      })
    default:
      return state
  }
}

export default panelCart
