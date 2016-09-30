import { formatCurrency, formatDate, splitStringByWordIntoLines } from '../string'

const RECEIPT_WIDTH = 240
const RECEIPT_FONT = 'sans-serif'
const RECEIPT_FONT_SIZE = 12
const RECEIPT_LINE_HEIGHT = 18
const RECEIPT_MARGIN = 6
const RECEIPT_DIVIDER = '------------------------------------------------------------'

const LI_NAME_MAX = 24

// styles
const RECEIPT_STYLE = `width: ${RECEIPT_WIDTH}px; margin: ${RECEIPT_MARGIN}px`
const ITEM_LIST_STYLE = 'display: flex; align-items: start; justify-content: start;'
const ITEM_QTY_STYLE = 'width: 24px; display: inline-block'
const ITEM_NAME_STYLE = 'width: 176px; display: inline-block;'
const ITEM_SUBTOTAL_STYLE = 'width: 36px; display: inline-block; text-align: right;'
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
export const buildReceipt = (receipt) => {
  receiptHtmlString = ''
  // receiptHtmlString += '<div style="width: 240px; border-bottom: 2px solid black; />'

  receiptHtmlString += `<div style="${RECEIPT_STYLE}">`
  // build header
  receiptHtmlString += buildHeader(receipt.headerText)
  receiptHtmlString += receipt.headerText ? RECEIPT_DIVIDER : ''

  // build extra info
  receiptHtmlString += buildExtraInfo(receipt.info)
  receiptHtmlString += receipt.info ? RECEIPT_DIVIDER : ''

  // build item list
  receiptHtmlString += buildItemList(receipt.items)
  receiptHtmlString += receipt.items ? RECEIPT_DIVIDER : ''

  // build price computation
  receiptHtmlString += buildComputation(receipt.trans)
  receiptHtmlString += receipt.trans ? RECEIPT_DIVIDER : ''

  // build footer
  receiptHtmlString += buildFooter(receipt.footerText)

  receiptHtmlString += '</div>'
}

/**
 * Add list item
 * @param {Object[]} items array of items
 */
const buildItemList = (items) => {
  let itemList = ''
  if (items) {
    items.forEach((item, index) => {
      if (index > 0) {
        receiptHtmlString += '\n'
      }

      itemList += `<div style="${ITEM_LIST_STYLE}">`
      itemList += stringifyItemQty(item.qty)
      itemList += stringifyItemName(item.name)
      itemList += stringifyItemSubtotal(item.subtotal)
      itemList += '</div>'
    })
  }
  return itemList
}

const stringifyItemQty = (qty) => {
  return `<div style="${ITEM_QTY_STYLE}">${qty}</div>`
}

const stringifyItemName = (name) => {
  let itemName = ''

  let nameLines
  if (name.length > LI_NAME_MAX) {
    nameLines = splitStringByWordIntoLines(name, LI_NAME_MAX)

    itemName += `<div style="${ITEM_NAME_STYLE}">`
    nameLines.forEach(nameLine => {
      itemName += `<div>${nameLine}</div>`
    })
    itemName += '</div>'
  } else {
    itemName += `<div style="${ITEM_NAME_STYLE}">${name}</div>`
  }

  return itemName
}

const stringifyItemSubtotal = (subtotal) => {
  return `<div style="${ITEM_SUBTOTAL_STYLE}">${formatCurrency(subtotal)}</div>`
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
 * Add staff, date, etc.
 * @param {Object} info of receipt
 */
export const buildExtraInfo = (info) => {
  let date = new Date(info.date)
  let extra = ''
  let orderId = info.orderId
    ? extra += `<div>Order ID : ${info.orderId}</div>`
    : null
  extra += '<div>'
  if (info.staff) {
    extra += `<div>STAFF : ${info.staff}<div>`
  }
  extra += `<div>${formatDate(date)}</div>`
  orderId
  extra += '</div>'

  return extra
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
      comp += `<div style="${TOTAL_DIV_STYLE_2}"><div>SUBTOTAL : </div>${formatCurrency(trans.sumOfCartItems)}</div>`
      comp += `<div style="${TOTAL_DIV_STYLE_2}"><div>GST : </div>${formatCurrency(0)}</div>`
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
