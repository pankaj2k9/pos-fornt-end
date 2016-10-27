import React from 'react'
import { connect } from 'react-redux'

import { formatDate } from '../utils/string'

class ProductsStock extends React.Component {
  render () {
    const { locale, storeId, products } = this.props

    return (
      <div className='container'>
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
                <tr>
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
    products: state.data.products.productsArray
  }
}

export default connect(mapStateToProps)(ProductsStock)
