import React from 'react'

import ReceiptPreview from './ReceiptPreview'
import ReceiptPreviewRow, {
  ReceiptRowDivider,
  ReceiptRowDividerDbl
} from './ReceiptPreviewRow'

import { formatCurrency, formatDate } from '../utils/string'

export default class DailyReport extends React.PureComponent {
  render () {
    const { orders } = this.props.data

    let transCount = orders.length
    let transTotal = 0

    orders.forEach((order) => {
      order.items.forEach((item) => {
        transTotal += Number(item.totalCost)
      })
    })

    const dateOptions = { day: 'numeric', month: 'numeric', year: 'numeric' }

    return (
      <ReceiptPreview>
        <span ref='preview'>
          {/* Header */}
          <ReceiptRowDividerDbl />
          <ReceiptPreviewRow cols={[formatDate(new Date(), dateOptions)]} />
          <ReceiptRowDivider />
          <ReceiptPreviewRow cols={['** TRANSACTION REPORT **']} />
          <ReceiptPreviewRow cols={['SALES PERSON DETAILS REPORT']} />
          <ReceiptRowDivider />
          <ReceiptPreviewRow cols={[
            `NET INCOME: ${transCount}`,
            formatCurrency(transTotal)]} />
          <ReceiptRowDividerDbl />

          {/* Transactions list */}
          {orders.map((order, index) => {
            const keyPref = `rcptprev-xz-${order.id}-`
            const orderCount = index + 1
            const key = `${keyPref}${orderCount}`

            return (
              <span key={keyPref}>
                <ReceiptPreviewRow
                  key={key}
                  keyPrefix={key}
                  colType='sh'
                  rowType={'spaced'}
                  cols={[
                    `${orderCount}.`,
                    order.id,
                    order.staff.username.toUpperCase(),
                    ''
                  ]} />

                {order.items.map((item) => {
                  const key = `${keyPref}item-${item.id}`

                  return <ReceiptPreviewRow
                    key={key}
                    keyPrefix={key}
                    colType={'sh'}
                    rowType={'spaced'}
                    cols={[
                      '',
                      item.product.barcodeInfo,
                      item.quantity,
                      formatCurrency(Number(item.totalCost))
                    ]} />
                })}
              </span>
            )
          })}

          {/* Average sales */}
          <ReceiptPreviewRow cols={[
            'Avg. Sales/Rcpt. :',
            formatCurrency(transTotal / transCount)
          ]} />
          <ReceiptRowDividerDbl />

        </span>
      </ReceiptPreview>
    )
  }
}
