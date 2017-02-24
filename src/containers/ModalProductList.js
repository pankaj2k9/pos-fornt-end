import React, { Component } from 'react'
// import { browserHistory } from 'react-router'
import { connect } from 'react-redux'
// import { FormattedMessage } from 'react-intl'

import ModalCard from '../components/ModalCard'

import {
  addOrderItem
} from '../actions/data/orderData'

import {
  closeActiveModal
} from '../actions/app/mainUI'

class ModalProductList extends Component {

  _chooseProduct (productId) {
    const {dispatch, productsById} = this.props
    const product = productsById[productId]
    dispatch(addOrderItem(product))
    this._closeModal()
  }

  _closeModal (event) {
    const { dispatch } = this.props
    dispatch(closeActiveModal())
  }

  renderProductItems () {
    const {
      locale,
      productsArray,
      storeId
    } = this.props
    return productsArray.map(function (product, key) {
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
          className={`column is-4`}
          onClick={this._chooseProduct.bind(this, product.id)}>
          <div className='card' style={{height: 140}}>
            <div className='section' style={{padding: 20, backgroundColor: 'transparent'}}>
              <div className='title is-5'>
                {productName}
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
    return (
      <ModalCard closeAction={this._closeModal.bind(this)}>
        <div className='columns is-multiline is-mobile'>
          {this.renderProductItems()}
        </div>
      </ModalCard>
    )
  }
}

export default connect()(ModalProductList)
