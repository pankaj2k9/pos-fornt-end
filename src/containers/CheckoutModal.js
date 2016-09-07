import React, {Component, PropTypes} from 'react'
import { connect } from 'react-redux'
import { FormattedMessage } from 'react-intl'

import CheckoutControls from '../components/CheckoutControls'
import CheckoutProcessing from '../components/CheckoutProcessing'
import {closeActiveModal} from '../actions/application'

import {
  setCashTendered,
  setTransNumber,
  setPinCode,
  setCardType,
  setCardProvider
} from '../actions/panelCheckout'

import {processOrder} from '../actions/orders'
import {resetStore, resetCheckoutModal, reprintReceipt} from '../actions/helpers'

class CheckoutModal extends Component {
  static propTypes () {
    return {
      id: PropTypes.string,
      title: PropTypes.string,
      submitText: PropTypes.string,
      submitAction: PropTypes.function
    }
  }

  onClickSubmit (data) {
    const { dispatch, orderItems,
            currency, paymentMode,
            activeCustomer, pincode, adminToken,
            cashTendered, locale, card,
            transNumber, storeId, voucher,
            orderNote, isDiscounted, overAllTotal
          } = this.props

    let staff = 'Shiela'
    let total = currency === 'sgd'
      ? Number(overAllTotal).toFixed(2)
      : Number(overAllTotal)

    let products = orderItems.map(item => {
      return {
        id: item.id,
        quantity: item.qty,
        discount: item.customDiscount === 0 // Check if zero custom discount
          ? isDiscounted // if true then check for default discount
            ? currency === 'sgd'
              ? item.priceDiscount
              : item.odboPriceDiscount
            : 0.00 // if no default then return zero
          : item.customDiscount // if custom dicount has value then return value
      }
    })

    let items = []
    orderItems.forEach(item => {
      items.push({
        id: item.id,
        name: locale === 'en' ? item.nameEn : item.nameZh,
        qty: item.qty,
        subtotal: currency === 'sgd'
          ? item.subTotalPrice
          : item.subTotalOdboPrice
      })
    })

    let voucherCode = (currency === 'sgd')
      ? !voucher
        ? undefined
        : voucher.code
      : undefined

    let receiptTrans = (currency === 'sgd')
      ? (paymentMode === 'cash')
        ? {type: 'cash', total: total, cash: cashTendered, change: data.change}
        : { type: 'credit', total: total, transNo: transNumber,
            cardType: card.type, provider: card.provider}
      : { type: 'odbo', total: total,
          odboCoins: data.odboCoins, odboBalance: data.odboBalance }

    let remarks = orderNote.length === 0
      ? [{type: 'others', message: 'no notes'}]
      : orderNote

    const receipt = {
      items,
      info: {
        date: new Date(),
        staff
      },
      trans: receiptTrans,
      headerText: ['485 Joo Christ Rd', 'Singapore', 'Tel. 02-323-1268'],
      footerText: ['Thank you', 'Have a nice day!']
    }

    let bonus = currency === 'sgd'
      ? 99
      : 0

    let posTrans = (currency === 'sgd')
      ? (paymentMode === 'cash')
        ? { type: 'cash', payment: overAllTotal, bonusPoints: bonus }
        : { type: 'credit', transNumber: transNumber,
            cardType: card.type, provider: card.provider,
            bonusPoints: bonus }
      : {type: 'odbo', odboId: activeCustomer.odboId, pinCode: pincode}

    const orderInfo = {
      products,
      currency,
      source: storeId,
      adminToken: adminToken,
      voucherCode: voucherCode,
      posTrans,
      remarks
    }
    dispatch(processOrder(orderInfo, receipt))
  }

  onClickCancel () {
    const {dispatch, orderError, orderSuccess} = this.props
    orderError === '' && orderSuccess
    ? dispatch(resetStore())
    : dispatch(closeActiveModal()) && document.getElementById('productsSearch').focus()
  }

  onClickReset () {
    const {dispatch} = this.props
    dispatch(resetCheckoutModal())
  }

  onChange (value) {
    const {dispatch, currency, paymentMode} = this.props
    currency === 'sgd'
      ? paymentMode === 'cash'
        ? dispatch(setCashTendered(value))
        : dispatch(setTransNumber(value))
      : dispatch(setPinCode(value))
  }

  onClickReprint () {
    const {dispatch, receiptData} = this.props
    dispatch(reprintReceipt(receiptData))
  }

  onClickCardToggle () {
    const {dispatch, card} = this.props
    card.type === 'credit'
    ? dispatch(setCardType('debit'))
    : dispatch(setCardType('credit'))
  }

  onClickCardProvToggle (provider) {
    const {dispatch} = this.props
    dispatch(setCardProvider(provider))
  }

  render () {
    const {
      id,
      activeModalId,
      isProcessing,
      currency,
      paymentMode,
      cashTendered,
      card,
      transNumber,
      activeCustomer,
      walkinCustomer,
      orderError,
      orderSuccess,
      overAllTotal,
      recieptData,
      reprinting
    } = this.props

    let odboCoins = (activeCustomer !== null || undefined)
    ? isNaN(Number(activeCustomer.odboCoins))
      ? Number(0).toFixed(2)
      : Number(activeCustomer.odboCoins)
    : Number(0).toFixed(2)

    const odboBalance = (odboCoins <= 0 || isNaN(odboCoins))
      ? Number(0).toFixed(2)
      : odboCoins
    const total = Number(overAllTotal).toFixed(2)
    const odboMinusTotal = Number(odboBalance) - Number(overAllTotal)
    const cashMinusTotal = Number(cashTendered) - Number(overAllTotal)
    const cashChange = (cashMinusTotal < 0 || isNaN(cashMinusTotal))
      ? Number(0).toFixed(2)
      : Number(cashMinusTotal)
    const newOdboBalance = odboMinusTotal < 0 || isNaN(odboMinusTotal) ? Number(0).toFixed(2) : odboMinusTotal

    return (
      <div id={id} className={'modal ' + (activeModalId === id ? 'is-active' : '')}>
        <div className='modal-background'></div>
        <div className='modal-card'>
          <header className='modal-card-head has-text-centered'>
            <p className='modal-card-title'>
              {currency === 'sgd'
                ? paymentMode === 'cash' ? 'Cash Payment' : 'Credit Card Payment'
                : 'The Odbo Member Payment'}
            </p>
          </header>

          {!orderSuccess && orderError === ''
            ? <CheckoutControls
              activeCustomer={activeCustomer}
              walkinCustomer={walkinCustomer}
              isProcessing={isProcessing}
              currency={currency}
              paymentMode={paymentMode}
              odboBalance={odboBalance}
              onChange={this.onChange.bind(this)}
              card={card}
              onClickCardToggle={this.onClickCardToggle.bind(this)}
              onClickCardProvToggle={this.onClickCardProvToggle.bind(this)}
              total={total}
              cashTendered={cashTendered}
              cashChange={cashChange}
              odboMinusTotal={newOdboBalance}
            />
            : <CheckoutProcessing
              isProcessing={isProcessing}
              orderError={orderError}
              orderSuccess={orderSuccess}
              recieptData={recieptData}
              reprinting={reprinting}
              onClickReprint={this.onClickReprint.bind(this)}
            />
          }
          {
            !isProcessing
            ? <footer className='modal-card-foot'>
              <div className='columns' style={{flex: 1}}>
                <p className='column control is-marginless'>
                  <a className={(!orderSuccess)
                    ? orderError === ''
                      ? 'button is-large is-fullwidth is-danger'
                      : 'button is-large is-fullwidth is-warning'
                    : 'button is-large is-fullwidth is-info'}
                    onClick={
                      orderError === ''
                      ? this.onClickCancel.bind(this)
                      : this.onClickReset.bind(this)}>
                    {!orderSuccess
                      ? orderError === ''
                        ? <FormattedMessage id='app.button.close' />
                        : <FormattedMessage id='app.button.retry' />
                      : <FormattedMessage id='app.button.nextTrans' />}
                  </a>
                </p>
                {
                  (currency === 'sgd') && !orderSuccess && orderError === ''
                  ? (cashMinusTotal >= Number(0).toFixed(2)) || paymentMode === 'credit' && transNumber !== ''
                    ? <p className='column control is-marginless'>
                      <a className='button is-large is-success is-fullwidth'
                        onClick={this.onClickSubmit.bind(this, {change: cashChange})}>
                        <FormattedMessage id='app.button.confirm' />
                      </a>
                    </p>
                    : null
                  : (odboMinusTotal >= Number(0).toFixed(2)) && !orderSuccess && orderError === ''
                    ? <p className='column control is-marginless'>
                      <a className='button is-large is-success is-fullwidth'
                        onClick={this.onClickSubmit.bind(this, {odboCoins: odboCoins, odboBalance: odboMinusTotal})}>
                        <FormattedMessage id='app.button.confirm' />
                      </a>
                    </p>
                    : null
                }
              </div>
            </footer>
            : null
          }
        </div>
      </div>
    )
  }
}

CheckoutModal.PropTypes = {
  locale: PropTypes.string,
  orderItems: PropTypes.array,
  paymentMode: PropTypes.string,
  walkinCustomer: PropTypes.string,
  voucherDiscount: PropTypes.number,
  orderNote: PropTypes.array,
  overAllTotal: PropTypes.number,
  card: PropTypes.object,
  voucher: PropTypes.object
}

function mapStateToProps (state) {
  return {
    storeId: state.application.storeId,
    activeModalId: state.application.activeModalId,
    adminToken: state.application.adminToken,
    isProcessing: state.orders.isProcessing,
    orderError: state.orders.orderError,
    orderSuccess: state.orders.orderSuccess,
    totalPrice: state.panelCart.totalPrice,
    totalOdboPrice: state.panelCart.totalOdboPrice,
    orderNote: state.panelCheckout.orderNote,
    cashTendered: state.panelCheckout.cashTendered,
    card: state.panelCheckout.card,
    transNumber: state.panelCheckout.transNumber,
    activeCustomer: state.panelCart.activeCustomer,
    pincode: state.panelCheckout.pincode,
    receiptData: state.orders.receipt,
    reprinting: state.orders.reprinting
  }
}

export default connect(mapStateToProps)(CheckoutModal)
