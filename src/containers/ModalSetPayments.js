import React, { Component } from 'react'
import { connect } from 'react-redux'

import { injectIntl } from 'react-intl'

import ModalCard from '../components/ModalCard'
import ContentDivider from '../components/ContentDivider'
import POSButtons from '../components/POSButtons'

import {
  closeActiveModal
} from '../actions/appMainUI'

import {
  setPaymentMode,
  setActiveCard,
  setAmountTendered,
  setFieldsDefault,
  setTransCode,
  setCashTendered
} from '../actions/appStoreUI'

import {
  addPaymentType,
  removePaymentType
} from '../actions/dataORDinfo'

import { formatCurrency, formatNumber } from '../utils/string'
import { compPaymentsSum } from '../utils/computations'

class ModalSetPayments extends Component {
  _closeModal (event) {
    const { dispatch } = this.props
    dispatch(closeActiveModal())
    dispatch(setFieldsDefault())
  }

  _confirm () {
    const { dispatch } = this.props
    dispatch(closeActiveModal())
  }

  _addPayment (mode, amount) {
    const { dispatch, card, cash, nets, voucher, amountToPay } = this.props
    let paymentAmt = mode === 'cash'
      ? {amount: formatNumber(amount), cash: formatNumber(amount)}
      : mode === 'voucher'
        ? {deduction: formatNumber(amountToPay)}
        : {amount: formatNumber(amountToPay)}
    let options = {
      'cash': cash,
      'credit': card,
      'nets': nets,
      'voucher': voucher
    }
    let payment = Object.assign({}, paymentAmt, options[mode])
    dispatch(addPaymentType(payment))
    if (mode !== 'cash') {
      dispatch(setFieldsDefault())
      document.getElementById('transID').value = ''
    }
  }

  _removePayment (mode) {
    const { dispatch } = this.props
    dispatch(setFieldsDefault())
    dispatch(removePaymentType(mode))
  }

  render () {
    const { dispatch, intl, cashTendered, paymentMode, card, amountToPay, total, payments } = this.props

    // Labels, Placeholders and Titles

    let totalLbl = formatCurrency(total)
    let paymentBal = total - compPaymentsSum(payments) < 0
      ? formatCurrency(0)
      : formatCurrency(total - compPaymentsSum(payments))
    let payInput = paymentMode === 'cash'
      ? cashTendered
      : amountToPay

    // Buttons

    let isActive = true
    let quickCashBtns = [
      {name: '', blank: true, label: '', size: 'is-1'},
      {name: '10', label: '$10', isActive, color: 'blue', size: 'is-2'},
      {name: '20', label: '$20', isActive, color: 'blue', size: 'is-2'},
      {name: '50', label: '$50', isActive, color: 'blue', size: 'is-2'},
      {name: '100', label: '$100', isActive, color: 'blue', size: 'is-2'},
      {name: 'clear', label: 'CLEAR', isActive, color: 'pink', size: 'is-2'}
    ]

    let cardSLCTD = (name) => { return name === card.provider }

    let cardBtns = [
      // {name: '', blank: true, label: '', size: 'is-1'},
      {name: 'visa', imgUrl: 'visa', inverted: cardSLCTD('visa'), isActive, size: 'is-4'},
      {name: 'master', imgUrl: 'mc', inverted: cardSLCTD('master'), isActive, size: 'is-4'},
      {name: 'amex', imgUrl: 'amex', inverted: cardSLCTD('amex'), isActive, size: 'is-4'},
      {name: 'diners', imgUrl: 'diners', inverted: cardSLCTD('diners'), isActive, size: 'is-4'},
      {name: 'union', imgUrl: 'union', inverted: cardSLCTD('union'), isActive, size: 'is-4'}
    ]

    let modeSLCTD = (name) => { return name === paymentMode }

    let payModeBtns = [
      {name: 'cash', label: 'app.general.cash', inverted: modeSLCTD('cash'), isActive, color: 'purple', size: 'is-6'},
      {name: 'credit', label: 'app.button.credit', inverted: modeSLCTD('credit'), isActive, color: 'purple', size: 'is-6'},
      {name: 'nets', label: 'app.button.debit', inverted: modeSLCTD('nets'), isActive, color: 'purple', size: 'is-6'},
      {name: 'voucher', label: 'app.button.voucher', inverted: modeSLCTD('voucher'), isActive, color: 'purple', size: 'is-6'}
    ]

    // Controls based on payment mode

    let otherCtrls = (mode) => {
      let inputPH = mode !== 'cash'
        ? mode !== 'voucher' ? intl.formatMessage({id: 'app.ph.enterTransId'}) : intl.formatMessage({id: 'app.general.voucherCode'})
        : null
      return (
        <div className='columns is-multiline is-mobile is-fullwidth is-marginless'>
          <div className={`column ${mode === 'cash' ? 'is-12' : 'is-7'}`}>
            <p>select card providers</p>
            {mode === 'credit' || mode === 'cash'
              ? <POSButtons
                containerStyle={mode !== 'cash' ? styles.cardCtnr : styles.btnCtnr}
                buttonStyle={mode === 'cash' ? styles.btnStyle : styles.cardProv}
                buttons={mode === 'cash' ? quickCashBtns : cardBtns}
                onClickButton={mode !== 'cash'
                  ? (name) => { dispatch(setActiveCard('credit', name)) }
                  : (value) => {
                    if (value !== 'clear') {
                      let amount = formatNumber(amountToPay) + Number(value)
                      dispatch(setAmountTendered(amount))
                      dispatch(setCashTendered(amount))
                      this._addPayment(mode, amount)
                    } else {
                      dispatch(setCashTendered(0))
                      this._removePayment(mode)
                    }
                  }
                } />
              : null
            }
            {mode !== 'cash'
              ? <p className='control has-icon has-addons' style={{marginTop: 7}}>
                <input id='transID' className='input is-info' style={{width: '100%'}}
                  placeholder={inputPH}
                  onChange={
                    (e) => { dispatch(setTransCode(e.target.value, mode)) }
                  } />
                <span className='icon is-small'>
                  <i className='fa fa-asterisk' />
                </span>
                <a className='button is-info' onClick={(e) => { this._addPayment(mode) }}>
                  add card
                </a>
              </p>
              : null
            }
          </div>
          {mode === 'cash'
            ? null
            : <div className='column is-5'>
              <p>added {mode}</p>
              <div className='box has-text-left'>
                {payments.length > 0
                  ? payments.map((payment, key) => {
                    if (payment.type === mode) {
                      return (
                        <span className='tag' key={key} style={{margin: 5}}>
                          {`${payment.provider || payment.type}:  ${formatCurrency(payment.deduction || payment.amount)}`}
                        </span>
                      )
                    }
                  })
                  : <p>no added {mode}</p>
                }
              </div>
            </div>
          }
        </div>
      )
    }

    return (
      <ModalCard title={'app.modal.payment'}
        closeAction={this._closeModal.bind(this)}
        confirmAction={this._confirm.bind(this)} >
        <ContentDivider offset={2} size={8}
          contents={[
            <div className='columns is-multiline is-mobile is-fullwidth is-marginless'>
              <div className='column is-4 has-text-centered' style={styles.center}>
                <p className='title is-4'>
                  <strong>TOTAL</strong>
                </p>
              </div>
              <div className='column is-8 has-text-centered'>
                <p className='title is-3'><strong>{totalLbl}</strong></p>
              </div>
              <div className='column is-4 has-text-centered' style={styles.center}>
                <p className='title is-4'>
                  <strong>PAY</strong>
                </p>
              </div>
              <div className='column is-8'>
                <input className='input is-large is-success' style={styles.input}
                  value={payInput}
                  onChange={e => {
                    let value = formatNumber(e.target.value)
                    dispatch(setCashTendered(value))
                    dispatch(setAmountTendered(value))
                    if (paymentMode === 'cash') { this._addPayment.bind(this, 'cash', value) }
                  }} />
              </div>
              <div className='column is-4 has-text-centered' style={styles.center}>
                <p className='title is-5'>
                  <strong>BALANCE AMOUNT</strong>
                </p>
              </div>
              <div className='column is-8 has-text-centered'>
                <p className='title is-3'><strong>{paymentBal}</strong></p>
              </div>
            </div>
          ]}
        />
        <ContentDivider offset={paymentMode === 'cash' ? 1 : null}
          size={paymentMode === 'cash' ? 10 : 12}
          contents={[
            <div className='has-text-centered'>
              <hr className='is-marginless' />
              {otherCtrls(paymentMode)}
              <hr />
            </div>
          ]}
        />
        <ContentDivider offset={1} size={10}
          contents={[
            <div className='has-text-centered'>
              <POSButtons
                buttonStyle={styles.btnStyle}
                buttons={payModeBtns}
                onClickButton={(name) => {
                  if (name !== 'cash') { dispatch(setFieldsDefault()) }
                  dispatch(setPaymentMode(name))
                }} />
            </div>
          ]}
        />
      </ModalCard>
    )
  }
}

const styles = {
  center: {
    display: 'flex',
    justifyContent: 'center',
    flexDirection: 'column'
  },
  input: {
    height: 'inherit',
    fontSize: '2.25rem',
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

function mapStateToProps (state) {
  return {
    intl: state.intl,
    payments: state.data.dataORDinfo.payments,
    total: state.data.dataORDinfo.total,
    totalDisc: state.data.dataORDinfo.totalDisc,
    amountToPay: state.app.appStoreUI.amountToPay,
    paymentMode: state.app.appStoreUI.paymentMode,
    card: state.app.appStoreUI.card,
    cash: state.app.appStoreUI.cash,
    nets: state.app.appStoreUI.nets,
    voucher: state.app.appStoreUI.voucher,
    cashTendered: state.app.appStoreUI.cashTendered
  }
}

export default connect(mapStateToProps)(injectIntl(ModalSetPayments))
