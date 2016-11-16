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
import Dropdown from '../components/Dropdown'

const focusOrderSearch = 'orderSearch'

import {
  closeActiveModal,
  setActiveModal
} from '../actions/application'

import { fetchCustomers } from '../actions/customers'

import {
  storeOrdersSetSearchKey,
  customersSetSearchKey,
  customersSetSearchKeyOIDFR,
  customersSetSearchKeyOIDTO,
  customersSetFilter,
  customersSetActiveId,
  customersSetContactFilter,
  setSettingsActiveTab,
  resetSettingsState,
  updateCustomerShow,
  updateCustomer
} from '../actions/settings'

import {
  searchCustomer,
  closeAndResetUtilitytModal
} from '../actions/helpers'

class SettingsTab extends Component {

  onClickRefund () {
    const {dispatch} = this.props
    dispatch(setActiveModal('refundModal', focusOrderSearch))
  }

  onClickNoSales (value) {
    const {dispatch} = this.props
    dispatch(setActiveModal(value))
  }

  onClickReprint () {
    const {dispatch} = this.props
    dispatch(setActiveModal('reprintModal', focusOrderSearch))
  }

  onClickCloseModal () {
    const {dispatch} = this.props
    dispatch(closeActiveModal())
    dispatch(resetSettingsState())
  }

  onClickOption (tabName) {
    const {dispatch} = this.props
    dispatch(setSettingsActiveTab(tabName))
    if (tabName === 'customers') {
      dispatch(fetchCustomers())
    }
  }

  setCustomerSearchKey (value) {
    const {dispatch} = this.props
    dispatch(customersSetSearchKey(value))
  }

  setCustomerSearchKeyOIDFR (value) {
    const {dispatch} = this.props
    dispatch(customersSetSearchKeyOIDFR(value))
  }

  setCustomerSearchKeyOIDTO (value) {
    const {dispatch} = this.props
    dispatch(customersSetSearchKeyOIDTO(value))
  }

  setCustomerFilter (value) {
    const {dispatch} = this.props
    dispatch(customersSetFilter(value))
  }

  setCustomerContactFilter (value) {
    const {dispatch} = this.props
    dispatch(customersSetContactFilter(value))
  }

  onSubmit (event) {
    if (event) { event.preventDefault() }
    const {
      dispatch,
      customerFilter,
      customerSearchKey,
      customerContactFilter,
      customerSearchKeyOIDFR,
      customerSearchKeyOIDTO
    } = this.props

    switch (customerFilter) {
      case 'first name':
        return dispatch(searchCustomer({ query: { firstName: { $like: `%${customerSearchKey.toUpperCase()}%` } } }))
      case 'last name':
        return dispatch(searchCustomer({ query: { lastName: { $like: `%${customerSearchKey.toUpperCase()}%` } } }))
      case 'phone number':
        return dispatch(searchCustomer({ query: { phoneNumber: { $like: `%${customerContactFilter}%` } } }))
      case 'odbo id':
        const query = { odboId: {}, $sort: { odboId: 1 } }
        if (customerSearchKeyOIDFR) { query.odboId.$gte = Number(customerSearchKeyOIDFR) }
        if (customerSearchKeyOIDTO) { query.odboId.$lte = Number(customerSearchKeyOIDTO) }

        dispatch(searchCustomer({ query }))
        break
    }
  }

  onFocus (inputId) {
    const {dispatch} = this.props

    document.getElementById('firstNameSearch').value = ''
    document.getElementById('lastNameSearch').value = ''
    document.getElementById('phoneNumberSearch').value = ''
    dispatch(customersSetSearchKey(''))
    // dispatch(searchCustomer()) // refetch 1st 40 customers
  }

  _setCustomerFilter (value) {
    const {dispatch} = this.props
    dispatch(customersSetFilter(value))
  }

  renderMainTab () {
    return (
      <div>
        <div className='columns'>
          <div className='column is-3'>
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
              <a className='button is-info'
                onClick={this.onClickNoSales.bind(this, 'verifyStorePin')}>
                <FormattedMessage id={'app.page.settings.openCashDrawer'} />
              </a>
            </div>
          </div>
          <div className='column is-3'>
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
                onClick={this.onClickOption.bind(this, 'orders')}>
                <FormattedMessage id={'app.page.settings.tabOrders'} />
              </a>
            </div>
          </div>
          <div className='column is-3'>
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
          <div className='column is-3'>
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
        <div className='columns'>
          <div className='column'><h1 className='title'>
            <FormattedMessage id={'app.general.reprint'} /></h1>
          </div>
        </div>
        <div className='columns'>
          <div className='column is-two-thirds'>
            <p className='subtitle'>
              <span>
                <FormattedMessage id={'app.page.settings.reprintDesc'} />
              </span>
            </p>
          </div>
          <div className='column'>
            <center>
              <a className='button is-large'
                onClick={this.onClickReprint.bind(this)}>
                <FormattedMessage id={'app.general.reprint'} />
              </a>
            </center>
          </div>
        </div>
      </div>
    )
  }

  onClickShowOdboControl () {
    const {dispatch, showControl} = this.props
    if (!showControl) {
      dispatch(updateCustomerShow(true))
    } else {
      dispatch(updateCustomerShow(false))
    }
  }

  updateOdboCoins (id, action, odboCoins) {
    const {dispatch} = this.props
    let inputValue = document.getElementById('newOdbo').value
    if (action === 'plus') {
      let newOdbo = Number(odboCoins) + Number(inputValue)
      dispatch(updateCustomer(id, {odboCoins: newOdbo}))
    } else {
      let newOdbo = Number(odboCoins) - Number(inputValue)
      dispatch(updateCustomer(id, {odboCoins: newOdbo < 0 ? 0 : newOdbo}))
    }
  }

  renderCustomersTab () {
    const {
      dispatch, isFetching,
      customers, customersById,
      customerSearchKey, customerFilter,
      activeCustomerId, activeModalId,
      intl, showControl,
      ucIsProcessing, ucError, customerContactFilter,
      customerSearchKeyOIDFR, customerSearchKeyOIDTO
    } = this.props

    const odboUser = customersById[activeCustomerId]
    let hideDetails = showControl
    var intFrameHeight = window.innerHeight

    let filter
    switch (customerFilter) {
      case 'first name':
        filter = `with first name: ${customerSearchKey}.`
        break
      case 'last name':
        filter = `with last name: ${customerSearchKey}.`
        break
      case 'phone number':
        filter = `with phone number: ${customerSearchKey}.`
        break
      case 'odbo id':
        filter = 'with ID'
        if (customerSearchKeyOIDFR) { filter += ` from ${customerSearchKeyOIDFR}` }
        if (customerSearchKeyOIDTO) { filter += ` to ${customerSearchKeyOIDTO}` }
        filter += '.'
        break
    }

    return (
      <div>
        <div className='columns'>
          <div className='column is-3'>
            <LabeledControl labelAlt='Filter'>
              <Dropdown
                value={customerFilter}
                size='is-medium'
                options={['odbo id', 'phone number', 'first name', 'last name']}
                onChange={this._setCustomerFilter.bind(this)} />
            </LabeledControl>
          </div>
          {customerFilter === 'odbo id'
            ? <div className='column is-3'>
              <LabeledControl label='app.ph.searchCustFr'>
                <SearchBar
                  id='odboIdSearchFr'
                  size='is-medium'
                  value={customerSearchKeyOIDFR}
                  placeholder={'app.ph.keyword'}
                  confirmButton={<i className='fa fa-search' />}
                  onChange={this.setCustomerSearchKeyOIDFR.bind(this)}
                  onSubmit={this.onSubmit.bind(this)}
                  confirmEvent={this.onSubmit.bind(this)}
                  />
              </LabeledControl>
            </div>
            : null
          }
          {customerFilter === 'odbo id'
            ? <div className='column is-3'>
              <LabeledControl label='app.ph.searchCustTo'>
                <SearchBar
                  id='odboIdSearchTo'
                  size='is-medium'
                  value={customerSearchKeyOIDTO}
                  placeholder={'app.ph.keyword'}
                  confirmButton={<i className='fa fa-search' />}
                  onChange={this.setCustomerSearchKeyOIDTO.bind(this)}
                  onSubmit={this.onSubmit.bind(this)}
                  confirmEvent={this.onSubmit.bind(this)}
                  />
              </LabeledControl>
            </div>
            : null
          }
          {customerFilter === 'first name'
            ? <div className='column is-3'>
              <LabeledControl label='app.ph.searchFn'>
                <SearchBar
                  id='firstNameSearch'
                  size='is-medium'
                  value={customerSearchKey}
                  placeholder={'app.ph.keyword'}
                  confirmButton={<i className='fa fa-search' />}
                  onChange={this.setCustomerSearchKey.bind(this)}
                  onSubmit={this.onSubmit.bind(this)}
                  onFocus={this.onFocus.bind(this)}
                  confirmEvent={this.onSubmit.bind(this)}
                />
              </LabeledControl>
            </div>
            : null
          }
          {customerFilter === 'last name'
            ? <div className='column is-3'>
              <LabeledControl label='app.ph.searchLn'>
                <SearchBar
                  id='lastNameSearch'
                  size='is-medium'
                  value={customerSearchKey}
                  placeholder={'app.ph.keyword'}
                  onChange={this.setCustomerSearchKey.bind(this)}
                  confirmButton={<i className='fa fa-search' />}
                  onSubmit={this.onSubmit.bind(this)}
                  onFocus={this.onFocus.bind(this)}
                  confirmEvent={this.onSubmit.bind(this)}
                  />
              </LabeledControl>
            </div>
            : null
          }
          {customerFilter === 'phone number'
            ? <div className='column is-3'>
              <LabeledControl label='app.ph.searchPhone'>
                <SearchBar
                  id='phoneNumberSearch'
                  size='is-medium'
                  value={customerContactFilter}
                  placeholder={'app.ph.keyword'}
                  confirmButton={<i className='fa fa-search' />}
                  onChange={this.setCustomerContactFilter.bind(this)}
                  onSubmit={this.onSubmit.bind(this)}
                  onFocus={this.onFocus.bind(this)}
                  confirmEvent={this.onSubmit.bind(this)}
                  />
              </LabeledControl>
            </div>
            : null
          }
        </div>
        <hr style={{margin: 20}} />
        <div
          className='columns is-mobile is-multiline'
          style={{
            height: intFrameHeight - 350, overflowY: 'scroll', padding: 5
          }}>
          {!isFetching
            ? customers.length !== 0
              ? customers.map(function (customer, key) {
                function view () {
                  dispatch(setActiveModal('customerDetails'))
                  dispatch(customersSetActiveId(customer.odboId))
                }
                let odboId = String(customer.odboId)
                let zeroes = ''
                for (var i = odboId.length; i < 7; i++) {
                  zeroes = zeroes + '0'
                }
                let stat = customer.status === 'active'
                  ? <span style={{color: 'green'}}><FormattedMessage id={'app.general.active'} /></span>
                  : <span style={{color: 'red'}}><FormattedMessage id={'app.general.notActive'} /></span>
                return (
                  <div key={key} className='column is-half'>
                    <BoxItem
                      title={{
                        main: `${customer.firstName} ${customer.lastName || ''}`,
                        alt: stat
                      }}
                      image={{icon: 'fa fa-user fa-4x'}}
                      button={{name: 'app.button.view', onClick: view}}>
                      <div className='columns'>
                        <div className='column'>
                          <ul className='is-marginless'>
                            <li>
                              <strong>ODBO ID: </strong>
                              {`${zeroes}${customer.odboId}`}
                            </li>
                            <li>
                              <strong><FormattedMessage id={'app.general.contactNo'} />: </strong>
                              {customer.phoneNumber}
                            </li>
                          </ul>
                        </div>
                        <div className='column'>
                          <ul className='is-marginless'>
                            <li>
                              <strong><FormattedMessage id={'app.general.membership'} />: </strong>
                              {customer.membership}
                            </li>
                            <li>
                              <strong><FormattedMessage id={'app.general.ob'} />: </strong>
                              {customer.odboCoins}
                            </li>
                          </ul>
                        </div>
                      </div>
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
                        : `${filter}`
                      }
                    </strong>
                  </span>
                }
                isFetching={isFetching}
                paneSize='is-medium' />
            </div>
          : <LoadingPane
            headerMessage={
              <FormattedMessage id='app.page.products.loadingCust' />
            }
            paneSize='is-medium' />
          }
        </div>
        {!odboUser
          ? null
          : <DetailsModal
            title='app.page.settings.customersDet'
            activeModalId={activeModalId}
            id='customerDetails'
            items={[
              {name: 'app.general.custName', desc: `${odboUser.firstName} ${odboUser.lastName}`},
              {name: 'app.general.odboId', desc: odboUser.odboId},
              {name: 'app.general.dateJoined'},
              {desc: `Date: ${intl.formatDate(odboUser.dateCreated)}`},
              {desc: `Time: ${intl.formatTime(odboUser.dateCreated)}`},
              {name: 'app.general.membership', desc: odboUser.membership},
              {name: 'app.general.memberPoints', desc: odboUser.membershipPoints},
              {name: 'app.general.ob', desc: odboUser.odboCoins},
              {name: 'app.general.email', desc: odboUser.emailAddress},
              {name: 'app.general.contactNo', desc: odboUser.phoneNumber}
            ]}
            hideDetails={hideDetails}
            onClick={this.onClickShowOdboControl.bind(this)}
            close={this.onClickCloseModal.bind(this)}>
            <div>
              {!showControl
                ? null
                : <div>
                  {!ucError
                    ? null
                    : <p className='subtitle has-text-centered'>
                      {ucError}
                    </p>
                  }
                  <div className='control is-expanded'>
                    <form autoComplete={false}>
                      <input id='newOdbo' className='input is-large' type='number'
                        placeholder={intl.formatMessage({ id: 'app.ph.enterNewVal' })} />
                    </form>
                  </div>
                  <div>
                    {!ucIsProcessing
                      ? <div className='columns'>
                        <div className='column is-4'>
                          <a className='button is-large is-fullwidth is-success'
                            onClick={this.updateOdboCoins.bind(this, odboUser.id, 'plus', odboUser.odboCoins)}>
                            <FormattedMessage id='app.general.increaseOdbo' />
                          </a>
                        </div>
                        <div className='column is-4'>
                          <a className='button is-large is-fullwidth is-warning'
                            onClick={this.updateOdboCoins.bind(this, odboUser.id, 'minus', odboUser.odboCoins)}>
                            <FormattedMessage id='app.general.decreaseOdbo' />
                          </a>
                        </div>
                        <div className='column is-4'>
                          <a className='button is-large is-fullwidth is-danger'
                            onClick={this.onClickShowOdboControl.bind(this)}>
                            <FormattedMessage id='app.button.cancel' />
                          </a>
                        </div>
                      </div>
                      : <div className='column is-fullwidth'>
                        <p className='has-text-centered'>
                          <i className='fa fa-spinner fa-pulse fa-fw' />
                        </p>
                      </div>
                    }
                  </div>
                </div>
              }
            </div>
          </DetailsModal>
        }
      </div>
    )
  }

  renderAccountTab () {
    return <Account />
  }

  renderOrderSearchModal () {
    const {activeModalId, orderSearchKey, intl,
           orderDetails, refundSuccess, locale, storeId,
           isProcessing, storeDetails, reprintSuccess} = this.props
    const modalId = activeModalId === 'refundModal'
                    ? 'refundModal' : 'reprintModal'
    const type = activeModalId

    if (orderDetails) {
      const {currency, id, dateOrdered, items, payments, users, remarks, subtotal, total, vouchers} = orderDetails
      let storeAddress = !storeDetails.storeAddress
        ? [
          'The ODBO',
          '200 Victoria Street',
          'Bugis Junction #02-22',
          'SINGAPORE',
          'Telephone : 6238 1337'
        ]
        : [storeDetails.name, storeDetails.storeAddress]

      let processedPayments = []
      let cashChange
      payments.forEach(function (payment) {
        if (currency === 'sgd') {
          if (payment.amount || payment.amount > 0) {
            if (payment.type !== 'odbo' && payment.type !== 'voucher') {
              payment.amount = Number(payment.amount)
              if (payment.type === 'cash') { payment.cash = Number(payment.cash) }
              cashChange = Number(payment.cash) - Number(payment.amount)
              processedPayments.push(payment)
            }
          }
        } else {
          if (payment.amount || payment.amount > 0) {
            if (payment.type === 'odbo') {
              payment.amount = Number(payment.amount)
              processedPayments.push(payment)
            }
          }
        }
      })

      let processedItems = []
      items.forEach(item => {
        let itemQty = Number(item.quantity)
        let discountPercent = item.product.isDiscounted
          ? currency === 'sgd'
            ? `${item.product.priceDiscount}%`
            : `${item.product.odboPriceDiscount}%`
          : ''
        let showDiscount = item.product.isDiscounted
          ? locale === 'en'
            ? `(less ${discountPercent})`
            : `(减去 ${discountPercent})`
          : ''
        let discount = item.product.isDiscounted
          ? currency === 'sgd'
            ? (Number(item.product.priceDiscount) / 100) * item.product.price
            : (parseInt(item.product.odboPriceDiscount) / 100) * item.product.odboPrice
          : 0.00
        let computedDiscount = currency === 'sgd'
          ? Number(item.product.price) - discount
          : Number(item.product.odboPrice) - Math.round(discount)
        processedItems.push({
          id: item.product.id,
          name: `${item.product.nameEn.substring(0, 18)}...\n
            #${item.product.barcodeInfo || ''}\n
            ${showDiscount}`,
          qty: itemQty,
          subtotal: currency === 'sgd'
            ? Number(itemQty * computedDiscount.toFixed(2))
            : itemQty * computedDiscount
        })
      })

      var receipt = {
        info: {
          orderId: id,
          date: dateOrdered
        },
        items: processedItems,
        trans: {
          type: undefined,
          payments: processedPayments,
          activeCustomer: users,
          computations: {
            total: total,
            subtotal: subtotal,
            cashChange: cashChange,
            remainingOdbo: currency === 'odbo' ? Number(users.odboCoins) : null,
            paymentTotal: total
          },
          vouchers: vouchers || [],
          orderNote: remarks,
          currency: currency,
          previousOdbo: users
            ? currency === 'odbo'
              ? Number(users.odboCoins) + Number(total)
              : Number(users.odboCoins) - Number(total)
            : undefined,
          points: users ? Number(total) : undefined,
          newOdbo: users ? Number(users.odboCoins) + Number(total) : undefined
        },
        headerText: storeAddress,
        footerText: ['']
      }
    }

    return (
      <SearchModal
        id={modalId}
        inputPh={intl.formatMessage({ id: 'app.ph.enterRefundRemarks' })}
        type={type}
        locale={locale}
        storeId={storeId}
        storeDetails={storeDetails}
        title='Enter Order ID'
        active={activeModalId}
        processing={isProcessing}
        displayData='details'
        details={!orderDetails ? undefined : receipt}
        orderSearchKey={orderSearchKey}
        modalStatus={{refund: refundSuccess, reprintSuccess}}
        search={{ id: 'searchOrder', value: orderSearchKey, placeholder: 'Search Order Id', onChange: storeOrdersSetSearchKey }}
        closeButton={{name: 'Close', event: closeAndResetUtilitytModal}} />
    )
  }

  openCashdrawerModal () {
    const {dispatch} = this.props
    dispatch(setActiveModal('updateCashDrawer'))
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
      <div className='is-fullheight'>
        {visibleContent}
        {this.renderOrderSearchModal()}
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
    storeDetails: state.application.store,
    storeId: state.application.storeId,
    customers: state.data.customers.customersArray,
    isFetching: state.data.customers.isFetching,
    customersById: state.data.customers.customersById,
    error: state.settings.error,
    showControl: state.settings.customer.showControl,
    ucSuccess: state.settings.customer.updateSuccess,
    ucIsProcessing: state.settings.customer.isProcessing,
    ucError: state.settings.customer.error,
    errorMessage: state.settings.errorMessage,
    customerSearchKey: state.settings.customerSearchKey,
    customerSearchKeyOIDFR: state.settings.customerSearchKeyOIDFR,
    customerSearchKeyOIDTO: state.settings.customerSearchKeyOIDTO,
    customerFilter: state.settings.customerFilter,
    customerContactFilter: state.settings.customerContactFilter,
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
