import React, { Component } from 'react'
import { connect } from 'react-redux'
import { injectIntl, FormattedMessage } from 'react-intl'

import SearchModal from './SearchModal'
import SearchBar from '../components/SearchBar'
import LabeledControl from '../components/LabeledControl'
import BoxItem from '../components/BoxItem'
import DetailsModal from '../components/DetailsModal'
import LoadingPane from '../components/LoadingPane'
import Account from '../containers/Account'

import {
  closeActiveModal,
  setActiveModal
} from '../actions/application'

import {
  storeOrdersSetSearchKey,
  customersSetSearchKey,
  customersSetFilter,
  customersSetActiveId,
  setSettingsActiveTab,
  verifyStorePin,
  resetSettingsState
} from '../actions/settings'

import {
  searchCustomer,
  closeAndResetUtilitytModal
} from '../actions/helpers'

class SettingsTab extends Component {
  onClickRefund () {
    const {dispatch} = this.props
    dispatch(setActiveModal('refundModal'))
  }

  onClickNoSales (value) {
    const {dispatch} = this.props
    dispatch(setActiveModal(value))
  }

  onClickReprint () {
    const {dispatch} = this.props
    dispatch(setActiveModal('reprintModal'))
  }

  onClickCloseModal () {
    const {dispatch} = this.props
    dispatch(closeActiveModal())
    dispatch(resetSettingsState())
  }

  onClickOption (tabName) {
    const {dispatch} = this.props
    dispatch(setSettingsActiveTab(tabName))
  }

  setCustomerSearchKey (value) {
    const {dispatch} = this.props
    dispatch(customersSetSearchKey(value))
  }

  setCustomerFilter (value) {
    const {dispatch} = this.props
    dispatch(customersSetFilter(value))
  }

  onSubmit (event) {
    event.preventDefault()
    const {dispatch, customerFilter, customerSearchKey} = this.props
    let query
    if (customerFilter !== '' && customerSearchKey === '') {
      query = { query: { firstName: customerFilter } }
    } else if (customerFilter !== '' && customerSearchKey !== '') {
      if (isNaN(parseInt(customerSearchKey))) {
        query = {
          query: { firstName: customerFilter, lastName: customerSearchKey }
        }
      } else {
        query = { query: { odboId: customerSearchKey } }
      }
    } else if (customerFilter === '' && customerSearchKey !== '') {
      if (isNaN(parseInt(customerSearchKey))) {
        query = { query: { lastName: customerSearchKey } }
      } else {
        query = { query: { odboId: customerSearchKey } }
      }
    }
    dispatch(searchCustomer(query))
  }

  onFocus (inputId) {
    const {dispatch} = this.props
    if (inputId === 'firstNameSearch') {
      dispatch(customersSetFilter(''))
    } else if (inputId === 'odboIdSearch') {
      // reset firstname and lastname fields if input id is 'odboIdSearch'
      document.getElementById('firstNameSearch').value = ''
      document.getElementById('lastNameSearch').value = ''
    }
    document.getElementById(inputId).value = ''
    dispatch(searchCustomer()) // refetch 1st 40 customers
  }

  renderMainTab () {
    return (
      <div>
        <div className='columns'>
          <div className='column'>
            <div className='box has-text-centered'>
              <span>
                <i className='fa fa-caret-square-o-down fa-4x' />
              </span>
              <p className='title'>
                <FormattedMessage id={'app.page.settings.noSales'} />
              </p>
              <p className='subtitle'>
                <FormattedMessage id={'app.page.settings.noSalesDesc'} />
              </p>
              <a className='button is-info'
                onClick={this.onClickNoSales.bind(this, 'verifyStorePin')}>
                <FormattedMessage id={'app.page.settings.noSales'} />
              </a>
            </div>
          </div>
          <div className='column'>
            <div className='box has-text-centered'>
              <span>
                <i className='fa fa-list-alt fa-4x' />
              </span>
              <p className='title'>
                <FormattedMessage id={'app.page.settings.refund'} />
              </p>
              <p className='subtitle'>
                <FormattedMessage id={'app.page.settings.refundDesc2'} />
              </p>
              <a className='button is-info'
                onClick={this.onClickOption.bind(this, 'orders')}>
                <FormattedMessage id={'app.page.settings.refund'} />
              </a>
            </div>
          </div>
          <div className='column'>
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
          <div className='column'>
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
        </div>
      </div>
    )
  }

  renderOrdersTab () {
    return (
      <div>
        <div className='columns'>
          <div className='column'><h1 className='title'>
            <FormattedMessage id={'app.page.settings.refund'} /></h1>
          </div>
        </div>
        <div className='columns'>
          <div className='column is-two-thirds'>
            <p className='subtitle'>
              <span>
                <FormattedMessage id={'app.page.settings.refundDesc'} />
              </span>
            </p>
            <p className='subtitle'>
              <span>
                <FormattedMessage id={'app.page.settings.refundDesc2'} />
              </span>
            </p>
          </div>
          <div className='column'>
            <center>
              <a className='button is-large'
                onClick={this.onClickRefund.bind(this)}>
                <FormattedMessage id={'app.page.settings.refundButton'} />
              </a>
            </center>
          </div>
        </div>
      </div>
    )
  }

  renderCustomersTab () {
    const {dispatch, isFetching,
           customers, customersById,
           customerSearchKey, customerFilter,
           activeCustomerId, activeModalId} = this.props

    const x = customersById[activeCustomerId]

    var intFrameHeight = window.innerHeight

    return (
      <div className='is-fullheight'>
        <div className='columns'>
          <div className='column'><h1 className='title'>
            <FormattedMessage id={'app.page.settings.customers'} /></h1>
          </div>
        </div>
        <div className='columns'>
          <div className='column is-3'
            style={{justifyContent: 'center'}}>
            <p className='subtitle'>
              <br />
              <span>
                <FormattedMessage id={'app.page.settings.customersDesc2'} />
              </span>
            </p>
          </div>
          <div className='column is-3'>
            <LabeledControl label='app.ph.searchFn'>
              <SearchBar
                id='firstNameSearch'
                size='is-medium'
                value={customerSearchKey}
                placeholder={'app.ph.keyword'}
                confirmButton={<i className='fa fa-search'></i>}
                onChange={this.setCustomerFilter.bind(this)}
                onSubmit={this.onSubmit.bind(this)}
                onFocus={this.onFocus.bind(this)}
                confirmEvent={this.onSubmit.bind(this)}
              />
            </LabeledControl>
          </div>
          <div className='column is-3'>
            <LabeledControl label='app.ph.searchLn'>
              <SearchBar
                id='lastNameSearch'
                size='is-medium'
                value={customerSearchKey}
                placeholder={'app.ph.keyword'}
                onChange={this.setCustomerSearchKey.bind(this)}
                confirmButton={<i className='fa fa-search'></i>}
                onSubmit={this.onSubmit.bind(this)}
                onFocus={this.onFocus.bind(this)}
                confirmEvent={this.onSubmit.bind(this)}
                />
            </LabeledControl>
          </div>
          <div className='column is-3'>
            <LabeledControl label='app.ph.searchCust'>
              <SearchBar
                id='odboIdSearch'
                size='is-medium'
                value={customerSearchKey}
                placeholder={'app.ph.keyword'}
                confirmButton={<i className='fa fa-search'></i>}
                onChange={this.setCustomerSearchKey.bind(this)}
                onSubmit={this.onSubmit.bind(this)}
                onFocus={this.onFocus.bind(this)}
                confirmEvent={this.onSubmit.bind(this)}
                />
            </LabeledControl>
          </div>
        </div>
        <hr />
        <div
          className='columns is-mobile is-multiline'
          style={{
            height: intFrameHeight / 2, overflowY: 'scroll', padding: 5
          }}>
            {!isFetching
              ? customers.length !== 0
                ? customers.map(function (customer, key) {
                  function view () {
                    dispatch(setActiveModal('customerDetails'))
                    dispatch(customersSetActiveId(customer.odboId))
                  }
                  let zeroes = ''
                  var i
                  for (i = customer.odboId.length; i < 7; i++) {
                    zeroes += 0
                  }
                  let stat = customer.status === 'active'
                    ? <FormattedMessage id={'app.general.active'} />
                    : <FormattedMessage id={'app.general.notActive'} />
                  return (
                    <div key={key} className='column is-half'>
                      <BoxItem
                        title={{
                          main: `${customer.firstName} ${customer.lastName}`,
                          alt: stat
                        }}
                        image={{icon: 'fa fa-user fa-4x'}}
                        button={{name: 'app.button.view', onClick: view}}>
                        <ul className='is-marginless'>
                          <li>
                            <strong>ODBO ID: </strong>
                            {`${zeroes}${customer.odboId}`}
                          </li>
                          <li>
                            <strong><FormattedMessage id={'app.general.membership'} />: </strong>
                            {customer.membership}
                          </li>
                          <li>
                            <strong><FormattedMessage id={'app.general.ob'} />: </strong>
                            {customer.odboCoins}
                          </li>
                        </ul>
                      </BoxItem>
                    </div>
                  )
                })
              : <div>
                <LoadingPane
                  headerMessage={
                    <span>
                      <FormattedMessage id='app.error.noCustResults' />
                      <strong>
                      {customerFilter === ''
                        ? ` ${customerSearchKey}`
                        : `" ${customerFilter} ${customerSearchKey} "`
                      }
                      </strong>
                    </span>
                  }
                  isFetching={isFetching}
                  paneSize='is-medium' />
              </div>
            : <LoadingPane
              headerMessage={
                <FormattedMessage id='app.page.products.loadingProd' />
              }
              paneSize='is-medium' />
            }
        </div>
        {!x
          ? null
          : <DetailsModal
            title='app.page.settings.customersDet'
            activeModalId={activeModalId}
            id='customerDetails'
            items={[
              {name: 'app.general.custName', desc: `${x.firstName} ${x.lastName}`},
              {name: 'app.general.odboId', desc: x.odboId},
              {name: 'app.general.dateJoined', desc: x.dateCreated},
              {name: 'app.general.membership', desc: x.membership},
              {name: 'app.general.memberPoints', desc: x.membershipPoints},
              {name: 'app.general.ob', desc: x.odboCoins},
              {name: 'Email', desc: x.emailAddress},
              {name: 'Phone', desc: x.phoneNumber}
            ]}
            close={this.onClickCloseModal.bind(this)} />
        }
      </div>
    )
  }

  renderAccountTab () {
    return <Account />
  }

  renderOrderSearchModal () {
    const {activeModalId, orderSearchKey,
           orderDetails, refundSuccess,
           isProcessing} = this.props
    const modalId = activeModalId === 'refundModal'
                    ? 'refundModal' : 'reprintModal'
    const type = activeModalId
    return (
      <SearchModal
        id={modalId}
        type={type}
        title='Enter Order ID'
        active={activeModalId}
        processing={isProcessing}
        displayData='details'
        details={orderDetails}
        orderSearchKey={orderSearchKey}
        modalStatus={{refund: refundSuccess}}
        search={{ id: 'searchOrder', value: orderSearchKey,
                  placeholder: 'Search Order Id',
                  onChange: storeOrdersSetSearchKey }}
        closeButton={{name: 'Close', event: closeAndResetUtilitytModal}} />
    )
  }

  onClickVerifyPin () {
    const {dispatch, storeId, activeCashier, staff} = this.props
    let query = {
      query: {
        store: storeId,
        pinCode: document.getElementById('storePinCode').value
      }
    }
    let staffName = !activeCashier ? staff : activeCashier
    dispatch(verifyStorePin(query, staffName))
  }

  renderVerifyStorePinCode () {
    const {intl, activeModalId, error, errorMessage, isProcessing} = this.props
    const active = activeModalId === 'verifyStorePin' ? 'is-active' : ''
    return (
      <div id='verifyStorePin' className={`modal ${active}`}>
        <div className='modal-background'></div>
        <div className='modal-card'>
          <header className='modal-card-head'>
            <p className='modal-card-title is-marginless has-text-centered'>
              <h1 className='title'><FormattedMessage id='app.general.storePin' /></h1>
            </p>
            <button className='delete' onClick={this.onClickCloseModal.bind(this)} />
          </header>
          <div className='modal-card-body'>
            <div className='content has-text-centered'>
              {!error
                ? null
                : <p className='subtitle'>
                  {errorMessage}
                </p>
              }
              <p className='control is-expanded'>
                <input id='storePinCode' className='input is-large' type='password'
                  placeholder={intl.formatMessage({ id: 'app.ph.storePin' })} />
              </p>
              <div className='columns'>
                <div className='column is-6 is-offset-3'>
                  {!isProcessing
                    ? <a className='button is-large is-fullwidth is-success'
                      onClick={this.onClickVerifyPin.bind(this)}>
                      <FormattedMessage id='app.button.verify' />
                    </a>
                    : <a className='button is-large is-fullwidth is-success is-disabled'>
                      <p className='has-text-centered'>
                        <i className='fa fa-spinner fa-pulse fa-fw'></i>
                      </p>
                    </a>
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  render () {
    const {activeTab} = this.props

    let visibleContent = this.renderMainTab()

    switch (activeTab) {
      case 'orders':
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
      <div className=''>
        {visibleContent}
        {this.renderOrderSearchModal()}
        {this.renderVerifyStorePinCode()}
      </div>
    )
  }
}

function mapStateToProps (state) {
  return {
    locale: state.intl.locale,
    activeModalId: state.application.activeModalId,
    staff: state.application.staff.data,
    activeCashier: state.application.activeCashier,
    storeId: state.application.storeId,
    customers: state.data.customers.customersArray,
    isFetching: state.data.customers.isFetching,
    customersById: state.data.customers.customersById,
    error: state.settings.error,
    errorMessage: state.settings.errorMessage,
    customerSearchKey: state.settings.customerSearchKey,
    customerFilter: state.settings.customerFilter,
    activeCustomerId: state.settings.activeCustomerId,
    activeTab: state.settings.activeTab,
    tabs: state.settings.tabs,
    orderDetails: state.settings.orderFromGet,
    orderSearchKey: state.settings.orderSearchKey,
    isProcessing: state.settings.isProcessing,
    refundSuccess: state.settings.refundSuccess,
    reprintSuccess: state.settings.reprintSuccess,
    intl: state.intl
  }
}

export default connect(mapStateToProps)(injectIntl(SettingsTab))
