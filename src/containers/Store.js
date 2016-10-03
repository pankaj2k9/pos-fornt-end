import React, { Component } from 'react'
import { connect } from 'react-redux'
import { injectIntl, FormattedMessage } from 'react-intl'

import PanelProducts from './PanelProducts'
import PanelCart from './PanelCart'
import PanelCheckout from './PanelCheckout'

import { fetchAllProducts } from '../actions/products'
import { fetchCustomers } from '../actions/customers'
import {
  setActiveModal
} from '../actions/application'

class Store extends Component {

  componentDidUpdate () {
    const { activeCashier, activeCashdrawer, activeModalId } = this.props
    if (!activeCashdrawer || activeCashdrawer.initialAmount > 0) {
      if (activeModalId === '' || !activeModalId) {
        if (activeCashier) {
          document.getElementById('productsSearch').focus()
        }
      }
    }
  }

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

  close () {
    const {dispatch} = this.props
    dispatch(setActiveModal(''))
  }

  renderDisabledStore () {
    const { staff } = this.props
    return (
      <div className='hero is-large'>
        <div className='hero-body'>
          <div className='container has-text-centered'>
            {staff.role === 'master'
              ? <div>
                <h1 className='title'>
                  <FormattedMessage id='app.general.noCashier' />
                </h1>
                <h2 className='subtitle'>
                  <FormattedMessage id='app.general.loginFirst' />
                </h2>
              </div>
              : <div>
                <h1 className='title'>
                  <FormattedMessage id='app.general.forbidden' />
                </h1>
                <h2 className='subtitle'>
                  <FormattedMessage id='app.general.onlyMaster' />
                </h2>
              </div>
            }
          </div>
        </div>
      </div>
    )
  }

  renderStore () {
    const {
      locale,
      activeModalId,
      customersArefetching,
      customersArray,
      customersById,
      cartItemsArray,
      productsAreFetching,
      productsArray,
      productsById,
      items, // ordersOnHold,
      staff,
      storeId
    } = this.props
    return (
      <div className='hero'>
        <div className='hero-body' style={{padding: 0}}>
          <div className='content'>
            <div className='tile is-ancestor is-fullwidth'>
              <div className='tile is-parent is-6'>
                <div className='tile is-child'>
                  <PanelProducts
                    locale={locale}
                    productsAreFetching={productsAreFetching}
                    productsArray={productsArray}
                    productById={productsById}
                    staff={staff}
                    storeId={storeId}
                    />
                </div>
              </div>
              <div className='tile is-parent is-vertical'>
                <div>
                  <div className='tile is-child'>
                    <PanelCart
                      locale={locale}
                      activeModalId={activeModalId}
                      cartItemsArray={cartItemsArray}
                      customersArefetching={customersArefetching}
                      customersArray={customersArray}
                      customersById={customersById}
                      ordersOnHold={items} />
                  </div>
                </div>
                <div>
                  <div className='tile is-child'>
                    <PanelCheckout
                      activeModalId={activeModalId}
                      cartItemsArray={cartItemsArray}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  render () {
    const {adminToken} = this.props
    return (
      <div>
        {
          !adminToken
          ? this.renderDisabledStore()
          : this.renderStore()
        }
      </div>
    )
  }
}

function mapStateToProps (state) {
  return {
    locale: state.intl.locale,
    activeModalId: state.application.activeModalId,
    activeCashier: state.application.activeCashier,
    cashdrawer: state.application.cashdrawer,
    adminToken: state.application.adminToken,
    shouldUpdate: state.application.shouldUpdate,
    error: state.application.error,
    customersArefetching: state.data.customers.isFetching,
    customersArray: state.data.customers.customersArray,
    customersById: state.data.customers.customersById,
    productsAreFetching: state.data.products.isFetching,
    productsArray: state.data.products.productsArray,
    productsById: state.data.products.productsById,
    productsShouldUpdate: state.data.products.shouldUpdate,
    items: state.ordersOnHold.items, // ordersOnHold
    cartItemsArray: state.panelCart.items,
    staff: state.application.staff.data,
    storeId: state.application.storeId,
    intl: state.intl
  }
}

export default connect(mapStateToProps)(injectIntl(Store))
