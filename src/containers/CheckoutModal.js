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
    const { dispatch, orderItems, customDiscount,
            currency, paymentMode, activeCashier,
            activeCustomer, pincode, adminToken,
            cashTendered, locale, card,
            transNumber, storeId, voucher,
            orderNote, isDiscounted, overAllTotal,
            bonusPoints, walkinCustomer, store
          } = this.props

    let staff = `${activeCashier.firstName} ${activeCashier.lastName}`
    let total = currency === 'sgd'
      ? Number(overAllTotal).toFixed(2)
      : Number(overAllTotal)

    let products = orderItems.map(item => {
      return {
        id: item.id,
        quantity: item.qty,
        discount: !customDiscount || customDiscount === 0 || customDiscount === ''
          ? item.customDiscount === 0 // Check if zero custom discount
            ? isDiscounted // if true then check for default discount
              ? currency === 'sgd'
                ? item.priceDiscount
                : item.odboPriceDiscount
              : 0
            : item.customDiscount // if custom dicount has value then return value
          : customDiscount
      }
    })

    let items = []
    orderItems.forEach(item => {
      let discountPercent = item.customDiscount === 0
        ? item.isDiscounted
          ? currency === 'sgd'
            ? `${item.priceDiscount}%`
            : `${item.odboPriceDiscount}%`
          : ''
        : `${item.customDiscount}%`
      let showDiscount = item.customDiscount === 0
        ? item.isDiscounted
          ? locale === 'en'
            ? `(less ${discountPercent})`
            : `(减去 ${discountPercent})`
          : ''
        : locale === 'en'
          ? `(less ${discountPercent})`
          : `(减去 ${discountPercent})`
      let discount = item.customDiscount === 0
        ? item.isDiscounted
          ? currency === 'sgd'
            ? (Number(item.priceDiscount) / 100) * item.price
            : (parseInt(item.odboPriceDiscount) / 100) * item.odboPrice
          : 0.00
        : currency === 'sgd'
          ? (Number(item.customDiscount) / 100) * item.price
          : (Number(item.customDiscount) / 100) * item.odboPrice
      let computedDiscount = currency === 'sgd'
        ? Number(item.price) - discount
        : Number(item.odboPrice) - discount
      items.push({
        id: item.id,
        name: `${item.nameEn} ${showDiscount}`,
        qty: item.qty,
        subtotal: currency === 'sgd'
          ? Number(Number(item.qty) * computedDiscount).toFixed(2)
          : parseInt(item.qty) * Number(computedDiscount)
      })
    })

    let voucherCode = (currency === 'sgd')
      ? !voucher
        ? undefined
        : voucher.code
      : undefined

    let voucherAmount = (currency === 'sgd')
      ? !voucher
        ? undefined
        : voucher.amount
      : undefined

    let bonus = bonusPoints
      ? currency === 'sgd'
        ? 100
        : 0
      : 0

    let earnedPoints = bonusPoints
      ? Number(total).toFixed(0) * 2
      : 0

    let earnedPlusPrevious = activeCustomer
      ? Number(earnedPoints) + Number(activeCustomer.odboCoins)
      : 0

    console.log('earnedPlusPrevious: ', earnedPlusPrevious)

    let customer = activeCustomer
      ? `${activeCustomer.lastName}, ${activeCustomer.firstName}`
      : undefined

    let prevOdbo = activeCustomer
      ? activeCustomer.odboCoins
      : 0.00

    let receiptTrans = (currency === 'sgd')
      ? (paymentMode === 'cash')
        ? {
          type: 'cash',
          total: total,
          cash: cashTendered,
          walkIn: !walkinCustomer ? 'N/A' : walkinCustomer,
          customer: customer,
          previousOdbo: prevOdbo,
          points: earnedPoints,
          newOdbo: earnedPlusPrevious,
          change: data.change,
          voucherDiscount: voucherAmount
        }
        : {
          type: 'credit',
          total: total,
          transNo: transNumber,
          walkIn: !walkinCustomer ? 'N/A' : walkinCustomer,
          customer: customer,
          previousOdbo: prevOdbo,
          points: earnedPoints,
          newOdbo: earnedPlusPrevious,
          cardType: card.type,
          provider: card.provider
        }
      : {
        type: 'odbo',
        total: total,
        odboCoins: data.odboCoins,
        odboBalance: data.odboBalance
      }

    let remarks = orderNote.length === 0
      ? [{type: 'others', message: 'no notes'}]
      : orderNote

    let storeAddress = !store.storeAddress
      ? ['485 Joo Christ Rd', 'Singapore', 'Tel. 02-323-1268']
      : [store.name, store.storeAddress]

    const receipt = {
      items,
      trans: receiptTrans,
      headerText: storeAddress,
      footerText: ['Thank you', 'Have a nice day!']
    }

    let payment = cashTendered === 0 || !cashTendered || cashTendered === ''
      ? 0
      : cashTendered

    let odboId = !activeCustomer.odboId ? undefined : activeCustomer.odboId

    let posTrans
    if (currency === 'sgd') {
      if (paymentMode === 'cash') {
        posTrans = {
          type: 'cash',
          payment: Number(payment),
          bonusPoints: bonus,
          odboId: odboId
        }
      } else if (paymentMode === 'credit') {
        posTrans = {
          type: 'credit',
          transNumber,
          cardType: card.type,
          provider: card.provider,
          bonusPoints: bonus,
          odboId: odboId
        }
      }
    } else if (currency === 'odbo') {
      posTrans = {
        type: 'odbo',
        odboId: odboId,
        pinCode: pincode
      }
    }

    const orderInfo = {
      products,
      currency,
      source: storeId,
      adminToken: adminToken,
      voucherCode: voucherCode,
      posTrans,
      remarks
    }
    dispatch(processOrder(orderInfo, receipt, staff))
  }

  onClickCancel () {
    const {dispatch, orderSuccess, locale} = this.props
    orderSuccess
    ? dispatch(resetStore(locale)) && document.getElementById('productsSearch').focus()
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
        <div className='modal-background' />
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
                      <a id='confirmCheckout' className='button is-large is-success is-fullwidth'
                        onClick={this.onClickSubmit.bind(this, {change: cashChange})}>
                        <FormattedMessage id='app.button.confirm' />
                      </a>
                    </p>
                    : null
                  : (odboMinusTotal >= Number(0).toFixed(2)) && !orderSuccess && orderError === ''
                    ? <p className='column control is-marginless'>
                      <a id='confirmCheckout' className='button is-large is-success is-fullwidth'
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
    store: state.application.store,
    activeModalId: state.application.activeModalId,
    adminToken: state.application.adminToken,
    activeCashier: state.application.activeCashier,
    isProcessing: state.orders.isProcessing,
    orderError: state.orders.orderError,
    orderSuccess: state.orders.orderSuccess,
    totalPrice: state.panelCart.totalPrice,
    totalOdboPrice: state.panelCart.totalOdboPrice,
    orderNote: state.panelCheckout.orderNote,
    bonusPoints: state.panelCheckout.bonusPoints,
    cashTendered: state.panelCheckout.cashTendered,
    card: state.panelCheckout.card,
    transNumber: state.panelCheckout.transNumber,
    activeCustomer: state.panelCart.activeCustomer,
    pincode: state.panelCheckout.pincode,
    customDiscount: state.panelCheckout.customDiscount,
    receiptData: state.orders.receipt,
    reprinting: state.orders.reprinting
  }
}

export default connect(mapStateToProps)(CheckoutModal)
