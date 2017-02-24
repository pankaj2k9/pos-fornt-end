import React, { Component } from 'react'
import { connect } from 'react-redux'
import { injectIntl, FormattedMessage } from 'react-intl'

import PanelButtons from './PanelButtons'
import PanelOrderInfo from './PanelOrderInfo'

import ModalProductList from './ModalProductList'
import ModalSetPayments from './ModalSetPayments'
import ModalStoreUtils from './ModalStoreUtils'

import { fetchAllProducts } from '../actions/data/products'

class Store extends Component {
  componentWillMount () {
  }

  componentDidMount () {
    const {
      dispatch,
      locale
    } = this.props
    dispatch(fetchAllProducts(locale))
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

  renderStoreModals () {
    const {
      locale,
      activeModalId,
      productsArray,
      productsById,
      storeId
    } = this.props
    if (activeModalId === 'productsList') {
      return (
        <ModalProductList
          locale={locale}
          productsArray={productsArray}
          productsById={productsById}
          storeId={storeId} />
      )
    } else if (activeModalId === 'payments') {
      return <ModalSetPayments />
    } else if (activeModalId === 'recallOrder' || 'overallDiscount' || 'notes') {
      return <ModalStoreUtils />
    }
  }

  renderStore () {
    return (
      <div className='hero'>
        <div className='hero-body' style={{padding: 0}}>
          <div className='tile is-ancestor is-fullwidth'>
            <div className='tile is-parent is-6 is-vertical'>
              <div className='tile is-child' style={{
                paddingTop: 15,
                display: 'flex',
                justifyContent: 'center',
                flexDirection: 'column'
              }}>
                <PanelButtons />
              </div>
            </div>
            <div className='tile is-parent is-vertical'>
              <div>
                <div className='tile is-child'>
                  <PanelOrderInfo />
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
        {this.renderStoreModals()}
      </div>
    )
  }
}

function mapStateToProps (state) {
  return {
    intl: state.intl,
    locale: state.intl.locale,
    activeModalId: state.app.mainUI.activeModalId,
    activeCashier: state.app.mainUI.activeCashier,
    cashdrawer: state.app.mainUI.activeDrawer,
    adminToken: state.app.mainUI.adminToken,
    shouldUpdate: state.app.mainUI.shouldUpdate,
    error: state.app.mainUI.error,
    posMode: state.app.mainUI.posMode,
    storeId: state.app.mainUI.activeStore.source,
    store: state.app.mainUI.store,
    staff: state.app.mainUI.activeStaff,
    customersArefetching: state.data.customers.isFetching,
    customersArray: state.data.customers.customersArray,
    customersById: state.data.customers.customersById,
    productsAreFetching: state.data.products.isFetching,
    productsArray: state.data.products.productsArray,
    productsById: state.data.products.productsById,
    productsShouldUpdate: state.data.products.shouldUpdate
  }
}

export default connect(mapStateToProps)(injectIntl(Store))
