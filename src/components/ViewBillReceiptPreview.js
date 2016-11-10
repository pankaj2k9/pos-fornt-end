import React from 'react'
import ReactDOM from 'react-dom'
import { FormattedMessage } from 'react-intl'

import ReceiptPreview from './ReceiptPreview'
import ReceiptPreviewRow, {
  ReceiptRowDivider,
  ReceiptRowDividerDbl,
  ReceiptRowNewLine
} from './ReceiptPreviewRow'

import { printReceiptFromString } from '../utils/receipt'

import { formatDate } from '../utils/string'

export default class ViewBillReceiptPreview extends React.PureComponent {
  constructor (props) {
    super(props)

    this.renderPrintBtn = this.renderPrintBtn.bind(this)
    this.handlePrint = this.handlePrint.bind(this)
  }

  splitAddr (sourceId, stores) {
    const store = stores.filter((store) => {
      return store.source === sourceId
    })[0] || {}

    const storeAddress = store.address || 'SINGAPORE 188021\nTELEPHONE:6238 1337'

    return storeAddress.split('\\n')
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
    const { orders, stores } = this.props
    const dateOptions = {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }

    return (
      <ReceiptPreview>
        {this.renderPrintBtn()}

        <span ref='preview'>
          {orders.map((order) => {
            const addrList = this.splitAddr(order.source, stores)
            const cust = order.users
              ? `${order.users.firstName} ${order.users.lastName}`.toUpperCase()
              : 'N/A'
            const itemCount = order.items.length
            const orderSalesPerson = order.staff && order.staff.username
              ? order.staff.username.toUpperCase() : 'N/A'

            const keyPref = `rcptprev-vb-${order.id}-`
            return (
              <span key={`${keyPref}`}>
                {/* Address */}
                {addrList.map((addr, i) => {
                  const key = `${keyPref}addr-${i}`

                  return <ReceiptPreviewRow
                    key={key}
                    keyPrefix={key}
                    cols={[addr]} />
                })}

                {/* Customer name */}
                <ReceiptPreviewRow
                  keyPrefix={`${keyPref}cust`}
                  cols={[`CUSTOMER: ${cust}`]} />
                <ReceiptRowDivider />

                {/* Date and order ID */}
                <ReceiptPreviewRow
                  keyPrefix={`${keyPref}date-id`}
                  cols={[
                    formatDate(new Date(order.dateOrdered), dateOptions),
                    order.id
                  ]} />

                {/* Order sales person */}
                <ReceiptPreviewRow
                  keyPrefix={`${keyPref}sales-person`}
                  cols={[`SALES PERSON: ${orderSalesPerson}`]} />
                <ReceiptRowDivider />

                {/* Items list */}
                {order.items.map((item, i) => {
                  const key = `${keyPref}item-${item.id || i}`

                  return (
                    <span key={key} className='item'>
                      <ReceiptPreviewRow
                        keyPrefix={key}
                        cols={[item.product.nameEn]} />
                      <ReceiptPreviewRow cols={[
                        item.product.barcodeInfo,
                        `${item.quantity}x`,
                        item.totalCost
                      ]} />
                    </span>
                  )
                })}

                {/* Items list info */}
                <ReceiptPreviewRow
                  keyPrefix={`${keyPref}item-list-info`}
                  cols={[
                    `Total (${itemCount}) item${itemCount === 1 ? '' : 's'}.`
                  ]} />
                <ReceiptRowDivider />

                {/* Totals */}
                <ReceiptPreviewRow
                  keyPrefix={`${keyPref}subtotal`}
                  cols={['Sub-TOTAL S$', order.subtotal]} />
                <ReceiptPreviewRow
                  keyPrefix={`${keyPref}total`}
                  cols={['TOTAL S$', order.total]} />

                {/* Payments */}
                <ReceiptPreviewRow
                  keyPrefix={`${keyPref}payments`}
                  cols={['PAYMENT(S):']} />

                {order.payments.map((payment, i) => {
                  let type = ''
                  const key = `${keyPref}payment-${payment.id || i}`

                  // Figure out the type of payment
                  if (payment.provider && payment.type === 'debit') {
                    type = 'NETS'
                  } else if (payment.provider && payment.type === 'credit') {
                    type = payment.provider.toUpperCase()
                  } else {
                    type = payment.type && payment.type.toUpperCase()
                  }

                  return <ReceiptPreviewRow
                    key={key}
                    keyPrefix={key}
                    cols={[type, payment.amount]} />
                })}

                <ReceiptRowDividerDbl />
                <ReceiptRowNewLine />
              </span>
            )
          })}
        </span>

        {this.renderPrintBtn()}
      </ReceiptPreview>
    )
  }
}
