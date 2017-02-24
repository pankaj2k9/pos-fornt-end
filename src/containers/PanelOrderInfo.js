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
  // removeCustomer,
  // setCurrencyType
} from '../actions/data/orderData'

import { formatCurrency } from '../utils/string'
import {
  compPaymentsSum,
  compPaymentsSumByType,
  compCashChange
} from '../utils/computations'

import { processOrder } from '../actions/orders'

class PanelOrderInfo extends Component {

  _onClickPanelButtons (name) {
    const { dispatch, orderInfo } = this.props
    switch (name) {
      case 'pay': return dispatch(setActiveModal('payments'))
      case 'printSub': return null
      case 'total':
        // ('orderInfo', orderInfo)
        return dispatch(processOrder(orderInfo))
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
      locale,
      isEditing
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
      return (
        notEmpty
        ? <tr key={key}>
          <td className='is-icon'>
            <Counter
              size='small'
              count={item.qty}
              plus={plus}
              minus={minus} />
          </td>
          <td><Truncate text={productName} maxLength={26} /></td>
          <td>
            <form onSubmit={e => {
              e.preventDefault()
            }}>
              <p className='control has-addons' style={{width: 50}}>
                <input id='itemDiscount' className='input is-small' type='Number'
                  placeholder={discountVal} value={discountVal}
                  onChange={e => setDiscount(e.target.value)} />
                <a className='button is-small'>%</a>
              </p>
            </form>
          </td>
          <td>
            <p>{!isEditing ? subtotal : 0}</p>
          </td>
          <td className='is-icon'>
            <a
              className='button is-inverted is-danger is-small'
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
      payments,
      total,
      totalDisc,
      totalOdbo,
      totalOdboDisc
    } = this.props

    let lblTR = (id) => { return (intl.formatMessage({id: id})).toUpperCase() }

    let orderTotal = currency === 'sgd' ? total : totalOdbo
    let orderDisc = currency === 'sgd' ? totalDisc : totalOdboDisc
    let subtotal = orderTotal + orderDisc
    let paymentsSum = formatCurrency(compPaymentsSum(payments))
    let cashSum = formatCurrency(compPaymentsSumByType(payments, 'cash'))
    let creditSum = formatCurrency(compPaymentsSumByType(payments, 'credit'))
    let netsSum = formatCurrency(compPaymentsSumByType(payments, 'nets'))
    let voucherSum = formatCurrency(compPaymentsSumByType(payments, 'voucher'))
    let cashChange = formatCurrency(compCashChange(payments))
    let intFrameHeight = window.innerHeight
    let isActive = true
    let buttons = [
      {name: 'pay', label: 'app.button.pay', isActive, color: 'pink', size: 'is-4'},
      {name: 'printSub', label: 'app.button.printTotal', isActive, color: 'purple', size: 'is-4'},
      {name: 'total', label: 'app.button.total', isActive, color: 'blue', size: 'is-4'}
    ]

    return (
      <div>
        <div className='panel'>
          <div className='panel-block' style={{height: intFrameHeight / 3, overflowYL: 'scroll', width: '100%'}}>
            <table className='table' style={{alignSelf: 'flex-start'}}>
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
                {!isEditing ? this.renderOrderItems() : <tr />}
              </tbody>
            </table>
          </div>
          <div className='panel-block' style={{flexDirection: 'column'}}>
            <div className='columns is-multilines is-mobile is-fullwidth is-marginless' style={{width: '100%'}}>
              <div className='column is-8 is-paddingless'>
                <ContentDivider contents={[
                  <strong>{`GST: ${formatCurrency(0, currency)}`}</strong>,
                  <strong>{`${lblTR('app.modal.subtotal')}: ${formatCurrency(subtotal, currency)}`}</strong> ]}
                  size={6} />
                <ContentDivider contents={[
                  ' ',
                  <strong>{`${lblTR('app.general.discount')}: ${formatCurrency(orderDisc, currency)}`}</strong> ]}
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
              <div className='column is-8 is-paddingless'>
                <ContentDivider contents={[
                  <p><strong>{lblTR('app.general.cash')}</strong>: {cashSum}</p>,
                  <p><strong>{lblTR('app.button.credit')}</strong>: {creditSum}</p>
                ]} size={6} />
                <ContentDivider contents={[
                  <p><strong>{lblTR('app.button.voucher')}</strong>: {voucherSum}</p>,
                  <p><strong>{lblTR('app.button.debit')}</strong>: {netsSum}</p>
                ]} size={6} />
              </div>
              <div className='column is-4 is-paddingless has-text-centered'>
                <strong>{lblTR('app.lbl.payTotal')}</strong>
                <p>{!isEditing ? paymentsSum : null}</p>
              </div>
            </div>
          </div>
          <div className='panel-block' style={{flexDirection: 'column'}}>
            <h1>Order Summary</h1>
            <div className='columns is-multilines is-mobile is-fullwidth is-marginless' style={{width: '100%'}}>
              <div className='column is-4 is-paddingless'>
                Notes
                <a onClick={this._onClickViewNotes.bind(this)}>view</a>
              </div>
              <div className='column is-4 is-paddingless'>
                <p>customer</p>
                <p>double points</p>
                <p>points to recieve</p>
              </div>
              <div className='column is-4 is-paddingless'>
                <p>{`payment total: ${paymentsSum}`}</p>
                <p>{`order total: ${formatCurrency(orderTotal, currency)}`}</p>
                <p>{`cash change: ${cashChange}`}</p>
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
  let mainUIediting = mainUI.isEditing
  let storeUIediting = storeUI.isEditing
  return {
    mainUI,
    storeUI,
    orderData,
    isEditing: mainUIediting || storeUIediting,
    activeCustomer: orderData.activeCustomer,
    total: orderData.total,
    totalDisc: orderData.totalDisc,
    totalOdbo: orderData.totalOdbo,
    totalOdboDisc: orderData.totalOdboDisc,
    currency: orderData.currency,
    orderItems: orderData.orderItems,
    payments: orderData.payments,
    orderNote: orderData.orderNote,
    orderInfo: orderData.orderInfo,
    shouldUpdate: orderData.shouldUpdate,
    isProcessing: orderData.isProcessing,
    intl: state.intl,
    locale: state.intl.locale
  }
}

export default connect(mapStateToProps)(injectIntl(PanelOrderInfo))
