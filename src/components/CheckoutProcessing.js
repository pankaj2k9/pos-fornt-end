import React from 'react'

import { FormattedMessage } from 'react-intl'

const CheckoutProcessing = (props) => {
  const {
    isProcessing,
    orderError,
    orderSuccess,
    reprinting,
    onClickReprint
  } = props

  return (
    <section className='modal-card-body'>
      {
        isProcessing
        ? <div className='container has-text-centered'>
          <i className='fa fa-spinner fa-pulse fa-5x fa-fw'></i>
          <h1>{"Processing Customer's Order..."}</h1>
        </div>
        : orderSuccess
          ? <center>
            <div className='container has-text-centered'>
              <h1 className='title is-1'>
                <FormattedMessage id='app.general.orderSuccess' />
              </h1>
            </div>
            <div className='box'>
            {reprinting
              ? <div className='content'>
                <p className='subtitle is-2'>
                  <FormattedMessage id='app.general.printing' />
                </p>
                <i className='fa fa-spinner fa-pulse fa-3x fa-fw' />
              </div>
              : <div className='content'>
                <p className='subtitle is-3'>
                  <FormattedMessage id='app.general.checkPrinter' />
                </p>
                <a className='button is-large is-light is-link' onClick={onClickReprint}>
                  <FormattedMessage id='app.general.reprint' />
                </a>
              </div>
            }
            </div>
          </center>
          : <div className='container has-text-centered'>
          {
            orderError.message === 'Failed to fetch'
            ? <h2 className='subtitle'>
              <FormattedMessage id='app.general.orderFailedCP' />
            </h2>
            : <h2 className='subtitle'>
              <FormattedMessage id='app.general.orderFailed' />
            </h2>
          }
          </div>
      }
    </section>
  )
}

export default CheckoutProcessing
