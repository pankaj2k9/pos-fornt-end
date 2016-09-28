import { formatCurrency, formatDate } from '../string'

const RECEIPT_WIDTH = 240
const RECEIPT_MARGIN = 6
const RECEIPT_FONT = 'sans-serif'
const RECEIPT_FONT_SIZE = 12
const RECEIPT_LINE_HEIGHT = 18
const RECEIPT_DIVIDER = '------------------------------------------------------------'
const RECEIPT_NEWLINE = '<br /><br />'

// const LI_NAME_MAX = 24

// styles
const RECEIPT_STYLE = `width: ${RECEIPT_WIDTH}px; margin: ${RECEIPT_MARGIN}px`
const ITEM_LIST_STYLE = 'display: flex; align-items: start; justify-content: start;'
const ITEM_QTY_STYLE = 'width: 65px; display: inline-block'
const ITEM_NAME_STYLE = 'width: 135px; display: inline-block;'
const ITEM_NAME_STYLE_FULL = 'width: 190px; display: inline-block;'
const ITEM_SUBTOTAL_STYLE = 'width: 70px; display: inline-block; text-align: right;'
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
  const { cashier, storeId, openCashDrawerCount, cashInDrawer } = data.info
  const refundCount = data.refundCount
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
    cashInDrawer
  )
  receiptHtmlString += data.summary ? RECEIPT_DIVIDER : ''

  // build order list
  receiptHtmlString += buildPaymentDetails(data.orders)
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
  let footerString = ''

  footerString += `<div style="${ITEM_LIST_STYLE}">`
  footerString += `Cashier : ${cashier.toUpperCase()}`
  footerString += '</div>'

  footerString += `<div style="${ITEM_LIST_STYLE}">`
  footerString += `Store Id : ${storeId}`
  footerString += '</div>'

  footerString += `<div style="${ITEM_LIST_STYLE}">`
  footerString += `Date Printed : ${formatDate(new Date())}`
  footerString += '</div>'

  return footerString
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
  info1 += `<div>${formatDate(date, dateOptions)}</div>`
  info1 += '<div>** END OF DAY SALES REPORT **</div>'

  return info1
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
  summaryText += `<div style="${ITEM_LIST_STYLE}">`
  summaryText += stringifyItemNameFull('NET SALES :')
  summaryText += stringifyItemSubtotal(netSales)
  summaryText += '</div>'

  summaryText += RECEIPT_NEWLINE

  // Add summary
  if (summary) {
    Object.keys(processedSummary).forEach(item => {
      summaryText += `<div style="${ITEM_LIST_STYLE}">`
      summaryText += stringifyItemName(processedSummary[item].type.toUpperCase())
      summaryText += stringifyItemQty('x' + processedSummary[item].count)
      summaryText += stringifyItemSubtotal(processedSummary[item].subtotal)
      summaryText += '</div>'

      totalCollected += Number(processedSummary[item].subtotal)
    })
  }

  // Add Odbo summary
  summaryText += `<div style="${ITEM_LIST_STYLE}">`
  summaryText += stringifyItemNameFull('TOTAL COLLECTED')
  summaryText += stringifyItemSubtotal(totalCollected)
  summaryText += '</div>'

  summaryText += RECEIPT_DIVIDER

  // add open cashdrawer
  summaryText += RECEIPT_NEWLINE

  // add refund count
  summaryText += `<div style="${ITEM_LIST_STYLE}">`
  summaryText += stringifyItemName('REFUND')
  summaryText += stringifyItemQty('x' + refundCount)
  summaryText += stringifyItemSubtotal(0)
  summaryText += '</div>'

  // add open cash drawer count
  summaryText += `<div style="${ITEM_LIST_STYLE}">`
  summaryText += stringifyItemName('OPEN CASHDRAWER')
  summaryText += stringifyItemQty('x' + openCashDrawerCount)
  summaryText += stringifyItemSubtotal(0)
  summaryText += '</div>'

  summaryText += RECEIPT_DIVIDER

  // cash in drawer
  summaryText += `<div style="${ITEM_LIST_STYLE}">`
  summaryText += stringifyItemNameFull('CASH IN DRAWER')
  summaryText += stringifyItemSubtotal(cashInDrawer)
  summaryText += '</div>'

  summaryText += RECEIPT_DIVIDER
  summaryText += RECEIPT_NEWLINE

  return summaryText
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
    ordersText += `<div style="${ITEM_LIST_STYLE}">`
    ordersText += `Payment Details : ${type.toUpperCase()}`
    ordersText += '</div>'

    // Add all orders for current type
    paymentDetail.trans.forEach(trans => {
      ordersText += `<div style="${ITEM_LIST_STYLE}">`
      ordersText += stringifyItemNameFull(trans.id)
      ordersText += stringifyItemSubtotal(trans.total)
      ordersText += '</div>'
    })

    // Add type subtotal
    ordersText += RECEIPT_DIVIDER
    ordersText += `<div style="${ITEM_LIST_STYLE}">`
    ordersText += stringifyItemNameFull('** SUBTOTAL **')
    ordersText += stringifyItemSubtotal(paymentDetail.subtotal)
    ordersText += '</div>'
    ordersText += RECEIPT_DIVIDER
  })

  // Add total
  ordersText += `<div style="${ITEM_LIST_STYLE}">`
  ordersText += stringifyItemNameFull('** TOTAL **')
  ordersText += stringifyItemSubtotal(paymentDetailsTotal)
  ordersText += '</div>'

  // bill info
  ordersText += RECEIPT_DIVIDER
  ordersText += RECEIPT_NEWLINE

  // Total No.Bill
  ordersText += `<div style="${ITEM_LIST_STYLE}">`
  ordersText += stringifyItemNameFull('Total No.Bill: ')
  ordersText += `<div style="${ITEM_SUBTOTAL_STYLE}">${orders.length}</div>`
  ordersText += '</div>'

  ordersText += `<div style="${ITEM_LIST_STYLE}">`
  ordersText += stringifyItemNameFull('First Bill No: ')
  ordersText += orders[0].id
  ordersText += '</div>'

  ordersText += `<div style="${ITEM_LIST_STYLE}">`
  ordersText += stringifyItemNameFull('Second Bill No: ')
  ordersText += orders[orders.length - 1].id
  ordersText += '</div>'
  ordersText += RECEIPT_NEWLINE

  return ordersText
}

const stringifyItemQty = (qty) => {
  return `<div style="${ITEM_QTY_STYLE}">${qty}</div>`
}

const stringifyItemName = (name) => {
  return `<div style="${ITEM_NAME_STYLE}">${name}</div>`
}

const stringifyItemNameFull = (name) => {
  return `<div style="${ITEM_NAME_STYLE_FULL}">${name}</div>`
}

const stringifyItemSubtotal = (subtotal) => {
  return `<div style="${ITEM_SUBTOTAL_STYLE}">${formatCurrency(subtotal)}</div>`
}

/**
 * Print receipt
 */
export const printReceiptFromString = () => {
  const width = window.innderWidth
  const height = window.innderHeight

  const content = '<!DOCTYPE html>' +
                  '<html>' +
                  '<head><title>Print Receipt</title></head>' +
                  '<body style="' + BODY_STYLE + '"onload="window.focus(); window.print(); window.close();">' +
                  receiptHtmlString +
                  '</body>' +
                  '</html>'
  const options = 'toolbar=no,location=no,directories=no,menubar=no,scrollbars=yes,width=' + width + ',height=' + height
  const printWindow = window.open('', 'Printing receipt...', options)
  printWindow.document.open()
  printWindow.document.write(content)
  printWindow.document.close()
  printWindow.focus()
  printWindow.close()
}
