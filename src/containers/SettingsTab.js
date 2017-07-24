import React, { Component } from 'react'
import { connect } from 'react-redux'
import { injectIntl, FormattedMessage } from 'react-intl'

import Account from '../containers/Account'
import ContentDivider from '../components/ContentDivider'
import CustomerList from '../components/CustomerList'

import {
  closeActiveModal,
  setActiveModal
} from '../actions/app/mainUI'

import {
  setActiveOrderDetails,
  setSettingsActiveTab,
  storeOrderFetch,
  storeOrdersSetSearchKey,
  setActiveCustomer
} from '../actions/settings'

import {
  storeOrderFetchOffline
} from '../actions/data/offlineData'

import {
  customersSetFilter,
  fetchCustomerByFilter
} from '../actions/data/customers'

import { formatOrderId } from '../utils/computations'
import { formatCurrency, formatNumber } from '../utils/string'

class SettingsTab extends Component {
  componentDidMount () {
    const { dispatch } = this.props
    dispatch(closeActiveModal())
  }

  onClickOption (tabName) {
    const {dispatch} = this.props
    dispatch(setSettingsActiveTab(tabName))
  }

  renderEmptyListLbl (lbl, isFetching) {
    return (
      <div className='has-text-centered' style={{padding: 50}}>
        <span className='icon is-large'>
          {isFetching
            ? <i className='fa fa-spinner fa-pulse fa-fw' />
            : <i className='fa fa-info-circle' />
          }
        </span>
        {isFetching
          ? <p className='title'>{'Fetching Data. . .'}</p>
          : <p className='title'>{lbl}</p>
        }
      </div>
    )
  }

  _searchOrder (e) {
    e.preventDefault()
    const {dispatch, settings, mainUI, posMode} = this.props
    let query = {
      id: settings.orderSearchKey,
      refundId: settings.orderSearchKey,
      storeId: mainUI.activeStore.source
    }

    if (posMode === 'offline') {
      dispatch(storeOrderFetchOffline(query))
    } else {
      dispatch(storeOrderFetch(query))
    }
  }

  _setOrderSearchKey (key) {
    const { dispatch, mainUI } = this.props
    let original = key
    let initial = key.replace(/[^\w\s]/gi, '') // removes any special character
    let searchKey = formatOrderId(mainUI.activeStore.code, formatNumber(initial))
    dispatch(storeOrdersSetSearchKey(searchKey, original))
  }

  _openOrderDetails (order) {
    const {dispatch} = this.props
    dispatch(setActiveOrderDetails(order))
    dispatch(setActiveModal('orderDetails'))
  }

  _setSearchCustFilters () {
    const { dispatch } = this.props
    let filter = document.getElementById('custFilter').value
    let searchKey = document.getElementById('custSearchKey').value
    if (searchKey) {
      searchKey = searchKey.toUpperCase()
      document.getElementById('custSearchKey').value = searchKey
    }
    dispatch(customersSetFilter(filter, searchKey))
  }

  _searchCustomer () {
    const { dispatch, custData } = this.props
    let { customerFilter, customerSearchKey } = custData
    dispatch(fetchCustomerByFilter(customerFilter, customerSearchKey))
  }

  _setActiveCustomer (customer) {
    const { dispatch } = this.props
    dispatch(setActiveModal('customerDetails'))
    dispatch(setActiveCustomer(customer))
  }

  renderMainTab (props) {
    const {posMode} = props
    return (
      <div>
        <div className='columns is-multiline is-mobile is-fullwidth'>
          <div className='column is-4'>
            <div className='box has-text-centered'>
              <span>
                <i className='fa fa-caret-square-o-down fa-4x' />
              </span>
              <p className='title'>
                <FormattedMessage id={'app.page.settings.openCashDrawer'} />
              </p>
              <p className='subtitle'>
                <FormattedMessage id={'app.page.settings.openCashDrawerDesc'} />
              </p>
              <a className='button is-info'>
                <FormattedMessage id={'app.page.settings.openCashDrawer'} />
              </a>
            </div>
          </div>
          <div className='column is-4'>
            <div className='box has-text-centered'>
              <span>
                <i className='fa fa-list-alt fa-4x' />
              </span>
              <p className='title'>
                <FormattedMessage id={'app.page.settings.tabOrders'} />
              </p>
              <p className='subtitle'>
                <FormattedMessage id={'app.page.settings.ordersDesc'} />
              </p>
              <a className='button is-info'
                onClick={this.onClickOption.bind(this, 'orderSearch')}>
                <FormattedMessage id={'app.page.settings.tabOrders'} />
              </a>
            </div>
          </div>
          {
            posMode !== 'offline' &&
            <div className='column is-4'>
              <div className='box has-text-centered'>
                <span>
                  <i className='fa fa-users fa-4x' />
                </span>
                <p className='title'>
                  <FormattedMessage id={'app.page.settings.customers'} />
                </p>
                <p className='subtitle'>
                  <FormattedMessage id={'app.page.settings.customersDesc'} />
                </p>
                <a className='button is-info'
                  onClick={this.onClickOption.bind(this, 'customers')}>
                  <FormattedMessage id={'app.page.settings.customers'} />
                </a>
              </div>
            </div>
          }
          {
            posMode !== 'offline' &&
            <div className='column is-4'>
              <div className='box has-text-centered'>
                <span>
                  <i className='fa fa-user fa-4x' />
                </span>
                <p className='title'>
                  <FormattedMessage id={'app.page.settings.account'} />
                </p>
                <p className='subtitle'>
                  <FormattedMessage id={'app.page.settings.accountDesc'} />
                </p>
                <a className='button is-info'
                  onClick={this.onClickOption.bind(this, 'account')}>
                  <FormattedMessage id={'app.page.settings.account'} />
                </a>
              </div>
            </div>
          }
        </div>
      </div>
    )
  }

  renderOrdersTab () {
    const { intl, settings, printedReceipts } = this.props
    let {isProcessing, searchedOrders} = settings
    let title = settings.activeTab === 'orderSearch' ? 'Search Order' : 'Cached Orders'
    let ordersData = settings.activeTab === 'orderSearch' ? searchedOrders : printedReceipts
    let lblAC = (id) => { return (intl.formatMessage({id: id})).toUpperCase() }

    let orderCPNT = (key, data) => {
      let currency = data.currency || data.paymentInfo.currency
      let total = data.total || data.paymentInfo.orderTotal
      if (data.duplicate) {
        total = total * -1
      }
      return (
        <div className='box' key={key}>
          <ContentDivider contents={[
            <p className='title'>{data.duplicate ? data.refundId : data.id || data.extraInfo.id}</p>,
            <p className='title is-5'>{`${lblAC('app.modal.currency')}: ${currency}`}</p>,
            <p className='title is-5'>{`${lblAC('app.lbl.orderTotal')}: ${formatCurrency(total, currency)}`}</p>,
            <a className='button is-medium is-info is-pulled-right' onClick={e => this._openOrderDetails(data)}>View Details</a>
          ]} size={3} />
        </div>
      )
    }
    return (
      <div className='card'>
        <div className='card-header' style={{padding: 10}}>
          <ContentDivider contents={[
            <p className='title is-2'>{title}</p>,
            <form id='orderSearch' onSubmit={e => this._searchOrder(e)}>
              <p className='control has-addons'>
                <input className='input is-large is-expanded' type='text' placeholder={lblAC('app.ph.keyword')}
                  onChange={e => this._setOrderSearchKey(e.target.value)} />
                {settings.activeTab === 'orderSearch' && <a className='button is-large is-success' onClick={e => this._searchOrder(e)}>Search</a>}
              </p>
            </form>
          ]} size={6} />
        </div>
        <div className='card-content'>
          {ordersData && ordersData.length > 0 && !isProcessing
            ? ordersData.map((order, key) => { return orderCPNT(key, order) })
            : this.renderEmptyListLbl('no results', isProcessing)
          }
        </div>
      </div>
    )
  }

  renderCustomersTab () {
    const { intl } = this.props
    let lblTR = (id) => { return (intl.formatMessage({id: id})).toUpperCase() }

    return (
      <CustomerList customerButtonText={lblTR('app.button.adjustPts')} onClickCustomerButton={this._setActiveCustomer.bind(this)} />
    )
  }

  renderAccountTab () {
    return <Account />
  }

  openCashdrawerModal () {
    const {dispatch} = this.props
    dispatch(setActiveModal('updateCashDrawer'))
  }

  render () {
    const { settings } = this.props
    const {activeTab} = settings

    let visibleContent = this.renderMainTab(this.props)

    switch (activeTab) {
      case 'orderSearch':
        visibleContent = this.renderOrdersTab()
        break
      case 'ordersCached':
        visibleContent = this.renderOrdersTab()
        break
      case 'customers':
        visibleContent = this.renderCustomersTab()
        break
      case 'account':
        visibleContent = this.renderAccountTab()
        break
    }

    return (
      <div className='is-fullheight'>
        {visibleContent}
      </div>
    )
  }
}

function mapStateToProps (state) {
  const mainUI = state.app.mainUI
  const settings = state.settings
  const custData = state.data.customers
  return {
    custData,
    mainUI,
    settings,
    printedReceipts: state.data.offlineData.printedReceipts,
    locale: state.intl.locale,
    posMode: state.app.mainUI.posMode,
    intl: state.intl
  }
}

export default connect(mapStateToProps)(injectIntl(SettingsTab))
