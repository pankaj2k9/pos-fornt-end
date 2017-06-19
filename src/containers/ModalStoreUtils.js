import React, { Component } from 'react'
import { connect } from 'react-redux'
import { injectIntl } from 'react-intl'

import ModalCard from '../components/ModalCard'
import ContentDivider from '../components/ContentDivider'
import LoadingScreen from '../components/LoadingScreen'
import CustomerList from '../components/CustomerList'
import POSButtons from '../components/POSButtons'

import {
  setActiveModal,
  closeActiveModal,
  toggleCashierWorkStatus,
  setQuickLoginPinCode,
  setInvalidQuickLoginPinCode,
  setQuickLoginCashier
} from '../actions/app/mainUI'

import {
  addOrderNote,
  setActiveCustomer,
  setOverallDiscount,
  setOrderInfo,
  resetOrderData,
  recallOrder,
  removeNote,
  setCurrentCashier
} from '../actions/data/orderData'

import {
  setCashierNotSelectedWarning
} from '../actions/app/storeUI'

import {
  makeOfflineOrder,
  offlineToggleWorkState
} from '../actions/data/offlineData'

import {
  customersResetState
} from '../actions/data/customers'

import {
  processOrder
} from '../actions/orders'

import {
  removeOrderOnHold
} from '../actions/ordersOnHold'

import { formatCurrency } from '../utils/string'
import print from '../utils/printReceipt/print'

const styles = {
  center: {
    display: 'flex',
    justifyContent: 'center',
    flexDirection: 'column'
  },
  input: {
    height: 'inherit',
    fontSize: '2.1rem',
    fontWeight: 600,
    paddingTop: ' 0.0em',
    textAlign: 'center'
  },
  btnStyle: {
    height: 60,
    padding: 10
  },
  btnCtnr: { margin: 10 },
  cardCtnr: { margin: 10 },
  cardProv: {
    opacity: 0.2,
    padding: 0
  }
}

class NumberInput extends Component {
  componentDidMount () {
    const numberInput = jQuery('#' + this.props.id)
    if (numberInput && numberInput.length > 0) {
      numberInput[0].select()
    }
  }

  render () {
    const { id, value, onChange } = this.props
    return (
      <input id={id} className='input is-large' type='Number'
        style={{fontSize: '2.75rem', textAlign: 'right', paddingLeft: '0em', paddingRight: '2em'}}
        value={value}
        onChange={onChange} />
    )
  }
}

class ModalStoreUtils extends Component {
  componentDidUpdate () {
    switch (this.props.activeModalId) {
      case 'searchCustomer': return document.getElementById('custSearchKey').focus()
      case 'notes': return document.getElementById('noteInput').focus()
      case 'custPincode': return document.getElementById('custCodeInput').focus()
      case 'overallDiscount': return document.getElementById('discountInput').focus()
      default: null
    }
  }

  _closeModal (e) {
    e && e.preventDefault()
    const { dispatch } = this.props
    dispatch(setQuickLoginPinCode(undefined))
    dispatch(setInvalidQuickLoginPinCode(false))
    dispatch(setQuickLoginCashier(undefined))
    dispatch(closeActiveModal())
    dispatch(customersResetState())
    document.getElementById('barcodeInput').focus()
  }

  _resetOrderData () {
    const { dispatch } = this.props
    this._printReceipt()
    dispatch(setActiveModal('printingReceipt'))
    setTimeout(() => {
      dispatch(resetOrderData())
      dispatch(closeActiveModal())
    }, 2000)
  }

  _setOADisc (value) {
    const {dispatch} = this.props
    dispatch(setOverallDiscount(value > 100 ? 100 : value))
  }

  _setActiveCustomer (customer) {
    const {dispatch, orderData, mainUI} = this.props
    dispatch(setActiveCustomer(customer))
    dispatch(setOrderInfo({orderData: orderData, appData: mainUI}, {customer: customer}))
    dispatch(closeActiveModal())
  }

  _addNoteToOrder (e) {
    e.preventDefault()
    const { dispatch } = this.props
    let note = document.getElementById('noteInput').value
    dispatch(addOrderNote(note))
    document.getElementById('note').reset()
  }

  _setOdboOrderInfo () {
    const {dispatch, orderData, mainUI} = this.props
    dispatch(setOrderInfo({orderData: orderData, appData: mainUI}))
  }

  _processOrder (e) {
    e && e.preventDefault()
    const {dispatch, activeDrawer, orderInfo, orderReceipt} = this.props
    dispatch(processOrder(orderInfo, orderReceipt, activeDrawer))
  }

  _processOfflineOrder (e) {
    e && e.preventDefault()
    const {dispatch, activeDrawer, orderInfo, orderReceipt} = this.props
    dispatch(makeOfflineOrder(orderInfo, orderReceipt, activeDrawer))
  }

  _recallOrder (orderData, orderKey) {
    const { dispatch } = this.props
    dispatch(removeOrderOnHold(orderKey))
    dispatch(recallOrder(orderData))
    dispatch(closeActiveModal())
  }

  _printReceipt () {
    print(this.props.orderReceipt)
  }

  _onConfirmQuickLoginPinCode () {
    const { dispatch, master, quickLoginPinCode, quickLoginCashier, storeId, posMode } = this.props
    if (!quickLoginPinCode) {
      dispatch(setInvalidQuickLoginPinCode(true))
    } else {
      if (posMode === 'online') {
        dispatch(toggleCashierWorkStatus(master.id, quickLoginCashier, storeId, quickLoginPinCode))
      } else {
        dispatch(offlineToggleWorkState(master.id, quickLoginCashier, storeId, quickLoginPinCode))
      }
    }
  }

  _setQuickLoginPinCode (value) {
    const {dispatch} = this.props
    dispatch(setQuickLoginPinCode(value))
  }

  render () {
    const {
      dispatch,
      activeModalId,
      overallDiscount,
      quickLoginPinCode,
      ordersOnHold,
      orderNote,
      intl,
      cashiers,
      currentCashier,
      cashierNotSelectedWarning
    } = this.props

    let lblTR = (id) => { return (intl.formatMessage({id: id})).toUpperCase() }
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

    let cashiersButtons = []

    let isActive = true
    cashiers.forEach((cashier) => {
      let button = {
        name: cashier.id,
        label: cashier.firstName,
        isActive,
        color: 'blue',
        size: 'is-3',
        inverted: (currentCashier && currentCashier.id === cashier.id)
      }
      cashiersButtons.push(button)
    })

    switch (activeModalId) {
      case 'overallDiscount':
        return (
          <ModalCard closeAction={e => this._closeModal()} title={'OVERALL DISCOUNT'} confirmAction={e => this._closeModal()}>
            <div className='content columns is-mobile is-multiline has-text-centered'>
              <div className='column is-4 is-offset-4 has-text-centered'>
                <form onSubmit={e => this._closeModal(e)} >
                  <p className='control has-icon has-icon-right is-marginless'>
                    <NumberInput id='discountInput' value={overallDiscount} onChange={e => this._setOADisc(e.target.value)} />
                    <span className='icon' style={{fontSize: '5rem', top: '3rem', right: '4.75rem'}}>
                      <i className='fa fa-percent' />
                    </span>
                  </p>
                </form>
              </div>
            </div>
          </ModalCard>
        )
      case 'quickLoginPinCode':
        return (
          <ModalCard closeAction={e => this._closeModal(e)} title={'PIN CODE'} confirmAction={e => this._onConfirmQuickLoginPinCode()}>
            <div className='content columns is-mobile has-text-centered'>
              <div className='column is-4 is-offset-4 has-text-centered' style={{width: '300px', margin: '0 auto'}}>
                <form onSubmit={e => this._onConfirmQuickLoginPinCode()} >
                  <p className='control is-marginless'>
                    <input id='quickLoginPinCodeInput' className={this.props.invalidQuickLoginPinCode ? 'input is-large red-border' : 'input is-large'} type='password'
                      style={{fontSize: '2.75rem', textAlign: 'right', paddingLeft: '0em', paddingRight: '2em'}}
                      value={quickLoginPinCode}
                      onChange={e => { this._setQuickLoginPinCode(e.target.value) }} />
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
          <ModalCard closeAction={e => this._resetOrderData()} confirmAction={e => this._resetOrderData()}>
            <div className='content has-text-centered'>
              <p className='title'>Order Success</p>
            </div>
          </ModalCard>
        )
      case 'orderFailed':
        return (
          <ModalCard closeAction={e => this._closeModal()} retryAction={e => this._processOrder()}>
            <div className='content has-text-centered'>
              <p className='title'>Order Failed</p>
              <p className='subtitle'>Try Again</p>
              <p>or</p>
              <a className='button is-info' onClick={e => this._processOfflineOrder()}>Process as Offline Order</a>
            </div>
          </ModalCard>
        )
      case 'searchCustomer':
        return (
          <ModalCard closeAction={e => this._closeModal()}>
            <CustomerList showActiveCustomer customerButtonText='Add Customer' onClickCustomerButton={this._setActiveCustomer.bind(this)} />
          </ModalCard>
        )

      case 'custPincode':
        return (
          <ModalCard closeAction={e => this._closeModal()} title={'Customer Pincode'} confirmAction={e => this._processOrder()}>
            <div className='content columns is-mobile is-multiline has-text-centered'>
              <div className='column is-6 is-offset-3 has-text-centered'>
                <form onSubmit={e => this._processOrder(e)} >
                  <p className='control has-icon has-icon-right is-marginless'>
                    <input id='custCodeInput' className='input is-large' type='password' onChange={e => this._setOdboOrderInfo()}
                      style={{fontSize: '2.75rem', textAlign: 'right', paddingLeft: '0em', paddingRight: '2em'}} />
                    <span className='icon' style={{fontSize: '5rem', top: '3rem', right: '4.75rem'}}>
                      <i className='fa fa-lock' />
                    </span>
                  </p>
                </form>
              </div>
              <ContentDivider offset={1} size={10}
                contents={[
                  <div className={'has-text-centered' + (cashierNotSelectedWarning ? ' red-border' : '')} >
                    <POSButtons
                      buttonStyle={styles.btnStyle}
                      buttons={cashiersButtons}
                      onClickButton={(cashierId) => {
                        let currentCashier
                        cashiers.forEach((cashier) => {
                          if (cashier.id === cashierId) {
                            currentCashier = cashier
                          }
                        })
                        dispatch(setCashierNotSelectedWarning(false))
                        dispatch(setCurrentCashier(currentCashier))
                      }} />
                  </div>
                ]}
              />
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
  let storeUI = state.app.storeUI
  return {
    mainUI,
    orderData,
    custData,
    cashiers: mainUI.activeStaff ? mainUI.activeStaff.staffs : [],
    currentCashier: orderData.currentCashier,
    cashierNotSelectedWarning: storeUI.cashierNotSelectedWarning,
    customerSearchKey: custData.customerSearchKey,
    customerFilter: custData.customerFilter,
    activeModalId: mainUI.activeModalId,
    quickLoginCashier: mainUI.quickLoginCashier,
    quickLoginPinCode: mainUI.quickLoginPinCode,
    invalidQuickLoginPinCode: mainUI.invalidQuickLoginPinCode,
    master: mainUI.activeStaff,
    posMode: mainUI.posMode,
    networkStatus: mainUI.networkStatus,
    overallDiscount: orderData.overallDiscount,
    orderNote: orderData.orderNote,
    orderInfo: orderData.orderInfo,
    orderReceipt: orderData.receipt,
    ordersOnHold: state.ordersOnHold.items,
    storeId: state.app.mainUI.activeStore.source,
    activeDrawer: mainUI.activeDrawer,
    activeDrawerOffline: state.app.mainUI.activeDrawerOffline,
    intl: state.intl
  }
}

export default connect(mapStateToProps)(injectIntl(ModalStoreUtils))
