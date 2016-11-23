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

import { formatCurrency, formatDate } from '../utils/string'

export default class ViewBillReceiptPreview extends React.PureComponent {
  constructor (props) {
    super(props)

    this.renderPrintBtn = this.renderPrintBtn.bind(this)
    this.handlePrint = this.handlePrint.bind(this)

    this.renderOldViewBillReceipt = this.renderOldViewBillReceipt.bind(this)
    this.renderNewViewBillReceipt = this.renderNewViewBillReceipt.bind(this)
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

  renderOldViewBillReceipt () {
    const { orders, stores } = this.props
    const dateOptions = {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }

    return (
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
                      order.currency === 'sgd' ? formatCurrency(item.totalCost) : item.totalCost
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
                cols={['Sub-TOTAL S$', order.currency === 'sgd' ? formatCurrency(order.subtotal) : order.subtotal]} />
              <ReceiptPreviewRow
                keyPrefix={`${keyPref}total`}
                cols={['TOTAL S$', formatCurrency(order.total)]} />

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
                  cols={[type, order.currency === 'sgd' ? formatCurrency(payment.amount) : payment.amount]} />
              })}

              <ReceiptRowDividerDbl />
              <ReceiptRowNewLine />
            </span>
          )
        })}
      </span>
    )
  }

  renderNewViewBillReceipt () {
    const { orders, stores } = this.props
    const dateOptions = {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }

    return (
      <span ref='preview'>
        {orders.map((order) => {
          const addrList = this.splitAddr(order.source, stores)
          const staff = order.staff
          let orderSalesPerson = ''

          if (staff) {
            orderSalesPerson += staff.firstName && `${staff.firstName.toUpperCase()} `
            orderSalesPerson += staff.lastName && `${staff.lastName.toUpperCase()}` || ''
          } else {
            orderSalesPerson = 'N/A'
          }

          const orderStore = stores.find((st) => st.source === order.source)

          const keyPref = `rcptprev-vb-${order.id}-`
          return (
            <span key={`${keyPref}`}>
              {/* "The odbo" */}
              <ReceiptPreviewRow
                key={`${keyPref}-header`}
                keyPrefix={`${keyPref}-header`}
                rowType='centered is-title'
                cols={['The odbo']} />

              {/* Store name */}
              <ReceiptPreviewRow
                key={`${keyPref}-stname`}
                keyPrefix={`${keyPref}-stname`}
                rowType='centered'
                cols={[orderStore.name]} />

              {/* Address */}
              {addrList.map((addr, i) => {
                const key = `${keyPref}addr-${i}`

                return <ReceiptPreviewRow
                  key={key}
                  keyPrefix={key}
                  rowType='centered'
                  cols={[addr]} />
              })}
              <ReceiptRowDivider />

              {/* Order ID */}
              <ReceiptPreviewRow
                keyPrefix={`${keyPref}order-id`}
                rowType='is-bold'
                cols={[`Order ID: ${order.id}`]} />

              {/* Order sales person */}
              <ReceiptPreviewRow
                keyPrefix={`${keyPref}sales-person`}
                cols={[`STAFF: ${orderSalesPerson}`]} />

              {/* Date */}
              <ReceiptPreviewRow
                keyPrefix={`${keyPref}order-id`}
                cols={[formatDate(new Date(order.dateOrdered), dateOptions)]} />
              <ReceiptRowDivider />

              {/* Items list */}
              {order.items.map((item, i) => {
                const key = `${keyPref}item-${item.id || i}`

                return (
                  <span key={key} className='item'>
                    <ReceiptPreviewRow
                      keyPrefix={key}
                      rowType='qty-name-total'
                      cols={[
                        `${item.quantity}x`,
                        item.product.nameEn,
                        order.currency === 'sgd' ? formatCurrency(item.totalCost) : item.totalCost
                      ]} />

                    <ReceiptPreviewRow
                      keyPrefix={key}
                      rowType='qty-name-total'
                      cols={['', item.product.barcodeInfo, '']} />
                  </span>
                )
              })}
              <ReceiptRowDivider />

              {/* Totals */}
              <ReceiptPreviewRow
                keyPrefix={`${keyPref}gst`}
                cols={['GST:', formatCurrency(0)]} />
              <ReceiptPreviewRow
                keyPrefix={`${keyPref}subtotal`}
                cols={['SUBTOTAL:', order.currency === 'sgd' ? formatCurrency(order.subtotal) : order.subtotal]} />
              <ReceiptRowDivider />
              <ReceiptPreviewRow
                keyPrefix={`${keyPref}total`}
                cols={['TOTAL:', order.currency === 'sgd' ? formatCurrency(order.total) : order.total]} />
              <ReceiptRowDivider />
              {/* VOUCHERS */}
              {order.vouchers.length > 0
                ? <ReceiptPreviewRow
                  keyPrefix={`${keyPref}vouchers`}
                  rowType='is-bold'
                  cols={['VOUCHERS']} />
                : null
              }
              {order.vouchers.map((voucher, i) => {
                const key = `${keyPref}voucher-${voucher.id || i}`
                const voucherRemarks = `voucher[${voucher.remarks}]`
                return (
                  <ReceiptPreviewRow
                    key={`${key}-amount`}
                    keyPrefix={`${key}-amount`}
                    cols={[voucherRemarks, formatCurrency(Number(voucher.deduction))]} />
                )
              })
              }
              {/* Payments */}
              {order.payments.map((payment, i) => {
                let type = ''
                const key = `${keyPref}payment-${payment.id || i}`

                // Figure out the type of payment
                if (order.currency === 'sgd') {
                  if (payment.provider && payment.type === 'debit') {
                    type = 'NETS'
                    return (
                      <span key={`${key}-cont`}>
                        <ReceiptPreviewRow
                          key={`${key}-type-${type}`}
                          keyPrefix={`${key}-type-${type}`}
                          rowType='is-bold'
                          cols={[type]} />
                        <ReceiptPreviewRow
                          key={`${key}-amount`}
                          keyPrefix={`${key}-amount`}
                          cols={['AMOUNT PAID:', formatCurrency(payment.amount)]} />
                        <ReceiptPreviewRow
                          key={`${key}-cardtype`}
                          keyPrefix={`${key}-cardtype`}
                          cols={['CARD TYPE:', payment.provider]} />
                        <ReceiptPreviewRow
                          key={`${key}-transnum`}
                          keyPrefix={`${key}-transnum`}
                          cols={['TRANS#:', payment.transNumber]} />
                      </span>
                    )
                  } else if (payment.provider && payment.type === 'credit') {
                    type = payment.provider.toUpperCase()
                    return (
                      <span key={`${key}-cont`}>
                        <ReceiptPreviewRow
                          key={`${key}-type-${type}`}
                          keyPrefix={`${key}-type-${type}`}
                          rowType='is-bold'
                          cols={[type]} />
                        <ReceiptPreviewRow
                          key={`${key}-amount`}
                          keyPrefix={`${key}-amount`}
                          cols={['AMOUNT PAID:', formatCurrency(payment.amount)]} />
                        <ReceiptPreviewRow
                          key={`${key}-transnum`}
                          keyPrefix={`${key}-transnum`}
                          cols={['TRANS#:', payment.transNumber]} />
                      </span>
                    )
                  } else {
                    type = payment.type && payment.type.toUpperCase()
                    return (
                      <span key={`${key}-cont`}>
                        <ReceiptPreviewRow
                          key={`${key}-type-${type}`}
                          keyPrefix={`${key}-type-${type}`}
                          rowType='is-bold'
                          cols={[type]} />
                        <ReceiptPreviewRow
                          key={`${key}-cash`}
                          keyPrefix={`${key}-cash`}
                          cols={['CASH GIVEN:', formatCurrency(payment.cash)]} />
                        <ReceiptPreviewRow
                          key={`${key}-amount`}
                          keyPrefix={`${key}-amount`}
                          cols={['AMOUNT PAID:', formatCurrency(payment.amount)]} />
                        <ReceiptPreviewRow
                          key={`${key}-change`}
                          keyPrefix={`${key}-change`}
                          cols={['CASH CHANGE:', formatCurrency(payment.change)]} />
                      </span>
                    )
                  }
                } else {
                  type = payment.type && payment.type.toUpperCase()
                  return (
                    <span key={`${key}-cont`}>
                      <ReceiptPreviewRow
                        key={`${key}-type-${type}`}
                        keyPrefix={`${key}-type-${type}`}
                        rowType='is-bold'
                        cols={[type]} />
                      <ReceiptPreviewRow
                        key={`${key}-cash`}
                        keyPrefix={`${key}-cash`}
                        cols={['ODBO COINS:', order.users.odboCoins + Number(payment.amount)]} />
                      <ReceiptPreviewRow
                        key={`${key}-amount`}
                        keyPrefix={`${key}-amount`}
                        cols={['AMOUNT PAID:', Number(payment.amount).toFixed(0)]} />
                      <ReceiptPreviewRow
                        key={`${key}-change`}
                        keyPrefix={`${key}-change`}
                        cols={['REMAINING BALANCE:', order.users.odboCoins]} />
                    </span>
                  )
                }
              })}

              {/* Footer */}
              <ReceiptRowDivider />
              <ReceiptPreviewRow
                key={`${keyPref}ty1`}
                keyPrefix={`${keyPref}ty1`}
                rowType='centered'
                cols={['Thank you']} />

              <ReceiptPreviewRow
                key={`${keyPref}ty2`}
                keyPrefix={`${keyPref}ty2`}
                rowType='centered'
                cols={['Have a nice day!']} />

              <ReceiptRowNewLine />
            </span>
          )
        })}
      </span>
    )
  }

  render () {
    return (
      <ReceiptPreview>
        {this.renderPrintBtn()}

        {this.renderNewViewBillReceipt()}

        {this.renderPrintBtn()}
      </ReceiptPreview>
    )
  }
}
