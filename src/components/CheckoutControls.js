import React from 'react'

import { injectIntl, FormattedMessage } from 'react-intl'

import Level from './Level'
import Toggle from './Toggle'

const ModalInput = (props) => {
  const {
    currency,
    paymentMode,
    onChange,
    onSubmit,
    inputPh
  } = props

  var inputCash = 6
  var inputCredit = 20
  var inputPin = 4

  return (
    <div className='control is-expanded'>
      <form autoComplete='off' onSubmit={onSubmit}>
        <input
          id={'modalInput'}
          autoFocus
          className='input is-large'
          type={
            currency === 'sgd'
            ? paymentMode === 'cash' ? 'number' : 'text'
            : 'password'
          }
          placeholder={
            currency === 'sgd'
            ? paymentMode === 'cash'
              ? inputPh.cash
              : inputPh.card
            : inputPh.odbo}
          maxLength={
            currency === 'sgd'
              ? paymentMode === 'cash' ? inputCash : inputCredit
              : inputPin
          }
          onChange={e => onChange(e.target.value)} />
      </form>
      <hr />
    </div>
  )
}

const CheckoutControls = (props) => {
  const {
    isProcessing,
    currency,
    paymentMode,
    onClickCardToggle,
    onClickCardProvToggle,
    total,
    cashTendered,
    cashChange,
    card,
    activeCustomer,
    walkinCustomer,
    odboMinusTotal,
    odboBalance,
    onChange,
    onSubmit,
    intl
  } = props

  // style for logo of card Association
  var unselected = {opacity: 0.2}
  var selected = {opacity: 1}

  // fixed width for displaying trans details
  var cashDetails = 250
  var odboDetails = 280

  CheckoutControls.defaultProps = {
    onSubmit: function (event) {
      event.preventDefault()
      document.getElementById('confirmCheckout').focus()
    }
  }
  return (
    <section className='modal-card-body'>
      {
        isProcessing
        ? <div className='container has-text-centered'>
          <i className='fa fa-spinner fa-pulse fa-5x fa-fw' />
          <h1>Processing Orders...</h1>
        </div>
        : <div>
          <div className='box'>
            <Level
              left={
                <div>
                  <h6 className='subtitle is-marginless'>
                    <FormattedMessage id='app.general.custName' />
                  </h6>
                  <h2 className='title is-marginless'>
                    {activeCustomer !== null
                      ? activeCustomer.firstName
                      : walkinCustomer}
                  </h2>
                </div>
              }
              right={
                <div>
                  <h2 className='title is-marginless'>
                    {activeCustomer !== null
                      ? activeCustomer.membership
                      : <FormattedMessage id='app.general.walkin' />}
                  </h2>
                  <h6 className='subtitle is-marginless'>
                    {activeCustomer !== null
                      ? <FormattedMessage id='app.general.member' />
                      : <FormattedMessage id='app.general.cust' />}
                  </h6>
                </div>
              }
            />
          </div>

          {currency === 'odbo' && odboBalance <= 0
            ? null
            : <ModalInput paymentMode={paymentMode} onChange={onChange}
              currency={currency} onSubmit={onSubmit} inputPh={{
                cash: intl.formatMessage({ id: 'app.ph.enterAmount' }),
                card: intl.formatMessage({ id: 'app.ph.enterTransId' }),
                odbo: intl.formatMessage({ id: 'app.ph.enterPin' })
              }} provider={card.provider} />
          }

          {currency === 'odbo'
            ? null
            : paymentMode === 'cash'
              ? null
              : <div className='columns container'>
                <div className={`column has-text-centered ${card.type === 'debit' ? 'is-12' : 'is-6'}`}>
                  <p className='title'>
                    <FormattedMessage id='app.general.cardType' />
                  </p>
                  <Toggle
                    switchAction={onClickCardToggle}
                    active={card.type}
                    toggleTwo={{name: intl.formatMessage({ id: 'app.button.debit' }), value: 'debit'}}
                    toggleOne={{name: intl.formatMessage({ id: 'app.button.credit' }), value: 'credit'}}
                    size='is-large' />
                </div>
                {
                  card.type === 'debit'
                    ? null
                    : <div className='column is-6 has-text-centered'>
                      <p className='title'>
                        <FormattedMessage id='app.general.cardAssoc' />
                      </p>
                      <div className='columns'>
                        <div className='column is-4'>
                          <img style={card.provider === 'visa'
                            ? selected
                            : unselected}
                            onClick={onClickCardProvToggle.bind(this, 'visa')}
                            src={require('../assets/card-visa.gif')} />
                        </div>
                        <div className='column is-4'>
                          <img style={card.provider === 'master'
                            ? selected
                            : unselected}
                            onClick={onClickCardProvToggle.bind(this, 'master')}
                            src={require('../assets/card-mc.gif')} />
                        </div>
                        <div className='column is-4'>
                          <img style={card.provider === 'amex'
                            ? selected
                            : unselected}
                            onClick={onClickCardProvToggle.bind(this, 'amex')}
                            src={require('../assets/card-amex.gif')} />
                        </div>
                      </div>
                    </div>
                }
              </div>
          }

          {currency === 'sgd'
            ? <div>
              <center>
                <div style={{width: cashDetails}}>
                  {paymentMode === 'cash'
                  ? <div>
                    <table>
                      <tbody>
                        <tr>
                          <td><h3><FormattedMessage id='app.general.total' />: </h3></td>
                          <td style={{textAlign: 'right'}}><h3>{total}</h3></td>
                        </tr>
                        <tr>
                          <td><h3><FormattedMessage id='app.general.cashTendered' />:</h3></td>
                          <td style={{textAlign: 'right'}}><h3>{cashTendered}</h3></td>
                        </tr>
                      </tbody>
                    </table>
                    <hr />
                  </div>
                  : null
                }
                  <table>
                    <tbody>
                      <tr className='is-bordered'>
                        <td>
                          {paymentMode === 'cash'
                          ? <h1><FormattedMessage id='app.general.change' />:</h1>
                          : <h1><FormattedMessage id='app.general.totalPrice' />:</h1>
                        }
                        </td>
                        <td style={{textAlign: 'right'}}>
                          {paymentMode === 'cash'
                          ? <h1>{cashChange}</h1>
                          : <h1>{total}</h1>
                        }
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </center>
            </div>
            : <div className='container has-text-centered'>
              <center>
                <div style={{width: odboDetails}}>
                  <table>
                    <tbody>
                      <tr>
                        <td>
                          <h3><FormattedMessage id='app.general.ob' />:</h3>
                        </td>
                        <td style={{textAlign: 'right'}}><h3>{odboBalance}</h3></td>
                      </tr>
                      <tr>
                        <td><h3><FormattedMessage id='app.general.top' />:</h3></td>
                        <td style={{textAlign: 'right'}}><h3>{total}</h3></td>
                      </tr>
                    </tbody>
                  </table>
                  <hr />
                  <table>
                    {odboBalance > 0 && odboMinusTotal >= 0
                    ? <tr className='is-bordered'>
                      <td>
                        <h3><FormattedMessage id='app.general.rob' />:</h3>
                      </td>
                      <td style={{textAlign: 'right'}}>
                        <h1>{odboMinusTotal}</h1>
                      </td>
                    </tr>
                    : <tr>
                      <td style={{textAlign: 'center'}}>
                        <h1 style={{color: '#ed6c63'}}>
                          <FormattedMessage id='app.general.ib' />
                        </h1>
                      </td>
                    </tr>
                  }
                  </table>
                </div>
              </center>
            </div>
          }
        </div>
      }
    </section>
  )
}

export default injectIntl(CheckoutControls)
