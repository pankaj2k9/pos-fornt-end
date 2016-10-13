import React, {Component, PropTypes} from 'react'
import { connect } from 'react-redux'
import { injectIntl, FormattedMessage } from 'react-intl'

import CheckoutControls from '../components/CheckoutControls'
import CheckoutProcessing from '../components/CheckoutProcessing'
import {closeActiveModal} from '../actions/application'

import {
  checkoutFieldsReset,
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

  componentDidUpdate () {
    const {orderSuccess} = this.props
    if (!orderSuccess) {
      document.getElementById('modalInput').focus()
    }
  }

  componentDidMount () {
    const {orderSuccess} = this.props
    if (!orderSuccess) {
      document.getElementById('modalInput').focus()
    }
  }

  componentWillUnmount () {
    document.getElementById('productsSearch').focus()
  }

  onClickSubmit (data, event) {
    event.preventDefault()
    const { dispatch, orderItems, customDiscount,
            currency, paymentMode, activeCashier,
            activeCustomer, pincode, adminToken,
            cashTendered, locale, card,
            transNumber, storeId, voucher,
            orderNote, isDiscounted, overAllTotal,
            bonusPoints, walkinCustomer, store,
            sumOfCartItems, overAllDeduct
          } = this.props

    let staff = `${activeCashier.firstName || ''} ${activeCashier.lastName || ''}`
    let total = overAllTotal

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
    console.log('overAllDeduct: ', overAllDeduct)
    let items = []
    orderItems.forEach(item => {
      let itemCD = Number(item.customDiscount)
      let itemQty = Number(item.qty)
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
          ? (itemCD / 100) * item.price
          : (itemCD / 100) * item.odboPrice
      let computedDiscount = currency === 'sgd'
        ? Number(item.price) - discount
        : Number(item.odboPrice) - Math.round(discount)
      items.push({
        id: item.id,
        name: `${item.nameEn.substring(0, 18)}...\n
          #${item.barcodeInfo || ''}\n
          ${showDiscount}`,
        qty: itemQty,
        subtotal: currency === 'sgd'
          ? Number(itemQty * computedDiscount).toFixed(2)
          : itemQty * computedDiscount
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

    let customer = activeCustomer
      ? `${activeCustomer.lastName}, ${activeCustomer.firstName}`
      : undefined

    let prevOdbo = activeCustomer
      ? activeCustomer.odboCoins
      : 0

    let receiptTrans = (currency === 'sgd')
      ? (paymentMode === 'cash')
        ? {
          type: 'cash',
          total: total,
          cash: cashTendered,
          walkIn: walkinCustomer,
          customer: customer,
          previousOdbo: prevOdbo,
          change: data.change,
          voucherDiscount: voucherAmount,
          sumOfCartItems: sumOfCartItems,
          customDiscount: customDiscount ? overAllDeduct : undefined,
          orderNote
        }
        : {
          type: 'credit',
          total: total,
          transNo: transNumber,
          walkIn: walkinCustomer,
          customer: customer,
          previousOdbo: prevOdbo,
          cardType: card.type === 'debit' ? 'Nets' : 'Credit',
          provider: !card.provider ? undefined : card.provider,
          voucherDiscount: voucherAmount,
          sumOfCartItems: sumOfCartItems,
          customDiscount: customDiscount ? overAllDeduct : undefined,
          orderNote
        }
      : {
        type: 'odbo',
        total: total,
        odboCoins: data.odboCoins,
        odboBalance: data.odboBalance,
        orderNote
      }

    let remarks = orderNote.length === 0
      ? [{type: 'others', message: 'no notes'}]
      : orderNote

    let storeAddress = !store.storeAddress
      ? [
        'The ODBO',
        '200 Victoria Street',
        'Bugis Junction #02-22',
        'SINGAPORE',
        'Telephone : 6238 1337'
      ]
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

    let odboId = !activeCustomer ? undefined : activeCustomer.odboId

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
          provider: !card.provider ? undefined : card.provider,
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
    document.getElementById('productsSearch').focus()
  }

  onClickCancel () {
    const {dispatch, orderSuccess, locale} = this.props
    orderSuccess
    ? dispatch(resetStore(locale)) && document.getElementById('productsSearch').focus()
    : dispatch(closeActiveModal()) && dispatch(checkoutFieldsReset()) &&
      document.getElementById('productsSearch').focus()
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
      ? 0
      : Number(activeCustomer.odboCoins)
    : 0

    const odboBalance = (odboCoins <= 0 || isNaN(odboCoins))
      ? 0
      : odboCoins
    const total = overAllTotal
    const odboMinusTotal = odboBalance - overAllTotal
    const cashMinusTotal = Number(cashTendered) - overAllTotal
    const cashChange = (cashMinusTotal < 0 || isNaN(cashMinusTotal))
      ? 0
      : Number(cashMinusTotal).toFixed(2)
    const newOdboBalance = odboMinusTotal < 0 || isNaN(odboMinusTotal)
      ? 0
      : odboMinusTotal

    let data = currency !== 'sgd'
      ? {odboCoins: odboCoins, odboBalance: odboMinusTotal}
      : {change: cashChange}

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
              odboCoins={odboCoins}
              odboBalance={odboBalance}
              onChange={this.onChange.bind(this)}
              card={card}
              onClickCardToggle={this.onClickCardToggle.bind(this)}
              onClickCardProvToggle={this.onClickCardProvToggle.bind(this)}
              total={total}
              cashTendered={Number(cashTendered).toFixed(2)}
              cashChange={cashChange}
              odboMinusTotal={newOdboBalance}
              transNumber={transNumber}
              onSubmit={this.onClickSubmit.bind(this, data)}
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
                  ? (cashMinusTotal >= 0) || paymentMode === 'credit'
                    ? <p className='column control is-marginless'>
                      <a id='confirmCheckout' className='button is-large is-success is-fullwidth'
                        onClick={this.onClickSubmit.bind(this, {change: cashChange})}>
                        <FormattedMessage id='app.button.confirm' />
                      </a>
                    </p>
                    : null
                  : (odboMinusTotal >= 0) && !orderSuccess && orderError === ''
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
  overAllDeduct: PropTypes.number,
  sumOfCartItems: PropTypes.number,
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
    reprinting: state.orders.reprinting,
    intl: state.intl
  }
}

export default connect(mapStateToProps)(injectIntl(CheckoutModal))
