import React from 'react'
import ReactDOM from 'react-dom'
import { FormattedMessage } from 'react-intl'
import moment from 'moment'

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
    const { orders, staff, from, to } = this.props.data
    const dateOptions = {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }

    const plainDateOptions = {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric'
    }

    const DAYS_IN_MONTH = 31
    const daysCount = moment(to).diff(moment(from), 'days') + 1
    const monthsCount = Math.ceil(daysCount / DAYS_IN_MONTH)
    let total = 0
    let totalOdbo = 0

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
            total += order.currency === 'sgd' && (Number(order.total) || 0)
            totalOdbo += order.currency === 'odbo' && (Number(order.total) || 0)

            return (
              <span key={key}>
                {/* Order id */}
                <ReceiptPreviewRow
                  key={idKey}
                  keyPrefix={idKey}
                  cols={[ `${order.id} (${staff.username.toUpperCase()})`, formatDate(new Date(order.dateCreated), plainDateOptions) ]} />

                {/* Order items */}
                {order.items.map((item, i) => {
                  const itemKey = `${key}-item-${i}`
                  return (
                    <ReceiptPreviewRow
                      key={itemKey}
                      keyPrefix={itemKey}
                      rowType={'spaced'}
                      cols={[
                        item.product.barcodeInfo,
                        `${item.quantity}x`,
                        formatCurrency(Number(item.totalCost), order.currency)
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
            cols={[
              'SGD sales/month:',
              formatCurrency(total / monthsCount)
            ]} />

          <ReceiptPreviewRow
            key={`${keyPref}-salesperday`}
            keyPrefix={`${keyPref}-salesperday`}
            cols={[
              'SGD sales/day:',
              formatCurrency(total / daysCount)
            ]} />

          <ReceiptPreviewRow
            key={`${keyPref}-odbosalespermonth`}
            keyPrefix={`${keyPref}-salespermonth`}
            cols={[
              '"odbo coins" sales/month:',
              formatCurrency(totalOdbo / monthsCount, 'odbo')
            ]} />

          <ReceiptPreviewRow
            key={`${keyPref}-odbosalesperday`}
            keyPrefix={`${keyPref}-salesperday`}
            cols={[
              '"odbo coins" sales/day:',
              formatCurrency(totalOdbo / daysCount, 'odbo')
            ]} />
        </span>

        {this.renderPrintBtn()}
      </ReceiptPreview>
    )
  }
}
