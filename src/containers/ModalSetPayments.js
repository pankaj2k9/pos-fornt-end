import React, { Component } from 'react'
import { connect } from 'react-redux'

import { injectIntl } from 'react-intl'

import ModalCard from '../components/ModalCard'
import ContentDivider from '../components/ContentDivider'
import POSButtons from '../components/POSButtons'

import {
  closeActiveModal
} from '../actions/app/mainUI'

import {
  setPaymentMode,
  setActiveCard,
  setAmountTendered,
  setFieldsDefault,
  setTransCode,
  setCashTendered
} from '../actions/app/storeUI'

import {
  addPaymentType,
  removePaymentType,
  removePaymentByKey,
  setOrderInfo
} from '../actions/data/orderData'

import { formatCurrency, formatNumber } from '../utils/string'
import { compPaymentsSum } from '../utils/computations'

class ModalSetPayments extends Component {

  _confirm () {
    const { dispatch, mainUI, orderData } = this.props
    dispatch(setOrderInfo({
      orderData: orderData,
      appData: mainUI
    }))
    dispatch(setFieldsDefault())
    dispatch(closeActiveModal())
  }

  _addPayment (mode, amount) {
    const { dispatch, card, cash, nets, voucher, amountToPay, total } = this.props
    let change = formatNumber(amount) > total ? formatNumber(amount) - total : 0
    let cashAmountPaid = formatNumber(amount) > total ? total : formatNumber(amount)
    let paymentAmt = mode === 'cash'
      ? {amount: cashAmountPaid, cash: formatNumber(amount), change: change}
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

    let lbl = (id) => { return intl.formatMessage({id: id}) } // translated lbl
    let lblAC = (id) => { return (intl.formatMessage({id: id})).toUpperCase() } // lbl all caps

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
        ? mode !== 'voucher' ? lbl('app.ph.enterTransId') : lbl('app.general.voucherCode')
        : null
      let disabled = formatNumber(amountToPay) <= 0
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
                <input id='transID' className={`input is-medium ${!disabled ? 'is-info' : 'is-danger'}`} style={{width: '100%', paddingLeft: '1.5em'}}
                  placeholder={!disabled ? inputPH : lbl('app.ph.enterAmt1st')}
                  onChange={
                    (e) => { dispatch(setTransCode(e.target.value, mode)) }
                  } />
                <span className='icon is-medium' style={{left: '1rem'}}>
                  <i className='fa fa-info-circle' />
                </span>
                {!disabled
                  ? <a className='button is-medium is-info'
                    onClick={(e) => { !disabled && this._addPayment(mode) }}>
                    {lblAC('app.button.add')}
                  </a>
                  : null
                }
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
                        <span className='tag is-medium' key={key} style={{margin: 5}}>
                          {`${payment.provider || payment.type}:  ${formatCurrency(payment.deduction || payment.amount)}`}
                          <button className='delete' onClick={e => dispatch(removePaymentByKey(key))} />
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
        closeAction={e => this._confirm()}
        confirmAction={e => this._confirm()} >
        <ContentDivider offset={2} size={8}
          contents={[
            <div className='columns is-multiline is-mobile is-fullwidth is-marginless'>
              <div className='column is-4 has-text-centered' style={styles.center}>
                <p className='title is-4'>
                  <strong>{lblAC('app.button.total')}</strong>
                </p>
              </div>
              <div className='column is-8 has-text-centered'>
                <p className='title is-3'><strong>{totalLbl}</strong></p>
              </div>
              <div className='column is-4 has-text-centered' style={styles.center}>
                <p className='title is-4'>
                  <strong>{lblAC('app.button.pay')}</strong>
                </p>
              </div>
              <div className='column is-8'>
                <input className='input is-large is-success' style={styles.input}
                  value={payInput}
                  onChange={e => {
                    let value = formatNumber(e.target.value)
                    if (paymentMode === 'cash') { dispatch(setCashTendered(value)) }
                    dispatch(setAmountTendered(value))
                    if (paymentMode === 'cash') {
                      this._addPayment('cash', value)
                    }
                  }} />
              </div>
              <div className='column is-4 has-text-centered' style={styles.center}>
                <p className='title is-5'>
                  <strong>{lblAC('app.lbl.balAmt')}</strong>
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
  let mainUI = state.app.mainUI
  let orderData = state.data.orderData
  let storeUI = state.app.storeUI
  return {
    mainUI,
    orderData,
    storeUI,
    payments: orderData.payments,
    total: orderData.total,
    totalDisc: orderData.totalDisc,
    amountToPay: storeUI.amountToPay,
    paymentMode: storeUI.paymentMode,
    card: storeUI.card,
    cash: storeUI.cash,
    nets: storeUI.nets,
    voucher: storeUI.voucher,
    cashTendered: storeUI.cashTendered,
    intl: state.intl,
    locale: state.intl.locale
  }
}

export default connect(mapStateToProps)(injectIntl(ModalSetPayments))
