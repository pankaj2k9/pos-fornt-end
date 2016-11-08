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
import PaymentModal from '../components/PaymentModal'
import Level from '../components/Level'
import Counter from '../components/Counter'
import Truncate from '../components/Truncate'

import FunctionButtons from '../components/FunctionButtons'

import { setActiveModal, closeActiveModal } from '../actions/application'
import {
  setOrderNote,
  removeNote,
  panelCheckoutShouldUpdate
} from '../actions/panelCheckout'

import {
  setCartItemQty,
  setCustomDiscount,
  removeCartItem,
  removeCustomer,
  panelCartShouldUpdate
} from '../actions/panelCart'

import {
  resetStore,
  reprintReceipt,
  printPreviewTotalReceipt
} from '../actions/helpers'

import {processOrder} from '../actions/orders'

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
    dispatch(closeActiveModal(focusProductSearch))
    dispatch(panelCheckoutShouldUpdate(false))
    if (activeModalId === 'orderProcessed') {
      if (orderSuccess) {
        dispatch(resetStore())
      }
    }
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
    if (currency === 'sgd' && !sumOfPayments) {
      return 0
    } else if (currency === 'sgd' && sumOfPayments) {
      return sumOfPayments + voucherTotal
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
                  ? Number(Number(item.qty) * computedDiscount).toFixed(2)
                  : parseInt(item.qty) * Number(computedDiscount)}
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
    const { currency, intl, cpShouldUpdate, activeCustomer, locale, productsAreFetching, staff,
            orderNote, shouldUpdate, cartItemsArray, showPayments, storeId,
            bonusPoints, payments, customDiscount } = this.props
    /** VAIDATION OF VALUES **/
    /** @customDiscount: prop to be validated
        @operator: customDiscount === '' || !customDiscount
            - this validates the customDiscount if it's an empty string, null
              or undefined
            - returns true if value is an empty string, null, or undefined
    **/

    // let subtotal = !customDiscount || customDiscount === 0
    //   ? (this.sumOfCartItems() - this.sumOfCartDiscounts()).toFixed(2)
    //   : this.sumOfCartItems()
    // var voucherDiscount = !voucher ? 0.00 : voucher.amount
    const orderNoteCount = orderNote.length === 0 ? 0 : orderNote.length
    const empty = (cartItemsArray.length === 0) || (cartItemsArray === null || undefined)

    const okForClear = cartItemsArray.length !== 0
    const okForCheckout = cartItemsArray.length !== 0 && this.paymentMinusOrderTotal() >= 0

    var buttons3 = [
      {name: 'Clear', icon: 'fa fa-times', customColor: okForClear ? 'red' : 'grey'},
      {name: 'Checkout Order', icon: 'fa fa-check', customColor: okForCheckout ? 'green' : 'grey'},
      {name: 'Open Drawer', icon: 'fa fa-upload', customColor: '#3273dc'}
    ]

    return (
      <div>
        <Panel>
          <div className='panel-block' style={{paddingTop: 5, paddingBottom: 5}}>
            {!shouldUpdate
              ? <div className='is-clearfix'>
                <h4 className='title is-4 is-marginless is-pulled-left'>
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
              <p>Subtotal: {this.sumOfCartItems()}</p>
              }
              center={<p className='has-text-left'>Discounts: {
                customDiscount === 0
                ? this.sumOfCartDiscounts()
                : this.overAllDeduct()
              }</p>}
              right={
                <h3 className='is-marginless'>
                  Order Total: <strong>
                    {`${currency === 'sgd' ? this.orderTotal().toFixed(2) : this.orderTotal().toFixed()}`}
                  </strong>
                </h3>
            } />
          </div>
          <div className='panel-block' style={{paddingTop: 5, paddingBottom: 5, height: showPayments ? 187 : 'auto'}}>
            <Level left={<strong>Payments <a>[View]</a></strong>}
              right={
                <h3 className='is-marginless'>
                  {shouldUpdate
                    ? null
                    : <span>{`${currency === 'sgd' ? 'Payment Total: ' : 'ODBO Coins: '}`}
                      <strong>{`${currency === 'sgd' ? this.sumOfPayments().toFixed(2) : this.sumOfPayments()}`}</strong>
                    </span>
                  }
                </h3>
            } />
            {payments && showPayments
              ? payments.map(function (payment, key) {
                return (
                  <div key={key}>
                    {payment.type !== 'voucher'
                      ? <Level key={key} left={
                        <span style={{color: payment.amount ? 'black' : 'white'}}>{payment.type}</span>
                        }
                        center={payment.type === 'credit' || payment.type === 'nets'
                          ? <p><strong style={{color: payment.amount ? 'black' : 'white'}}>trans#: </strong>{payment.transNumber}</p> : ''}
                        right={
                          <strong style={{color: payment.amount ? 'black' : 'white'}}>{Number(payment.amount).toFixed(2) || 0.00}</strong>
                      } />
                      : null
                    }
                    {payment.type === 'voucher'
                      ? <Level key={key} left={
                        <span style={{color: this.vouchers() ? 'black' : 'white'}}>{payment.type}</span>
                        }
                        center={
                          <p>
                            {this.vouchers() ? `[ ${this.vouchers().voucherToString} ]` : ''}
                          </p>
                        }
                        right={
                          <strong style={{color: this.vouchers() ? 'black' : 'white'}}>
                            {this.vouchers() ? Number(this.vouchers().voucherTotal).toFixed(2) || 0.00 : ''}
                          </strong>
                      } />
                      : null
                    }
                  </div>
                )
              }, this)
              : null
            }
          </div>
          <div className='panel-block' style={{paddingTop: 5, paddingBottom: 5}}>
            <Level right={
              <h3 className='is-marginless'>
                {`${currency === 'sgd' ? 'Cash Change: ' : 'Remaining Balance: '} `}
                <strong>
                  {`${currency === 'sgd' ? this.cashChange().toFixed(2) : this.paymentMinusOrderTotal()}`}
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
          ? this.renderModal()
          : null
        }
      </div>
    )
  }

  renderModal () {
    const {activeModalId} = this.props
    switch (activeModalId) {
      case 'notesModal':
        return this.renderNoteModal()
      case 'paymentModal':
        return this.renderPaymentModal()
      case 'orderProcessing':
        return this.renderOrderProcessing()
      case 'orderProcessed':
        return this.renderOrderProcessed()
      case 'printingPreview':
        return this.renderPrintingPreview()
      default:
    }
  }

  renderPaymentModal () {
    const {activeModalId, card, cashTendered, transNumber, payments} = this.props
    return (
      <PaymentModal
        id={activeModalId}
        card={card}
        cashTendered={cashTendered}
        transNumber={transNumber}
        orderTotal={this.orderTotal()}
        paymentTotal={this.sumOfPayments()}
        paymentMode={this.props.paymentMode}
        currency={this.props.currency}
        payments={payments} />
    )
  }

  renderPrintingPreview () {
    const { activeModalId } = this.props
    let modalActive = activeModalId === 'printingPreview'
      ? 'modal is-active'
      : 'modal'
    return (
      <div className={modalActive}>
        <div className='modal-background' />
        <div className='modal-content'>
          <div className='box has-text-centered' style={{backgroundColor: 'transparent'}}>
            <i className='fa fa-spinner fa-pulse fa-5x fa-fw' style={{color: 'white'}} />
            <h1 className='title is-1' style={{color: 'white'}}>Printing...</h1>
          </div>
        </div>
      </div>
    )
  }

  renderOrderProcessing () {
    const { activeModalId } = this.props
    let modalActive = activeModalId === 'orderProcessing'
      ? 'modal is-active'
      : 'modal'
    return (
      <div className={modalActive}>
        <div className='modal-background' />
        <div className='modal-content'>
          <div className='box has-text-centered' style={{backgroundColor: 'transparent'}}>
            <i className='fa fa-spinner fa-pulse fa-5x fa-fw' style={{color: 'white'}} />
            <h1 className='title is-1' style={{color: 'white'}}>Processing Order...</h1>
          </div>
        </div>
      </div>
    )
  }

  renderOrderProcessed () {
    const { activeModalId, orderError, orderSuccess, reprinting } = this.props
    let modalActive = activeModalId === 'orderProcessed'
      ? 'modal is-active'
      : 'modal'
    return (
      <div className={modalActive}>
        <div className='modal-background' />
        <div className='modal-card'>
          <header className='modal-card-head'>
            <p className='modal-card-title is-marginless has-text-centered'>
              Order Processed
            </p>
            <button className='delete' onClick={this._closeModal.bind(this)} />
          </header>
          <div className='modal-card-body'>
            <div className='content columns is-mobile is-multiline has-text-centered'>
              <div className='column is-12'>
                {orderSuccess
                  ? <h1 className='title is-marginless'>Order Success</h1>
                  : <h1 className='title is-marginless' style={{color: 'red'}}>{orderError}</h1>
                }
              </div>
              <div className='column is-6 is-offset-3'>
                {orderSuccess
                  ? <p className='is-subtitle'>
                    <FormattedMessage id='app.general.checkPrinter' />
                    {reprinting
                      ? <span><br /><i className='fa fa-spinner fa-pulse fa-2x fa-fw' /></span>
                      : <a className='button is-large is-light is-link' onClick={this._clickReprint.bind(this)}>
                        <FormattedMessage id='app.general.reprint' />
                      </a>
                    }
                  </p>
                  : null
                }
              </div>
              <div className='column is-6 is-offset-3'>
                {orderSuccess
                  ? <a className='button is-success is-large is-fullwidth'>
                    Confirm
                  </a>
                  : <a className='button is-warning is-large is-fullwidth'>
                    Retry
                  </a>
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  renderNoteModal () {
    const {dispatch, orderNote, activeModalId, cpShouldUpdate} = this.props
    const active = activeModalId === 'notesModal' ? 'is-active' : ''
    return (
      <div id='notesModal' className={`modal ${active}`}>
        <div className='modal-background' />
        <div className='modal-card'>
          <header className='modal-card-head'>
            <p className='modal-card-title is-marginless has-text-centered'>
              <FormattedMessage id='app.general.notes' />
            </p>
            <button className='delete' onClick={this._closeModal.bind(this)} />
          </header>
          <div className='modal-card-body'>
            <div className='content'>
              {!cpShouldUpdate
                ? <ul>
                  {!orderNote
                    ? null
                    : orderNote.map(function (item, key) {
                      function remove () {
                        dispatch(panelCheckoutShouldUpdate(true))
                        dispatch(removeNote(item.message))
                      }
                      return (
                        <li key={key}>
                          {`${item.message} `}
                          <span className='tag is-danger' style={{marginLeft: 10}}>
                            <FormattedMessage id='app.button.removeNote' />
                            <button className='delete' onClick={remove} />
                          </span>
                        </li>
                      )
                    }, this)
                  }
                </ul>
                : null
              }
            </div>
          </div>
        </div>
      </div>
    )
  }

  _processOrder () {
    const {
      dispatch,
      locale,
      currency,
      storeData,
      orderNote,
      payments,
      bonusPoints,
      activeCashier,
      activeCustomer,
      customDiscount,
      cartItemsArray,
      printPreviewTotal
    } = this.props

    /*
    / General Info
    */

    let storeAddress = !storeData.storeAddress
      ? [
        'The ODBO',
        '200 Victoria Street',
        'Bugis Junction #02-22',
        'SINGAPORE',
        'Telephone : 6238 1337'
      ]
      : [storeData.name, storeData.storeAddress]

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
      }
    })

    const orderInfo = {
      products,
      currency,
      source: storeData.source,
      bonusPoints: bonusPoints ? 100 : 0,
      payments: processedPayments,
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
        payments,
        activeCustomer,
        computations: {
          total: Number(this.orderTotal()),
          subtotal: Number(this.sumOfCartItems()),
          customDiscount: Number(this.overAllDeduct()),
          cashChange: Number(this.cashChange()),
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
      dispatch(processOrder(orderInfo, receipt, staff))
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
