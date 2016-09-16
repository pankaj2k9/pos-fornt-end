import React from 'react'

import { injectIntl, FormattedMessage } from 'react-intl'

import Level from './Level'
import Toggle from './Toggle'

const CheckoutControls = (props) => {
  const {
    isProcessing,
    currency,
    paymentMode,
    onChange,
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
    intl,
    onSubmit
  } = props

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
            : <div className='control is-expanded'>
              <form autoComplete='off' onSubmit={onSubmit}>
                <input
                  id='checkoutInput'
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
                      ? intl.formatMessage({ id: 'app.ph.enterAmount' })
                      : intl.formatMessage({ id: 'app.ph.enterTransId' })
                    : intl.formatMessage({ id: 'app.ph.enterPin' })}
                  maxLength={
                    currency === 'sgd'
                      ? paymentMode === 'cash' ? 6 : 20
                      : 4
                  }
                  onChange={e => onChange(e.target.value)} />
              </form>
              <hr />
            </div>
          }

          {currency === 'odbo'
            ? null
            : paymentMode === 'cash'
              ? null
              : <div className='columns container'>
                <div className='column is-6 has-text-centered'>
                  <p className='title'>Card Type</p>
                  <Toggle
                    switchAction={onClickCardToggle}
                    active={card.type}
                    toggleTwo={{name: 'Debit', value: 'debit'}}
                    toggleOne={{name: 'Credit', value: 'credit'}}
                    size='is-large' />
                </div>
                <div className='column is-6 has-text-centered'>
                  <p className='title'>Card Association</p>
                  <div className='columns'>
                    <div className='column is-4'>
                      <img style={card.provider === 'visa'
                        ? {opacity: 1}
                        : {opacity: 0.2}}
                        onClick={onClickCardProvToggle.bind(this, 'visa')}
                        src='http://www.credit-card-logos.com/images/visa_credit-card-logos/visa_logo_7.gif' />
                    </div>
                    <div className='column is-4'>
                      <img style={card.provider === 'master'
                        ? {opacity: 1}
                        : {opacity: 0.2}}
                        onClick={onClickCardProvToggle.bind(this, 'master')}
                        src='http://www.credit-card-logos.com/images/mastercard_credit-card-logos/mastercard_logo_8.gif' />
                    </div>
                    <div className='column is-4'>
                      <img style={card.provider === 'amex'
                        ? {opacity: 1}
                        : {opacity: 0.2}}
                        onClick={onClickCardProvToggle.bind(this, 'amex')}
                        src='http://www.credit-card-logos.com/images/american_express_credit-card-logos/american_express_logo_8.gif' />
                    </div>
                  </div>
                </div>
              </div>
          }

          {currency === 'sgd'
            ? <div>
              <center>
                <div style={{width: 250}}>
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
                          <td style={{textAlign: 'right'}}><h3>{parseInt(cashTendered).toFixed(2)}</h3></td>
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
                          ? <h1>{parseInt(cashChange).toFixed(2)}</h1>
                          : <h1>{parseInt(total).toFixed(2)}</h1>
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
                <div style={{width: 280}}>
                  <table>
                    <tbody>
                      <tr>
                        <td><h3><FormattedMessage id='app.general.ob' />:</h3></td>
                        <td style={{textAlign: 'right'}}><h3>{parseInt(odboBalance).toFixed(2)}</h3></td>
                      </tr>
                      <tr>
                        <td><h3><FormattedMessage id='app.general.top' />:</h3></td>
                        <td style={{textAlign: 'right'}}><h3>{parseInt(total).toFixed(2)}</h3></td>
                      </tr>
                    </tbody>
                  </table>
                  <hr />
                  <table>
                  {parseInt(odboBalance).toFixed(2) > 0 && odboMinusTotal >= 0
                    ? <tr className='is-bordered'>
                      <td>
                        <h3><FormattedMessage id='app.general.rob' />:</h3>
                      </td>
                      <td style={{textAlign: 'right'}}>
                        <h1>{parseInt(odboMinusTotal).toFixed(2)}</h1>
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
