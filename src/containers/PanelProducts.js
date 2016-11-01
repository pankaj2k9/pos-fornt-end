import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'

import SearchBar from '../components/SearchBar'
import Panel from '../components/Panel'

import {
  addItemToCart,
  productsSetSearchkey,
  resetProductsPanel
} from '../actions/panelProducts'

import { fetchAllProducts } from '../actions/products'
import { fetchCustomers } from '../actions/customers'

import {
  panelCartShouldUpdate
} from '../actions/panelCart'

class PanelProducts extends Component {
  componentWillMount () {
    const {
      dispatch,
      locale,
      productsById,
      productsFilter
    } = this.props
    if (!productsById) {
      dispatch(fetchAllProducts(locale, productsFilter))
      dispatch(fetchCustomers())
    }
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
      productsSearchKey, currency
    } = this.props
    const barcodeItem = productsArray.filter(function (product) {
      return product.barcodeInfo === (productsSearchKey)
    })
    const product = productsById[barcodeItem[0].id] // item extracted from productsById
    if (product !== undefined || product === null) {
      dispatch(panelCartShouldUpdate(true))
      dispatch(addItemToCart(product, currency))
      dispatch(resetProductsPanel())
      document.getElementById('productsSearch').value = ''
      document.getElementById('productsSearch').focus()
    } else {
      dispatch(resetProductsPanel())
      document.getElementById('productsSearch').value = ''
      document.getElementById('productsSearch').focus()
    }
  }

  render () {
    const {
      autofocusSearchInput, isFetching,
      productsSearchKey, shouldUpdate
    } = this.props
    return (
      !shouldUpdate && !isFetching
      ? <div className='is-fullheight'>
        <Panel>
          <div className='panel-heading'>
            <SearchBar
              id='productsSearch'
              autoFocus={autofocusSearchInput}
              value={productsSearchKey}
              placeholder='app.ph.searchOrBarcode'
              onChange={this.searchKeyInput.bind(this)}
              onSubmit={this.barcodeInput.bind(this)} />
          </div>
        </Panel>
      </div>
      : null
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
  return {
    activeProductId: state.panelProducts.activeProductId,
    activeProduct: state.panelProducts.activeProduct,
    filters: state.panelProducts.filters,
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
