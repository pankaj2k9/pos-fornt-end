import React from 'react'
import { FormattedMessage, FormattedNumber } from 'react-intl'

const POSTransList = ({ posTrans }) => {
  return (!posTrans
    ? null
    : <div className='tile is-ancestor is-vertical'>
      {Object.keys(posTrans).map((key, index) => {
        const keyValue = posTrans[key]
        let keyName
        let value = keyValue || keyValue === 0 ? keyValue : 'N/A'
        let prefix
        const fieldKey = `pos-trans-${key}-${index}`

        switch (key) {
          case 'type':
            keyName = <FormattedMessage id='app.modal.type' />
            break
          case 'change':
            keyName = <FormattedMessage id='app.modal.change' />
            value = <FormattedNumber value={Number(keyValue)} minimumFractionDigits={2} />
            prefix = 'SGD '
            break
          case 'payment':
            keyName = <FormattedMessage id='app.modal.payment' />
            value = <FormattedNumber value={Number(keyValue)} minimumFractionDigits={2} />
            prefix = 'SGD '
            break
          case 'transNumber':
            keyName = <FormattedMessage id='app.modal.transNumber' />
            break
          case 'userId':
            keyName = <FormattedMessage id='app.modal.userId' />
            break
        }

        return <div key={fieldKey} className='tile'>
          <div className='tile is-parent is-4'>
            <div className='tile is-child'>
              <p className='title is-5 is-hidden-mobile'>{keyName}</p>
              <p className='title is-5 is-hidden-tablet'>{keyName}</p>
            </div>
          </div>
          <div className='tile is-parent is-8'>
            <div className='tile is-child'>
              <p className='subtitle is-5'>
                {prefix}{value}
              </p>
            </div>
          </div>
        </div>
      })}
    </div>
  )
}

export default POSTransList
