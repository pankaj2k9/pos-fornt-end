import { formatCurrency, formatDate } from '../string'

const RECEIPT_WIDTH = 240
const RECEIPT_MARGIN = 6
const RECEIPT_FONT = 'sans-serif'
const RECEIPT_FONT_SIZE = 12
const RECEIPT_LINE_HEIGHT = 18
const RECEIPT_DIVIDER = '------------------------------------------------------------'
const RECEIPT_NEWLINE = '<br /><br />'
const RECEIPT_STYLES = '' +
  '.row { display: flex; justify-content: space-between; }\n' +
  '.row.col3 .col:nth-child(1) { width: 150px; }\n' +
  '.row.col3 .col:nth-child(2) { width: 30px; text-align: right; }\n' +
  '.row.col3 .col:nth-child(3) { width: 60px; text-align: right; }\n' +
  '.row.col4 > div { width: 55px; text-align: right; }\n' + '.row.col4 .col:nth-child(1) { width: 80px; text-align: left; }\n'

// const LI_NAME_MAX = 24

// styles
const RECEIPT_STYLE = `width: ${RECEIPT_WIDTH}px; margin: ${RECEIPT_MARGIN}px`
const HEADER_STYLE = `display: flex; flex-direction: column; align-items: center; margin-bottom: ${RECEIPT_MARGIN}px;`
let receiptHtmlString = ''
const BODY_STYLE = `font-family: ${RECEIPT_FONT};
  font-size: ${RECEIPT_FONT_SIZE}px;
  line-height: ${RECEIPT_LINE_HEIGHT}px;`

/**
 * Build the receipt as html string
 * @param {Object} receipt contain info needed to print the receipt
 */
export const buildReceipt = (data) => {
  const {
    cashier,
    storeId,
    openCashDrawerCount,
    cashInDrawer,
    cashInfo,
    floatInfo,
    PO,
    RA
  } = data.info
  const refundCount = Number(data.refundCount.count)
  let netSales = 0

  // remove ODBO transactions
  data.summary = data.summary.filter(item => {
    return item.type !== 'odbo'
  })
  data.orders = data.orders.filter(item => {
    if (item.posTrans.type === 'odbo') { data.orders = Number(data.orders) - 1 }
    return item.posTrans.type !== 'odbo'
  })
  // end remove ODBO transactions

  data.orders.forEach(order => {
    netSales += Number(order.total)
  })

  receiptHtmlString = ''
  // receiptHtmlString += '<div style="width: 240px; border-bottom: 2px solid black; />'

  receiptHtmlString += `<div style="${RECEIPT_STYLE}">`
  // build header
  receiptHtmlString += buildHeader(data.headerText)
  receiptHtmlString += data.headerText ? RECEIPT_DIVIDER : ''

  // build info section 1
  receiptHtmlString += buildInfo1()
  receiptHtmlString += RECEIPT_DIVIDER

  // build summary
  receiptHtmlString += buildSummary(
    data.summary,
    netSales,
    openCashDrawerCount,
    refundCount,
    cashInfo,
    floatInfo,
    PO,
    RA,
    cashInDrawer
  )
  receiptHtmlString += data.summary ? RECEIPT_DIVIDER : ''

  // build order list
  receiptHtmlString += buildPaymentDetails(data.orders)
  receiptHtmlString += RECEIPT_DIVIDER

  // build staffs list
  receiptHtmlString += buildStaffs(data.staffs)
  receiptHtmlString += RECEIPT_DIVIDER

  // build footer
  receiptHtmlString += buildFooter(cashier, storeId)
}

/**
 * Add receipt footer
 * @param {string} cashier
 * @param {string} storeId
 */
export const buildFooter = (cashier, storeId) => {
  let footerText = ''

  footerText += buildRow([`Cashier : ${cashier.toUpperCase()}`])
  footerText += buildRow([`Store Id : ${storeId}`])
  footerText += buildRow([`Date Printed : ${formatDate(new Date())}`])

  return footerText
}

/**
 * Add receipt header/s
 * @param {string|string[]} headerText
 */
export const buildHeader = (headerText) => {
  let header = ''
  if (headerText) {
    header += `<div style="${HEADER_STYLE}">`
    if (typeof headerText === 'string') {
      header += `<div>${headerText}</div>`
    } else if (typeof headerText === 'object') {
      headerText.forEach(hdr => {
        header += `<div>${hdr}</div>`
      })
    }
    header += '</div>'
  }
  return header
}

/**
 * Add info section 1
 */
const buildInfo1 = () => {
  const date = new Date()
  const dateOptions = { day: 'numeric', month: 'numeric', year: 'numeric' }
  let info1 = ''
  info1 += buildRow([formatDate(date, dateOptions)])
  info1 += buildRow(['<div>** END OF DAY SALES REPORT **</div>'])

  return info1
}

const buildRow = (cols) => {
  let rowText = ''
  const colLength = cols.length

  rowText += `<div class="row col${colLength}">`
  cols.forEach(col => { rowText += `<div class="col">${col}</div>` })
  rowText += '</div>'

  return rowText
}

/**
 * Print sales summary
 * @param {Object[]} summary of receipt
 * @param {Number} netSales total sales today
 * @param {Number} refundsCount
 * @param {Number} openCashDrawerCount
 * @param {Number} cashInDrawer
 */
export const buildSummary = (
  summary,
  netSales,
  openCashDrawerCount,
  refundCount,
  cashInfo,
  floatInfo,
  PO,
  RA,
  cashInDrawer
) => {
  let summaryText = ''
  let totalCollected = 0

  const processedSummary = {}
  summary.forEach(item => {
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

  // Add net sales
  summaryText += buildRow([ 'NET SALES :', formatCurrency(netSales) ])
  summaryText += RECEIPT_NEWLINE

  // Add summary
  if (summary) {
    Object.keys(processedSummary).forEach(item => {
      const summType = processedSummary[item].type.toUpperCase()
      const summCount = 'x' + processedSummary[item].count
      const summSubtotal = formatCurrency(processedSummary[item].subtotal)

      summaryText += buildRow([ summType, summCount, summSubtotal ])

      totalCollected += Number(processedSummary[item].subtotal)
    })
  }

  // Add Odbo summary
  summaryText += buildRow(['TOTAL COLLECTED', formatCurrency(totalCollected)])
  summaryText += RECEIPT_DIVIDER

  // add open cash drawer count
  summaryText += RECEIPT_NEWLINE
  summaryText += buildRow(['OPEN CASHDRAWER', 'x' + openCashDrawerCount, formatCurrency(0)])
  summaryText += RECEIPT_NEWLINE

  // add refund count
  summaryText += buildRow(['REFUND', 'x' + refundCount, formatCurrency(0)])

  // add cash and float info
  if (cashInfo) {
    const count = 'x' + cashInfo.count
    const value = formatCurrency(cashInfo.value)

    summaryText += buildRow(['CASH', count, value])
  }
  if (floatInfo) {
    const count = 'x' + floatInfo.count
    const value = formatCurrency(floatInfo.value)

    summaryText += buildRow(['FLOAT', count, value])
  }
  // P/O and R/A
  if (PO) {
    const count = 'x' + PO.count
    const value = formatCurrency(PO.value)

    summaryText += buildRow(['P/O', count, value])
  }
  if (RA) {
    const count = 'x' + RA.count
    const value = formatCurrency(RA.value)

    summaryText += buildRow(['R/A', count, value])
  }

  summaryText += RECEIPT_DIVIDER

  // cash in drawer
  summaryText += buildRow(['CASH IN DRAWER', formatCurrency(cashInDrawer)])

  summaryText += RECEIPT_DIVIDER
  summaryText += RECEIPT_NEWLINE

  return summaryText
}

/**
 * Build sales person section
 * @param {Object[]} staffs
 */
export const buildStaffs = (staffs) => {
  let staffsText = ''

  staffsText += buildRow(['Sales-Person', 'Products', 'Service', 'Rounding'])

  staffs.forEach(staff => {
    staffsText += buildRow([staff.firstName, staff.total, '0.00', '0.00'])
  })

  return staffsText
}

/**
 * Print sales orders list
 * @param {Object} orders for the day
 */
export const buildPaymentDetails = (orders) => {
  let ordersText = ''
  let paymentDetailsTotal = 0

  ordersText += '<div>Payment Details Information</div>'
  ordersText += RECEIPT_DIVIDER

  // paymentDetails = {
  //   'MASTER': {
  //     subtotal: 0,
  //     trans: [
  //       {
  //         id: 1.
  //         total: 1
  //       },
  //       ...
  //     ]
  //   },
  //   ...
  // }
  const paymentDetails = {}
  orders.forEach(order => {
    const posTrans = order.posTrans
    let orderType
    if (posTrans.provider && posTrans.cardType === 'debit') {
      orderType = 'NETS'
    } else if (posTrans.provider && posTrans.cardType === 'credit') {
      orderType = posTrans.provider
    } else {
      orderType = posTrans.type
    }

    const orderTotal = order.total
    const orderID = order.id
    paymentDetailsTotal += Number(orderTotal)

    // Add order to existing type
    if (paymentDetails && Object.keys(paymentDetails).find(type => type === orderType)) {
      paymentDetails[orderType] = {
        subtotal: paymentDetails[orderType].subtotal + Number(orderTotal),
        trans: [...paymentDetails[orderType].trans,
          { id: orderID, total: Number(orderTotal) }
        ]
      }
    } else { // Create new type in paymentDetails
      paymentDetails[orderType] = {}
      paymentDetails[orderType] = {
        subtotal: Number(orderTotal),
        trans: [{ id: orderID, total: Number(orderTotal) }]
      }
    }
  })

  // Add all transactions for each type
  Object.keys(paymentDetails).forEach(type => {
    const paymentDetail = paymentDetails[type]

    // Add section header
    ordersText += RECEIPT_NEWLINE
    ordersText += buildRow([type.toUpperCase()])

    // Add all orders for current type
    paymentDetail.trans.forEach(trans => {
      ordersText += buildRow([trans.id, formatCurrency(trans.total)])
    })

    // Add type subtotal
    ordersText += RECEIPT_DIVIDER
    ordersText += buildRow(['** SUBTOTAL **', formatCurrency(paymentDetail.subtotal)])
    ordersText += RECEIPT_DIVIDER
  })

  // Add total
  ordersText += buildRow(['** TOTAL **', formatCurrency(paymentDetailsTotal)])

  // bill info
  ordersText += RECEIPT_DIVIDER
  ordersText += RECEIPT_NEWLINE

  // Total No.Bill
  ordersText += buildRow(['Total No.Bill: ', orders.length])
  ordersText += buildRow(['First Bill No: ', orders[0].id])
  ordersText += buildRow(['Last  Bill No: ', orders[orders.length - 1].id])

  ordersText += RECEIPT_NEWLINE

  return ordersText
}

/**
 * Print receipt
 */
export const printReceiptFromString = () => {
  const width = window.innderWidth
  const height = window.innderHeight

  const content = '<!DOCTYPE html>' +
                  '<html>' +
                  '<head>' +
                  '<title>Print Receipt</title>' +
                  '<style>' + RECEIPT_STYLES + '</style>' +
                  '</head>' +
                  '<body style="' + BODY_STYLE + '"onload="window.focus(); window.print(); window.close();">' +
                  receiptHtmlString +
                  '</body>' +
                  '</html>'
  const options = 'toolbar=no,location=no,directories=no,menubar=no,scrollbars=yes,width=' + width + ',height=' + height
  const printWindow = window.open('', 'Printing receipt...', options)
  printWindow.document.open()
  printWindow.document.write(content)
  // printWindow.document.close()
  // printWindow.focus()
  // printWindow.close()
}
