import React from 'react'
import ReactDOM from 'react-dom'
import { FormattedMessage } from 'react-intl'

import ReceiptPreview from './ReceiptPreview'
import ReceiptPreviewRow, {
  ReceiptRowDivider
} from './ReceiptPreviewRow'

import { printReceiptFromString } from '../utils/receipt'

import { formatDate, formatCurrency } from '../utils/string'

export default class ViewBillReceiptPreview extends React.Component {
  constructor (props) {
    super(props)

    this.renderPrintBtn = this.renderPrintBtn.bind(this)
    this.handlePrint = this.handlePrint.bind(this)
  }

  renderPrintBtn () {
    return (
      <p className='control'>
        <button className='button is-primary is-inverted' onClick={this.handlePrint}>
          <FormattedMessage id='app.general.printReceipt' />
        </button>
      </p>
    )
  }

  handlePrint () {
    const receiptContent = ReactDOM.findDOMNode(this.refs.preview).innerHTML
    printReceiptFromString(receiptContent)
  }

  render () {
    const { orders, staff } = this.props.data

    const dateOptions = {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }

    let salesPerMonth = 0
    let salesPerDay = 1

    const keyPref = 'rcptprev-ss'
    return (
      <ReceiptPreview>
        {this.renderPrintBtn()}

        <span ref='preview'>
          {/* Header */}
          <ReceiptPreviewRow
            key={`${keyPref}-date`}
            keyPrefix={`${keyPref}-date`}
            cols={[formatDate(new Date(), dateOptions)]} />

          <ReceiptPreviewRow
            key={`${keyPref}-title`}
            keyPrefix={`${keyPref}-title`}
            cols={['TRANSACTION REPORT']} />
          <ReceiptRowDivider />

          {/* Orders list */}
          {orders.map((order, i) => {
            const key = `${keyPref}-order-${i}`
            const idKey = `${key}-id-${order.id}`

            return (
              <span key={key}>
                {/* Order id */}
                <ReceiptPreviewRow
                  key={idKey}
                  keyPrefix={idKey}
                  cols={[`${order.id} (${staff.username.toUpperCase()})`]}
                />

                {/* Order items */}
                {order.items.map((item, i) => {
                  const itemKey = `${key}-item-${i}`
                  return (
                    <ReceiptPreviewRow
                      key={itemKey}
                      keyPrefix={itemKey}
                      cols={[
                        item.product.barcodeInfo,
                        item.quantity,
                        formatCurrency(Number(item.totalCost))
                      ]}
                    />
                  )
                })}
              </span>
            )
          })}
          <ReceiptRowDivider />

          {/* Staff sales per month/day */}
          <ReceiptPreviewRow
            key={`${keyPref}-salespermonth`}
            keyPrefix={`${keyPref}-salespermonth`}
            cols={['Staff sales/month', formatCurrency(salesPerMonth)]} />

          <ReceiptPreviewRow
            key={`${keyPref}-salesperday`}
            keyPrefix={`${keyPref}-salesperday`}
            cols={['Staff sales/day', formatCurrency(salesPerDay)]} />
        </span>

        {this.renderPrintBtn()}
      </ReceiptPreview>
    )
  }
}
