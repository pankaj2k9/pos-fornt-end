import { formatCurrency, formatDate } from '../string'

const RECEIPT_WIDTH = 240
const RECEIPT_FONT = 'sans-serif'
const RECEIPT_FONT_SIZE = 12
const RECEIPT_LINE_HEIGHT = 18
const RECEIPT_MARGIN = 6
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
const TOTAL_DIV_STYLE_1 = `display: flex; justify-content: space-between; flex-direction: row; font-size: ${RECEIPT_FONT_SIZE * 1.2}px; font-weight: bold;`
const TOTAL_DIV_STYLE_2 = 'display: flex; justify-content: space-between; flex-direction: row;'
const BODY_STYLE = `font-family: ${RECEIPT_FONT};
  font-size: ${RECEIPT_FONT_SIZE}px;
  line-height: ${RECEIPT_LINE_HEIGHT}px;`
let receiptHtmlString = ''

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
  // receiptHtmlString += buildItemList(receipt.items)
  // receiptHtmlString += receipt.items ? RECEIPT_DIVIDER : ''

  // build price computation
  // receiptHtmlString += buildComputation(receipt.trans)
  // receiptHtmlString += receipt.trans ? RECEIPT_DIVIDER : ''

  // build footer
  // receiptHtmlString += buildFooter(receipt.footerText)

  receiptHtmlString += '</div>'
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
 * Add the receipt footer/s
 * @param {string|string[]} footerText
 */
export const buildFooter = (footerText) => {
  let footer = ''

  footer += `<div style="${HEADER_STYLE}">`
  if (typeof footerText === 'string') {
    footer += `<div>${footerText}</div>`
  } else if (typeof footerText === 'object') {
    footerText.forEach(ftr => {
      footer += `<div>${ftr}</div>`
    })
  }
  footer += '</div>'
  return footer
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
export const buildOrders = (orders) => {
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

  summaryText += `<div style="${ITEM_LIST_STYLE}">`
  summaryText += stringifyItemName(odbo.type.toUpperCase())
  summaryText += stringifyItemQty('x' + odbo.count)
  summaryText += stringifyItemSubtotal(odbo.subtotal)
  summaryText += '</div>'

  return summaryText
}

/**
 * Add purchase computation
 * @param {Object} info of receipt
 */
export const buildComputation = (trans) => {
  let comp = ''
  if (trans) {
    let total = `<div>${formatCurrency(trans.total)}</div>`
    let customerLbl = trans.customer ? 'ODBO USER' : 'CUST. NAME'
    let customer = trans.customer ? trans.customer : trans.walkIn
    let minLabel
    let minuend
    let card
    let cardType
    let diffLabel
    let difference
    let showDiff = true
    switch (trans.type) {
      case 'cash':
        minLabel = 'CASH'
        minuend = `<div>${formatCurrency(trans.cash)}</div>`
        diffLabel = 'CHANGE'
        difference = `<div>${formatCurrency(trans.change)}</div>`
        break
      case 'odbo':
        total = `<div>${trans.total}</div>`
        minLabel = 'THE ODBO COINS'
        minuend = `<div>${trans.odboCoins}</div>`
        diffLabel = 'BALANCE'
        difference = `<div>${trans.odboBalance}</div>`
        break
      case 'credit':
        minLabel = 'Trans #'
        minuend = `<div>${trans.transNo}</div>`
        card = 'Card Type'
        cardType = `<div>${trans.cardType} <br /> ${trans.provider}</div>`
        showDiff = false
    }

    comp += '<div>'
    if (trans.type === 'cash' || trans.type === 'credit') {
      comp += `<div style="${TOTAL_DIV_STYLE_2}"><div>SUBTOTAL : </div>${trans.sumOfCartItems}</div>`
      if (trans.voucherDiscount) {
        comp += `<div style="${TOTAL_DIV_STYLE_2}"><div>VOUCHER DISCOUNT : </div>${trans.voucherDiscount}</div>`
      } else if (trans.customDiscount) {
        comp += `<div style="${TOTAL_DIV_STYLE_2}"><div>OVERALL DISCOUNT : </div>${trans.customDiscount}</div>`
      }
      comp += RECEIPT_DIVIDER
    }
    comp += `<div style="${TOTAL_DIV_STYLE_1}"><div>TOTAL : </div>${total}</div>`
    comp += trans.type === 'credit'
      ? `<div style="${TOTAL_DIV_STYLE_2}"><div>${card} : </div>${cardType}</div>`
      : ''
    comp += `<div style="${TOTAL_DIV_STYLE_2}"><div>${minLabel} : </div>${minuend}</div>`
    if (showDiff) {
      comp += `<div style="${TOTAL_DIV_STYLE_1}">
        <div>${diffLabel} : </div>${difference}</div>`
    }
    if (trans.type === 'cash' || trans.type === 'credit') {
      if (customer) {
        comp += RECEIPT_DIVIDER
        comp += `<div style="${TOTAL_DIV_STYLE_1}"><div>${customerLbl} : </div>${customer}</div>`
      }
      if (trans.customer) {
        if (trans.points !== 0) {
          comp += `<div style="${TOTAL_DIV_STYLE_2}"><div>--------------ODBO COIN BALANCE--------------</div></div>`
          comp += `<div style="${TOTAL_DIV_STYLE_2}"><div>PREVIOUS BALANCE : </div>${trans.previousOdbo}</div>`
          comp += `<div style="${TOTAL_DIV_STYLE_2}"><div>EARNED POINTS : </div>${trans.points}</div>`
          comp += `<div style="${TOTAL_DIV_STYLE_1}"><div>NEW BALANCE : </div>${trans.newOdbo}<br/></div>`
        }
      }
    }
    if (trans.orderNote) {
      if (trans.orderNote.length !== 0) {
        comp += RECEIPT_DIVIDER
        comp += `<div style="${TOTAL_DIV_STYLE_1}"><div>Remarks: </div></div>`
        trans.orderNote.map(note => {
          comp += `<div style="${TOTAL_DIV_STYLE_2}">${note.message}</div>`
        })
      }
    }
    comp += '</div>'
  }

  return comp
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
