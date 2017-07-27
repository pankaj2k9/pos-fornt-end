import React, { Component } from 'react'
import { connect } from 'react-redux'

import { injectIntl } from 'react-intl'

import ModalCard from '../components/ModalCard'
import ContentDivider from '../components/ContentDivider'
import POSButtons from '../components/POSButtons'
// import MoneyInput from '../components/MoneyInput'

import {
  closeActiveModal
} from '../actions/app/mainUI'

import {
  setPaymentMode,
  setActiveCard,
  setAmountTendered,
  setFieldsDefault,
  setTransCode,
  setFinalValue,
  setCashTendered,
  setCashierNotSelectedWarning
} from '../actions/app/storeUI'

import {
  addPaymentType,
  removePaymentType,
  removePaymentByKey,
  setOrderInfo,
  setCurrentCashier
} from '../actions/data/orderData'

import { formatCurrency, formatNumber, formatDecimalStr } from '../utils/string'
import { compCashChange, compPaymentsSum } from '../utils/computations'

class ModalSetPayments extends Component {

  componentDidMount () {
    const { dispatch } = this.props
    dispatch(setCashierNotSelectedWarning(false))
    document.getElementById('payInput').focus()
  }

  _close () {
    const { dispatch } = this.props
    dispatch(closeActiveModal())
    document.getElementById('barcodeInput').focus()
  }

  _confirm () {
    const { dispatch, mainUI, orderData, currentCashier } = this.props
    if (currentCashier === undefined) {
      dispatch(setCashierNotSelectedWarning(true))
      return
    }
    dispatch(setOrderInfo({ orderData: orderData, appData: mainUI }))
    dispatch(setFieldsDefault())
    dispatch(closeActiveModal())
    document.getElementById('barcodeInput').focus()
  }

  _addPayment (mode, amount) {
    const { dispatch, card, cash, nets, voucher, amountToPay, total } = this.props
    let change = formatNumber(amount) > total ? formatNumber(amount) - total : 0
    let cashAmountPaid = formatNumber(amount) > total ? total : formatNumber(amount)
    let paymentAmt = (mode === 'cash')
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

    // let paymentAmt

    // switch (mode) {
    //   case 'cash':
    //     paymentAmt = {
    //       amount: cashAmountPaid,
    //       cash: formatNumber(amount),
    //       change: change
    //     }
    //     break
    //   case 'voucher':
    //     paymentAmt = {
    //       deduction: formatNumber(amountToPay)
    //     }
    //     break
    //   default:
    //     paymentAmt = {
    //       amount: formatNumber(amountToPay),
    //       change: formatNumber(amountToPay) > total ? formatNumber(amountToPay) - total : 0
    //     }
    // }

    let payment = Object.assign({}, paymentAmt, options[mode])
    dispatch(addPaymentType(total, payment))
    if (mode !== 'cash') {
      dispatch(setFieldsDefault())
      document.getElementById('transID').value = ''
    }
  }

  _setFinalValue (e) {
    e.preventDefault()
    const { dispatch, paymentMode } = this.props
    document.getElementById('okBtn').className = 'is-hidden'
    let amtInput = document.getElementById('payInput')
    let amt = amtInput && document.getElementById('payInput').value
    let initial = amt.replace(/[^\d.]/g, '')
    let final = formatDecimalStr(initial)
    dispatch(setFinalValue(paymentMode, final))
    if (paymentMode === 'cash') {
      this._addPayment('cash', final)
    } else {
      document.getElementById('transID').focus()
    }
  }

  _removePayment (mode) {
    const { dispatch, total } = this.props
    dispatch(setFieldsDefault())
    dispatch(removePaymentType(total, mode))
  }

  render () {
    const { dispatch, intl, cashTendered, paymentMode, card, amountToPay, total, payments, vouchers, cashiers, currentCashier, cashierNotSelectedWarning } = this.props

    // Labels, Placeholders and Titles

    let totalLbl = formatCurrency(total)
    let paymentBal = compCashChange(payments) === 0 ? formatCurrency(total - compPaymentsSum(payments, false, vouchers)) : formatCurrency(compCashChange(payments) * -1)
    let payInput = paymentMode === 'cash'
      ? (cashTendered === 0 ? '' : cashTendered)
      : amountToPay
    let cashInputPH = paymentMode === 'cash' && !(cashTendered === '' || cashTendered !== '$0.00' || cashTendered !== 0)
      ? cashTendered
      : '$0.00'
    if (document.getElementById('payInput')) {
      document.getElementById('payInput').value = payInput
    }

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

    let cashiersButtons = []

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
      let ctrlLbl = mode !== 'cash'
        ? mode !== 'voucher' ? 'CARD' : 'VOUCHER'
        : 'QUICK CASH'
      let disabled = formatNumber(amountToPay) <= 0
      return (
        <div className='columns is-multiline is-mobile is-fullwidth is-marginless'>
          <div className={`column ${mode === 'cash' ? 'is-12' : 'is-7'}`}>
            <p>{ctrlLbl}</p>
            {mode === 'credit' || mode === 'cash'
              ? <POSButtons
                containerStyle={mode !== 'cash' ? styles.cardCtnr : styles.btnCtnr}
                buttonStyle={mode === 'cash' ? styles.btnStyle : styles.cardProv}
                buttons={mode === 'cash' ? quickCashBtns : cardBtns}
                onClickButton={mode !== 'cash'
                  ? (name) => {
                    dispatch(setActiveCard('credit', name))
                    document.getElementById('transID').focus()
                  }
                  : (value) => {
                    if (value !== 'clear') {
                      let initial = formatNumber(amountToPay) + Number(value)
                      let final = formatDecimalStr(String(initial).replace(/[^\d.]/g, ''))
                      dispatch(setAmountTendered(final))
                      dispatch(setCashTendered(final))
                      this._addPayment(mode, initial)
                    } else {
                      dispatch(setCashTendered(''))
                      this._removePayment(mode)
                    }
                    document.getElementById('payInput').focus()
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
                          <button className='delete' onClick={e => dispatch(removePaymentByKey(total, key))} />
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
        closeAction={e => this._close()}
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
                <form onSubmit={e => this._setFinalValue(e)}>
                  <p className='control has-addons'>
                    <input id='payInput' className='input is-large is-success' style={styles.input}
                      onChange={e => {
                        if (e.target.value !== '') {
                          document.getElementById('okBtn').className = 'button is-large is-success'
                        } else if (e.target.value === '') {
                          document.getElementById('okBtn').className = 'is-hidden'
                        }
                      }} onFocus={e => { document.getElementById('okBtn').className = 'is-hidden' }} placeholder={cashInputPH} />
                    <a id='okBtn' onClick={e => this._setFinalValue(e)} style={{height: 48, fontSize: 10}}>
                      {paymentMode === 'cash' && cashTendered !== '' ? 'EDIT' : 'ENTER'}
                    </a>
                  </p>
                </form>
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
                  dispatch(setPaymentMode(name))
                  document.getElementById('okBtn').className = 'is-hidden'
                  if (name !== 'cash') { dispatch(setFieldsDefault()) }
                  document.getElementById('payInput').focus()
                }} />
            </div>
          ]}
        />
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

function mapStateToProps (state) {
  let mainUI = state.app.mainUI
  let orderData = state.data.orderData
  let storeUI = state.app.storeUI
  return {
    mainUI,
    orderData,
    storeUI,
    cashiers: mainUI.activeStaff ? mainUI.activeStaff.staffs : [],
    currentCashier: orderData.currentCashier,
    cashierNotSelectedWarning: storeUI.cashierNotSelectedWarning,
    payments: orderData.payments,
    vouchers: orderData.vouchers,
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
