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
  const sampleHeader = [
    'adr1',
    'adr2',
    'adr3'
  ]
  const cashier = 'jennye'
  const machineId = 'BUGIS?'

  receiptHtmlString = ''
  // receiptHtmlString += '<div style="width: 240px; border-bottom: 2px solid black; />'

  receiptHtmlString += `<div style="${RECEIPT_STYLE}">`
  // build header
  receiptHtmlString += buildHeader(sampleHeader)
  receiptHtmlString += sampleHeader ? RECEIPT_DIVIDER : ''

  // build info section 1
  receiptHtmlString += buildInfo1()
  receiptHtmlString += RECEIPT_DIVIDER

  // build summary
  receiptHtmlString += buildSummary(data.summary)
  receiptHtmlString += data.summary ? RECEIPT_DIVIDER : ''

  // build order list
  receiptHtmlString += buildPaymentDetails(data.orders)
  receiptHtmlString += RECEIPT_DIVIDER

  // build footer
  receiptHtmlString += buildFooter(cashier, machineId)
}

/**
 * Add receipt footer
 * @param {string} cashier
 * @param {string} machineId
 */
export const buildFooter = (cashier, machineId) => {
  let footerString = ''

  footerString += `<div style="${ITEM_LIST_STYLE}">`
  footerString += `Cashier : ${cashier.toUpperCase()}`
  footerString += '</div>'

  footerString += `<div style="${ITEM_LIST_STYLE}">`
  footerString += `Machine Id : ${machineId}`
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
 * @param {Object} summary of receipt
 */
export const buildSummary = (summary) => {
  let summaryText = ''
  let odbo
  let totalCollected = 0

  if (summary) {
    summary.forEach((item, index) => {
      if (item.provider) {
        summaryText += `<div style="${ITEM_LIST_STYLE}">`
        summaryText += stringifyItemName(item.provider.toUpperCase())
        summaryText += stringifyItemQty('x' + item.count)
        summaryText += stringifyItemSubtotal(item.subtotal)
        summaryText += '</div>'

        totalCollected += Number(item.subtotal)
      } else if (item.type === 'cash') {
        summaryText += `<div style="${ITEM_LIST_STYLE}">`
        summaryText += stringifyItemName(item.type.toUpperCase())
        summaryText += stringifyItemQty('x' + item.count)
        summaryText += stringifyItemSubtotal(item.subtotal)
        summaryText += '</div>'

        totalCollected += Number(item.subtotal)
      } else if (item.type === 'odbo') {
        odbo = item
      }
    })
  }

  summaryText += `<div style="${ITEM_LIST_STYLE}">`
  summaryText += stringifyItemNameFull('TOTAL COLLECTED')
  summaryText += stringifyItemSubtotal(totalCollected)
  summaryText += '</div>'

  summaryText += RECEIPT_DIVIDER

  // add odbo summary
  summaryText += `<div style="${ITEM_LIST_STYLE}">`
  summaryText += stringifyItemName(odbo.type.toUpperCase())
  summaryText += stringifyItemQty('x' + odbo.count)
  summaryText += stringifyItemSubtotal(odbo.subtotal)
  summaryText += '</div>'

  // add open cashdrawer
  summaryText += RECEIPT_NEWLINE
  summaryText += `<div style="${ITEM_LIST_STYLE}">`
  summaryText += stringifyItemName('OPEN CASHDRAWER')
  summaryText += stringifyItemQty('x123')
  summaryText += stringifyItemSubtotal(0)
  summaryText += '</div>'

  summaryText += RECEIPT_DIVIDER

  // cash in drawer
  summaryText += `<div style="${ITEM_LIST_STYLE}">`
  summaryText += stringifyItemNameFull('CASH IN DRAWER')
  summaryText += stringifyItemSubtotal(118)
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
    const orderType = order.posTrans.type
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
  // printWindow.document.close()
  // printWindow.focus()
  // printWindow.close()
  // console.log(receiptHtmlString)
}
