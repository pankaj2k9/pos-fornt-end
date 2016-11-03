import {
  // formatCurrency,
  formatDate
} from '../string'

const RECEIPT_WIDTH = 240
const RECEIPT_MARGIN = 6
const RECEIPT_FONT = 'sans-serif'
const RECEIPT_FONT_SIZE = 12
const RECEIPT_LINE_HEIGHT = 18
const RECEIPT_DIVIDER_DBL = '=================================='
const RECEIPT_DIVIDER = '------------------------------------------------------------'
const RECEIPT_NEWLINE = '<br /><br />'
const RECEIPT_STYLES = '' +
  '.row { display: flex; justify-content: space-between; }\n' +
  '.row { font-family: "Courier New", Courier, monospace; }\n' +
  '.row.spaced { margin-bottom: 5px; }\n' +
  '.row.col3 .col:nth-child(1) { width: 140px; }\n' +
  '.row.col3 .col:nth-child(2) { width: 30px; text-align: right; }\n' +
  '.row.col3 .col:nth-child(3) { width: 70px; text-align: right; }\n' +

  '.row.col4 > div { width: 55px; text-align: right; }\n' +
  '.row.col4 .col:nth-child(1) { width: 80px; text-align: left; }\n' +

  '.row.col4 .col.col-sh:nth-child(1) { width: 25px; text-align: left; }\n' +
  '.row.col4 .col.col-sh:nth-child(2) { width: 100px; text-align: left; }\n' +
  '.row.col4 .col.col-sh:nth-child(3) { width: 50px; text-align: right; }\n' +
  '.row.col4 .col.col-sh:nth-child(4) { width: 65px; text-align: right; }\n'

// const LI_NAME_MAX = 24

// styles
const RECEIPT_STYLE = `width: ${RECEIPT_WIDTH}px; margin: ${RECEIPT_MARGIN}px`
// const HEADER_STYLE = `display: flex; flex-direction: column; align-items: center; margin-bottom: ${RECEIPT_MARGIN}px;`
let receiptHtmlString = ''
const BODY_STYLE = `font-family: ${RECEIPT_FONT};
  font-size: ${RECEIPT_FONT_SIZE}px;
  line-height: ${RECEIPT_LINE_HEIGHT}px;`

const buildRow = (cols, colType, rowType) => {
  let rowText = ''
  const colLength = cols.length

  rowText += `<div class="row ${rowType} col${colLength}">`
  cols.forEach(col => { rowText += `<div class="col col-${colType}">${col}</div>` })
  rowText += '</div>'

  return rowText
}

/**
 * Build the receipt as html string
 * @param {Object} receipt contain info needed to print the receipt
 */
export const buildReceipt = (data) => {
  const { orders, stores } = data

  // Start building receipt string
  receiptHtmlString = ''

  receiptHtmlString += `<div style="${RECEIPT_STYLE}">`

  // build trasnactions list
  receiptHtmlString += buildBillsList(orders, stores)

  receiptHtmlString += '</div>'
}

/**
 * Add order store source address
 */
const addAddress = (sourceId, stores) => {
  let addr = ''

  const store = stores.filter((store) => {
    return store.source === sourceId
  })[0] || {}

  const storeAddress = store.address || 'SINGAPORE 188021\nTELEPHONE:6238 1337'

  if (storeAddress) {
    storeAddress.split('\n').forEach((section) => {
      addr += buildRow([section])
    })
  }

  return addr
}

/**
 * Add Bills list
 * @param {Object[]} orders transaction objects
 */
export const buildBillsList = (orders, stores) => {
  let bills = ''

  const dateOptions = {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }

  // Iterating through all orders
  bills += RECEIPT_DIVIDER_DBL
  orders.forEach((order) => {
    // Address
    bills += addAddress(order.source, stores)

    // Customer name
    const cust = order.users
      ? `${order.users.firstName} ${order.users.lastName}`.toUpperCase()
      : 'N/A'
    bills += buildRow([`CUSTOMER: ${cust}`])
    bills += RECEIPT_DIVIDER

    // Date and order ID
    bills += buildRow([
      formatDate(new Date(order.dateOrdered), dateOptions),
      order.id
    ])
    bills += RECEIPT_DIVIDER

    // Items list
    order.items.forEach((item) => {
      bills += buildRow([item.product.nameEn])
      bills += buildRow([
        item.product.barcodeInfo,
        `${item.quantity}x`,
        item.totalCost
      ])
    })

    // Items list info
    const itemCount = order.items.length
    bills += buildRow([`Total (${itemCount}) item${itemCount > 1 ? 's' : ''}.`])
    bills += RECEIPT_DIVIDER

    // Totals
    bills += buildRow(['Sub-TOTAL S$', order.subtotal])
    bills += buildRow(['TOTAL S$', order.total])

    // Payments
    bills += buildRow(['PAYMENT(S):'])
    order.payments.forEach((payment) => {
      let type = ''

      if (payment.provider && payment.type === 'debit') {
        type = 'NETS'
      } else if (payment.provider && payment.type === 'credit') {
        type = payment.provider.toUpperCase()
      } else {
        type = payment.type && payment.type.toUpperCase()
      }

      bills += buildRow([type, payment.amount])
    })

    bills += RECEIPT_DIVIDER_DBL
    bills += RECEIPT_NEWLINE
  })

  return bills
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
  printWindow.document.close()
  printWindow.focus()
  printWindow.close()
}
