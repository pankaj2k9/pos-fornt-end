import React, {Component, PropTypes} from 'react'
import { connect } from 'react-redux'

import { injectIntl, FormattedMessage } from 'react-intl'

import {
  closeActiveModal
} from '../actions/application'

import {
  addPaymentType,
  setCashTendered,
  setTransNumber,
  setPinCode,
  setCardProvider
} from '../actions/panelCheckout'

const focusProductSearch = 'productsSearch'

class PaymentModal extends Component {

  componentDidMount () {
    const {paymentMode} = this.props
    if (paymentMode !== 'voucher') {
      document.getElementById('paymentValue').focus()
    }
  }

  _closeModal () {
    const { dispatch } = this.props
    dispatch(closeActiveModal(focusProductSearch))
  }

  _clickConfirm (event) {
    if (event) { event.preventDefault() }
    const { dispatch, paymentMode, cashTendered, card, transNumber, orderTotal, paymentTotal } = this.props
    var orderMinusPayment = orderTotal - paymentTotal <= 0
      ? null
      : orderTotal - paymentTotal
    let paymentValue
    let voucherCode
    if (paymentMode === 'voucher') {
      paymentValue = Number(transNumber)
      voucherCode = document.getElementById('voucherCode').value
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
      payment = { type: 'voucher', voucher: {deduction: paymentValue, remarks: voucherCode} }
    }
    dispatch(addPaymentType(payment))
    dispatch(closeActiveModal(focusProductSearch))
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

  render () {
    const {intl, id, card, currency, paymentMode, error, orderTotal, paymentTotal} = this.props
    const active = id === 'paymentModal' ? 'is-active ' : ''
    var inputCash = 6
    var inputCredit = 20
    var inputPin = 4

    var orderMinusPayment = orderTotal - paymentTotal

    // style for logo of card Association
    var unselected = {opacity: 0.2}
    var selected = {opacity: 1}
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
              {!error
                ? null
                : <p className='subtitle'>
                  {error}
                </p>
              }
              <div className='control is-horizontal'>
                <div className='control-label' style={{maxWidth: 130}}>
                  <label className='label'>
                    {paymentMode === 'voucher' ? 'Voucher Code' : 'Amount to Pay'}
                  </label>
                </div>
                <div className='control is-expanded'>
                  <input id={paymentMode === 'voucher' ? 'voucherCode' : 'paymentValue'} className='input is-large'
                    placeholder={orderMinusPayment < 0 ? 0 : orderMinusPayment} />
                </div>
              </div>
              <form autoComplete={false} onSubmit={this._clickConfirm.bind(this)}>
                <div className='control is-horizontal'>
                  <div className='control-label' style={{width: 130, maxWidth: 130}}>
                    <label className='label'>
                      {paymentMode !== 'cash' ? paymentMode !== 'voucher' ? 'Trans No.' : 'VOUCHER' : 'Cash Given'}
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
                            : 'Voucher Amount'
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
                  <a className='button is-large is-fullwidth is-success'
                    onClick={this._clickConfirm.bind(this)}>
                    <FormattedMessage id='app.button.verify' />
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
  card: PropTypes.object,
  currency: PropTypes.string,
  paymentTotal: PropTypes.number,
  orderTotal: PropTypes.number,
  transNumber: PropTypes.string.isRequired,
  cashTendered: PropTypes.number,
  payments: PropTypes.array
}

export default connect()(injectIntl(PaymentModal))
