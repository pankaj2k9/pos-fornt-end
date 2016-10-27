import { formatCurrency, formatDate } from '../string'

const RECEIPT_WIDTH = 240
const RECEIPT_MARGIN = 6
const RECEIPT_FONT = 'sans-serif'
const RECEIPT_FONT_SIZE = 12
const RECEIPT_LINE_HEIGHT = 18
const RECEIPT_DIVIDER_DBL = '=================================='
const RECEIPT_DIVIDER = '------------------------------------------------------------'
// const RECEIPT_NEWLINE = '<br /><br />'
const RECEIPT_STYLES = '' +
  '.row { display: flex; justify-content: space-between; }\n' +
  '.row { font-family: "Courier New", Courier, monospace; }\n' +
  '.row.spaced { margin-bottom: 5px; }\n' +
  '.row.col3 .col:nth-child(1) { width: 150px; }\n' +
  '.row.col3 .col:nth-child(2) { width: 30px; text-align: right; }\n' +
  '.row.col3 .col:nth-child(3) { width: 60px; text-align: right; }\n' +

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

const computeItemSubtotal = (item) => {
  const price = Number(item.product.price)
  const qty = item.quantity
  const discounted = item.product.isDiscounted
  const discount = item.product.priceDiscount / 100
  const subtotal = (discounted ? price * discount : price) * qty

  return subtotal
}

/**
 * Build the receipt as html string
 * @param {Object} receipt contain info needed to print the receipt
 */
export const buildReceipt = (data) => {
  const { orders } = data

  let transCount = orders.length
  let transTotal = 0

  orders.forEach((order) => {
    order.items.forEach((item) => {
      transTotal += computeItemSubtotal(item)
    })
  })

  const info = {
    total: transTotal,
    count: transCount
  }

  // Start building receipt string
  receiptHtmlString = ''

  receiptHtmlString += `<div style="${RECEIPT_STYLE}">`

  // build header
  receiptHtmlString += buildHeader(info)

  // build trasnactions list
  receiptHtmlString += buildTransactionsList(orders)

  // Add average sales
  receiptHtmlString += RECEIPT_DIVIDER
  receiptHtmlString += buildRow([
    'Average Sales per Receipt:',
    formatCurrency(transTotal / transCount)
  ])

  receiptHtmlString += RECEIPT_DIVIDER_DBL

  receiptHtmlString += '</div>'
}

/**
 * Add receipt header/s
 * @param {string|string[]} headerText
 */
export const buildHeader = (info) => {
  const { count, total } = info
  let header = ''
  const dateOptions = { day: 'numeric', month: 'numeric', year: 'numeric' }

  header += RECEIPT_DIVIDER_DBL
  header += buildRow([formatDate(new Date(), dateOptions)])
  header += RECEIPT_DIVIDER
  header += buildRow(['<div>** TRANSACTION REPORT **</div>'])
  header += buildRow(['<div>SALES PERSON DETAILS REPORT</div>'])
  header += RECEIPT_DIVIDER
  header += buildRow([`NET INCOME: ${count}`, formatCurrency(total)])
  header += RECEIPT_DIVIDER_DBL

  return header
}

/**
 * Add transactions list
 * @param {Object[]} orders transaction objects
 */
export const buildTransactionsList = (orders) => {
  let tlist = ''

  orders.forEach((order, index) => {
    const orderCount = index + 1
    tlist += buildRow([
      `${orderCount}.`,
      order.id,
      order.staff.username.toUpperCase(),
      ''
    ], 'sh')

    order.items.forEach((item) => {
      const subtotal = computeItemSubtotal(item)

      tlist += buildRow([
        '',
        item.product.barcodeInfo,
        item.quantity,
        formatCurrency(subtotal)
      ], 'sh', 'spaced')
    })
  })

  return tlist
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
