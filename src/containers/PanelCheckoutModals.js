/*
* TODO:
*
*
*/

import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { injectIntl, FormattedMessage } from 'react-intl'

import PaymentModal from '../components/PaymentModal'

import {
  removeNote,
  removePaymentType,
  panelCheckoutShouldUpdate
} from '../actions/panelCheckout'

import { formatCurrency } from '../utils/string'

class PanelCheckoutModals extends Component {

  render () {
    const {activeModalId} = this.props
    switch (activeModalId) {
      case 'notesModal':
        return this.renderNoteModal()
      case 'paymentListModal':
        return this.renderPaymentListModal()
      case 'paymentModal':
        return this.renderPaymentModal()
      case 'orderProcessing':
        return this.renderOrderProcessing()
      case 'orderProcessed':
        return this.renderOrderProcessed()
      case 'printingPreview':
        return this.renderPrintingPreview()
      case 'odboUserPincode':
        return this.renderInputPincode()
      default:
        return null
    }
  }

  renderInputPincode () {
    const { activeModalId, setOdboUserPincode, closeModal, processOrder } = this.props
    let modalActive = activeModalId === 'odboUserPincode'
      ? 'modal is-active'
      : 'modal'
    return (
      <div className={modalActive}>
        <div className='modal-background' />
        <div className='modal-card'>
          <header className='modal-card-head'>
            <p className='modal-card-title is-marginless has-text-centered'>
              Odbo User Pincode
            </p>
            <button className='delete' onClick={closeModal} />
          </header>
          <div className='modal-card-body'>
            <div className='content columns is-mobile is-multiline has-text-centered'>
              <div className='column is-8 is-offset-2'>
                <div className='control is-horizontal is-fullwidth'>
                  <div className='control-label' style={{width: 150}}>
                    <h3 className='label is-marginless'>Input Pincode</h3>
                  </div>
                  <form onSubmit={processOrder} >
                    <input id='userPincode' className='input is-large' type='Password' autoFocus
                      onChange={e => setOdboUserPincode(e.target.value)} />
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  renderPaymentModal () {
    const {activeModalId, card, cashTendered, currency, error, orderTotal, paymentAmount, paymentBalance, paymentMode, paymentTotal, payments, transNumber} = this.props
    return (
      <PaymentModal
        id={activeModalId}
        card={card}
        cashTendered={Number(cashTendered)}
        error={error}
        transNumber={transNumber}
        orderTotal={orderTotal}
        paymentAmount={paymentAmount}
        paymentBalance={paymentBalance}
        paymentTotal={paymentTotal}
        paymentMode={paymentMode}
        currency={currency}
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
    const { activeModalId, orderError, orderSuccess, reprinting, closeModal, reprint } = this.props
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
            <button className='delete' onClick={closeModal} />
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
                      : <a className='button is-large is-light is-link' onClick={reprint}>
                        <FormattedMessage id='app.general.reprint' />
                      </a>
                    }
                  </p>
                  : null
                }
              </div>
              <div className='column is-6 is-offset-3'>
                {orderSuccess
                  ? <a className='button is-success is-large is-fullwidth' onClick={closeModal}>
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

  renderPaymentListModal () {
    const {dispatch, payments, activeModalId, cpShouldUpdate, closeModal} = this.props
    const active = activeModalId === 'paymentListModal' ? 'is-active' : ''
    return (
      <div id='paymentListModal' className={`modal ${active}`}>
        <div className='modal-background' />
        <div className='modal-card'>
          <header className='modal-card-head'>
            <p className='modal-card-title is-marginless has-text-centered'>
              Payments
            </p>
            <button className='delete' onClick={closeModal} />
          </header>
          <div className='modal-card-body'>
            <div className='content'>
              {cpShouldUpdate
                ? <div>
                  {!payments
                    ? null
                    : payments.map(function (item, key) {
                      function remove () {
                        dispatch(panelCheckoutShouldUpdate(true))
                        dispatch(removePaymentType(item.type, key))
                      }
                      return (
                        <div className='content' key={key}>
                          <p className='title is-marginless'>{`${item.deduction ? 'voucher' : item.type} - `}
                            <a className='button is-danger is-outlined' onClick={remove}>Remove Payment</a>
                          </p>
                          <ul>
                            <li>{`payment amount: ${formatCurrency(item.deduction || item.amount)} `}</li>
                            {item.deduction
                              ? <li>voucher code: {item.remarks}</li>
                              : item.type === 'cash'
                                ? <li>cash given: {formatCurrency(item.cash)}</li>
                                : <li>transaction id: {item.transNumber}</li>
                            }
                            {item.provider ? <li>card: {item.provider}</li> : null}
                          </ul>
                        </div>
                      )
                    }, this)
                  }
                </div>
                : null
              }
            </div>
          </div>
        </div>
      </div>
    )
  }

  renderNoteModal () {
    const {dispatch, orderNote, activeModalId, cpShouldUpdate, closeModal} = this.props
    const active = activeModalId === 'notesModal' ? 'is-active' : ''
    return (
      <div id='notesModal' className={`modal ${active}`}>
        <div className='modal-background' />
        <div className='modal-card'>
          <header className='modal-card-head'>
            <p className='modal-card-title is-marginless has-text-centered'>
              <FormattedMessage id='app.general.notes' />
            </p>
            <button className='delete' onClick={closeModal} />
          </header>
          <div className='modal-card-body'>
            <div className='content'>
              {cpShouldUpdate
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

}

PanelCheckoutModals.propTypes = {
  activeModalId: PropTypes.string,
  card: PropTypes.object,
  cashTendered: PropTypes.number,
  cpShouldUpdate: PropTypes.bool,
  currency: PropTypes.string,
  error: PropTypes.string,
  orderError: PropTypes.string,
  orderNote: PropTypes.array,
  orderSuccess: PropTypes.bool,
  orderTotal: PropTypes.number,
  payments: PropTypes.array,
  paymentMode: PropTypes.string,
  paymentTotal: PropTypes.number,
  reprinting: PropTypes.bool,
  transNumber: PropTypes.string,
  setOdboUserPincode: PropTypes.func,
  closeModal: PropTypes.func,
  reprint: PropTypes.func,
  processOrder: PropTypes.func
}

export default connect()(injectIntl(PanelCheckoutModals))
