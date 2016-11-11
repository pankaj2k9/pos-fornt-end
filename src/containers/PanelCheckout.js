/*
* TODO:
*
*
*/

import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { injectIntl, FormattedMessage } from 'react-intl'

import Panel from '../components/Panel'
import PanelProducts from './PanelProducts'
import PanelCheckoutModals from './PanelCheckoutModals'
import Level from '../components/Level'
import Counter from '../components/Counter'
import Truncate from '../components/Truncate'

import FunctionButtons from '../components/FunctionButtons'

import { setActiveModal, closeActiveModal } from '../actions/application'
import {
  addPaymentType,
  removePaymentType,
  setOrderNote,
  panelCheckoutShouldUpdate,
  setPinCode
} from '../actions/panelCheckout'

import {
  setCartItemQty,
  setCustomDiscount,
  removeCartItem,
  removeCustomer,
  panelCartShouldUpdate,
  setCurrencyType
} from '../actions/panelCart'

import {
  resetStore,
  reprintReceipt,
  printPreviewTotalReceipt
} from '../actions/helpers'

import {processOrder} from '../actions/orders'
import { formatCurrency } from '../utils/string'

const focusProductSearch = 'productsSearch'

class PanelCheckout extends Component {
  componentDidUpdate () {
    const {printPreviewTotal} = this.props
    if (printPreviewTotal) {
      this._processOrder()
    }
  }

  _clickRemoveCustomer () {
    const {dispatch} = this.props
    dispatch(setCurrencyType('sgd'))
    dispatch(removeCustomer())
  }

  _clickConfirm () {
    const { dispatch } = this.props
    dispatch(setActiveModal(''))
    dispatch(panelCheckoutShouldUpdate(false))
  }

  _clickAddNote (event) {
    event.preventDefault()
    const { dispatch, orderNote } = this.props
    var noteToAdd = [{
      type: 'others',
      message: document.getElementById('noteInput').value
    }]
    var newNote = orderNote.concat(noteToAdd)
    dispatch(setOrderNote(newNote))
    document.getElementById('noteInput').value = ''
    document.getElementById('productsSearch').focus()
  }

  _clickViewNotes () {
    const { dispatch } = this.props
    dispatch(setActiveModal('notesModal'))
  }

  _closeModal () {
    const { dispatch, activeModalId, orderSuccess } = this.props
    if (activeModalId === 'orderProcessed') {
      if (orderSuccess) {
        dispatch(resetStore())
      }
    }
    dispatch(closeActiveModal(focusProductSearch))
    dispatch(panelCheckoutShouldUpdate(false))
  }

  _clickReprint () {
    const {dispatch, receiptData} = this.props
    dispatch(reprintReceipt(receiptData))
  }

  _clickCheckoutButtons (buttonName) {
    const { dispatch, cartItemsArray } = this.props
    let mode = buttonName.toLowerCase()
    if (mode === 'clear') {
      dispatch(resetStore())
    } else if (mode === 'checkout order') {
      const okForCheckout = cartItemsArray.length !== 0 && this.paymentMinusOrderTotal() >= 0
      if (okForCheckout) {
        this._processOrder()
        dispatch(panelCheckoutShouldUpdate(true))
      }
    } else if (mode === 'open drawer') {
      dispatch(setActiveModal('verifyStorePin'))
      dispatch(panelCheckoutShouldUpdate(true))
    }
  }

  _setOdboUserPincode (value) {
    const { dispatch } = this.props
    dispatch(setPinCode(value))
  }

  _removePayment (value) {
    const { dispatch } = this.props
    dispatch(panelCheckoutShouldUpdate(true))
    dispatch(removePaymentType(value))
  }

  /*
  / COMPUTATIONS
  */

  sumOfCartItems () {
    const {cartItemsArray, currency} = this.props

    let x = cartItemsArray
    let sumOfItemsSgd = 0.00
    let sumOfItemsOdbo = 0

    for (var i = 0; i < x.length; i++) {
      sumOfItemsSgd = sumOfItemsSgd + Number(x[i].subTotalPrice)
      sumOfItemsOdbo = sumOfItemsOdbo + Number(x[i].subTotalOdboPrice)
    }

    let sumOfItems = currency === 'sgd'
      ? Number(sumOfItemsSgd.toFixed(2))
      : Number(sumOfItemsOdbo.toFixed(0))

    return sumOfItems
  }

  sumOfCartDiscounts () {
    const {cartItemsArray, currency, shouldUpdate} = this.props
    let x = cartItemsArray
    let sumOfDiscounts = 0
    for (var i = 0; i < x.length; i++) {
      // validate if there is no custom discount
      sumOfDiscounts = x[i].customDiscount === 0
        // if none then check if product has default discount
        ? x[i].isDiscounted
          // if isDiscounted then compute the default discounts
          ? currency === 'sgd'
            ? (x[i].qty * (Number(x[i].priceDiscount) / 100) * x[i].price) + sumOfDiscounts
            : (x[i].qty * Math.round((Number(x[i].odboPriceDiscount) / 100) * x[i].odboPrice)) + sumOfDiscounts
          // else value is zero
          : sumOfDiscounts
        /* if custom discount then is creater than zero then computed the custom
         discount together with the price of the product */
        : currency === 'sgd'
          ? (x[i].qty * (Number(x[i].customDiscount) / 100) * x[i].price) + sumOfDiscounts
          : (x[i].qty * Math.round((Number(x[i].customDiscount) / 100) * x[i].odboPrice)) + sumOfDiscounts
    }

    let updatedDiscount = shouldUpdate // detects changes in discount
      ? null
      : currency === 'sgd'
        ? Number(sumOfDiscounts.toFixed(2))
        : Number(sumOfDiscounts.toFixed(0))
    return updatedDiscount
  }

  sumOfPayments () {
    const { payments, currency, activeCustomer } = this.props
    let x = payments
    let voucherTotal = this.vouchers() ? this.vouchers().voucherTotal : 0
    let sumOfPayments = 0
    if (x) {
      for (var i = 0; i < x.length; i++) {
        sumOfPayments = sumOfPayments + (Number(x[i].amount) || 0)
      }
    }
    if (currency === 'sgd') {
      return (sumOfPayments || 0) + voucherTotal || 0
    } else if (currency === 'odbo') {
      return Number(activeCustomer.odboCoins)
    }
  }

  overAllDeduct () {
    const {customDiscount, currency} = this.props
    let discount = !customDiscount || customDiscount === '' || customDiscount === 0
      ? 0 : Number(customDiscount)
    let overAllDeduct = currency === 'sgd'
      ? (discount / 100) * this.sumOfCartItems()
      : Math.round((discount / 100) * this.sumOfCartItems())
    return overAllDeduct
  }

  orderTotal () {
    const { customDiscount } = this.props
    let subtotal = !customDiscount || customDiscount === 0
      ? Number(this.sumOfCartItems() - this.sumOfCartDiscounts())
      : this.sumOfCartItems() - this.overAllDeduct()
    return Number(subtotal)
  }

  paymentMinusOrderTotal () {
    return this.sumOfPayments() - this.orderTotal()
  }

  vouchers () {
    const {payments} = this.props
    let voucherToString = ''
    let voucherList = []
    let voucherTotal = 0
    let vouchers
    payments.forEach(payment => {
      if (payment.type === 'voucher' && payment.vouchers.length > 0) {
        payment.vouchers.forEach(voucher => {
          let v1 = `${voucher.deduction}, `
          voucherList.push(voucher)
          voucherTotal += Number(voucher.deduction)
          voucherToString = voucherToString.concat(v1)
          vouchers = {
            voucherToString: voucherToString,
            voucherList: voucherList,
            voucherTotal: voucherTotal
          }
        })
      }
    })
    return vouchers
  }

  cashChange () {
    const { payments } = this.props
    let change
    payments.forEach(function (payment) {
      if (payment.type === 'cash') {
        change = Number(payment.cash) - payment.amount
      }
    })
    return change || 0
  }

  renderOrderItems () {
    const { dispatch, cartItemsArray, currency,
            locale, shouldUpdate, customDiscount } = this.props
    const notEmpty = (cartItemsArray !== null || undefined)
    // const add = this.addProductQty
    return cartItemsArray.map(function (item, key) {
      function plus () {
        dispatch(panelCartShouldUpdate(true))
        dispatch(setCartItemQty(item.id, 'plus'))
        document.getElementById('productsSearch').focus()
      }

      function minus () {
        dispatch(panelCartShouldUpdate(true))
        dispatch(setCartItemQty(item.id, 'minus'))
        document.getElementById('productsSearch').focus()
      }

      function remove () {
        dispatch(panelCartShouldUpdate(true))
        dispatch(removeCartItem(item.id))
        document.getElementById('productsSearch').focus()
      }

      function setDiscount (value) {
        let discount = Number(value) > 100 ? 100 : value
        dispatch(panelCartShouldUpdate(true))
        dispatch(setCustomDiscount(discount, item.id))
      }

      let productName = locale === 'en' ? item.nameEn : item.nameZh
      let itemDiscount = Number(item.priceDiscount)
      let odboDiscount = Number(item.odboPriceDiscount)
      let overallDiscount = Number(item.customDiscount)
      let price = Number(item.price)
      let odboPrice = Number(item.odboPrice)

      // validate customDiscount is equal to 0
      let discountPH = item.customDiscount === 0
        ? item.isDiscounted
          ? currency === 'sgd'
            ? itemDiscount
            : odboDiscount
          : 0.00
        : overallDiscount

      // input value: 100 is max value
      let discountVal = odboDiscount === 0
        ? ''
        : overallDiscount

      // validate customDiscount is equal to 0
      let discount = overallDiscount === 0
        // if true then validate if item discount is enabled
        ? item.isDiscounted
          ? currency === 'sgd'
            ? Math.round((itemDiscount / 100) * price)
            : Math.round((odboDiscount / 100) * odboPrice)
          // else if item discount not enabled, discount is zero
          : 0.00
        // else if customDiscount is not zero, compute overall discount of sale
        : currency === 'sgd'
          ? Math.round((overallDiscount / 100) * price)
          : Math.round((overallDiscount / 100) * odboPrice)

      let computedDiscount = currency === 'sgd'
        ? price - discount
        : odboPrice - Math.round(discount)

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
          {
            Number(customDiscount) === 0
              ? <td>
                <form onSubmit={e => {
                  e.preventDefault()
                  document.getElementById('productsSearch').focus()
                }}>
                  <p className='control has-addons' style={{width: 50}}>
                    <input id='itemDiscount' className='input is-small' type='Number'
                      placeholder={discountPH} value={discountVal}
                      onChange={e => setDiscount(e.target.value)} />
                    <a className='button is-small'>%</a>
                  </p>
                </form>
              </td>
              : null
          }
          <td>
            <p>
              {shouldUpdate
                ? null
                : currency === 'sgd'
                  ? formatCurrency(item.qty * computedDiscount)
                  : item.qty * computedDiscount}
            </p>
          </td>
          <td className='is-icon'>
            <a
              className='button is-inverted is-danger is-small'
              style={{padding: 0}}
              onClick={remove}>
              <span className='icon fa fa-times is-marginless' />
            </a>
          </td>
        </tr>
        : <tr />
      )
    })
  }

  render () {
    var intFrameHeight = window.innerHeight
    const {
      activeCustomer,
      activeModalId,
      bonusPoints,
      card,
      cartItemsArray,
      cashTendered,
      cpShouldUpdate,
      currency,
      customDiscount,
      intl,
      locale,
      orderError,
      orderNote,
      orderSuccess,
      payments,
      paymentMode,
      productsAreFetching,
      reprinting,
      shouldUpdate,
      showPayments,
      staff,
      storeId,
      transNumber
    } = this.props

    const orderNoteCount = orderNote.length === 0 ? 0 : orderNote.length
    const empty = (cartItemsArray.length === 0) || (cartItemsArray === null || undefined)

    const okForClear = cartItemsArray.length !== 0
    const okForCheckout = cartItemsArray.length !== 0 && this.paymentMinusOrderTotal() >= 0

    var buttons3 = [
      {name: 'Clear', icon: 'fa fa-times', customColor: okForClear ? 'red' : 'grey'},
      {name: 'Checkout Order', icon: 'fa fa-check', customColor: okForCheckout ? 'green' : 'grey'},
      {name: 'Open Drawer', icon: 'fa fa-upload', customColor: '#3273dc'}
    ]

    let voucherSum = this.vouchers() ? this.vouchers().voucherTotal : 0
    var paymentList = {
      cash: formatCurrency(payments[0].cash),
      credit: formatCurrency(payments[1].amount),
      nets: formatCurrency(payments[2].amount),
      voucher: formatCurrency(voucherSum)
    }

    console.log(paymentList)
    return (
      <div>
        <Panel>
          <div className='panel-block' style={{paddingTop: 5, paddingBottom: 5}}>
            {!shouldUpdate
              ? <div className='is-clearfix'>
                <h4 className='title is-4 is-marginless is-pulled-left' style={{width: 150}}>
                Order Items
                </h4>
                <div className='is-pulled-right'>
                  <PanelProducts
                    locale={locale}
                    productsAreFetching={productsAreFetching}
                    staff={staff}
                    storeId={storeId} />
                </div>
              </div>
              : <div className='has-text-centered'>
                <i className='fa fa-spinner fa-pulse fa-fw' />
              </div>
            }
          </div>
          <div className='panel-block' style={{padding: 0}}>
            <div className='content'
              style={{height: intFrameHeight / 3, overflowY: 'scroll'}}>
              {!empty
                ? <table className='table'>
                  <thead>
                    <tr>
                      <th><FormattedMessage id='app.general.qty' /></th>
                      <th><FormattedMessage id='app.general.product' /></th>
                      {!customDiscount || customDiscount === 0
                        ? <th><FormattedMessage id='app.general.discount' /></th>
                        : null
                      }
                      <th><FormattedMessage id='app.general.subtotal' /></th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {this.renderOrderItems()}
                  </tbody>
                </table>
                : <div className='section has-text-centered is-fullheight'
                  style={{height: intFrameHeight / 4, overflowY: 'scroll'}}>
                  <p>
                    <strong><FormattedMessage id='app.error.noCartItems' /></strong>
                  </p>
                </div>
              }
            </div>
          </div>
          <div className='panel-block' style={{paddingTop: 5, paddingBottom: 5}}>
            <Level left={
              <p>Subtotal: {currency === 'sgd' ? formatCurrency(this.sumOfCartItems()) : this.sumOfCartItems()}</p>
              }
              center={<p className='has-text-left'>Discounts: {
                customDiscount === 0
                ? currency === 'sgd' ? formatCurrency(this.sumOfCartDiscounts()) : this.sumOfCartDiscounts()
                : currency === 'sgd' ? formatCurrency(this.overAllDeduct()) : this.overAllDeduct()
              }</p>}
              right={
                <h3 className='is-marginless'>
                  Order Total: <strong>
                    {`${currency === 'sgd' ? formatCurrency(this.orderTotal()) : this.orderTotal().toFixed()}`}
                  </strong>
                </h3>
            } />
          </div>
          <div className='panel-block' style={{paddingTop: 5, paddingBottom: 5, height: showPayments ? 187 : 'auto'}}>
            {currency === 'sgd' ? <h3 className='is-marginless'>Payments</h3> : null}
            <Level left={currency === 'sgd'
              ? <div>
                <ul style={{margin: 0, marginLeft: 15, listStyle: 'none'}}>
                  <li onClick={this._removePayment.bind(this, 'cash')}><i className='fa fa-close' /> Cash: {paymentList.cash}</li>
                  <li onClick={this._removePayment.bind(this, 'voucher')}><i className='fa fa-close' /> Voucher: {paymentList.voucher}</li>
                </ul>
              </div>
              : null
            }
              center={currency === 'sgd'
                ? <div className='has-text-left'>
                  <ul style={{margin: 0, marginLeft: 15, listStyle: 'none'}}>
                    <li onClick={this._removePayment.bind(this, 'credit')}><i className='fa fa-close' /> Credit: {paymentList.credit}</li>
                    <li onClick={this._removePayment.bind(this, 'nets')}><i className='fa fa-close' /> Nets: {paymentList.nets}</li>
                  </ul>
                </div>
                : null
              }
              right={
                <h3 className='is-marginless'>
                  {shouldUpdate
                    ? null
                    : <span>{`${currency === 'sgd' ? 'Payment Total: ' : 'ODBO Coins: '}`}
                      <strong>{`${currency === 'sgd' ? formatCurrency(this.sumOfPayments()) : this.sumOfPayments()}`}</strong>
                    </span>
                  }
                </h3>
            } />
          </div>

          <div className='panel-block' style={{paddingTop: 5, paddingBottom: 5}}>
            <Level right={
              <h3 className='is-marginless'>
                {`${currency === 'sgd' ? 'Cash Change: ' : 'Remaining Balance: '} `}
                <strong>
                  {`${currency === 'sgd' ? formatCurrency(this.cashChange()) : this.paymentMinusOrderTotal()}`}
                </strong>
              </h3>
              } />
          </div>
          <div className='panel-block'>
            {/*
                @operator: !activeCustomer
                    - validates if the prop object 'activeCustomer' is null,
                      it will display nothing else validate currency
                @operator: !currency
                    - validates if the prop string 'currency' is 'odbo',
                      it will display nothing else display bonusPoints control
              */
              !activeCustomer
                ? <Level left={<h3 />} />
                : <Level left={
                  <div>
                    <p className='is-marginless'>
                      <FormattedMessage id='app.general.cust' />:
                      <strong>{` ${activeCustomer.firstName}`}</strong>
                    </p>
                    <a style={{color: 'orange'}}
                      onClick={this._clickRemoveCustomer.bind(this)}>
                      <i className='fa fa-times' />
                      <FormattedMessage id='app.button.remove' />
                    </a>
                  </div>
                  }
                  center={
                    <p>
                      {currency === 'sgd'
                        ? <strong style={{color: bonusPoints ? 'green' : 'grey'}}>
                          [ x2 {bonusPoints
                          ? <FormattedMessage id='app.general.enabled' />
                          : <FormattedMessage id='app.general.disabled' />
                        } ]
                        </strong>
                        : null
                      }
                    </p>
                  }
                  right={<h3 className='is-marginless'>
                    {currency === 'sgd'
                    ? <strong style={{color: 'green'}}>{activeCustomer
                      ? bonusPoints
                        ? Number(this.sumOfCartItems().toFixed(0)) * 2
                        : Number(this.sumOfCartItems().toFixed(0))
                      : '0.00'
                    } Points
                    </strong>
                    : null}
                  </h3>}
                   />
            }
          </div>
          <div className='panel-block control is-grouped is-marginless'>
            {/*
                @operator: !orderNoteCount
                    - validates the variable 'orderNoteCount' is zero,
                      it will display nothing, else, display a button showing
                      the note count and when clicked, display the notes modal
              */
              orderNoteCount === 0
              ? null
              : <p className='control'>
                <a className='button' onClick={this._clickViewNotes.bind(this)}>
                  <span>View
                    <strong style={{color: 'red'}}> {orderNoteCount} </strong>
                  </span>
                </a>
              </p>
            }
            <div className='control is-expanded'>
              <form autoComplete='off' onSubmit={this._clickAddNote.bind(this)}>
                <p className='control has-icon is-expanded'>
                  <input id='noteInput' className='input'
                    placeholder={intl.formatMessage({ id: 'app.ph.saleAddNote' })} />
                  <i className='fa fa-plus' />
                </p>
              </form>
            </div>
            <p className='control'>
              <a className='button' onClick={this._clickAddNote.bind(this)}>
                <strong><FormattedMessage id='app.button.addNote' /></strong>
              </a>
            </p>
          </div>
        </Panel>
        <Panel>
          <div className='panel-block'>
            <FunctionButtons buttons={buttons3} onClickButton={this._clickCheckoutButtons.bind(this)} />
          </div>
        </Panel>
        {cpShouldUpdate
          ? <PanelCheckoutModals
            activeModalId={activeModalId}
            card={card}
            cashTendered={Number(cashTendered)}
            cpShouldUpdate={cpShouldUpdate}
            currency={currency}
            orderError={orderError}
            orderNote={orderNote}
            orderSuccess={orderSuccess}
            orderTotal={this.orderTotal()}
            payments={payments}
            paymentMode={paymentMode}
            paymentTotal={this.sumOfPayments()}
            transNumber={transNumber}
            reprinting={reprinting}
            closeModal={this._closeModal.bind(this)}
            reprint={this._clickReprint.bind(this)}
            processOrder={this._processOrder.bind(this)} />
          : null
        }
      </div>
    )
  }

  _processOrder (event) {
    const {
      dispatch,
      locale,
      currency,
      storeData,
      orderNote,
      payments,
      pincode,
      bonusPoints,
      activeCashier,
      activeCustomer,
      customDiscount,
      cartItemsArray,
      printPreviewTotal
    } = this.props

    if (currency === 'odbo' && pincode && event) {
      event.preventDefault()
    }

    /*
    / General Info
    */

    let addr = storeData.address ? storeData.address.split('\\n') : ['200 Victoria Street']
    var storeAddress = [
      'The ODBO',
      storeData.name,
      ...addr
    ]

    let staff = `${activeCashier.firstName || ''} ${activeCashier.lastName || ''}`

    /*
    / Process Order Info
    */

    let products = cartItemsArray.map(item => {
      return {
        id: Number(item.id),
        quantity: item.qty,
        discount: Number(customDiscount) === 0
          ? Number(item.customDiscount) === 0 // Check if zero custom discount
            ? item.isDiscounted // if true then check for default discount
              ? currency === 'sgd'
                ? Number(item.priceDiscount)
                : Number(item.odboPriceDiscount)
              : 0
            : Number(item.customDiscount) // if custom dicount has value then return value
          : Number(customDiscount)
      }
    })

    let processedPayments = []
    payments.forEach(function (payment) {
      if (currency === 'sgd') {
        if (payment.amount || payment.amount > 0) {
          if (payment.type !== 'odbo' && payment.type !== 'voucher') {
            payment.amount = Number(payment.amount)
            if (payment.type === 'cash') { payment.cash = Number(payment.cash) }
            processedPayments.push(payment)
          }
        }
      } else {
        if (payment.amount || payment.amount > 0) {
          if (payment.type === 'odbo') {
            payment.amount = Number(payment.amount)
            processedPayments.push(payment)
          }
        }
      }
    })

    const orderInfo = {
      products,
      currency,
      source: storeData.source,
      bonusPoints: bonusPoints ? 100 : 0,
      payments: processedPayments,
      pinCode: pincode,
      adminId: activeCashier.id,
      vouchers: this.vouchers() ? this.vouchers().voucherList : undefined,
      odboId: activeCustomer ? String(activeCustomer.odboId) : undefined
    }

    /*
    / Process Reciept Info
    */

    let items = []
    cartItemsArray.forEach(item => {
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
          ? Number(itemQty * computedDiscount.toFixed(2))
          : itemQty * computedDiscount
      })
    })

    const receipt = {
      items,
      trans: {
        payments: processedPayments,
        activeCustomer,
        computations: {
          total: Number(this.orderTotal()),
          subtotal: Number(this.sumOfCartItems()),
          customDiscount: Number(this.overAllDeduct()),
          cashChange: Number(this.cashChange()),
          paymentMinusOrderTotal: Number(this.paymentMinusOrderTotal()),
          paymentTotal: Number(this.sumOfPayments())
        },
        vouchers: this.vouchers() ? this.vouchers().voucherList : [],
        orderNote: orderNote,
        currency: currency,
        previousOdbo: activeCustomer ? Number(activeCustomer.odboCoins) : undefined
      },
      headerText: storeAddress,
      footerText: !printPreviewTotal ? ['Thank you', 'Have a nice day!'] : ['']
    }
    if (printPreviewTotal) {
      dispatch(printPreviewTotalReceipt(receipt, activeCustomer))
    } else {
      if (currency === 'odbo' && !pincode) {
        var odboPayment = {type: 'odbo', amount: this.orderTotal(), remarks: 'odbo payment'}
        dispatch(addPaymentType(odboPayment))
        dispatch(setActiveModal('odboUserPincode', 'userPincode'))
      } else {
        dispatch(closeActiveModal())
        dispatch(processOrder(orderInfo, receipt, staff))
      }
    }
  }
}

PanelCheckout.PropTypes = {
  cartItemsArray: PropTypes.array
}

function mapStateToProps (state) {
  return {
    currency: state.panelCart.currency,
    storeData: state.application.store,
    storeId: state.application.storeId,
    staff: state.application.staff,
    adminToken: state.application.adminToken,
    activeCashier: state.application.activeCashier,
    shouldUpdate: state.panelCart.shouldUpdate,
    orderNote: state.panelCheckout.orderNote,
    walkinCustomer: state.panelCart.walkinCustomer,
    activeCustomer: state.panelCart.activeCustomer,
    panelCartItems: state.panelCart.items,
    customDiscount: state.panelCheckout.customDiscount,
    paymentMode: state.panelCheckout.paymentMode,
    showPayments: state.panelCheckout.showPayments,
    bonusPoints: state.panelCheckout.bonusPoints,
    pincode: state.panelCheckout.pincode,
    payments: state.panelCheckout.payments,
    card: state.panelCheckout.card,
    cashTendered: state.panelCheckout.cashTendered,
    transNumber: state.panelCheckout.transNumber,
    cpShouldUpdate: state.panelCheckout.shouldUpdate,
    receiptData: state.orders.receipt,
    orderError: state.orders.orderError,
    orderSuccess: state.orders.orderSuccess,
    productsAreFetching: state.data.products.isFetching,
    printPreviewTotal: state.panelCheckout.printPreviewTotal,
    reprinting: state.orders.reprinting,
    error: state.panelCheckout.error,
    locale: state.intl.locale,
    intl: state.intl
  }
}

export default connect(mapStateToProps)(injectIntl(PanelCheckout))
