import React, { Component } from 'react'
import { connect } from 'react-redux'
import { injectIntl, FormattedMessage } from 'react-intl'

import PanelCart from './PanelCart'
import PanelCheckout from './PanelCheckout'

import { storeGetDailyData } from '../actions/application'

class Store extends Component {

  componentDidMount () {
    const {dispatch, storeId, cashdrawer} = this.props
    dispatch(storeGetDailyData(storeId, cashdrawer))
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
      items // ordersOnHold,
    } = this.props
    return (
      <div className='hero'>
        <div className='hero-body' style={{padding: 0}}>
          <div className='content'>
            <div className='tile is-ancestor is-fullwidth'>
              <div className='tile is-parent is-6 is-vertical'>
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
              <div className='tile is-parent is-vertical'>
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
    const {activeCashier} = this.props
    return (
      <div>
        {
          !activeCashier
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
    store: state.application.store,
    intl: state.intl
  }
}

export default connect(mapStateToProps)(injectIntl(Store))
