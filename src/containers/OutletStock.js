import React from 'react'
import { connect } from 'react-redux'
import { FormattedMessage } from 'react-intl'

import LoadingPane from '../components/LoadingPane'

import { fetchAllProducts } from '../actions/products'
import { outletStocksChSource } from '../actions/reports'
import { formatDate } from '../utils/string'

class ProductsStock extends React.Component {
  componentWillMount () {
    const { dispatch, locale, productsFilter } = this.props

    dispatch(fetchAllProducts(locale, productsFilter))
  }

  _handleSourceChange (event) {
    const { dispatch } = this.props

    dispatch(outletStocksChSource(event.target.value))
  }

  render () {
    const { locale, storeId, storeIds, selectedStore, products, isLoading } = this.props

    // Extract store id array
    const storeSrcList = storeIds.map((store) => {
      return {
        source: store.source,
        name: store.name
      }
    })

    // Filter products by source
    const filterSource = selectedStore || storeId

    return (isLoading
      ? <LoadingPane
        headerMessage={<FormattedMessage id='app.page.products.loadingProd' />} />
      : <div className='container'>
        <p className='control'>
          <span className='select'>
            <select
              value={filterSource}
              onChange={this._handleSourceChange.bind(this)}>
              {storeSrcList.map((storeSrc) => {
                return (
                  <option
                    value={storeSrc.source}
                    key={`store-src-${storeSrc.source}`}>
                    {storeSrc.name}
                  </option>
                )
              })}
            </select>
          </span>
        </p>

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
    storeId: state.application.storeId,
    storeIds: state.application.storeIds,
    selectedStore: state.reports.outletStocks.source,
    products: state.data.products.productsArray,
    productsFilter: state.panelProducts.productsFilter,
    isLoading: state.data.products.isFetching
  }
}

export default connect(mapStateToProps)(ProductsStock)