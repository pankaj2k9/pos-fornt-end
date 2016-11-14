import React from 'react'
import { FormattedDate, FormattedTime, FormattedMessage } from 'react-intl'
import DataListItem from './DataListItem'
import POSTransList from './POSTransList'

const DataList = ({ data, listName, keyStyle, valStyle }) => {
  return (
    <div className='tile is-ancestor is-vertical'>
      {Object.keys(data).map(key => {
        const keyValue = data[key]
        let keyName
        let value = keyValue || keyValue === 0 ? keyValue : 'N/A'
        const fieldKey = `order-modal-${key}`

        switch (key) {
          case 'id':
            keyName = <FormattedMessage id='app.modal.orderId' />
            break
          case 'userId':
            keyName = <FormattedMessage id='app.modal.userId' />
            break
          case 'dateCreated':
            keyName = <FormattedMessage id='app.modal.dateCreated' />

            value = (
              <span>
                <FormattedDate value={keyValue} /> <FormattedTime value={keyValue} />
              </span>
            )
            break
          case 'dateUpdated':
            keyName = <FormattedMessage id='app.modal.dateUpdated' />
            value = (
              <span>
                <FormattedDate value={keyValue} /> <FormattedTime value={keyValue} />
              </span>
            )
            break
          case 'dateOrdered':
            keyName = <FormattedMessage id='app.modal.dateOrdered' />
            value = (
              <span>
                <FormattedDate value={keyValue} /> <FormattedTime value={keyValue} />
              </span>)
            break
          case 'dateFulfilled':
            keyName = <FormattedMessage id='app.modal.dateFulfilled' />
            value = keyValue
              ? (<span>
                <FormattedDate value={keyValue} /> <FormattedTime value={keyValue} />
              </span>)
              : 'N/A'
            break
          case 'currency':
            keyName = <FormattedMessage id='app.modal.currency' />
            break
          case 'totalQuantity':
            keyName = <FormattedMessage id='app.modal.totalQuantity' />
            break
          case 'subtotal':
            keyName = <FormattedMessage id='app.modal.subtotal' />
            break
          case 'redemptionPoints':
            keyName = <FormattedMessage id='app.modal.redemptionPoints' />
            break
          case 'source':
            keyName = <FormattedMessage id='app.modal.source' />
            break
          case 'posTrans':
            keyName = <FormattedMessage id='app.modal.posTrans' />
            value = <POSTransList posTrans={keyValue} />
            break
          case 'stripeChargeId':
            keyName = <FormattedMessage id='app.modal.stripeChargeId' />
            break
          case 'isFulfilled':
            keyName = <FormattedMessage id='app.modal.isFulfilled' />
            value = keyValue.toString()
            break
          case 'shippingDetails':
            keyName = <FormattedMessage id='app.modal.shippingDetails' />
            value = keyValue ? 'Can\'t show' : 'N/A'
            break
          case 'tSalesAftTax':
            keyName = <FormattedMessage id='app.page.reports.tSalesAftTax' />
            value = keyValue
            break
          case 'tSalesBefTax':
            keyName = <FormattedMessage id='app.page.reports.tSalesBefTax' />
            value = keyValue
            break
          case 'tTaxCollected':
            keyName = <FormattedMessage id='app.page.reports.tTaxCollected' />
            value = keyValue
            break
          case 'transCount':
            keyName = <FormattedMessage id='app.page.reports.tTaxCollected' />
            value = keyValue
            break
          case 'salesDate':
            keyName = <FormattedMessage id='app.page.reports.salesDate' />
            value = (
              <span>
                <FormattedDate value={keyValue} />
              </span>
            )
            break
        }

        return <DataListItem
          key={fieldKey}
          dataName={keyName}
          dataValue={value}
          keyStyle={keyStyle}
          valStyle={valStyle}
        />
      })}
    </div>
  )
}

export default DataList
