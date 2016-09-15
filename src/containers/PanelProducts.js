import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { FormattedMessage } from 'react-intl'

import LoadingPane from '../components/LoadingPane'
import SearchBar from '../components/SearchBar'
import Panel from '../components/Panel'
import Truncate from '../components/Truncate'
import Tabs from '../components/Tabs'

import {
  counterIncrement,
  counterDecrement,
  counterReset
} from '../actions/application'

import {
  addItemToCart,
  productsSetFilter,
  productsSetSearchkey,
  resetProductsPanel
} from '../actions/panelProducts'

import {
  panelCartShouldUpdate
} from '../actions/panelCart'

const intFrameHeight = window.innerHeight
const intFrameWidth = window.innerWidth

class PanelProducts extends Component {
  /* Panel Events*/
  onClickFilterButton (filter) {
    const {dispatch} = this.props
    document.getElementById('productsSearch').focus()
    dispatch(productsSetFilter(filter))
  }

  searchKeyInput (productsSearchKey) {
    const {dispatch} = this.props
    dispatch(productsSetSearchkey(productsSearchKey))
  }

  onClickProduct (productId) {
    const {dispatch, productsById, currency} = this.props
    const product = productsById[productId]
    dispatch(panelCartShouldUpdate())
    dispatch(addItemToCart(product, currency))
    document.getElementById('productsSearch').focus()
  }

  barcodeInput (event) {
    event.preventDefault()
    const {
      dispatch,
      productsById,
      productsArray,
      productsSearchKey, currency
    } = this.props
    dispatch(panelCartShouldUpdate())
    const barcodeItem = productsArray.filter(function (product) {
      return product.barcodeInfo === (productsSearchKey)
    })
    const product = productsById[barcodeItem[0].id] // item extracted from productsById
    if (product !== undefined || product === null) {
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

  /* Modal Events */
  counterAdd () {
    this.props.dispatch(counterIncrement())
  }
  counterSubtract () {
    this.props.dispatch(counterDecrement())
  }
  productDetailsModalCancel () {
    const { dispatch } = this.props
    dispatch(counterReset())
    dispatch(resetProductsPanel())
  }

  renderChildren () {
    const {
      locale,
      productsArray,
      productsSearchKey,
      productsFilter,
      storeId
    } = this.props
    let columnSize = intFrameWidth <= 1024 ? 'is-4' : 'is-3'
    let itemNameSize = intFrameWidth <= 1024 ? 25 : 40
    let filterString = productsFilter.trim().toLowerCase()
    let searchKey = productsSearchKey.trim().toLowerCase()
    let firstFilter = []
    let filteredProducts = []

    if (productsFilter === 'all' && productsSearchKey === '') {
      filteredProducts = productsArray
    } else if (productsFilter === 'all' && productsSearchKey !== '') {
      filteredProducts = productsArray.filter(function (product) {
        return product.nameEn.toLowerCase().match(searchKey) ||
          product.descriptionEn.toLowerCase().match(searchKey) ||
          product.nameZh.toLowerCase().match(searchKey) ||
          product.descriptionZh.toLowerCase().match(searchKey)
      })
    } else if (productsFilter !== 'all' && productsSearchKey === '') {
      filteredProducts = productsArray.filter(function (product) {
        return product.type.toLowerCase().match(filterString)
      })
    } else if (productsFilter !== 'all' || productsSearchKey !== '') {
      firstFilter = productsArray.filter(function (product) {
        return product.type.toLowerCase().match(filterString)
      })
      filteredProducts = firstFilter.filter(function (product) {
        return product.nameEn.toLowerCase().match(searchKey) ||
          product.descriptionEn.toLowerCase().match(searchKey) ||
          product.nameZh.toLowerCase().match(searchKey) ||
          product.descriptionZh.toLowerCase().match(searchKey)
      })
    }
    return filteredProducts.map(function (product, key) {
      let productStock = {}
      product.stock.forEach(obj => {
        if (obj.storeId === storeId) {
          let tagColor
          if (obj.stock >= 51) {
            tagColor = {color: 'green'}
          } else if (obj.stock <= 50) {
            if (obj.stock > 20) {
              tagColor = {color: 'orange'}
            } else if (obj.stock < 20) {
              tagColor = {color: 'red'}
            }
          }
          productStock = {stock: obj.stock, tag: tagColor}
        }
      })
      let tag = productStock.tag
      let productName = locale === 'en' ? product.nameEn : product.nameZh

      return (
        <div
          key={key}
          className={`column ${columnSize}`}
          onClick={this.onClickProduct.bind(this, product.id)}>
          <div className='card' style={{height: 140}}>
            <div className='section' style={{padding: 20, backgroundColor: 'transparent'}}>
              <div className='title is-5'>
                <Truncate text={productName} maxLength={itemNameSize} />
              </div>

              {product.stock.length === 0 || Object.keys(productStock).length === 0
                ? <p style={{
                  color: 'red',
                  fontSize: 16 }}>
                  update stock on admin
                </p>
                : <div>
                  {'stock: '}
                  <span
                    style={{fontSize: 18}}>
                    <strong style={tag}>
                      {productStock.stock}
                    </strong>
                  </span>
                </div>
              }
            </div>
          </div>
        </div>
      )
    }, this)
  }

  render () {
    const {
      autofocusSearchInput,
      productsSearchKey,
      productsFilter,
      filters,
      isFetching
    } = this.props
    return (
      <div className='is-fullheight'>
        <Panel
          panelName={<FormattedMessage id='app.panel.products' />}
          >
          <div className='panel-heading'>
            <SearchBar
              id='productsSearch'
              autoFocus={autofocusSearchInput}
              value={productsSearchKey}
              placeholder='app.ph.searchOrBarcode'
              onChange={this.searchKeyInput.bind(this)}
              onKeyDown={this.barcodeInput.bind(this)} />
          </div>
          <div className='panel-heading'>
            <Tabs
              activeLink={productsFilter}
              links={filters}
              onClick={this.onClickFilterButton.bind(this)}
              type='is-toggle'
            />
          </div>
          <div className='panel-block'>
          {!isFetching
            ? <div className='columns is-multiline is-mobile'
              style={{height: intFrameHeight - 250, overflowY: 'scroll'}}>
              {this.renderChildren()}
            </div>
            : <div style={{height: intFrameHeight - 300, justifyContent: 'center'}}>
              <LoadingPane
                headerMessage={
                  <FormattedMessage id='app.page.products.loadingProd' />
                }
                paneSize='is-medium' />
            </div>
          }
          </div>
        </Panel>
      </div>
    )
  }
}

PanelProducts.propTypes = {
  locale: PropTypes.string,
  productsAreFetching: PropTypes.bool,
  productsArray: PropTypes.array,
  staff: PropTypes.object,
  storeId: PropTypes.string
}

function mapStateToProps (state) {
  return {
    activeProductId: state.panelProducts.activeProductId,
    activeProduct: state.panelProducts.activeProduct,
    filters: state.panelProducts.filters,
    isFetching: state.data.products.isFetching,
    productsById: state.data.products.productsById,
    initialCount: state.application.counterCount,
    currency: state.panelCart.currency,
    productsFilter: state.panelProducts.productsFilter,
    productsSearchKey: state.panelProducts.productsSearchKey,
    autofocusSearchInput: state.panelProducts.autofocusSearchInput
  }
}

export default connect(mapStateToProps)(PanelProducts)
