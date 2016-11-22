import React, {Component, PropTypes} from 'react'
import { connect } from 'react-redux'

import { injectIntl, FormattedMessage } from 'react-intl'

import {
  closeActiveModal,
  setError
} from '../actions/application'

import {
  addPaymentType,
  setCashTendered,
  setTransNumber,
  setPinCode,
  setCardProvider,
  setPaymentAmount,
  removePaymentType
} from '../actions/panelCheckout'

import {
  panelCartShouldUpdate
} from '../actions/panelCart'

const focusProductSearch = 'productsSearch'

class PaymentModal extends Component {

  componentDidMount () {
    const {paymentMode} = this.props
    if (paymentMode !== 'voucher') {
      document.getElementById('paymentValue').focus()
    } else {
      document.getElementById('voucherAmount').focus()
    }
  }

  _setPaymentAmount (amount) {
    const { dispatch } = this.props
    dispatch(setPaymentAmount(amount))
  }

  _closeModal () {
    const { dispatch } = this.props
    dispatch(closeActiveModal(focusProductSearch))
    dispatch(panelCartShouldUpdate(false))
  }

  _clickConfirm (event) {
    if (event) { event.preventDefault() }
    const { dispatch, paymentMode, cashTendered, card, transNumber, orderTotal, paymentTotal, paymentBalance } = this.props
    var editCashPayment = this.paymentInfo() && paymentMode === 'cash'
    var orderMinusPayment = orderTotal - paymentTotal <= 0
      ? null
      : orderTotal - paymentTotal
    let paymentValue
    let voucherCode
    if (paymentMode === 'voucher') {
      paymentValue = Number(document.getElementById('voucherAmount').value)
      voucherCode = transNumber
    } else {
      paymentValue = Number(document.getElementById('paymentValue').value) || orderMinusPayment
    }
    let payment = {}
    if (paymentMode === 'cash') {
      payment = { type: 'cash', amount: paymentValue, cash: cashTendered, remarks: 'Without change' }
    } else if (paymentMode === 'credit') {
      payment = { type: 'credit', amount: paymentValue, transNumber: transNumber, provider: card.provider, remarks: 'Needs more' }
    } else if (paymentMode === 'nets') {
      payment = { type: 'nets', amount: paymentValue, transNumber: transNumber, remarks: 'Needs more' }
    } else if (paymentMode === 'voucher') {
      payment = { deduction: paymentValue, remarks: voucherCode }
    }
    if (editCashPayment) {
      dispatch(removePaymentType('cash'))
      dispatch(addPaymentType(payment))
      dispatch(panelCartShouldUpdate(false))
    } else if (paymentMode === 'voucher') {
      dispatch(addPaymentType(payment))
      dispatch(closeActiveModal(focusProductSearch))
      dispatch(panelCartShouldUpdate(false))
    } else {
      if (paymentValue > paymentBalance) {
        dispatch(setError('app.error.excessPayment'))
      } else {
        if (paymentMode === 'credit' || paymentMode === 'nets') {
          let okayToAddCredit = card.provider && transNumber
          let okayToAddNets = transNumber !== '' || transNumber
          if (paymentMode === 'credit' && okayToAddCredit) {
            dispatch(addPaymentType(payment))
            dispatch(closeActiveModal(focusProductSearch))
            dispatch(panelCartShouldUpdate(false))
          } else if (paymentMode === 'nets' && okayToAddNets) {
            dispatch(addPaymentType(payment))
            dispatch(closeActiveModal(focusProductSearch))
            dispatch(panelCartShouldUpdate(false))
          } else {
            if (paymentMode === 'credit' && !card.provider) {
              dispatch(setError('app.error.noCardAssoc'))
            } else if (!okayToAddNets) {
              dispatch(setError('app.error.noTransId'))
            }
          }
        } else if (paymentMode === 'cash') {
          let okayToAddCash = cashTendered - paymentValue >= 0
          if (okayToAddCash) {
            dispatch(addPaymentType(payment))
            dispatch(closeActiveModal(focusProductSearch))
            dispatch(panelCartShouldUpdate(false))
          } else {
            dispatch(setError('app.error.cashNotEnough'))
          }
        }
      }
    }
  }

  _changeInputValue (value) {
    const {dispatch, currency, paymentMode} = this.props
    currency === 'sgd'
      ? paymentMode === 'cash'
        ? dispatch(setCashTendered(value))
        : dispatch(setTransNumber(value))
      : dispatch(setPinCode(value))
  }

  _clickCardProvToggle (provider) {
    const {dispatch} = this.props
    dispatch(setCardProvider(provider))
  }

  _focus2ndInput (event) {
    event.preventDefault()
    document.getElementById('inputValue').focus()
  }

  paymentInfo () {
    const { payments, paymentMode } = this.props
    var paymentInfo
    payments.filter(function (payment) {
      if (paymentMode === payment.type && payment.amount && payment.amount !== 0) {
        if (payment.type === 'credit' || payment.type === 'nets' || payment.deduction) {
          paymentInfo = []
          paymentInfo.push(payment)
        } else if (payment.type === 'cash') {
          paymentInfo
          paymentInfo = payment
        }
      }
    })
    return paymentInfo
  }

  render () {
    const {intl, id, card, currency, orderTotal, paymentAmount, paymentBalance, paymentMode, error} = this.props
    const active = id === 'paymentModal' ? 'is-active ' : ''
    var inputCash = 6
    var inputCredit = 20
    var inputPin = 4
    // style for logo of card Association
    var unselected = {opacity: 0.2}
    var selected = {opacity: 1}
    var editCashPayment = this.paymentInfo() && paymentMode === 'cash'
    return (
      <div id='paymentModal' className={`modal ${active}`}>
        <div className='modal-background' />
        <div className='modal-card'>
          <header className='modal-card-head'>
            <p className='modal-card-title is-marginless has-text-centered'>
              Payment
            </p>
            <button className='delete' onClick={this._closeModal.bind(this)} />
          </header>
          <section className='modal-card-body'>
            <div className='content has-text-centered'>
              {editCashPayment
                ? paymentAmount > orderTotal
                  ? <p className='subtitle' style={{color: 'red'}}>
                    <FormattedMessage id={error || 'app.error.excessPayment'} />
                  </p>
                  : null
                : paymentAmount > paymentBalance
                  ? <p className='subtitle' style={{color: 'red'}}>
                    <FormattedMessage id={error || 'app.error.excessPayment'} />
                  </p>
                  : null
              }
              <form autoComplete={false} onSubmit={this._focus2ndInput.bind(this)}>
                <div className='control is-horizontal'>
                  <div className='control-label' style={{maxWidth: 130}}>
                    <label className='label'>
                      {paymentMode === 'voucher' ? 'Voucher Amount' : 'Amount to Pay'}
                    </label>
                  </div>
                  <div className='control is-expanded'>
                    <input id={paymentMode === 'voucher' ? 'voucherAmount' : 'paymentValue'} className='input is-large'
                      onChange={e => this._setPaymentAmount(e.target.value)}
                      placeholder={paymentMode === 'voucher' ? intl.formatMessage({ id: 'app.ph.voucherAmount' }) : intl.formatMessage({ id: 'app.ph.paymentAmount' })} />
                  </div>
                </div>
              </form>
              <form autoComplete={false} onSubmit={this._clickConfirm.bind(this)}>
                <div className='control is-horizontal' style={{marginTop: 10}}>
                  <div className='control-label' style={{width: 130, maxWidth: 130}}>
                    <label className='label'>
                      {paymentMode !== 'cash'
                        ? paymentMode !== 'voucher'
                          ? 'Trans No.' : 'Voucher Code'
                        : 'Cash Given'}
                    </label>
                  </div>
                  <div className='control is-expanded'>
                    <input
                      id={'inputValue'}
                      autoFocus
                      className='input is-large'
                      type={
                        currency === 'sgd'
                        ? paymentMode === 'cash' ? 'number' : 'text'
                        : 'password'
                      }
                      placeholder={
                        currency === 'sgd'
                        ? paymentMode === 'cash'
                          ? intl.formatMessage({ id: 'app.ph.enterAmount' })
                          : paymentMode !== 'voucher'
                            ? intl.formatMessage({ id: 'app.ph.enterTransId' })
                            : intl.formatMessage({ id: 'app.ph.enterVC' })
                        : intl.formatMessage({ id: 'app.ph.enterPin' })}
                      maxLength={
                        currency === 'sgd'
                          ? paymentMode === 'cash' ? inputCash : inputCredit
                          : inputPin
                      }
                      onChange={e => this._changeInputValue(e.target.value)} />
                  </div>
                </div>
              </form>
              <hr />
              {currency === 'odbo'
                ? null
                : paymentMode === 'cash'
                  ? null
                  : <div className='columns container'>
                    {
                      paymentMode === 'nets' || paymentMode === 'voucher'
                        ? null
                        : <div className='column is-12 has-text-centered'>
                          <p className='title'>
                            <FormattedMessage id='app.general.cardAssoc' />
                          </p>
                          <div className='columns'>
                            <div className='column is-1' />
                            <div className='column is-2'>
                              <img style={card.provider === 'visa'
                                ? selected
                                : unselected}
                                onClick={this._clickCardProvToggle.bind(this, 'visa')}
                                src={require('../assets/card-visa.gif')} />
                            </div>
                            <div className='column is-2'>
                              <img style={card.provider === 'master'
                                ? selected
                                : unselected}
                                onClick={this._clickCardProvToggle.bind(this, 'master')}
                                src={require('../assets/card-mc.gif')} />
                            </div>
                            <div className='column is-2'>
                              <img style={card.provider === 'amex'
                                ? selected
                                : unselected}
                                onClick={this._clickCardProvToggle.bind(this, 'amex')}
                                src={require('../assets/card-amex.gif')} />
                            </div>
                            <div className='column is-2'>
                              <img style={card.provider === 'diners'
                                ? selected
                                : unselected}
                                onClick={this._clickCardProvToggle.bind(this, 'diners')}
                                src={require('../assets/diners.png')} />
                            </div>
                            <div className='column is-2'>
                              <img style={card.provider === 'union'
                                ? selected
                                : unselected}
                                onClick={this._clickCardProvToggle.bind(this, 'union')}
                                src={require('../assets/union.png')} />
                            </div>
                          </div>
                        </div>
                    }
                  </div>
              }
              <div className='columns'>
                <p className='column is-6 is-offset-3'>
                  <a className={`button is-large is-fullwidth ${editCashPayment ? 'is-danger' : 'is-success'}`}
                    onClick={this._clickConfirm.bind(this)}>
                    {editCashPayment
                      ? 'Edit Cash Payment'
                      : <FormattedMessage id='app.button.confirm' />
                    }
                  </a>
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    )
  }
}

PaymentModal.propTypes = {
  id: PropTypes.string,
  paymentMode: PropTypes.string,
  paymentAmount: PropTypes.number,
  card: PropTypes.object,
  currency: PropTypes.string,
  error: PropTypes.string,
  paymentBalance: PropTypes.number,
  paymentTotal: PropTypes.number,
  orderTotal: PropTypes.number,
  transNumber: PropTypes.string.isRequired,
  cashTendered: PropTypes.number,
  payments: PropTypes.array
}

export default connect()(injectIntl(PaymentModal))
