import React, { Component } from 'react'
import { connect } from 'react-redux'
import { injectIntl } from 'react-intl'

import ModalCard from '../components/ModalCard'
import ContentDivider from '../components/ContentDivider'
import LoadingScreen from '../components/LoadingScreen'

import { closeActiveModal } from '../actions/app/mainUI'
import {
  addOrderNote,
  setActiveCustomer,
  setOverallDiscount,
  setOrderInfo,
  resetOrderData,
  recallOrder,
  removeNote
} from '../actions/data/orderData'

import {
  makeOfflineOrder,
  syncOfflineOrders
} from '../actions/data/offlineData'

import {
  createDailyData,
  updateDailyData
} from '../actions/data/cashdrawers'

import {
  customersSetFilter,
  fetchCustomerByFilter
} from '../actions/data/customers'

import {
  processOrder
} from '../actions/orders'

import {
  removeOrderOnHold
} from '../actions/ordersOnHold'

import { formatCurrency, formatDate } from '../utils/string'
import { processOdboID, processCustomers } from '../utils/computations'
import print from '../utils/printReceipt/print'

class ModalStoreUtils extends Component {
  _closeModal (event) {
    const { dispatch } = this.props
    dispatch(closeActiveModal())
  }

  _resetOrderData () {
    const { dispatch } = this.props
    dispatch(resetOrderData())
    dispatch(closeActiveModal())
  }

  _setOADisc (value) {
    const {dispatch} = this.props
    dispatch(setOverallDiscount(value > 100 ? 100 : value))
  }

  _updateCashdrawer () {
    const { dispatch, activeDrawer, activeDrawerOffline, storeId, posMode, networkStatus } = this.props
    let amount = Number(document.getElementById('drawerAmtInput').value) || 0
    if (activeDrawer) {
      dispatch(updateDailyData(activeDrawer, amount))
    } else if (!activeDrawer) {
      if (posMode === 'online' || networkStatus === 'online') {
        dispatch(createDailyData(storeId, amount))
      } else {
        dispatch(updateDailyData(activeDrawerOffline, amount, storeId))
      }
    }
  }

  _searchCustomer () {
    const { dispatch, custData } = this.props
    let { customerFilter, customerSearchKey } = custData
    dispatch(fetchCustomerByFilter(customerFilter, customerSearchKey))
  }

  _setActiveCustomer (customer) {
    const { dispatch } = this.props
    dispatch(setActiveCustomer(customer))
    dispatch(closeActiveModal())
  }

  _addNoteToOrder (e) {
    e.preventDefault()
    const { dispatch } = this.props
    let note = document.getElementById('noteInput').value
    dispatch(addOrderNote(note))
    document.getElementById('note').reset()
  }

  _setSearchCustFilters () {
    const { dispatch } = this.props
    let filter = document.getElementById('custFilter').value
    let searchKey = document.getElementById('custSearchKey').value
    dispatch(customersSetFilter(filter, searchKey))
  }

  _setOdboOrderInfo () {
    const {dispatch, orderData, mainUI} = this.props
    dispatch(setOrderInfo({orderData: orderData, appData: mainUI}))
  }

  _processOdboOrder () {
    const {dispatch, activeDrawer, orderInfo, orderReceipt, posMode} = this.props
    if (posMode === 'online') {
      dispatch(processOrder(orderInfo, orderReceipt, activeDrawer))
    } else {
      dispatch(makeOfflineOrder(orderInfo, orderReceipt, activeDrawer))
    }
  }

  _recallOrder (orderData, orderKey) {
    const { dispatch } = this.props
    dispatch(removeOrderOnHold(orderKey))
    dispatch(recallOrder(orderData))
    dispatch(closeActiveModal())
  }

  syncOrders () {
    const {dispatch, offlineOrdersData} = this.props
    let { failedOrders, processedOfflineOrders } = offlineOrdersData

    const allOfflineOrders = failedOrders.length > 0
      ? processedOfflineOrders.concat(failedOrders)
      : processedOfflineOrders
    dispatch(syncOfflineOrders(allOfflineOrders))
  }

  render () {
    const {
      dispatch,
      custData,
      activeModalId,
      overallDiscount,
      ordersOnHold,
      orderNote,
      orderReceipt,
      intl
    } = this.props

    let lblTR = (id) => { return (intl.formatMessage({id: id})).toUpperCase() }
    let bold = (txt) => { return <strong>{txt}</strong> }
    let emptyListLbl = (data, lbl) => {
      if (data.length === 0) {
        return (
          <div className='box has-text-centered'>
            <span className='icon is-large'><i className='fa fa-info-circle' /></span>
            <p className='title'>{lblTR(lbl)}</p>
          </div>
        )
      }
    }

    let isFetchingLbl = (lbl) => {
      return (
        <div className='box has-text-centered'>
          <span className='icon is-large'><i className='fa fa-spinner fa-pulse fa-fw' /></span>
          <p className='title'>{lbl ? lblTR(lbl) : 'Searching . . .'}</p>
        </div>
      )
    }

    switch (activeModalId) {
      case 'overallDiscount':
        return (
          <ModalCard closeAction={e => this._closeModal()} title={'OVERALL DISCOUNT'}>
            <div className='content columns is-mobile is-multiline has-text-centered'>
              <div className='column is-4 is-offset-4 has-text-centered'>
                <form onSubmit={e => this._closeModal()} >
                  <p className='control has-icon has-icon-right is-marginless'>
                    <input id='overallDiscountInput' className='input is-large' type='Number'
                      style={{fontSize: '2.75rem', textAlign: 'right', paddingLeft: '0em', paddingRight: '2em'}}
                      value={overallDiscount}
                      onChange={e => this._setOADisc(e.target.value)} />
                    <span className='icon' style={{fontSize: '5rem', top: '3rem', right: '4.75rem'}}>
                      <i className='fa fa-percent' />
                    </span>
                  </p>
                </form>
              </div>
            </div>
          </ModalCard>
        )
      case 'recallOrder':
        return (
          <ModalCard closeAction={e => this._closeModal()}>
            {ordersOnHold.map((order, key) => {
              return (
                <div className='box is-clearfix' key={key}>
                  <div className='media-content is-clearfix'>
                    <p className='is-pulled-left'>Order {key + 1}</p>
                    <a className='button is-pulled-right' onClick={e => this._recallOrder(order, key)}>Recall</a>
                    <ContentDivider size={6} contents={[
                      order.orderItems.map((item, key) => {
                        return (<p key={key}>{item.nameEn}</p>)
                      }),
                      <div>
                        <p>currency: {order.currency}</p>
                        <p>order total: {formatCurrency(order.total.toFixed(2))}</p>
                      </div>
                    ]} />
                  </div>
                </div>
              )
            })}
            {emptyListLbl(ordersOnHold, 'app.lbl.noOnholdOrders')}
          </ModalCard>
        )
      case 'notes':
        return (
          <ModalCard closeAction={e => this._closeModal()}>
            <form id='note' onSubmit={e => this._addNoteToOrder(e)} style={{margin: 15}}>
              <p className='control has-addons'>
                <input id='noteInput' className='input is-large is-expanded' type='text' />
                <a className='button is-large is-success'
                  onClick={e => this._addNoteToOrder(e)}>ADD NOTE</a>
              </p>
            </form>
            {orderNote.map((note, key) => {
              return (
                <div className='card'>
                  <header className='card-header'>
                    <p className='card-header-title'>{note}</p>
                    <a className='card-header-icon' onClick={e => dispatch(removeNote(key))}>
                      {lblTR('app.button.remove')}
                      <span><i className='fa fa-close fa-2x' /></span>
                    </a>
                  </header>
                </div>
              )
            })}
            {emptyListLbl(orderNote, 'app.lbl.noOrderNotes')}
          </ModalCard>
        )
      case 'processingOrder':
        return (
          <LoadingScreen loadingText={lblTR('app.ph.procOrder')} />
        )
      case 'printingReceipt':
        return (
          <LoadingScreen loadingText={lblTR('app.ph.printingRCT')} />
        )
      case 'orderSuccess':
        return (
          <ModalCard closeAction={e => this._resetOrderData()} confirmAction={this._resetOrderData.bind(this)}>
            <div className='content has-text-centered'>
              <p className='title'>Order Success</p>
              <a onClick={e => print(orderReceipt)}>Reprint Receipt</a>
            </div>
          </ModalCard>
        )
      case 'orderFailed':
        return (
          <ModalCard closeAction={e => this._closeModal()} retryAction={this._closeModal.bind(this)}>
            <div className='content has-text-centered'>
              <p className='title'>Order Failed</p>
              <p className='subtitle'>Try Again</p>
            </div>
          </ModalCard>
        )
      case 'searchCustomer':
        let { isFetching, customersArray, customerFilter, customerSearchKey, customerSearch } = custData
        let fromFetched = processCustomers(customersArray, customerFilter, customerSearchKey)
        let fromSearch = customerSearch
        let customers = fromFetched.length > 0 ? fromFetched : fromSearch
        return (
          <ModalCard closeAction={e => this._closeModal()}>
            <form id='searchCust' onSubmit={e => this._searchCustomer(e)}>
              <p className='control has-addons'>
                <span className='select is-large'>
                  <select id='custFilter'>
                    <option value='byId'>odbo ID</option>
                    <option value='byName'>First Name</option>
                    <option value='bySurName'>Last Name</option>
                    <option value='byContactNum'>phone number</option>
                  </select>
                </span>
                <input id='custSearchKey' className='input is-large is-expanded'
                  type='text' placeholder={lblTR('app.ph.keyword')}
                  value={customerSearchKey} onChange={e => this._setSearchCustFilters()} />
                <a className='button is-large is-success' onClick={e => this._searchCustomer()}>{lblTR('app.button.search')}</a>
              </p>
            </form>
            <div>
              {!isFetching
                ? customers.map((customer, key) => {
                  let {firstName, lastName, odboCoins, odboId, membership, status, dateUpdated, phoneNumber} = customer
                  return (
                    <div className='box is-clearfix' key={key}>
                      <div className='media-content is-clearfix'>
                        <p className='is-pulled-left title is-4'>
                          {bold(`[ID#${processOdboID(odboId)}] `)}
                          {`< ${firstName} ${lastName || ''} >`}
                        </p>
                        <a className='button is-success is-pulled-right'
                          onClick={e => { this._setActiveCustomer(customer) }}>
                          Add Customer
                        </a>
                        <ContentDivider contents={[
                          <div>
                            <p>{bold('membership:')} {membership}</p>
                            <p>{bold('odbo coins:')} {odboCoins || 0}</p>
                            <p>{bold('contact number:')} {phoneNumber || 'N/A'}</p>
                          </div>,
                          <div>
                            <p>{bold('status:')} {status}</p>
                            <p>{bold('last update:')} {formatDate(dateUpdated)}</p>
                          </div>
                        ]} size={6} />
                      </div>
                    </div>
                  )
                })
                : null
              }
              {isFetching
                ? isFetchingLbl()
                : emptyListLbl(customers, 'app.lbl.noCustomers')
              }
            </div>
          </ModalCard>
        )

      case 'custPincode':
        return (
          <ModalCard closeAction={e => this._closeModal()} title={'Customer Pincode'} confirmAction={e => this._processOdboOrder()}>
            <div className='content columns is-mobile is-multiline has-text-centered'>
              <div className='column is-6 is-offset-3 has-text-centered'>
                <form onSubmit={e => this._processOdboOrder()} >
                  <p className='control has-icon has-icon-right is-marginless'>
                    <input id='custCodeInput' className='input is-large' type='password' onChange={e => this._setOdboOrderInfo()}
                      style={{fontSize: '2.75rem', textAlign: 'right', paddingLeft: '0em', paddingRight: '2em'}} />
                    <span className='icon' style={{fontSize: '5rem', top: '3rem', right: '4.75rem'}}>
                      <i className='fa fa-lock' />
                    </span>
                  </p>
                </form>
              </div>
            </div>
          </ModalCard>
        )

      default:
        return null
    }
  }
}

function mapStateToProps (state) {
  let mainUI = state.app.mainUI
  let orderData = state.data.orderData
  let custData = state.data.customers
  return {
    mainUI,
    orderData,
    custData,
    customerSearchKey: custData.customerSearchKey,
    customerFilter: custData.customerFilter,
    activeModalId: mainUI.activeModalId,
    posMode: mainUI.posMode,
    networkStatus: mainUI.networkStatus,
    overallDiscount: orderData.overallDiscount,
    orderNote: orderData.orderNote,
    orderInfo: orderData.orderInfo,
    orderReceipt: orderData.receipt,
    ordersOnHold: state.ordersOnHold.items,
    offlineData: state.data.offlineData,
    storeId: state.app.mainUI.activeStore.source,
    activeDrawer: mainUI.activeDrawer,
    activeDrawerOffline: state.app.mainUI.activeDrawerOffline,
    intl: state.intl
  }
}

export default connect(mapStateToProps)(injectIntl(ModalStoreUtils))
