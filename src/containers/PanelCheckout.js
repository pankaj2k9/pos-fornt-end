/*
* TODO:
*
*
*/

import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { injectIntl, FormattedMessage } from 'react-intl'

import Panel from '../components/Panel'
import Level from '../components/Level'
import Modal from './CheckoutModal'

import { setActiveModal } from '../actions/application'
import {
  setPaymentMode,
  setOrderNote,
  verifyVoucherCode,
  setDiscount,
  removeNote,
  toggleBonusPoints,
  panelCheckoutShouldUpdate
} from '../actions/panelCheckout'

import {
  removeVoucher
} from '../actions/panelCart'

import { resetStore } from '../actions/helpers'

class PanelCheckout extends Component {
  onClickCheckout (paymentMode) {
    const { dispatch } = this.props
    dispatch(setActiveModal('afterCheckoutModal'))
    dispatch(setPaymentMode(paymentMode))
  }

  onClickConfirm () {
    const { dispatch } = this.props
    dispatch(setActiveModal(''))
  }

  onClickCancelOrder () {
    const { dispatch } = this.props
    dispatch(resetStore())
  }

  onClickRemoveVoucher () {
    const { dispatch } = this.props
    dispatch(removeVoucher())
  }

  sumOfCartItems () {
    const {cartItemsArray, currency} = this.props
    let x = cartItemsArray
    let sumOfItemsSgd = 0.00
    let sumOfItemsOdbo = 0.00

    for (var i = 0; i < x.length; i++) {
      sumOfItemsSgd = sumOfItemsSgd + Number(x[i].subTotalPrice)
      sumOfItemsOdbo = sumOfItemsOdbo + Number(x[i].subTotalOdboPrice)
    }
    let sumOfItems = currency === 'sgd'
      ? sumOfItemsSgd
      : sumOfItemsOdbo
    return sumOfItems
  }

  sumOfCartDiscounts () {
    const {cartItemsArray, currency, shouldUpdate} = this.props
    let x = cartItemsArray
    let sumOfDiscounts = 0.00
    for (var i = 0; i < x.length; i++) {
      // validate if there is no custom discount
      sumOfDiscounts = x[i].customDiscount === 0
        // if none then check if product has default discount
        ? x[i].isDiscounted
          // if isDiscounted then compute the default discounts
          ? currency === 'sgd'
            ? (x[i].qty * (Number(x[i].priceDiscount) / 100) * x[i].price) + sumOfDiscounts
            : (x[i].qty * (Number(x[i].odboPriceDiscount) / 100) * x[i].odboPrice) + sumOfDiscounts
          // else value is zero
          : sumOfDiscounts
        /* if custom discount then is creater than zero then computed the custom
         discount together with the price of the product*/
        : currency === 'sgd'
          ? (x[i].qty * (Number(x[i].customDiscount) / 100) * x[i].price) + sumOfDiscounts
          : (x[i].qty * (Number(x[i].customDiscount) / 100) * x[i].odboPrice) + sumOfDiscounts
    }
    let updatedDiscount = shouldUpdate // detects changes in discount
      ? null
      : sumOfDiscounts
    return updatedDiscount
  }

  onClickAddNote () {
    const { dispatch, orderNote } = this.props
    var noteToAdd = [{
      type: 'others',
      message: document.getElementById('noteInput').value
    }]
    var newNote = orderNote.concat(noteToAdd)
    dispatch(setOrderNote(newNote))
    document.getElementById('noteInput').value = ''
  }

  onClickViewNotes () {
    const { dispatch } = this.props
    dispatch(setActiveModal('notesModal'))
  }

  onClickAddVoucher () {
    const { dispatch } = this.props
    dispatch(setActiveModal('voucherModal'))
  }

  onClickVerifyVoucher () {
    const { dispatch } = this.props
    let query = { query: {
      code: document.getElementById('vcInput').value
    }}
    dispatch(verifyVoucherCode(query))
  }

  closeNotes () {
    const { dispatch } = this.props
    dispatch(setActiveModal(''))
  }

  toggleBonus () {
    const { dispatch, bonusPoints } = this.props
    let boolVal = !bonusPoints
    dispatch(toggleBonusPoints(boolVal))
  }

  renderModal () {
    const { cartItemsArray, locale, currency, card,
            paymentMode, walkinCustomer, voucher, orderNote } = this.props

    return (
      <Modal id='afterCheckoutModal'
        locale={locale}
        orderItems={cartItemsArray}
        currency={currency}
        paymentMode={paymentMode}
        walkinCustomer={walkinCustomer}
        voucher={voucher}
        overAllTotal={this.overAllTotal()}
        orderNote={orderNote}
        card={card} />
    )
  }

  overAllDeduct () {
    const {customDiscount} = this.props
    let discount = !customDiscount || customDiscount === '' || customDiscount === 0
      ? 0 : customDiscount
    let overAllDeduct = (Number(discount) / 100) * this.sumOfCartItems()
    return Number(overAllDeduct).toFixed(2)
  }

  overAllTotal () {
    const { voucher, currency, customDiscount } = this.props
    var voucherDiscount = !voucher ? 0.00 : voucher.amount
    let subtotal = !customDiscount || customDiscount === 0
      ? Number(this.sumOfCartItems() - this.sumOfCartDiscounts()).toFixed(2)
      : this.sumOfCartItems() - this.overAllDeduct()
    let sgdMinusVc = Number(subtotal).toFixed(2) - Number(voucherDiscount) < 0
      ? 0.00
      : Number(subtotal).toFixed(2) - Number(voucherDiscount).toFixed(2)
    let overAllTotal = currency === 'sgd'
      ? sgdMinusVc
      : subtotal
    return overAllTotal
  }

  setOverallDiscount (value) {
    const {dispatch} = this.props
    dispatch(panelCheckoutShouldUpdate())
    let discount = value === ''
      ? ''
      : Number(value) > 100 ? 100 : value
    dispatch(setDiscount(discount))
  }

  renderVoucherModal () {
    const {intl, activeModalId, error} = this.props
    const active = activeModalId === 'voucherModal' ? 'is-active' : ''
    return (
      <div id='voucherModal' className={`modal ${active}`}>
        <div className='modal-background'></div>
        <div className='modal-card'>
          <header className='modal-card-head'>
            <p className='modal-card-title is-marginless has-text-centered'>
              <FormattedMessage id='app.button.addVoucher' />
            </p>
            <button className='delete' onClick={this.closeNotes.bind(this)} />
          </header>
          <section className='modal-card-body'>
            <div className='content has-text-centered'>
              {!error
                ? null
                : <p className='subtitle'>
                  {error}
                </p>
              }
              <p className='control is-expanded'>
                <input id='vcInput' className='input is-large'
                  placeholder={intl.formatMessage({ id: 'app.ph.saleAddNote' })} />
              </p>
              <div className='columns'>
                <p className='column is-6 is-offset-3'>
                  <a className='button is-large is-fullwidth is-success'
                    onClick={this.onClickVerifyVoucher.bind(this)}>
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

  renderNoteModal () {
    const {dispatch, orderNote, activeModalId, cpShouldUpdate} = this.props
    const active = activeModalId === 'notesModal' ? 'is-active' : ''
    return (
      <div id='notesModal' className={`modal ${active}`}>
        <div className='modal-background'></div>
        <div className='modal-content'>
          <div className='box'>
            <div className='content'>
              <h1 className='title'><FormattedMessage id='app.general.notes' /></h1>
              {!cpShouldUpdate
                ? <ul>
                  {
                    orderNote.map(function (item, key) {
                      function remove () {
                        dispatch(panelCheckoutShouldUpdate())
                        dispatch(removeNote(item.message))
                      }
                      return (
                        <li key={key}>
                          {`${item.message} `}
                          <span className='tag is-danger' style={{marginLeft: 10}}>
                            <FormattedMessage id='app.button.removeNote' />
                            <button className='delete' onClick={remove}></button>
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
        <button className='modal-close' onClick={this.closeNotes.bind(this)} />
      </div>
    )
  }

  render () {
    const { cartItemsArray, currency, intl, shouldUpdate, activeCustomer,
            orderNote, voucher, customDiscount, bonusPoints } = this.props
    /** VAIDATION OF VALUES **/
    /** @customDiscount: prop to be validated
        @operator: customDiscount === '' || !customDiscount
            - this validates the customDiscount if it's an empty string, null
              or undefined
            - returns true if value is an empty string, null, or undefined
    **/

    // @discountPH: Discount Placeholder
    let discountPH = customDiscount === '' || !customDiscount
      ? 0
      : Number(customDiscount)
    // @discount: discount value to be displayed
    let discount = customDiscount === '' || !customDiscount
      ? ''
      : Number(customDiscount) > 100 ? 100 : customDiscount
    // @subtotal: display apropriate computation of discounts
    let subtotal = !customDiscount || customDiscount === 0
      ? Number(this.sumOfCartItems() - this.sumOfCartDiscounts()).toFixed(2)
      : Number(this.sumOfCartItems()).toFixed(2)
    var voucherDiscount = !voucher ? 0.00 : voucher.amount
    const orderNoteCount = orderNote.length === 0 ? 0 : orderNote.length
    const empty = cartItemsArray.length === 0
    return (
      <div>
        { /*
            @operator: cartItemsArray.length === 0
                      - validates if the prop array 'cartItemsArray' is null,
                        it will display nothing else display the Panel
          */
          cartItemsArray.length === 0
          ? null
          : <Panel
            panelName={<FormattedMessage id='app.panel.checkout' />}
            buttonOne={!empty ? {name: 'app.button.addVoucher', class: 'is-info',
                        onClick: this.onClickAddVoucher.bind(this),
                        icon: 'fa fa-money'} : null}
            buttonTwo={!empty ? {name: 'app.button.cancelOrder', class: 'is-danger',
                        onClick: this.onClickCancelOrder.bind(this)} : null}>
            <div className='panel-block control is-grouped'>
              {/*
                  @operator: !orderNoteCount
                      - validates the variable 'orderNoteCount' is zero,
                        it will display nothing, else, display a button showing
                        the note count and when clicked, display the notes modal
                */
                orderNoteCount === 0
                ? null
                : <p className='control'>
                  <a className='button' onClick={this.onClickViewNotes.bind(this)}>
                    <span>View
                      <strong style={{color: 'red'}}> {orderNoteCount} </strong>
                    </span>
                  </a>
                </p>
              }
              <p className='control has-icon is-expanded'>
                <input id='noteInput' className='input'
                  placeholder={intl.formatMessage({ id: 'app.ph.saleAddNote' })} />
                <i className='fa fa-plus'></i>
              </p>
              <p className='control'>
                <a className='button' onClick={this.onClickAddNote.bind(this)}>
                  <strong><FormattedMessage id='app.button.addNote' /></strong>
                </a>
              </p>
            </div>
            <div className='panel-block'>
              <Level
                left={<FormattedMessage id='app.general.subtotal' />}
                right={
                  <p className='control'>
                    <strong>
                    {subtotal}
                    </strong>
                  </p>
              } />
              { /*
                  @operator: !shouldUpdate
                      - validates if the prop bool 'shouldUpdate' is false,
                        it will display nothing, else, display the overallDiscount
                        controls and the updated overallDiscount value
                */
                !shouldUpdate
                ? <div>
                  {this.sumOfCartDiscounts() === 0
                    ? <Level left={<FormattedMessage id='app.general.overallDiscount' />}
                      center={
                        <div>
                          <p className='control has-addons' style={{width: 50, marginLeft: 100}}>
                            <input id='itemDiscount' className='input is-small' type='Number'
                              placeholder={discountPH} value={discount}
                              onChange={e => this.setOverallDiscount(e.target.value)} />
                            <a className='button is-small'>%</a>
                          </p>
                        </div>
                      }
                      right={
                        <p>
                          <strong>
                            {
                              this.overAllDeduct()
                            }
                          </strong>
                        </p>
                    } />
                    : null
                  }
                </div>
                : null
              }
              <Level left={<FormattedMessage id='app.general.voucherDiscount' />}
                right={
                  <strong>
                  {/*
                      @operator: !voucher
                          - validates if the prop object 'voucher' is null,
                            it will display nothing else display the remove
                            voucher button
                    */
                    !voucher
                    ? null
                    : <a onClick={this.onClickRemoveVoucher.bind(this)}
                      style={{marginRight: 50}}>
                      <FormattedMessage id='app.button.removeVoucher' /> </a>
                  }
                  {Number(voucherDiscount).toFixed(2)}</strong>
                } />
              {/*
                  @operator: !activeCustomer
                      - validates if the prop object 'activeCustomer' is null,
                        it will display nothing else validate currency
                  @operator: !currency
                      - validates if the prop string 'currency' is 'odbo',
                        it will display nothing else display bonusPoints control
                */
                !activeCustomer
                ? null
                : currency === 'odbo'
                  ? null
                  : <Level left={
                    <div>
                      <FormattedMessage id='app.general.bonusPoints' />
                      <strong
                        style={{color: bonusPoints ? 'green' : 'red'}}> [ {bonusPoints
                        ? <FormattedMessage id='app.general.enabled' />
                        : <FormattedMessage id='app.general.disabled' />
                      } ]</strong>
                    </div>
                    }
                    right={
                      <p className='control' onClick={this.toggleBonus.bind(this)}>
                        <label className='checkbox'>
                          <input type='checkbox' />
                        </label>
                      </p>
                    } />
              }
            </div>
            <div>
              <div className='panel-block' style={{paddingTop: 0}}>
                <Level left={
                  <strong><FormattedMessage id='app.general.total' /></strong>
                  }
                  right={
                    <h3 className='is-marginless'>
                      <strong>
                        {
                          this.overAllTotal()
                        }
                      </strong>
                    </h3>
                } />
              </div>
              {!empty
                ? <div className='panel-block'>
                  <h3 className='has-text-centered'>
                    <FormattedMessage id='app.general.mop' />
                  </h3>
                  {currency === 'sgd'
                  ? <div className='columns'>
                    <p className='column is-marginless control'>
                      <a className={'button is-info is-large is-fullwidth '}
                        onClick={this.onClickCheckout.bind(this, 'credit')}>
                        <span className='icon'>
                          <i className='fa fa-credit-card' />
                        </span>
                        <span>
                          <strong> <FormattedMessage id='app.general.card' /></strong>
                        </span>
                      </a>
                    </p>
                    <p className='column is-marginless control'>
                      <a className={'button is-success is-large is-fullwidth '}
                        onClick={this.onClickCheckout.bind(this, 'cash')}>
                        <span className='icon'><i className='fa fa-money' /></span>
                        <span>
                          <strong> <FormattedMessage id='app.general.cash' /></strong>
                        </span>
                      </a>
                    </p>
                  </div>
                  : <div className='control'>
                    <a className={'button is-dark is-outlined is-large is-fullwidth'}
                      onClick={this.onClickCheckout.bind(this, 'odbo')}>
                      <span className='icon'><i className='fa fa-asterisk' /></span>
                      <span>
                        <strong> <FormattedMessage id='app.page.reports.odbo' /></strong>
                      </span>
                    </a>
                  </div>
                  }
                </div>
                : null
              }
              {
                orderNote.length === 0
                ? null
                : this.renderNoteModal()
              }

              <div>
                {this.renderVoucherModal()}
                {this.renderModal()}
              </div>

            </div>
          </Panel>
        }
      </div>
    )
  }
}

PanelCheckout.PropTypes = {
  cartItemsArray: PropTypes.array
}

function mapStateToProps (state) {
  return {
    currency: state.panelCart.currency,
    cashTotalFromCart: state.panelCart.totalPrice,
    odboTotalFromCart: state.panelCart.totalOdboPrice,
    paymentMode: state.panelCheckout.paymentMode,
    bonusPoints: state.panelCheckout.bonusPoints,
    staff: state.application.staff,
    orderNote: state.panelCheckout.orderNote,
    walkinCustomer: state.panelCart.walkinCustomer,
    activeCustomer: state.panelCart.activeCustomer,
    activeCashier: state.application.activeCashier,
    shouldUpdate: state.panelCart.shouldUpdate,
    error: state.panelCheckout.error,
    cpShouldUpdate: state.panelCheckout.shouldUpdate,
    totalFromCart: state.panelCart.totalPrice,
    panelCartItems: state.panelCart.items,
    customDiscount: state.panelCheckout.customDiscount,
    voucher: state.panelCart.voucher,
    card: state.panelCheckout.card,
    locale: state.intl.locale,
    intl: state.intl
  }
}

export default connect(mapStateToProps)(injectIntl(PanelCheckout))
