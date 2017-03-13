import React, { Component } from 'react'
import { connect } from 'react-redux'
import { injectIntl } from 'react-intl'
import moment from 'moment'

import LoadingScreen from '../components/LoadingScreen'

import {
  createDailyData,
  updateDailyData
} from '../actions/data/cashdrawers'

import {
  syncOfflineOrders
} from '../actions/data/offlineData'

import ModalCard from '../components/ModalCard'
import ContentDivider from '../components/ContentDivider'

import {
  setCashierLoggedIn,
  setActiveModal,
  closeActiveModal
} from '../actions/app/mainUI'

import {
  updateCustomer
} from '../actions/settings'

import { refund } from '../actions/refund'

import { formatCurrency } from '../utils/string'
import {
  processOrderSearchReceipt,
  processStoreAddress,
  processOrdID,
  processOdboID
} from '../utils/computations'

import print from '../utils/printReceipt/print'

class ModalApp extends Component {
  _closeModal () {
    const { dispatch } = this.props
    dispatch(closeActiveModal())
  }

  _activeCashier () {
    const { intl, mainUI } = this.props
    let active = mainUI.activeCashier === null
      ? intl.formatMessage({id: 'app.general.chooseUser'})
      : intl.formatMessage({id: 'app.ph.youChoose'}) + mainUI.activeCashier.username
    return active
  }

  _updateCashdrawer () {
    const { dispatch, mainUI } = this.props
    let { activeDrawer, activeDrawerOffline, activeStore, posMode, networkStatus } = mainUI
    let amount = Number(document.getElementById('drawerAmtInput').value) || 0
    if (activeDrawer) {
      dispatch(updateDailyData(activeDrawer, amount))
    } else if (!activeDrawer) {
      if (posMode === 'online' || networkStatus === 'online') {
        dispatch(createDailyData(activeStore.source, amount))
      } else {
        dispatch(updateDailyData(activeDrawerOffline, amount, activeStore.source))
      }
    }
  }

  _adjustCustPoints (customer, option) {
    const { dispatch } = this.props
    let { id, odboCoins } = customer
    let amount = Number(document.getElementById('adjPoints').value)
    let coins = option === 'add' ? odboCoins + amount : odboCoins - amount
    let updatedData = { odboCoins: coins }
    dispatch(updateCustomer(Number(id), updatedData))
  }

  _reprint () {
    const { activeOD, mainUI } = this.props
    if (!activeOD.storeAddress) {
      let storeAddress = processStoreAddress(mainUI.activeStore)
      let receipt = processOrderSearchReceipt('reprint', activeOD, storeAddress)
      print(receipt)
    } else {
      print(activeOD)
    }
  }

  _refund () {
    const { dispatch, activeOD, mainUI, currentPath } = this.props
    let remark = document.getElementById('refundRemark').value
    let refundId = processOrdID(mainUI.activeStore.code, mainUI.activeStore.lastId)
    let refundData = {id: activeOD.id || activeOD.extraInfo.id, refundRemarks: remark, refundId: refundId}
    dispatch(setActiveModal('orderDetails'))
    dispatch(refund(refundData, mainUI.activeStore, activeOD, currentPath))
  }

  _syncOrders () {
    const {dispatch, offlineData} = this.props
    let { failedOrders, offlineOrders } = offlineData

    const allOfflineOrders = failedOrders.length > 0
      ? offlineOrders.concat(failedOrders)
      : offlineOrders
    dispatch(syncOfflineOrders(allOfflineOrders))
  }

  renderEmptyListLbl (lbl, isProcessing) {
    return (
      isProcessing
        ? <div className='has-text-centered' style={{padding: 50}}>
          <span className='icon is-large'><i className='fa fa-spinner fa-pulse fa-fw' /></span>
          <p className='title'>{lbl}</p>
        </div>
        : null
    )
  }

  render () {
    const { intl, dispatch, mainUI, offlineData, activeOD, settings, isProcessing } = this.props
    let { activeModalId, activeStaff } = mainUI

    let lblTR = (id) => { return (intl.formatMessage({id: id})).toUpperCase() }

    switch (activeModalId) {
      case 'settingsIsProcessing':
        return (
          <LoadingScreen loadingText={'ADJUSTING POINTS . . . '} />
        )
      case 'chooseUser':
        let staffs = activeStaff.staffs
        let changeUser = (staffId) => {
          staffs.forEach(staff => {
            if (staff.id === staffId) {
              dispatch(setCashierLoggedIn(staff))
              dispatch(closeActiveModal())
            }
          })
        }
        return (
          <ModalCard title='app.button.logCashier' closeAction={e => this._closeModal(e)}>
            <div className='control is-horizontal'>
              <div className='control'>
                <span className='select is-large is-fullwidth'>
                  <select
                    onChange={e => changeUser(e.target.value)}
                    value={this._activeCashier()}
                    style={{backgroundColor: 'rgba(255,255,255,0.0)'}}>
                    <option>{this._activeCashier()}</option>
                    {staffs.map(function (cashier, key) {
                      return (
                        <option key={key} value={cashier.id}>
                          {cashier.username}
                        </option>
                      )
                    }, this)
                    }
                  </select>
                </span>
              </div>
            </div>
          </ModalCard>
        )
      case 'updateCashdrawer':
        return (
          <ModalCard closeAction={e => this._closeModal()} title={'Update Cashdrawer'} confirmAction={e => this._updateCashdrawer()}>
            <div className='content columns is-mobile is-multiline has-text-centered'>
              <div className='column is-4 is-offset-4 has-text-centered'>
                <form onSubmit={e => this._updateCashdrawer()} >
                  <p className='control has-icon has-icon-right is-marginless'>
                    <input id='drawerAmtInput' className='input is-large' type='Number'
                      style={{fontSize: '2.75rem', textAlign: 'right', paddingLeft: '0em', paddingRight: '1.5em'}} />
                    <span className='icon' style={{fontSize: '5rem', top: '3rem', right: '3rem'}}>
                      <i className='fa fa-usd' />
                    </span>
                  </p>
                </form>
              </div>
            </div>
          </ModalCard>
        )
      case 'syncModal':
        let { offlineOrders, failedOrders, offlineDrawers, failedDrawers } = offlineData
        let haveDatatoSync = offlineOrders.length > 0 || failedOrders.length > 0 || offlineDrawers.length > 0 || failedDrawers.length > 0
        let container = (type, data, icon, lbl) => {
          return (
            data.length > 0
            ? <div className='box' style={{margin: 10}}>
              <article className='media'>
                <div className='media-left'><span className='icon is-large'><i className={`fa fa-${icon}`} /></span></div>
                <div className='media-content'>
                  <div className='content'>
                    <p className='subtitle'><strong>{data.length}</strong> {lblTR(`app.lbl.${lbl}`)}</p>
                    <p>{type === 'orders' ? lblTR('app.lbl.offlineOrders') : lblTR('app.lbl.cashdrawerData')}</p>
                  </div>
                </div>
              </article>
            </div>
            : null
          )
        }
        return (
          <ModalCard closeAction={e => this._closeModal()} title={lblTR('app.button.syncData')}>
            {haveDatatoSync
              ? <div className='has-text-centered'>
                <ContentDivider contents={[
                  container('orders', offlineOrders, 'list-alt', 'notSynced'),
                  container('orders', failedOrders, 'close', 'syncFailed'),
                  container('drawer', offlineDrawers, 'upload', 'notSynced'),
                  container('drawer', failedDrawers, 'close', 'syncFailed')
                ]} size={6} />
                <a className={`button is-large is-success ${isProcessing ? 'is-outlined' : ''}`} onClick={e => this._syncOrders()}>
                  <span className='icon is-large'><i className={`fa fa-refresh ${isProcessing ? 'fa-spin fa-3x' : 'fa-2x'}`} /></span>
                  <span>{isProcessing ? lblTR('app.lbl.syncing') : lblTR('app.button.syncOrders')}</span>
                </a>
              </div>
              : <p className='title has-text-centered'>{lblTR('app.lbl.noDataToSync')}</p>
            }
          </ModalCard>
        )
      case 'refundRemark':
        let hideCpnt = settings.isProcessing
        return (
          <ModalCard
            closeAction={e => dispatch(setActiveModal('orderDetails'))}
            confirmAction={!hideCpnt ? e => this._refund() : null} cancelAction={!hideCpnt ? e => dispatch(setActiveModal('orderDetails')) : null}>
            {!hideCpnt
              ? <div className='content has-text-centered'>
                <h1 className='title'>Refund Remarks</h1>
                <p className='subtitle'>Reason of refund</p>
                <input id='refundRemark' className='input is-medium' />
              </div>
              : this.renderEmptyListLbl('refund is processing', hideCpnt)
            }
          </ModalCard>
        )
      case 'customerDetails':
        let { activeCustomer, updateSuccess, error } = settings
        let { id, firstName, lastName, odboCoins, membershipPoints, membership,
              phoneNumber, emailAddress, dateCreated, dateUpdated, status } = activeCustomer
        let successStr = (str) => <strong style={{color: updateSuccess ? 'limeGreen' : 'black'}}>{str}</strong>
        return (
          <ModalCard closeAction={e => this._closeModal()}>
            <div className='content'>
              <h1 className='title'>{`ID#${processOdboID(id)}`}</h1>
              <p className='subtitle'>{`date joined: ${moment(dateCreated).format('LLLL')}`}</p>
            </div>
            <ContentDivider contents={[
              <p>
                {`Status: ${status}`}<br />{`First name: ${firstName}`}<br />{`Last name: ${lastName || 'N/A'}`}<br />
                {`contact: ${phoneNumber}`}<br />{`email: ${emailAddress}`}
              </p>,
              <p>
                {`Membership: ${membership}`}<br />{`Member Points: `}{successStr(membershipPoints)}<br />
                {`The odbo coins: `}{successStr(odboCoins)}<br />
                {`date of last update:`}<br />{successStr(moment(dateUpdated).format('LLLL'))}
              </p> ]} size={6} />
            <hr />
            {!isProcessing
              ? <div className='content has-text-centered'>
                <h1 className='title'>{lblTR('app.button.adjustPts')}</h1>
                {!error && updateSuccess
                  ? <p className='subtitle' style={{color: 'limeGreen'}}>{`Successfully adjusted customer points`}</p>
                  : error && <p className='subtitle' style={{color: 'red'}}>{`Error: ${error}`}</p>
                }
                {!updateSuccess && <input id='adjPoints' className='input is-large' type='Number'
                  placeholder='0' style={{width: '25%', textAlign: 'center'}} />}
              </div>
              : null }
            {!isProcessing && !updateSuccess
              ? <ContentDivider contents={[
                <div style={{margin: 20}}>
                  <a className='button is-large is-fullwidth is-dark' onClick={e => this._adjustCustPoints(activeCustomer, 'deduct')}>Deduct</a>
                </div>,
                <div style={{margin: 20}}>
                  <a className='button is-large is-fullwidth is-info' onClick={e => this._adjustCustPoints(activeCustomer, 'add')}>Add</a>
                </div> ]} size={!refundId ? 5 : 10} offset={1} />
              : null }
          </ModalCard>
        )
      case 'orderDetails':
        let currency = activeOD && (activeOD.currency || activeOD.paymentInfo.currency)
        let date = activeOD && (activeOD.dateCreated || activeOD.extraInfo.date)
        let total = activeOD && (activeOD.total || activeOD.paymentInfo.orderTotal)
        let payments = activeOD && (activeOD.payments || activeOD.paymentInfo.payments)
        let orderId = activeOD && (activeOD.id || activeOD.extraInfo && activeOD.extraInfo.id)
        let refundId = activeOD && (activeOD.refundId || activeOD.paymentInfo && activeOD.paymentInfo.refundId)
        let dateRefunded = activeOD && (activeOD.dateRefunded || activeOD.paymentInfo && activeOD.paymentInfo.dateRefunded)
        return (
          activeOD
          ? <ModalCard closeAction={e => this._closeModal()}>
            <div className='content'>
              <h1>{`${!refundId ? 'ORDER' : 'REFUNDED ORDER'} #${refundId || orderId}`}</h1>
              <p className='is-marginless'>{`Date Ordered: ${moment(date).format('L')}`}</p>
              {refundId && <p>{`Date Refunded: ${moment(dateRefunded).format('L')}`}</p>}
              <ContentDivider contents={[
                <div><p className='is-marginless'>ITEMS:</p>
                  <ul style={{marginTop: 0}}>
                    {activeOD.items.map((x, key) => { return <li key={key}>{`${(x.product && x.product.nameEn) || x.name} (x${x.quantity})`}</li> })}
                  </ul>
                </div>,
                <p>
                  {`${lblTR('app.modal.currency')}: ${currency.toUpperCase()}`}
                  <br />{`${lblTR('app.lbl.orderTotal')}: ${formatCurrency(total, currency)}`}
                </p>,
                <div><p className='is-marginless'>PAYMENTS:</p>
                  <ul style={{marginTop: 0}}>
                    {payments.map((x, key) => { return <li key={key}>{`${x.type}: ${formatCurrency(x.amount, currency)}`}</li> })}
                  </ul>
                </div>
              ]} size={4} />
              <ContentDivider contents={[
                <div style={{margin: 20}}>
                  <a className='button is-large is-fullwidth is-info' onClick={e => this._reprint()}>{lblTR('app.button.reprint')}</a>
                </div>,
                <div style={{margin: 20}}>
                  {!refundId && <a className='button is-large is-fullwidth is-dark' onClick={e => dispatch(setActiveModal('refundRemark'))}>{lblTR('app.button.refund')}</a>}
                </div>
              ]} size={!refundId ? 5 : 10} offset={1} />
              {settings.error && <p>{settings.errorMessage}</p>}
            </div>
          </ModalCard>
          : null
        )
      default:
        return null
    }
  }
}

function mapStateToProps (state) {
  let custData = state.data.customers
  let offlineData = state.data.offlineData
  let settings = state.settings
  let activeOD1 = settings.activeOrderDetails
  let activeOD2 = state.reports.storeOrders.activeOrderDetails
  return {
    custData,
    settings,
    offlineData,
    mainUI: state.app.mainUI,
    orderData: state.data.orderData,
    activeOD: activeOD1 || activeOD2,
    isProcessing: settings.isProcessing || offlineData.isProcessing,
    intl: state.intl
  }
}

export default connect(mapStateToProps)(injectIntl(ModalApp))
