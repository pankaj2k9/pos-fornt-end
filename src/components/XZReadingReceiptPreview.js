import React from 'react'
import ReactDOM from 'react-dom'
import { FormattedMessage } from 'react-intl'

import ReceiptPreview from './ReceiptPreview'
import ReceiptPreviewRow, {
  ReceiptRowDivider,
  ReceiptRowNewLine
} from './ReceiptPreviewRow'

import {
  formatCurrency,
  formatDate
} from '../utils/string'

import { printReceiptFromString } from '../utils/receipt'

export default class XZReadingReceiptPreview extends React.PureComponent {
  constructor (props) {
    super(props)

    this.renderPrintBtn = this.renderPrintBtn.bind(this)
    this.handlePrint = this.handlePrint.bind(this)
    this.handleCloseDay = this.handleCloseDay.bind(this)
  }

  handleCloseDay () {
    this.props.handleCloseDay()
  }

  renderPrintBtn (isDayClosed) {
    return (
      <p className='control'>
        <button className='button is-primary is-inverted' onClick={this.handlePrint}>
          <FormattedMessage id='app.general.printReceipt' />
        </button>
        {
          !isDayClosed &&
          <button className='button is-primary' onClick={this.handleCloseDay}>
            <FormattedMessage id='app.general.closeDay' />
          </button>
        }
      </p>
    )
  }

  handlePrint () {
    const receiptContent = ReactDOM.findDOMNode(this.refs.preview).innerHTML
    printReceiptFromString(receiptContent)
  }

  getPaymentDetails (orders) {
    const paymentDetails = {}
    let paymentDetailsTotal = 0

    orders.forEach(order => {
      const posTrans = order.posTrans

      const updatePaymentDetails = (orderType, orderAmount, orderID) => {
        // Add order to existing type
        if (paymentDetails &&
            Object.keys(paymentDetails).find(type => type === orderType)) {
          paymentDetails[orderType] = {
            subtotal: paymentDetails[orderType].subtotal + orderAmount,
            trans: [...paymentDetails[orderType].trans,
              { id: orderID, total: orderAmount }
            ]
          }
        } else { // Create new type in paymentDetails
          paymentDetails[orderType] = {}
          paymentDetails[orderType] = {
            subtotal: orderAmount,
            trans: [{ id: orderID, total: orderAmount }]
          }
        }
      }

      // Extract and update order type from posTrans
      if (posTrans) {
        let orderType = 'N/A'
        if (posTrans.cardType === 'debit') {
          orderType = 'NETS'
        } else if (posTrans.provider && posTrans.cardType === 'credit') {
          orderType = posTrans.provider
        } else {
          orderType = posTrans.type
        }

        const orderAmount = Number(order.total)
        const orderID = order.id
        paymentDetailsTotal += orderAmount

        updatePaymentDetails(orderType, orderAmount, orderID)
      } else if (order.payments && order.payments.length) {
        // Extract payment types from order.payments array
        order.payments.forEach((payment) => {
          let orderType = payment.type || 'N/A'
          const orderAmount = Number(payment.amount)
          const orderID = order.id
          if (order.currency !== 'odbo' && order.vouchers.length < 1) {
            paymentDetailsTotal += orderAmount
          }

          updatePaymentDetails(orderType, orderAmount, orderID)
        })
      }
    })

    return {
      paymentDetails,
      paymentDetailsTotal
    }
  }

  getRefundSummary (refundSummary) {
    const processedRefundSummary = {}
    refundSummary.forEach(item => {
      const newItem = {
        count: Number(item.count),
        subtotal: Number(item.subtotal)
      }

      if (item.provider && item.cardType === 'debit') {
        newItem.type = 'NETS'
      } else if (item.provider && item.cardType === 'credit') {
        newItem.type = item.provider
      } else {
        newItem.type = item.type
      }

      if (processedRefundSummary[newItem.type]) {
        processedRefundSummary[newItem.type].type = newItem.type
        processedRefundSummary[newItem.type].count += newItem.count
        processedRefundSummary[newItem.type].subtotal += newItem.subtotal
      } else {
        processedRefundSummary[newItem.type] = {}
        processedRefundSummary[newItem.type].type = newItem.type
        processedRefundSummary[newItem.type].count = newItem.count
        processedRefundSummary[newItem.type].subtotal = newItem.subtotal
      }
    })

    return processedRefundSummary
  }

  getSummary (summary) {
    const processedSummary = {}

    summary.forEach(item => {
      const newItem = {
        count: Number(item.count),
        subtotal: Number(item.subtotal)
      }

      if (item.cardType === 'debit') {
        newItem.type = 'NETS'
      } else if (item.provider && item.cardType === 'credit') {
        newItem.type = item.provider
      } else {
        newItem.type = item.type
      }

      if (processedSummary[newItem.type]) {
        processedSummary[newItem.type].type = newItem.type
        processedSummary[newItem.type].count += newItem.count
        processedSummary[newItem.type].subtotal += newItem.subtotal
      } else {
        processedSummary[newItem.type] = {}
        processedSummary[newItem.type].type = newItem.type
        processedSummary[newItem.type].count = newItem.count
        processedSummary[newItem.type].subtotal = newItem.subtotal
      }
    })

    return processedSummary
  }

  render () {
    const { data } = this.props

    const isDayClosed = !data || data.isDayClosed
    let summaryData = []
    let netSales = 0
    let netSalesOdbo = 0
    data.orders.forEach(order => {
      if (order.currency === 'sgd' && order.payments.length > 0) {
        netSales += Number(order.total || 0)
      } else if (order.currency === 'odbo') {
        netSalesOdbo += Number(order.total || 0)
      }
    })
    data.info.cashInfo.value = netSales

    const {
      cashier,
      storeId,
      openCashDrawerCount,
      cashInfo,
      floatInfo,
      PO,
      RA
    } = data.info
    const refundCount = Number(data.refundCount.count)

    // remove ODBO transactions
    summaryData = data.summary.filter(item => {
      return item.type !== 'odbo'
    })

    // get subtotal and count of cash orders
    let cashOrderAmount = 0
    let cashOrderCount = 0
    if (summaryData.length > 0) {
      summaryData.forEach(function (item) {
        if (item.type === 'cash') {
          cashOrderCount += Number(item.count || 0)
          cashOrderAmount += Number(item.subtotal || 0)
        }
      })
    }

    // get amount of refunded items of type 'cash'
    let refundedAmount = 0
    if (data.refundSummary.length > 0) {
      data.refundSummary.forEach(item => {
        if (item.type === 'cash') {
          refundedAmount = Number(item.subtotal)
        }
      })
    }

    const dateOptions = { day: 'numeric', month: 'numeric', year: 'numeric' }

    // XZ Reading summary
    let totalRefund = 0
    let totalCollected = 0
    const processedRefundSummary = this.getRefundSummary(data.refundSummary)
    const processedSummary = this.getSummary(summaryData)

    // Payment details
    const pDetails = this.getPaymentDetails(data.orders)
    const paymentDetails = pDetails.paymentDetails
    const paymentDetailsTotal = pDetails.paymentDetailsTotal

    const keyPref = 'rcptprev-xz'
    let voucherSubtotal = 0
    return (
      <ReceiptPreview>
        {this.renderPrintBtn(isDayClosed)}

        <span ref='preview'>
          {/* Header */}
          {data.headerText.map((headerText, i) => {
            const key = `${keyPref}-header-${i}`

            return <ReceiptPreviewRow
              key={key}
              keyPrefix={key}
              rowType={'centered'}
              cols={[headerText]} />
          })}
          <ReceiptRowDivider />

          {/* Date and Title */}
          <ReceiptPreviewRow
            key={`${keyPref}-date`}
            keyPrefix={`${keyPref}-date`}
            cols={[formatDate(new Date(), dateOptions)]} />
          <ReceiptPreviewRow
            key={`${keyPref}-title`}
            keyPrefix={`${keyPref}-title`}
            cols={['** END OF DAY SALES REPORT **']} />

          {/* XZ Reading summary */}
          <ReceiptPreviewRow
            key={`${keyPref}-netsales`}
            keyPrefix={`${keyPref}-netsales`}
            cols={['NET SALES :', formatCurrency(netSales)]} />
          <ReceiptRowNewLine />

          <ReceiptPreviewRow
            key={`${keyPref}-netsalesOdbo`}
            keyPrefix={`${keyPref}-netsalesOdbo`}
            cols={['NET SALES[The odbo coins]:', netSalesOdbo]} />
          <ReceiptRowNewLine />

          {Object.keys(processedSummary).map((item, i) => {
            const key = `${keyPref}-summary-${i}`

            const sumType = processedSummary[item].type.toUpperCase()
            const sumCount = 'x' + processedSummary[item].count
            const sumSubtotal = formatCurrency(processedSummary[item].subtotal)

            totalCollected += Number(processedSummary[item].subtotal)

            return (
              <ReceiptPreviewRow
                key={key}
                keyPrefix={key}
                cols={[sumType, sumCount, sumSubtotal]} />
            )
          })}

          {/* XZ Reading refund summary */}
          {Object.keys(processedRefundSummary).map((item, i) => {
            let refundType = processedRefundSummary[item].type.toUpperCase()

            if (refundType === 'ODBO') {
              return null
            }

            const key = `${keyPref}-refsummary-${i}`

            const sumType = `${refundType} [REFUND]`
            const sumCount = 'x' + processedRefundSummary[item].count
            const sumSubtotal = '- ' + formatCurrency(processedRefundSummary[item].subtotal)

            totalRefund += Number(processedRefundSummary[item].subtotal)

            return (
              <ReceiptPreviewRow
                key={key}
                keyPrefix={key}
                cols={[sumType, sumCount, sumSubtotal]} />
            )
          })}

          {/* Odbo summary */}
          <ReceiptPreviewRow
            key={`${keyPref}-totalcoll`}
            keyPrefix={`${keyPref}-totalcoll`}
            cols={['TOTAL COLLECTED', formatCurrency(totalCollected - totalRefund)]} />
          <ReceiptRowDivider />

          {/* Open cash drawer count */}
          <ReceiptRowNewLine />
          <ReceiptPreviewRow
            key={`${keyPref}-cdcount`}
            keyPrefix={`${keyPref}-cdcount`}
            cols={[
              'OPEN CASHDRAWER',
              `x${openCashDrawerCount || 0}`,
              formatCurrency(0)
            ]}
          />
          <ReceiptRowNewLine />

          {/* Cash */}
          {cashInfo
            ? <ReceiptPreviewRow
              key={`${keyPref}-cash`}
              keyPrefix={`${keyPref}-cash`}
              cols={[
                'CASH',
                `x${!cashOrderCount ? 0 : cashOrderCount}`,
                formatCurrency(cashOrderAmount)]}
              />
            : null
          }

          {/* Refund info */}
          <ReceiptPreviewRow
            key={`${keyPref}-refund`}
            keyPrefix={`${keyPref}-refund`}
            cols={[
              'REFUND (CASH)',
              `x${refundCount}`,
              `-${formatCurrency(refundedAmount)}`
            ]}
          />

          {/* Float info */}
          <ReceiptPreviewRow
            key={`${keyPref}-float`}
            keyPrefix={`${keyPref}-float`}
            cols={[
              'FLOAT',
              `x${floatInfo.count || 0}`,
              formatCurrency(floatInfo.value || 0)
            ]}
          />

          {/* P/O */}
          <ReceiptPreviewRow
            key={`${keyPref}-po`}
            keyPrefix={`${keyPref}-po`}
            cols={[
              'P/O',
              `x${PO.count}`,
              formatCurrency(PO.value)
            ]}
          />

          {/* R/A */}
          <ReceiptPreviewRow
            key={`${keyPref}-ra`}
            keyPrefix={`${keyPref}-ra`}
            cols={[
              'R/A',
              `x${RA.count}`,
              formatCurrency(RA.value)
            ]}
          />

          {/* Cash in drawer */}
          <ReceiptPreviewRow
            key={`${keyPref}-cid`}
            keyPrefix={`${keyPref}-cid`}
            cols={[
              'CASH IN DRAWER',
              formatCurrency((cashOrderAmount - refundedAmount) + floatInfo.value || 0)
            ]}
          />

          <ReceiptRowDivider />
          <ReceiptRowNewLine />
          {/* End XZ Reading refund summary */}

          {/* Payment details */}
          <ReceiptPreviewRow
            key={`${keyPref}-pdetails`}
            keyPrefix={`${keyPref}-pdetails`}
            cols={[
              'Payment Details Information'
            ]}
          />

          {/* Voucher transactions */}
          <span key={`${keyPref}-payment-voucher`}>
            <ReceiptRowNewLine />
            <ReceiptPreviewRow
              key={`${keyPref}-payment-voucher`}
              keyPrefix={`${keyPref}-payment-voucher`}
              cols={['VOUCHERS']} />
            {
              data.orders.map(order => {
                let vouchers = order.vouchers
                if (vouchers.length > 0) {
                  let voucherSumInOrder = 0
                  vouchers.forEach(voucher => {
                    voucherSumInOrder += Number(voucher.deduction)
                  })
                  voucherSubtotal += Number(voucherSumInOrder)
                  const keyTrans = `${keyPref}-payment-voucher-${order.id}`
                  return (
                    <ReceiptPreviewRow
                      key={keyTrans}
                      keyPrefix={keyTrans}
                      cols={[
                        order.id,
                        formatCurrency(voucherSumInOrder)
                      ]} />
                  )
                }
              })
            }
            {/* All orders for current type */}
            <ReceiptRowDivider />
            <ReceiptPreviewRow
              key={`${keyPref}-payment-voucher-subtotal`}
              keyPrefix={`${keyPref}-payment-voucher-subtotal`}
              cols={[
                '** SUBTOTAL **',
                formatCurrency(voucherSubtotal)
              ]} />
            <ReceiptRowDivider />
          </span>

          {/* Other Payment transactions */}
          {Object.keys(paymentDetails).map((type, i) => {
            const payment = paymentDetails[type]
            const keyParent = `${keyPref}-payment-${type}`

            return (
              <span key={keyParent}>
                {/* Section header */}
                <ReceiptRowNewLine />
                <ReceiptPreviewRow
                  key={keyParent}
                  keyPrefix={keyParent}
                  cols={[type.toUpperCase()]} />

                {/* All orders for current type */}
                {payment.trans.map((trans) => {
                  const keyTrans = `${keyParent}-${trans.id}`
                  return (
                    <ReceiptPreviewRow
                      key={keyTrans}
                      keyPrefix={keyTrans}
                      cols={[
                        trans.id,
                        type !== 'odbo' ? formatCurrency(trans.total) : trans.total
                      ]} />
                  )
                })}

                {/* All orders for current type */}
                <ReceiptRowDivider />
                <ReceiptPreviewRow
                  key={`${keyParent}-subtotal`}
                  keyPrefix={`${keyParent}-subtotal`}
                  cols={[
                    '** SUBTOTAL **',
                    type !== 'odbo' ? formatCurrency(payment.subtotal) : payment.subtotal
                  ]} />
                <ReceiptRowDivider />
              </span>
            )
          })}

          {/* Total */}
          <ReceiptPreviewRow
            key={`${keyPref}-ptotal`}
            keyPrefix={`${keyPref}-ptotal`}
            cols={[
              '** TOTAL **'
            ]}
          />
          <ReceiptPreviewRow
            key={`${keyPref}-ptotalSgd`}
            keyPrefix={`${keyPref}-ptotalSgd`}
            cols={[
              'SGD',
              formatCurrency(paymentDetailsTotal)
            ]}
          />
          <ReceiptPreviewRow
            key={`${keyPref}-ptotalVoucher`}
            keyPrefix={`${keyPref}-ptotalVoucher`}
            cols={[
              'VOUCHERS',
              formatCurrency(data.voucherSummary[0].subtotal)
            ]}
          />
          <ReceiptPreviewRow
            key={`${keyPref}-ptotalOdbo`}
            keyPrefix={`${keyPref}-ptotalodbo`}
            cols={[
              'The odbo coins',
              netSalesOdbo
            ]}
          />
          <ReceiptRowDivider />
          <ReceiptRowNewLine />

          {/* Total No. Bill */}
          <ReceiptPreviewRow
            key={`${keyPref}-billcount`}
            keyPrefix={`${keyPref}-billcount`}
            cols={['Total No.Bill: ', data.orders.length]} />

          <ReceiptPreviewRow
            key={`${keyPref}-firstbill`}
            keyPrefix={`${keyPref}-firstbill`}
            cols={['First Bill No: ', data.orders[0] && data.orders[0].id || 'N/A']} />

          <ReceiptPreviewRow
            key={`${keyPref}-secondbill`}
            keyPrefix={`${keyPref}-secondbill`}
            cols={[
              'Last  Bill No: ',
              data.orders[data.orders.length - 1] &&
              data.orders[data.orders.length - 1].id ||
              'N/A'
            ]} />

          <ReceiptRowNewLine />

          {/* Staffs list */}
          <ReceiptPreviewRow
            key={`${keyPref}-staffsheader`}
            keyPrefix={`${keyPref}-staffsheader`}
            cols={['Sales-Person', 'Products', 'Service', 'Rounding']} />

          {data.staffs.map((staff, i) => {
            const key = `${keyPref}-staff-${i}`
            return (
              <ReceiptPreviewRow
                key={key}
                keyPrefix={key}
                cols={[staff.firstName, staff.total, '0.00', '0.00']} />
            )
          })}
          <ReceiptRowDivider />

          {/* Footer */}
          <ReceiptPreviewRow
            key={`${keyPref}-cashier`}
            keyPrefix={`${keyPref}-cashier`}
            cols={[`Cashier : ${cashier.toUpperCase()}`]} />

          <ReceiptPreviewRow
            key={`${keyPref}-storeid`}
            keyPrefix={`${keyPref}-storeid`}
            cols={[`Store Id : ${storeId}`]} />

          <ReceiptPreviewRow
            key={`${keyPref}-dateprinted`}
            keyPrefix={`${keyPref}-dateprinted`}
            cols={[`Date Printed : ${formatDate(new Date())}`]} />
        </span>

        {this.renderPrintBtn(isDayClosed)}
      </ReceiptPreview>
    )
  }
}
