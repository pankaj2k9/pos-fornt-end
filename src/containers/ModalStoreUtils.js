import React, { Component } from 'react'
import { connect } from 'react-redux'
import { injectIntl } from 'react-intl'

import ModalCard from '../components/ModalCard'
import ContentDivider from '../components/ContentDivider'
import LoadingScreen from '../components/LoadingScreen'
import SyncModal from '../components/SyncModal'

import { closeActiveModal } from '../actions/app/mainUI'
import {
  setActiveCustomer,
  setOverallDiscount
} from '../actions/data/orderData'

import {
  syncOfflineOrders
} from '../actions/data/offlineOrders'

import {
  createDailyData,
  updateDailyData
} from '../actions/data/cashdrawers'

import {
  customersSetFilter
} from '../actions/data/customers'

import { formatCurrency, formatDate } from '../utils/string'
import { processOdboID, processCustomers } from '../utils/computations'

class ModalStoreUtils extends Component {
  _closeModal (event) {
    const { dispatch } = this.props
    dispatch(closeActiveModal())
  }

  _setOADisc (value) {
    const {dispatch} = this.props
    dispatch(setOverallDiscount(value > 100 ? 100 : value))
  }

  _updateCashdrawer () {
    const { dispatch, activeDrawer, activeDrawerOffline, storeId, posMode, networkStatus } = this.props
    let amount = Number(document.getElementById('drawerAmtInput').value) || 0
    if (activeDrawer && activeDrawer.float === 0) {
      dispatch(updateDailyData(activeDrawer, amount))
    } else if (!activeDrawer) {
      if (posMode === 'online' || networkStatus === 'online') {
        dispatch(createDailyData(storeId, amount))
      } else {
        dispatch(updateDailyData(activeDrawerOffline, amount, storeId))
      }
    }
  }

  _setActiveCustomer (customer) {
    const { dispatch } = this.props
    dispatch(setActiveCustomer(customer))
    dispatch(closeActiveModal())
  }

  _setSearchCustFilters () {
    const { dispatch } = this.props
    let filter = document.getElementById('custFilter').value
    let searchKey = document.getElementById('custSearchKey').value
    dispatch(customersSetFilter(filter, searchKey))
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
      custData,
      activeModalId,
      overallDiscount,
      ordersOnHold,
      orderNote,
      offlineOrdersData,
      intl
    } = this.props

    let lblTR = (id) => { return (intl.formatMessage({id: id})).toUpperCase() }
    let bold = (txt) => { return <strong>{txt}</strong> }

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
                    <a className='button is-pulled-right'>Recall</a>
                    <ContentDivider size={6} contents={[
                      order.orderItems.map((item, key) => {
                        return (
                          <p key={key}>{item.nameEn}</p>
                        )
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
          </ModalCard>
        )
      case 'notes':
        return (
          <ModalCard closeAction={e => this._closeModal()}>
            {orderNote.length > 0
              ? orderNote.map((note, key) => {
                return (
                  <div className='card'>
                    <header className='card-header'>
                      <p className='card-header-title'>{note}</p>
                      <a className='card-header-icon'>
                        remove
                        <span><i className='fa fa-close' /></span>
                      </a>
                    </header>
                  </div>
                )
              })
              : <div>
                NO NOTES
              </div>
            }
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
          <ModalCard closeAction={e => this._closeModal()} confirmAction={this._closeModal.bind(this)}>
            <div className='content has-text-centered'>
              <p className='title'>Order Success</p>
              <a>Reprint Receipt</a>
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
        let { customersArray, customerFilter, customerSearchKey } = custData
        let customers = processCustomers(customersArray, customerFilter, customerSearchKey)
        return (
          <ModalCard closeAction={e => this._closeModal()}>
            <p className='control has-addons'>
              <span className='select is-large'>
                <select id='custFilter' onChange={e => {}}>
                  <option value='byId'>odbo ID</option>
                  <option value='byName'>First Name</option>
                  <option value='bySurName'>Last Name</option>
                  <option value='byContactNum'>phone number</option>
                </select>
              </span>
              <input id='custSearchKey' className='input is-large is-expanded' type='text' placeholder={lblTR('app.ph.keyword')} onChange={e => this._setSearchCustFilters()} />
              <a className='button is-large is-success' onClick={e => this._setSearchCustFilters()}>{lblTR('app.button.search')}</a>
            </p>
            <div>
              {customers.map((customer, key) => {
                let {firstName, lastName, odboCoins, odboId, membership, status, dateUpdated} = customer
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
                        </div>,
                        <div>
                          <p>{bold('status:')} {status}</p>
                          <p>{bold('last update:')} {formatDate(dateUpdated)}</p>
                        </div>
                      ]} size={6} />
                    </div>
                  </div>
                )
              })}
            </div>
          </ModalCard>
        )
      case 'syncModal':
        let { syncIsProcessing, syncSuccess, failedOrders, processedOfflineOrders, successOrders } = offlineOrdersData

        return (
          <SyncModal
            isProcessing={syncIsProcessing}
            syncSuccess={syncSuccess}
            failedOrders={failedOrders}
            offlineOrders={processedOfflineOrders}
            successOrders={successOrders}
            onSync={this.syncOrders.bind(this)}
            onClose={this._closeModal.bind(this)} />
        )
      case 'updateCashdrawer':
        return (
          <ModalCard closeAction={this._closeModal.bind(this)} title={'Update Cashdrawer'} confirmAction={this._updateCashdrawer.bind(this)}>
            <div className='content columns is-mobile is-multiline has-text-centered'>
              <div className='column is-4 is-offset-4 has-text-centered'>
                <form onSubmit={this._closeModal.bind(this)} >
                  <p className='control has-icon has-icon-right is-marginless'>
                    <input id='drawerAmtInput' className='input is-large' type='Number'
                      style={{fontSize: '2.75rem', textAlign: 'right', paddingLeft: '0em', paddingRight: '1.5em'}}
                      value={overallDiscount} />
                    <span className='icon' style={{fontSize: '5rem', top: '3rem', right: '3rem'}}>
                      <i className='fa fa-usd' />
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
    custData,
    customerSearchKey: custData.customerSearchKey,
    customerFilter: custData.customerFilter,
    activeModalId: mainUI.activeModalId,
    posMode: mainUI.posMode,
    networkStatus: mainUI.networkStatus,
    overallDiscount: orderData.overallDiscount,
    orderNote: orderData.orderNote,
    orderInfo: orderData.orderInfo,
    ordersOnHold: state.ordersOnHold.items,
    offlineOrdersData: state.data.offlineOrders,
    storeId: state.app.mainUI.activeStore.source,
    activeDrawer: state.app.mainUI.activeDrawer,
    activeDrawerOffline: state.app.mainUI.activeDrawerOffline,
    intl: state.intl
  }
}

export default connect(mapStateToProps)(injectIntl(ModalStoreUtils))
