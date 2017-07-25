import React, { Component } from 'react'
import { connect } from 'react-redux'
import { injectIntl } from 'react-intl'

import ContentDivider from '../components/ContentDivider'
import POSButtons from '../components/POSButtons'
import Counter from '../components/Counter'
import Truncate from '../components/Truncate'

import {
  setActiveModal
} from '../actions/app/mainUI'

import {
  setOrderItemQty,
  setCustomDiscount,
  removeOrderItem
} from '../actions/data/orderData'

import {
  makeOfflineOrder
} from '../actions/data/offlineData'

import { formatCurrency } from '../utils/string'

import {
  compPaymentsSum,
  compPaymentsSumByType,
  compCashChange,
  processOdbo
} from '../utils/computations'

import { processOrder } from '../actions/orders'

import print from '../utils/printReceipt/print'

class PanelOrderInfo extends Component {

  _onClickPanelButtons (name) {
    const { dispatch, currency, orderInfo, receipt, posMode, activeDrawer } = this.props
    switch (name) {
      case 'total': return dispatch(setActiveModal('payments'))
      case 'printSub':
        print(receipt)
        document.getElementById('barcodeInput').focus()
        break
      case 'pay':
        if (posMode === 'online') {
          if (currency === 'sgd') {
            dispatch(processOrder(orderInfo, receipt, activeDrawer))
          } else {
            dispatch(setActiveModal('custPincode'))
          }
        } else {
          dispatch(makeOfflineOrder(orderInfo, receipt, activeDrawer))
        }
        break
      default:
    }
  }

  _onClickViewNotes () {
    const { dispatch } = this.props
    dispatch(setActiveModal('notes'))
  }

  renderOrderItems () {
    const {
      dispatch,
      orderItems,
      currency,
      locale
    } = this.props
    const notEmpty = (orderItems !== null || undefined)
    return orderItems.map(function (item, key) {
      function plus () {
        dispatch(setOrderItemQty(item.id, 'plus'))
      }

      function minus () {
        dispatch(setOrderItemQty(item.id, 'minus'))
      }

      function remove (e) {
        dispatch(removeOrderItem(item.id))
      }

      function setDiscount (value) {
        let discount = Number(value) > 100 ? 100 : value
        dispatch(setCustomDiscount(discount, item.id))
      }

      let productName = locale === 'en' ? item.nameEn : item.nameZh
      let origDisc = item.isDiscounted
        ? currency === 'sgd' ? item.priceDiscount : item.odboPriceDiscount
        : item.customDiscount
      let discountVal = item.overallDiscount === 0
        ? origDisc
        : item.overallDiscount

      let subtotal = currency === 'sgd'
        ? formatCurrency(item.subTotalPrice)
        : item.subTotalOdboPrice.toFixed(0)
      let disabled = item.overallDiscount || item.overallDiscount !== 0
      return (
        notEmpty
        ? <tr key={key}>
          <td className='is-icon'>
            <Counter
              size='big'
              count={item.qty}
              plus={plus}
              minus={minus} />
          </td>
          <td className='item-name-col'><Truncate text={productName} maxLength={26} /></td>
          <td>
            <form onSubmit={e => {
              e.preventDefault()
            }}>
              <p className='control has-addons' style={{width: 60}}>
                <input id='itemDiscount' className='input is-big' type='Number'
                  placeholder={discountVal} value={discountVal}
                  onChange={e => { !disabled && setDiscount(e.target.value) }} />
                <a className='button is-big'>%</a>
              </p>
            </form>
          </td>
          <td className='item-subtotal-col'>
            <p>{subtotal}</p>
          </td>
          <td className='is-icon'>
            <a
              className='button is-inverted is-danger is-big'
              style={{padding: 0}}
              onClick={remove}>
              <span className='icon'><i className='fa fa-times' /></span>
            </a>
          </td>
        </tr>
        : <tr />
      )
    })
  }

  render () {
    const {
      intl,
      isEditing,
      currency,
      bonusPoints,
      orderItems,
      payments,
      total,
      totalDisc,
      totalOdbo,
      totalOdboDisc,
      activeCustomer
    } = this.props

    let lblTR = (id) => { return (intl.formatMessage({id: id})).toUpperCase() }

    let orderTotal = currency === 'sgd' ? total : totalOdbo
    let orderDisc = currency === 'sgd' ? totalDisc : totalOdboDisc
    let subtotal = orderTotal + orderDisc
    let payBal = currency === 'sgd'
      ? total - compPaymentsSum(payments) < 0 ? 0 : total - compPaymentsSum(payments)
      : totalOdbo - compPaymentsSum(payments) < 0 ? 0 : totalOdbo - compPaymentsSum(payments)
    let paymentsSum = currency === 'sgd' ? formatCurrency(compPaymentsSum(payments)) : orderTotal
    let cashSum = formatCurrency(compPaymentsSumByType(payments, 'cash'))
    let creditSum = formatCurrency(compPaymentsSumByType(payments, 'credit'))
    let netsSum = formatCurrency(compPaymentsSumByType(payments, 'nets'))
    let voucherSum = formatCurrency(compPaymentsSumByType(payments, 'voucher'))
    let cashChange = formatCurrency(compCashChange(payments) * -1)
    let custName = activeCustomer ? activeCustomer.firstName : 'N/A'
    let odbo = processOdbo(currency, activeCustomer, orderTotal, bonusPoints, activeCustomer ? activeCustomer.odboCoins : 0)
    let intFrameHeight = window.innerHeight
    let itemsNotEmpty = currency === 'sgd' && orderItems.length > 0
    let activePrintAndTotal = currency === 'sgd'
      ? payments.length > 0 && payBal === 0 : odbo.newCoins2 > 0
    let buttons = [
      {name: 'total', label: 'app.button.total', isActive: itemsNotEmpty, color: 'pink', size: 'is-4'},
      {name: 'printSub', label: 'app.button.printTotal', isActive: activePrintAndTotal, color: 'purple', size: 'is-4'},
      {name: 'pay', label: 'app.button.pay', isActive: activePrintAndTotal, color: 'blue', size: 'is-4'}
    ]

    return (
      <div>
        <div className='panel order-info'>
          <div className='panel-block' style={{height: intFrameHeight / 2.5, overflowY: 'scroll', width: '100%'}}>
            <table className='table product-list' style={{alignSelf: 'flex-start'}}>
              <thead>
                <tr>
                  <th>{`${lblTR('app.general.qty')}`}</th>
                  <th>{`${lblTR('app.general.product')}`}</th>
                  <th>{`${lblTR('app.general.discount')}`}</th>
                  <th>{`${lblTR('app.general.subtotal')}`}</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                { this.renderOrderItems() }
              </tbody>
            </table>
          </div>
          <div className='panel-block' style={{flexDirection: 'column'}}>
            <div className='columns is-multilines is-mobile is-fullwidth is-marginless' style={{width: '100%'}}>
              <div className='column is-8 is-paddingless'>
                <ContentDivider contents={[
                  <span>
                    {currency === 'sgd'
                      ? <span>
                        <strong>GST: </strong>{currency === 'sgd' ? formatCurrency(0, currency) : ''}
                      </span>
                      : <strong>{lblTR('app.page.reports.odbo')}</strong>
                    }
                  </span>,
                  <span>
                    <strong style={{display: 'inline-block', width: '6.5rem'}}>{lblTR('app.modal.subtotal')}: </strong> {formatCurrency(subtotal, currency)}
                  </span> ]}
                  size={6} />
                <ContentDivider contents={[
                  ' ',
                  <span>
                    <strong style={{display: 'inline-block', width: '6.5rem'}}>{lblTR('app.general.discount')}: </strong> {formatCurrency(orderDisc, currency)}
                  </span> ]}
                  size={6} />
              </div>
              <div className='column is-4 is-paddingless has-text-centered'>
                <strong>{lblTR('app.lbl.orderTotal')}</strong>
                <p>{formatCurrency(orderTotal, currency)}</p>
              </div>
            </div>
          </div>
          <div className='panel-block'>
            <div className='columns is-multilines is-mobile is-fullwidth is-marginless' style={{width: '100%'}}>
              {currency === 'sgd'
                ? <div className='column is-8 is-paddingless'>
                  <ContentDivider contents={[
                    <p><strong style={{display: 'inline-block', width: '5.5rem'}}>{lblTR('app.general.cash')}:</strong> {cashSum}</p>,
                    <p><strong style={{display: 'inline-block', width: '5.5rem'}}>{lblTR('app.button.credit')}:</strong> {creditSum}</p>
                  ]} size={6} />
                  <ContentDivider contents={[
                    <p><strong style={{display: 'inline-block', width: '5.5rem'}}>{lblTR('app.button.voucher')}:</strong> {voucherSum}</p>,
                    <p><strong style={{display: 'inline-block', width: '5.5rem'}}>{lblTR('app.button.debit')}:</strong> {netsSum}</p>
                  ]} size={6} />
                </div>
                : <div className='column is-8 is-paddingless'>
                  <ContentDivider contents={[
                    <strong>{lblTR('app.general.odboPay')}</strong>,
                    <div>
                      <strong style={{display: 'inline-block', width: '6.5rem'}}>COINS:</strong> {odbo.prevCoins}<br />
                      {odbo.newCoins2 < 0
                        ? <p style={{color: 'red'}}>{lblTR('app.general.ib')}</p>
                        : <p><strong style={{display: 'inline-block', width: '6.5rem'}}>REMAINING:</strong> {odbo.newCoins2}</p>}
                    </div>
                  ]} size={6} />
                </div>
              }
              <div className='column is-4 is-paddingless has-text-centered'>
                <strong>{lblTR('app.lbl.payTotal')}</strong>
                <p>{!isEditing ? paymentsSum : null}</p>
              </div>
            </div>
          </div>
          <div className='panel-block' style={{flexDirection: 'column'}}>
            <h1><strong>ORDER SUMMARY</strong></h1>
            <div className='columns is-multilines is-mobile is-fullwidth is-marginless' style={{width: '100%'}}>
              <div className='column is-3 is-paddingless' >
                <p>
                  <strong style={{display: 'inline-block', width: '8rem'}}>NOTES</strong>
                  <a onClick={this._onClickViewNotes.bind(this)}>({lblTR('app.button.view')})</a>
                </p>
                {
                  activeCustomer &&
                  <p><strong style={{display: 'inline-block', width: '8rem'}}>CUST. POINTS:</strong> {activeCustomer.odboCoins ? formatCurrency(activeCustomer.odboCoins, 'odbo') : 0 }</p>
                }
              </div>
              <div className='column is-5 is-paddingless'>
                <p><strong style={{display: 'inline-block', width: '8rem'}}>CUSTOMER:</strong> {custName}</p>
                <p><strong style={{display: 'inline-block', width: '8rem'}}>BONUS POINTS:</strong> {bonusPoints ? <strong style={{color: 'green'}}>(2x)</strong> : activeCustomer ? '(1x)' : 'N/A'}</p>
                <p><strong style={{display: 'inline-block', width: '8rem'}}>ORDER POINTS:</strong> {currency === 'sgd' ? odbo ? odbo.earnedPts + 'pts' : 'N/A' : 'N/A'}</p>
              </div>
              <div className='column is-4 is-paddingless'>
                <p><strong style={{display: 'inline-block', width: '9rem'}}>PAYMENT TOTAL:</strong> {paymentsSum}</p>
                <p><strong style={{display: 'inline-block', width: '9rem'}}>ORDER TOTAL:</strong> {formatCurrency(orderTotal, currency)}</p>
                {currency === 'sgd' ? <p><strong style={{display: 'inline-block', width: '9rem'}}>CASH CHANGE:</strong> {cashChange}</p> : null}
              </div>
            </div>
          </div>
          <div className='panel-block'>
            <div style={{width: '100%'}}>
              <POSButtons
                buttons={buttons}
                onClickButton={this._onClickPanelButtons.bind(this)} />
            </div>
          </div>
        </div>
      </div>
    )
  }
}

function mapStateToProps (state) {
  let mainUI = state.app.mainUI
  let storeUI = state.app.storeUI
  let orderData = state.data.orderData
  return {
    mainUI,
    storeUI,
    orderData,
    isEditing: mainUI.isEditing,
    activeDrawer: mainUI.activeDrawer,
    posMode: mainUI.posMode,
    activeCustomer: orderData.activeCustomer,
    total: orderData.total,
    totalDisc: orderData.totalDisc,
    totalOdbo: orderData.totalOdbo,
    totalOdboDisc: orderData.totalOdboDisc,
    currency: orderData.currency,
    bonusPoints: orderData.bonusPoints,
    orderItems: orderData.orderItems,
    payments: orderData.payments,
    orderNote: orderData.orderNote,
    orderInfo: orderData.orderInfo,
    receipt: orderData.receipt,
    shouldUpdate: orderData.shouldUpdate,
    isProcessing: orderData.isProcessing,
    intl: state.intl,
    locale: state.intl.locale
  }
}

export default connect(mapStateToProps)(injectIntl(PanelOrderInfo))
