import React from 'react'
import ReactDOM from 'react-dom'
import { FormattedMessage } from 'react-intl'

import ReceiptPreview from './ReceiptPreview'
import ReceiptPreviewRow, {
  ReceiptRowDivider,
  ReceiptRowNewLine
} from './ReceiptPreviewRow'

import { printReceiptFromString } from '../utils/receipt'

import {
  compPaymentsSum,
  compCashChange,
  processOdboID,
  processRefundOdbo,
  processOdbo,
  processReceiptProducts
} from '../utils/computations'

import { formatCurrency, formatDate, formatNumber } from '../utils/string'

export default class ViewBillReceiptPreview extends React.PureComponent {
  constructor (props) {
    super(props)

    this.renderPrintBtn = this.renderPrintBtn.bind(this)
    this.handlePrint = this.handlePrint.bind(this)

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

  renderReceiptHeader (keyPref, order, stores) {
    const addrList = this.splitAddr(order.source, stores)
    const orderStore = stores.find((st) => st.source === order.source)

    return (
      <span key={`${keyPref}-header-section`}>
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
      </span>
    )
  }

  renderOrderNumberSection (keyPref, order) {
    const dateOptions = {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }
    const staff = order.staff
    let orderSalesPerson = ''

    if (staff) {
      orderSalesPerson += staff.firstName && `${staff.firstName.toUpperCase()} `
      orderSalesPerson += staff.lastName && `${staff.lastName.toUpperCase()}` || ''
    } else {
      orderSalesPerson = 'N/A'
    }

    const customer = order.users

    return (
      <span key={`${keyPref}-order-number-section`}>
        {/* Order ID */}
        <span>
          {order.refundId && order.duplicate &&
            <ReceiptPreviewRow
              keyPrefix={`${keyPref}refund-id`}
              rowType='is-bold'
              cols={[`REFUND ID: ${order.refundId}`]} />}
          <ReceiptPreviewRow
            keyPrefix={`${keyPref}order-id`}
            rowType='is-bold'
            cols={[`ORDER ID: ${order.id}`]} />
        </span>

        {/* Order sales person */}
        <ReceiptPreviewRow
          keyPrefix={`${keyPref}sales-person`}
          cols={[`STAFF: ${orderSalesPerson}`]} />

        {/* Date */}
        <ReceiptPreviewRow
          keyPrefix={`${keyPref}order-id`}
          cols={[formatDate(new Date(order.refundId && order.duplicate ? order.dateRefunded : order.dateOrdered), dateOptions)]} />

        {/* Customer name */}
        {
          customer &&
          <ReceiptPreviewRow
            key={`${keyPref}-customername}`}
            keyPrefix={`${keyPref}-customername`}
            cols={[`CUSTOMER[ID#${processOdboID(customer.odboId)}] :`, `${customer.firstName || ''} ${customer.lastName || ''}`]} />
        }
      </span>
    )
  }

  renderItemsListSection (keyPref, order) {
    const items = processReceiptProducts(order.discountPercentOverall, order.items, order.currency)

    return (
      <span key={`${keyPref}-items-section`}>
        {/* Items list */}
        {items.map((item, i) => {
          const key = `${keyPref}item-${item.id || i}`
          return (
            <span key={key} className='item'>
              <ReceiptPreviewRow
                keyPrefix={key}
                rowType='qty-name-total'
                cols={[
                  `${item.quantity}x`,
                  `${item.name}`,
                  item.totalCost
                ]} />
              {
                item.discountLabel &&
                <ReceiptPreviewRow
                  keyPrefix={key}
                  rowType='discount-name'
                  cols={[
                    '',
                    item.discountLabel,
                    ''
                  ]} />
              }

              {
                item.barcodeInfo &&
                <ReceiptPreviewRow
                  keyPrefix={key}
                  rowType='barcode-name'
                  cols={[
                    '',
                    item.barcodeInfo,
                    ''
                  ]} />
              }
            </span>
          )
        })}
      </span>
    )
  }

  renderSubtotalSection (keyPref, order) {
    const subtotal = Number(order.subtotal) + Number(order.discount)
    return (
      <span key={`${keyPref}-subtotal-section`}>
        <ReceiptPreviewRow
          keyPrefix={`${keyPref}gst`}
          cols={['GST:', formatCurrency(0)]} />
        <ReceiptPreviewRow
          keyPrefix={`${keyPref}subtotal`}
          cols={['SUBTOTAL:', order.currency === 'sgd' ? formatCurrency(Number(subtotal)) : subtotal.toFixed(0)]} />
        <ReceiptPreviewRow
          keyPrefix={`${keyPref}discount`}
          cols={['DISCOUNTS:', order.currency === 'sgd' ? formatCurrency(-order.discount) : -order.discount]} />
      </span>
    )
  }

  renderTotalSection (keyPref, order) {
    return (
      <span key={`${keyPref}-total-section`}>
        <ReceiptPreviewRow
          keyPrefix={`${keyPref}total`}
          rowType='is-bold'
          cols={['TOTAL:', order.currency === 'sgd' ? formatCurrency(order.total) : order.total]} />
      </span>
    )
  }

  renderPaymentsSection (keyPref, order) {
    const deductSign = order.refundId && order.duplicate ? '-' : ''
    const netPayments = order.payments.filter(payment => payment.type === 'nets')
    const creditPayments = order.payments.filter(payment => payment.type === 'credit' || payment.type === 'debit')
    const odboPayment = order.payments.filter(payment => payment.type === 'odbo')[0]
    const cashPayment = order.payments.filter(payment => payment.type === 'cash')[0]

    if (order.currency === 'odbo') {
      return (
        <span key={`${keyPref}-payments-section`}>
          {
            this.renderOdboPayment(keyPref, order.users, odboPayment)
          }
        </span>
      )
    }

    return (
      <span key={`${keyPref}-payments-section`}>
        {
          netPayments.length > 0 &&
          this.renderNetsPayments(keyPref, netPayments, deductSign)
        }
        {
          creditPayments.length > 0 &&
          this.renderCreditPayments(keyPref, creditPayments, deductSign)
        }
        {
          cashPayment &&
          this.renderCashPayment(keyPref, cashPayment, deductSign)
        }
        {
          order.vouchers && order.vouchers.length > 0 &&
          this.renderVouchersPayment(keyPref, order.vouchers, deductSign)
        }
        <ReceiptRowDivider />
        <ReceiptPreviewRow
          keyPrefix={`${keyPref}total`}
          rowType='is-bold'
          cols={['TOTAL PAYMENT:', formatCurrency(compPaymentsSum(order.payments, false, order.vouchers))]} />
        <ReceiptPreviewRow
          key={`${200}-change`}
          keyPrefix={`${keyPref}-change`}
          rowType='is-bold'
          cols={['CASH CHANGE:', formatCurrency(cashPayment ? cashPayment.change : 0)]} />
      </span>
    )
  }

  renderNetsPayments (keyPref, nets, deductSign) {
    return (
      <span key={`nets-cont`}>
        {
          nets.map((payment, index) => {
            const key = `${keyPref}payment-${payment.id || index + 0}`

            return (
              <span>
                <ReceiptPreviewRow
                  key={`${key}-header-type-nets`}
                  keyPrefix={`header-type-nets`}
                  rowType='is-bold'
                  cols={['NETS PAYMENT']} />
                <ReceiptPreviewRow
                  key={`${key}-amount`}
                  keyPrefix={`${key}-amount`}
                  cols={['AMOUNT PAID:', `${deductSign}${formatCurrency(payment.amount)}`]} />
                <ReceiptPreviewRow
                  key={`${key}-transnum`}
                  keyPrefix={`${key}-transnum`}
                  cols={['TRANS#:', payment.transNumber]} />
              </span>
            )
          })
        }
      </span>
    )
  }

  renderCreditPayments (keyPref, credits, deductSign) {
    return (
      <span key={`credit-cont`}>
        <ReceiptPreviewRow
          key={`header-type-credit`}
          keyPrefix={`header-type-credit`}
          rowType='is-bold'
          cols={['CREDIT PAYMENT']} />

        {
          credits.map((payment, index) => {
            const key = `${keyPref}payment-${payment.id || index + 10}`

            return (
              <span>
                <ReceiptPreviewRow
                  key={`${key}-amount`}
                  keyPrefix={`${key}-amount`}
                  cols={['AMOUNT PAID:', `${deductSign}${formatCurrency(payment.amount)}`]} />
                <ReceiptPreviewRow
                  key={`${key}-card-type`}
                  keyPrefix={`${key}-card-type`}
                  cols={['CARD TYPE:', payment.provider ? payment.provider.toUpperCase() : '--']} />
                <ReceiptPreviewRow
                  key={`${key}-transnum`}
                  keyPrefix={`${key}-transnum`}
                  cols={['TRANS#:', payment.transNumber]} />
              </span>
            )
          })
        }
      </span>
    )
  }

  renderCashPayment (keyPref, payment, deductSign) {
    const key = `${keyPref}payment-${payment.id || 80}`
    return (
      <span key={`cash-cont`}>
        <ReceiptPreviewRow
          key={`header-type-cash`}
          keyPrefix={`header-type-cash`}
          rowType='is-bold'
          cols={['CASH PAYMENT']} />

        <ReceiptPreviewRow
          key={`${key}-cash`}
          keyPrefix={`${key}-cash`}
          cols={['CASH GIVEN:', formatCurrency(payment.cash)]} />
        <ReceiptPreviewRow
          key={`${key}-amount`}
          keyPrefix={`${key}-amount`}
          cols={['AMOUNT PAID:', `${deductSign}${formatCurrency(payment.amount)}`]} />
      </span>
    )
  }

  renderVouchersPayment (keyPref, vouchers, deductSign) {
    return (
      <span>
        {/* Vouchers */}
        {vouchers.length > 0
          ? <ReceiptPreviewRow
            keyPrefix={`${keyPref}vouchers`}
            rowType='is-bold'
            cols={['VOUCHER PAYMENT:']} />
          : null
        }
        {vouchers.map((voucher, i) => {
          const key = `${keyPref}voucher-${voucher.id || i}`
          const voucherRemarks = `voucher[${voucher.remarks}]`
          return (
            <ReceiptPreviewRow
              key={`${key}-amount`}
              keyPrefix={`${key}-amount`}
              cols={[voucherRemarks, `${deductSign}${formatCurrency(Number(voucher.deduction))}`]} />
          )
        })
        }
      </span>
    )
  }

  renderOdboPayment (keyPref, user, payment) {
    const key = `${keyPref}payment-${payment.id || 100}`
    return (
      <span key={`${key}-cont`}>
        <ReceiptPreviewRow
          key={`${key}-type-odbo`}
          keyPrefix={`${key}-type-odbo`}
          rowType='is-bold'
          cols={['ODBO PAYMENT']} />
        <ReceiptPreviewRow
          key={`${key}-cash`}
          keyPrefix={`${key}-cash`}
          cols={['ODBO COINS:', user.odboCoins + Number(payment.amount)]} />
        <ReceiptPreviewRow
          key={`${key}-amount`}
          keyPrefix={`${key}-amount`}
          cols={['AMOUNT PAID:', Number(payment.amount).toFixed(0)]} />
        <ReceiptPreviewRow
          key={`${key}-change`}
          keyPrefix={`${key}-change`}
          cols={['REMAINING BALANCE:', user.odboCoins]} />
      </span>
    )
  }

  renderOdboCoinBalanceSection (keyPref, order) {
    const isRefund = order.refundId && order.duplicate
    const deductSign = isRefund ? '-' : ''
    const odbo = isRefund ? processRefundOdbo(order.currency, order.users, order.total, order.bonusPoints, order.userPrevCoins)
            : processOdbo(order.currency, order.users, order.total, order.bonusPoints, order.userPrevCoins)

    return (
      <span key={`${keyPref}-coin-balance-section`}>
        <ReceiptPreviewRow
          keyPrefix={`${keyPref}coinbalance`}
          rowType='is-bold centered'
          cols={['THE ODBO COIN BALANCE']} />
        <ReceiptPreviewRow
          keyPrefix={`${keyPref}prevcoins`}
          cols={[`PREVIOUS BALANCE:`, `${odbo.prevCoins}`]} />
        <ReceiptPreviewRow
          keyPrefix={`${keyPref}earnedpoints`}
          cols={[`EARNED POINTS${odbo.bonus ? ' ' + odbo.bonus : ''}:`, `${deductSign}${odbo.earnedPts}`]} />
        <ReceiptPreviewRow
          keyPrefix={`${keyPref}newbalance`}
          cols={['NEW BALANCE', odbo.newCoins]} />
      </span>
    )
  }

  renderNewViewBillReceipt () {
    const { orders, stores, idTo, idFrom } = this.props

    let modifiedOrdersList = []
    orders.forEach((order) => {
      let original = order
      if (formatNumber(order.id) >= formatNumber(idFrom) || order.id <= formatNumber(idTo)) {
        original.refId = formatNumber(order.id)
        modifiedOrdersList.push(original)
      }
      if (!idTo && order.refundId || order.refundId && formatNumber(order.refundId) <= formatNumber(idTo)) {
        let duplicate = Object.assign({duplicate: true}, order)
        duplicate.refId = formatNumber(order.refundId)
        modifiedOrdersList.push(duplicate)
      }

      // if (order.refundId) {
      //   let refund = Object.assign({}, order)
      //   refund.isRefund = true
      //   modifiedOrdersList.push(refund)
      // }
    })
    modifiedOrdersList.sort((a, b) => { return a.refId - b.refId })
    return (
      <span ref='preview'>
        {modifiedOrdersList.reverse().map((order) => {
          const refundAmt = compPaymentsSum(order.payments, false, order.vouchers) - compCashChange(order.payments)
          const keyPref = `rcptprev-vb-${order.duplicate ? order.refundId : order.id}-`
          return (
            <span key={`${keyPref}`}>
              {
                this.renderReceiptHeader(keyPref, order, stores)
              }
              <ReceiptRowDivider />
              {
                this.renderOrderNumberSection(keyPref, order)
              }
              <ReceiptRowDivider />
              {
                this.renderItemsListSection(keyPref, order)
              }
              <ReceiptRowDivider />
              {
                this.renderSubtotalSection(keyPref, order)
              }
              <ReceiptRowDivider />
              {
                this.renderTotalSection(keyPref, order)
              }
              <ReceiptRowDivider />
              {
                this.renderPaymentsSection(keyPref, order)
              }
              {/* Refund details */}
              {order.refundId && order.duplicate &&
                <span>
                  <ReceiptRowDivider />
                  <ReceiptPreviewRow
                    keyPrefix={`${keyPref}order-id`}
                    rowType='is-bold'
                    cols={['REFUNDED AMOUNT:', formatCurrency(refundAmt, order.currency)]} />
                </span>
              }
              {
                order.users &&
                <ReceiptRowDivider />
              }
              {
                order.users &&
                this.renderOdboCoinBalanceSection(keyPref, order)
              }

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
