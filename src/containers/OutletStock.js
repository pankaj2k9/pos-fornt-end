import React from 'react'
import { connect } from 'react-redux'
import { FormattedMessage } from 'react-intl'

import LoadingPane from '../components/LoadingPane'
import StoresDropdown from '../components/StoresDropdown'

import { fetchAllProducts } from '../actions/data/products'
import { outletStocksChSource } from '../actions/reports'
import { formatDate } from '../utils/string'

class ProductsStock extends React.Component {
  componentWillMount () {
    const { dispatch, locale } = this.props

    dispatch(fetchAllProducts(locale))
  }

  _handleSourceChange (event) {
    const { dispatch } = this.props

    dispatch(outletStocksChSource(event.target.value))
  }

  render () {
    const { locale, storeId, storeIds, selectedStore, products, isLoading } = this.props

    // Filter products by source
    const filterSource = selectedStore || storeId

    return (isLoading
      ? <LoadingPane
        headerMessage={<FormattedMessage id='app.page.products.loadingProd' />} />
      : <div className='container'>
        <StoresDropdown
          storeIds={storeIds}
          selectedStore={filterSource}
          onChange={this._handleSourceChange.bind(this)} />

        <table className='table is-bordered is-unselectable'>
          <thead>
            <tr>
              <th><FormattedMessage id='app.general.product' /></th>
              <th><FormattedMessage id='app.general.barcode' /></th>
              <th><FormattedMessage id='app.modal.dateCreated' /></th>
              <th><FormattedMessage id='app.modal.dateUpdated' /></th>
              <th><FormattedMessage id='app.general.stock' /></th>
            </tr>
          </thead>

          <tbody>
            {products.map((product) => {
              const { barcodeInfo, dateCreated, dateUpdated } = product
              const prodName = locale === 'en' ? product.nameEn : product.nameZh
              const inStock = product.stock.filter((stock) => {
                return stock.storeId === filterSource
              })[0]

              return (
                <tr key={`prod-stock-id-${product.id}`}>
                  <td>{prodName}</td>
                  <td>{barcodeInfo}</td>
                  <td>{formatDate(new Date(dateCreated))}</td>
                  <td>{formatDate(new Date(dateUpdated))}</td>
                  <td>{inStock && inStock.stock || 0}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    locale: state.intl.locale,
    storeId: state.app.mainUI.activeStore.source,
    storeIds: state.data.stores.stores,
    selectedStore: state.reports.outletStocks.source,
    products: state.data.products.productsArray,
    isLoading: state.data.products.isFetching
  }
}

export default connect(mapStateToProps)(ProductsStock)
