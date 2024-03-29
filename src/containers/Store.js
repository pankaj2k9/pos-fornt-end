import React, { Component } from 'react'
import { connect } from 'react-redux'
import { injectIntl, FormattedMessage } from 'react-intl'

import PanelButtons from './PanelButtons'
import PanelOrderInfo from './PanelOrderInfo'

import ModalProductList from './ModalProductList'
import ModalSetPayments from './ModalSetPayments'
import ModalAddMember from './ModalAddMember'
import ModalStoreUtils from './ModalStoreUtils'

import { fetchAllProducts } from '../actions/data/products'
import { fetchCustomers } from '../actions/data/customers'
import { fetchCashdrawers } from '../actions/data/cashdrawers'
import { fetchLastOrderId } from '../actions/orders'

import { validateCashdrawers } from '../actions/helpers'

class Store extends Component {
  componentWillMount () {
  }

  componentDidMount () {
    const {
      dispatch,
      locale,
      storeId,
      storeCode,
      cashdrawers,
      lastClosedDay,
      networkStatus
    } = this.props

    if (networkStatus === 'online') {
      dispatch(fetchAllProducts(locale))
      dispatch(fetchCustomers())
      dispatch(fetchCashdrawers(storeId))
      dispatch(fetchLastOrderId(storeId, storeCode))
    } else {
      dispatch(validateCashdrawers(cashdrawers, lastClosedDay))
    }
  }

  renderDisabledStore () {
    const { staff } = this.props
    return (
      <div className='hero is-large'>
        <div className='hero-body'>
          <div className='container has-text-centered'>
            {staff && staff.role === 'master'
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
      activeModalId
    } = this.props
    if (activeModalId === 'productsList') {
      // return (
      //   <ModalProductList />
      // )
    } else if (activeModalId === 'addMember') {
      return <ModalAddMember />
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
                // paddingTop: 15,
                display: 'flex',
                flexGrow: 1,
                alignItems: 'stretch',
                justifyContent: 'center',
                flexDirection: 'column'
              }}>
                {
                  this.props.activeModalId === 'productsList'
                    ? <ModalProductList /> : <PanelButtons />
                }

              </div>
            </div>
            <div className='tile is-parent is-vertical'>
              <div className='tile is-child' style={{
                // paddingTop: 15,
                display: 'flex',
                justifyContent: 'center',
                flexDirection: 'column'
              }}>
                <PanelOrderInfo />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  render () {
    const {staff, isFetching, netStat} = this.props
    return (
      <div>
        {isFetching && netStat === 'online'
          ? <section className='hero is-large'>
            <div className='hero-body'>
              <div className='container has-text-centered'>
                <i className='fa fa-spinner fa-pulse fa-5x fa-fw' />
                <h1 className='title'>
                  Loading
                </h1>
              </div>
            </div>
          </section>
          : !staff
            ? this.renderDisabledStore()
            : this.renderStore()
        }
        {this.renderStoreModals()}
      </div>
    )
  }
}

function mapStateToProps (state) {
  const isFetching = state.data.products.isFetching || state.data.customers.isFetching || state.orders.isFetching || state.data.cashdrawers.isProcessing

  return {
    intl: state.intl,
    locale: state.intl.locale,
    isFetching,
    activeModalId: state.app.mainUI.activeModalId,
    cashdrawer: state.app.mainUI.activeDrawer,
    cashdrawers: state.data.cashdrawers.cdList,
    lastClosedDay: state.data.cashdrawers.lastClosedDay,
    adminToken: state.app.mainUI.adminToken,
    shouldUpdate: state.app.mainUI.shouldUpdate,
    error: state.app.mainUI.error,
    posMode: state.app.mainUI.posMode,
    networkStatus: state.app.mainUI.networkStatus,
    storeId: state.app.mainUI.activeStore.source,
    storeCode: state.app.mainUI.activeStore.code,
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
