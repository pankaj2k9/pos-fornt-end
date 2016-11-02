import React from 'react'
import { connect } from 'react-redux'
import { FormattedMessage } from 'react-intl'

import LoadingPane from '../components/LoadingPane'

import { fetchAllProducts } from '../actions/products'
import { formatDate } from '../utils/string'

class ProductsStock extends React.Component {
  componentWillMount () {
    const { dispatch, locale, productsFilter } = this.props

    dispatch(fetchAllProducts(locale, productsFilter))
  }

  render () {
    const { locale, storeId, products, isLoading } = this.props

    return (isLoading
      ? <LoadingPane
        headerMessage={<FormattedMessage id='app.page.reports.loadingStoreOrders' />} />
      : <div className='container'>
        <table className='table is-bordered is-unselectable'>
          <thead>
            <tr>
              <th>Product</th>
              <th>Barcode</th>
              <th>Date Created</th>
              <th>Last updated</th>
              <th>In Stock</th>
            </tr>
          </thead>

          <tbody>
            {products.map((product) => {
              const { barcodeInfo, dateCreated, dateUpdated } = product
              const prodName = locale === 'en' ? product.nameEn : product.nameZh
              const inStock = product.stock.filter((stock) => {
                return stock.storeId === storeId
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
    products: state.data.products.productsArray,
    productsFilter: state.panelProducts.productsFilter,
    isLoading: state.data.products.isFetching
  }
}

export default connect(mapStateToProps)(ProductsStock)
