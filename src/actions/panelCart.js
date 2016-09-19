export const PANEL_CART_SHOULD_UPDATE = 'PANEL_CART_SHOULD_UPDATE'
export const SET_CUSTOMER_INPUT_ACTIVE = 'SET_CUSTOMER_INPUT_ACTIVE'
export const SET_CUSTOMER_INPUT_DISABLED = 'SET_CUSTOMER_INPUT_DISABLED'
export const SET_WALKIN_CUSTOMER = 'SET_WALKIN_CUSTOMER'
export const SET_INPUT_ODBO_ID = 'SET_INPUT_ODBO_ID'
export const SET_ACTIVE_CUSTOMER = 'SET_ACTIVE_CUSTOMER'
export const SET_ACTIVE_CUSTOMER_ERROR = 'SET_ACTIVE_CUSTOMER_ERROR'
export const SET_CURRENCY_TYPE = 'SET_CURRENCY_TYPE'
export const SET_VOUCHER_DISCOUNT = 'SET_VOUCHER_DISCOUNT'
export const ADD_CART_ITEM = 'ADD_CART_ITEM'
export const REMOVE_CART_ITEM = 'REMOVE_CART_ITEM'
export const REMOVE_VOUCHER = 'REMOVE_VOUCHER'
export const REMOVE_CUSTOMER = 'REMOVE_CUSTOMER'
export const SET_CART_ITEM_QTY = 'SET_CART_ITEM_QTY'
export const SET_CUSTOM_DISCOUNT = 'SET_CUSTOM_DISCOUNT'
export const PANEL_CART_RESET = 'PANEL_CART_RESET'
export const RECALL_CART_ITEMS = 'RECALL_CART_ITEMS'

export function panelCartShouldUpdate () {
  return {
    type: PANEL_CART_SHOULD_UPDATE
  }
}

export function setCustomerInputActive (inputAction) {
  return {
    type: SET_CUSTOMER_INPUT_ACTIVE,
    inputAction
  }
}

export function setCustomerInputDisabled () {
  return {
    type: SET_CUSTOMER_INPUT_DISABLED
  }
}

export function setWalkinCustomer (name) {
  return {
    type: SET_WALKIN_CUSTOMER,
    name
  }
}

export function setInputOdboID (odboID) {
  return {
    type: SET_INPUT_ODBO_ID,
    odboID
  }
}

export function setActiveCustomer (customer) {
  return {
    type: SET_ACTIVE_CUSTOMER,
    customer
  }
}

export function setActiveCustomerError (error) {
  return {
    type: SET_ACTIVE_CUSTOMER_ERROR,
    error
  }
}

export function setCurrencyType (currency) {
  return {
    type: SET_CURRENCY_TYPE,
    currency
  }
}

export function setVoucherDiscount (data) {
  return {
    type: SET_VOUCHER_DISCOUNT,
    data
  }
}

export function addCartItem (product, currency) {
  return {
    type: ADD_CART_ITEM,
    product,
    currency
  }
}

export function removeCartItem (cartItemId) {
  return {
    type: REMOVE_CART_ITEM,
    cartItemId
  }
}

export function removeVoucher () {
  return {
    type: REMOVE_VOUCHER
  }
}

export function removeCustomer () {
  return {
    type: REMOVE_CUSTOMER
  }
}

export function setCartItemQty (cartItemId, opperand) {
  return {
    type: SET_CART_ITEM_QTY,
    cartItemId,
    opperand
  }
}

export function setCustomDiscount (discount, cartItemId) {
  return {
    type: SET_CUSTOM_DISCOUNT,
    discount,
    cartItemId
  }
}

export function panelCartReset () {
  return {
    type: PANEL_CART_RESET
  }
}

export function recallCartItems (cartItems, totalPrice, totalOdboPrice) {
  return {
    type: RECALL_CART_ITEMS,
    cartItems,
    totalPrice,
    totalOdboPrice
  }
}

export function validateCustomerOdboId (customersArray, searchKey) {
  return (dispatch) => {
    let result = []
    customersArray.forEach(customer => {
      if (customer.odboId === searchKey) {
        dispatch(setActiveCustomer(customer))
        result[customer.id] = customer
        dispatch(setCustomerInputDisabled())
        document.getElementById('productsSearch').focus()
      }
    })
    if (result.length === 0) {
      dispatch(setActiveCustomerError('customer_search_error'))
      dispatch(setInputOdboID(''))
      document.getElementById('customerInput').value = ''
      document.getElementById('customerInput').focus()
    }
  }
}
