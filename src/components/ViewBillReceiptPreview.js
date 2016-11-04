import React from 'react'
import ReceiptPreview from './ReceiptPreview'
import ReceiptPreviewRow, {
  ReceiptRowDivider,
  ReceiptRowDividerDbl,
  ReceiptRowNewLine
} from './ReceiptPreviewRow'

import { formatDate } from '../utils/string'

export default class ViewBillReceiptPreview extends React.Component {
  splitAddr (sourceId, stores) {
    const store = stores.filter((store) => {
      return store.source === sourceId
    })[0] || {}

    const storeAddress = store.address || 'SINGAPORE 188021\nTELEPHONE:6238 1337'

    return storeAddress.split('\\n')
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
        {orders.map((order) => {
          const addrList = this.splitAddr(order.source, stores)
          const cust = order.users
            ? `${order.users.firstName} ${order.users.lastName}`.toUpperCase()
            : 'N/A'
          const itemCount = order.items.length

          return (
            <span key={`vb-preview-${order.id}`}>
              {/* Address */}
              {addrList.map((addr) => {
                return <ReceiptPreviewRow cols={[addr]} />
              })}

              {/* Customer name */}
              <ReceiptPreviewRow cols={[`CUSTOMER: ${cust}`]} />
              <ReceiptRowDivider />

              {/* Date and order ID */}
              <ReceiptPreviewRow cols={[
                formatDate(new Date(order.dateOrdered), dateOptions),
                order.id
              ]} />
              <ReceiptRowDivider />

              {/* Items list */}
              {order.items.map((item) => {
                return (
                  <span key={`vb-preview-item-${item.id}`} className='item'>
                    <ReceiptPreviewRow cols={[item.product.nameEn]} />
                    <ReceiptPreviewRow cols={[
                      item.product.barcodeInfo,
                      `${item.quantity}x`,
                      item.totalCost
                    ]} />
                  </span>
                )
              })}

              {/* Items list */}
              <ReceiptPreviewRow cols={[
                `Total (${itemCount}) item${itemCount > 1 ? 's' : ''}.`
              ]} />
              <ReceiptRowDivider />

              {/* Totals */}
              <ReceiptPreviewRow cols={['Sub-TOTAL S$', order.subtotal]} />
              <ReceiptPreviewRow cols={['TOTAL S$', order.total]} />

              {/* Payments */}
              <ReceiptPreviewRow cols={['PAYMENT(S):']} />
              {order.payments.map((payment) => {
                let type = ''

                // Figure out the type of payment
                if (payment.provider && payment.type === 'debit') {
                  type = 'NETS'
                } else if (payment.provider && payment.type === 'credit') {
                  type = payment.provider.toUpperCase()
                } else {
                  type = payment.type && payment.type.toUpperCase()
                }

                return <ReceiptPreviewRow cols={[type, payment.amount]} />
              })}

              <ReceiptRowDividerDbl />
              <ReceiptRowNewLine />
            </span>
          )
        })}
      </ReceiptPreview>
    )
  }
}
