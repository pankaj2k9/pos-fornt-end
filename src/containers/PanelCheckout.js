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
  verifyVoucherCode
} from '../actions/panelCheckout'
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
    const {cartItemsArray, currency} = this.props
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
    return sumOfDiscounts
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

  overAllTotal () {
    const { voucher, currency } = this.props
    var voucherDiscount = !voucher ? 0.00 : voucher.amount
    var subtotal = this.sumOfCartItems() - this.sumOfCartDiscounts()
    let sgdMinusVc = Number(subtotal).toFixed(2) - Number(voucherDiscount) < 0
      ? 0.00
      : Number(subtotal).toFixed(2) - Number(voucherDiscount).toFixed(2)
    let overAllTotal = currency === 'sgd'
      ? sgdMinusVc
      : subtotal
    return overAllTotal
  }

  renderVoucherModal () {
    const {intl, activeModalId} = this.props
    const active = activeModalId === 'voucherModal' ? 'is-active' : ''
    return (
      <div id='voucherModal' className={`modal ${active}`}>
        <div className='modal-background'></div>
        <div className='modal-content'>
          <div className='box'>
            <div className='content has-text-centered'>
              <h1 className='title'><FormattedMessage id='app.button.addVoucher' /></h1>
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
          </div>
        </div>
        <button className='modal-close' onClick={this.closeNotes.bind(this)} />
      </div>
    )
  }

  renderNoteModal () {
    const {orderNote, activeModalId} = this.props
    const active = activeModalId === 'notesModal' ? 'is-active' : ''
    return (
      <div id='notesModal' className={`modal ${active}`}>
        <div className='modal-background'></div>
        <div className='modal-content'>
          <div className='box'>
            <div className='content'>
              <h1 className='title'><FormattedMessage id='app.general.notes' /></h1>
              <ul>
                {
                  orderNote.map(function (item, key) {
                    return (
                      <li key={key}>
                        {item.message}
                      </li>
                    )
                  }, this)
                }
              </ul>
            </div>
          </div>
        </div>
        <button className='modal-close' onClick={this.closeNotes.bind(this)} />
      </div>
    )
  }

  render () {
    const { cartItemsArray, currency, intl,
            orderNote, voucher } = this.props
    var voucherDiscount = !voucher ? 0.00 : voucher.amount
    const orderNoteCount = orderNote.length === 0 ? 0 : orderNote.length
    const empty = cartItemsArray.length === 0
    return (
      <div>
        {cartItemsArray.length === 0
          ? null
          : <Panel
            panelName={<FormattedMessage id='app.panel.checkout' />}
            buttonOne={!empty ? {name: 'app.button.addVoucher', class: 'is-info',
                        onClick: this.onClickAddVoucher.bind(this),
                        icon: 'fa fa-money'} : null}
            buttonTwo={!empty ? {name: 'app.button.cancelOrder', class: 'is-danger',
                        onClick: this.onClickCancelOrder.bind(this)} : null}>
            <div className='panel-block control is-grouped'>
              {orderNoteCount === 0
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
                    {
                      Number(this.sumOfCartItems() - this.sumOfCartDiscounts()).toFixed(2)
                    }
                    </strong>
                  </p>
              } />
              <Level left={<FormattedMessage id='app.general.discount' />}
                right={<strong>{Number(voucherDiscount).toFixed(2)}</strong>} />
            </div>
            <div>
              <div className='panel-block' style={{paddingTop: 0}}>
                <Level left={<FormattedMessage id='app.general.total' />}
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
    staff: state.application.staff,
    orderNote: state.panelCheckout.orderNote,
    walkinCustomer: state.panelCart.walkinCustomer,
    activeCustomer: state.panelCart.activeCustomer,
    activeCashier: state.application.activeCashier,
    totalFromCart: state.panelCart.totalPrice,
    panelCartItems: state.panelCart.items,
    voucher: state.panelCart.voucher,
    card: state.panelCheckout.card,
    locale: state.intl.locale,
    intl: state.intl
  }
}

export default connect(mapStateToProps)(injectIntl(PanelCheckout))
