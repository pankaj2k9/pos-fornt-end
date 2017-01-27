import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'

import SearchBar from '../components/SearchBar'

import {
  addItemToCart,
  productsSetSearchkey
} from '../actions/panelProducts'

import { fetchAllProducts } from '../actions/products'
import { fetchCustomers } from '../actions/customers'

class PanelProducts extends Component {

  componentWillMount () {
    const {
      dispatch,
      locale,
      productsById,
      productsFilter,
      posMode,
      networkStatus
    } = this.props
    const case1 = posMode === 'offline' && networkStatus === 'online'
    const case2 = posMode === 'online' && networkStatus === 'online'
    if (!productsById) {
      if (case1 || case2) {
        dispatch(fetchAllProducts(locale, productsFilter))
        dispatch(fetchCustomers())
      }
    }
  }

  componentDidMount () {
    const {focusedInput} = this.props
    document.getElementById(focusedInput).focus()
  }

  searchKeyInput (productsSearchKey) {
    const {dispatch} = this.props
    dispatch(productsSetSearchkey(productsSearchKey))
  }

  barcodeInput (event) {
    event.preventDefault()
    const {
      dispatch,
      productsById,
      productsArray,
      productsSearchKey,
      currency
    } = this.props
    const barcodeItem = productsArray.filter(function (product) {
      return product.barcodeInfo === (productsSearchKey)
    })
    const product = productsById[barcodeItem[0].id] // item extracted from productsById
    document.getElementById('productsSearch').value = ''
    if (product !== undefined || product === null) {
      dispatch(addItemToCart(product, currency))
    }
  }

  render () {
    const {
      autofocusSearchInput,
      productsSearchKey
    } = this.props
    return (
      <SearchBar
        id='productsSearch'
        autoFocus={autofocusSearchInput}
        value={productsSearchKey}
        placeholder='app.ph.searchOrBarcode'
        onChange={this.searchKeyInput.bind(this)}
        onSubmit={this.barcodeInput.bind(this)} />
    )
  }
}

PanelProducts.propTypes = {
  locale: PropTypes.string,
  productsAreFetching: PropTypes.bool,
  staff: PropTypes.object,
  storeId: PropTypes.string
}

function mapStateToProps (state) {
  const focusedInput = state.application.focusedInput || state.panelCart.focusedInput
  return {
    posMode: state.application.posMode,
    networkStatus: state.application.networkStatus,
    activeProductId: state.panelProducts.activeProductId,
    activeProduct: state.panelProducts.activeProduct,
    filters: state.panelProducts.filters,
    focusedInput,
    shouldUpdate: state.data.products.shouldUpdate,
    isFetching: state.data.products.isFetching,
    productsArray: state.data.products.productsArray,
    productsById: state.data.products.productsById,
    initialCount: state.application.counterCount,
    currency: state.panelCart.currency,
    productsFilter: state.panelProducts.productsFilter,
    productsSearchKey: state.panelProducts.productsSearchKey,
    autofocusSearchInput: state.panelProducts.autofocusSearchInput
  }
}

export default connect(mapStateToProps)(PanelProducts)
