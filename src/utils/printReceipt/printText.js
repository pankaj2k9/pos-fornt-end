import { formatCurrency, formatDate, splitStringByWordIntoLines } from '../string'
import { processOdboID, compPaymentsSum } from '../computations'

const RECEIPT_WIDTH = 240
const RECEIPT_FONT = 'sans-serif'
const RECEIPT_FONT_SIZE = 12
const RECEIPT_LINE_HEIGHT = 18
const RECEIPT_MARGIN = 6
const RECEIPT_DIVIDER = '------------------------------------------------------------'

const LI_NAME_MAX = 24

// styles
const RECEIPT_STYLE = `width: ${RECEIPT_WIDTH}px; margin: ${RECEIPT_MARGIN}px; margin-bottom: 10px;`
const ITEM_LIST_STYLE = 'display: flex; align-items: start; justify-content: start;'
const ITEM_QTY_STYLE = 'width: 24px; display: inline-block'
const ITEM_NAME_STYLE = 'width: 176px; display: inline-block;'
const ITEM_SUBTOTAL_STYLE = 'width: 36px; display: inline-block; text-align: right;'
const HEADER_STYLE = `display: flex; flex-direction: column; align-items: center; margin-bottom: ${RECEIPT_MARGIN}px;`
const COMPANY_NAME = `font-size: ${RECEIPT_FONT_SIZE * 2}px; font-weight: bold;`
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
  receiptHtmlString += buildHeader(receipt.storeAddress)
  receiptHtmlString += receipt.headerText ? RECEIPT_DIVIDER : ''

  // build extra info
  receiptHtmlString += buildExtraInfo(receipt.type, receipt.extraInfo, receipt.duplicate)
  receiptHtmlString += receipt.info ? RECEIPT_DIVIDER : ''

  // build item list
  receiptHtmlString += buildItemList(receipt.items)
  receiptHtmlString += receipt.items ? RECEIPT_DIVIDER : ''

  // build price computation
  receiptHtmlString += buildComputation(receipt.type, receipt.paymentInfo, receipt.extraInfo, receipt.duplicate)
  receiptHtmlString += receipt.paymentInfo ? RECEIPT_DIVIDER : ''

  // build footer
  receiptHtmlString += buildFooter(receipt.footerText)

  receiptHtmlString += '</div>'
}

/**
 * Add receipt header/s
 * @param {string|string[]} headerText
 */
export const buildHeader = (headerText) => {
  return `<div style="${HEADER_STYLE}">
          <div style="${COMPANY_NAME}">The odbo</div>
          ${headerText.map((x) => { return `<div>${x}</div>` }).join('')}
          </div>`
}

/**
 * Add staff, date, etc.
 * @param {Object} info of receipt
 */
export const buildExtraInfo = (type, info, duplicate) => {
  let { staff, customer, id, date, refundId, dateRefunded } = info
  let extra = ''
  let custLbl = customer ? `<div style="${TOTAL_DIV_STYLE_2}">CUSTOMER[ID#${processOdboID(customer.odboId)}] : ${customer.firstName || ''} ${customer.lastName || ''}</div>` : ''
  let orderId = type === 'reprint' && refundId && duplicate
    ? `<div style="${TOTAL_DIV_STYLE_1}">Refund ID : ${refundId}</div>`
    : id
      ? `<div style="${TOTAL_DIV_STYLE_1}">Order ID : ${id}</div>`
      : ''
  let dateToShow = refundId && duplicate ? dateRefunded : !date ? null : date
  extra += `<div>
  ${RECEIPT_DIVIDER}
  ${orderId}
  ${staff ? `<div>STAFF : ${staff}<div>` : ''}
  <div>${formatDate(dateToShow || new Date())}</div>
  ${custLbl}
  ${RECEIPT_DIVIDER}
  </div>`

  return extra
}

/**
 * Add list item
 * @param {Object[]} items array of items
 */
const buildItemList = (items) => {
  let itemList = ''
  itemList += `<div style="${TOTAL_DIV_STYLE_1}"><div>ITEMS</div></div>`
  if (items) {
    items.forEach((item, index) => {
      if (index > 0) {
        receiptHtmlString += '\n'
      }
      itemList += `<div style="${ITEM_LIST_STYLE}">
                    ${stringifyItemQty(item.quantity)}
                    ${stringifyItemName(item.name)}
                    ${stringifyItemSubtotal(item.totalCost)}
                  </div>`
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
  return `<div style="${ITEM_SUBTOTAL_STYLE}">${subtotal}</div>`
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
 * Add purchase computation
 * @param {Object} info of receipt
 */
export const buildComputation = (type, paymentInfo, extraInfo, duplicate) => {
  let comp = ''

  if (paymentInfo) {
    const { currency, payments, subtotal, orderTotal, orderDisccount, notes, vouchers, odbo, refundId, refundAmt, dateRefunded } = paymentInfo
    let deductSign = refundId && duplicate ? '-' : ''
    comp += '<div>'
    if (currency === 'sgd') {
      comp += `<div style="${TOTAL_DIV_STYLE_2}"><div>GST: </div>${formatCurrency(0)}</div>
               <div style="${TOTAL_DIV_STYLE_2}"><div>SUBTOTAL: </div>${formatCurrency(subtotal)}</div>
               ${RECEIPT_DIVIDER}`
    }

    comp += orderDisccount ? `<div style="${TOTAL_DIV_STYLE_2}"><div>DISCOUNTS : </div>${formatCurrency(orderDisccount, currency)}</div>` : ''
    comp += `<div style="${TOTAL_DIV_STYLE_1}"><div>TOTAL: </div>${formatCurrency(orderTotal, currency)}</div>`

    comp += RECEIPT_DIVIDER

    payments.map(payment => {
      if (currency === 'sgd') {
        if (payment.type === 'credit') {
          if (payment.amount) {
            comp += `<div style="${TOTAL_DIV_STYLE_1}"><div>CREDIT PAYMENT</div></div>
                     <div style="${TOTAL_DIV_STYLE_2}"><div>AMOUNT PAID: </div>${deductSign}${formatCurrency(payment.amount)}</div>
                     <div style="${TOTAL_DIV_STYLE_2}"><div>CARD TYPE : </div>${payment.provider}</div>
                     <div style="${TOTAL_DIV_STYLE_2}"><div>TRANS#: </div>${payment.transNumber}</div>`
          }
        }
        if (payment.type === 'nets') {
          if (payment.amount) {
            comp += `<div style="${TOTAL_DIV_STYLE_1}"><div>NETS PAYMENT</div></div>
                     <div style="${TOTAL_DIV_STYLE_2}"><div>AMOUNT PAID: </div>${deductSign}${formatCurrency(payment.amount)}</div>
                     <div style="${TOTAL_DIV_STYLE_2}"><div>TRANS#: </div>${payment.transNumber}</div>`
          }
        }
        if (payment.type === 'cash') {
          if (payment.amount) {
            comp += `<div style="${TOTAL_DIV_STYLE_1}"><div>CASH PAYMENT</div></div>
                     <div style="${TOTAL_DIV_STYLE_2}"><div>CASH GIVEN: </div>${formatCurrency(payment.cash)}</div>
                     <div style="${TOTAL_DIV_STYLE_2}"><div>AMOUNT PAID : </div>${deductSign}${formatCurrency(payment.amount)}</div>
                     <div style="${TOTAL_DIV_STYLE_2}"><div>CASH CHANGE : </div>${formatCurrency(payment.change * -1)}</div>`
          }
        }
      } else if (currency === 'odbo') {
        if (payment.amount) {
          comp += `<div style="${TOTAL_DIV_STYLE_1}"><div>ODBO PAYMENT</div></div>
                   <div style="${TOTAL_DIV_STYLE_2}"><div>ODBO COINS: </div>${odbo.prevCoins}</div>
                   <div style="${TOTAL_DIV_STYLE_2}"><div>AMOUNT PAID: </div>${deductSign}${formatCurrency(orderTotal, 'odbo')}</div>
                   <div style="${TOTAL_DIV_STYLE_1}"><div>REMAINING BALANCE: </div>${odbo.newCoins2}</div>`
        }
      }
    })

    if (vouchers.length > 0) {
      comp += `<div style="${TOTAL_DIV_STYLE_1}"><div>VOUCHER PAYMENT</div></div>`
      vouchers.map(voucher => {
        comp += `<div style="${TOTAL_DIV_STYLE_2}"><div>voucher [${voucher.remarks || '###'}] : </div>${formatCurrency(duplicate ? -voucher.deduction : voucher.deduction)}</div>`
      })
    }

    if (currency === 'sgd' && payments.length > 1) {
      comp += `<div style="${TOTAL_DIV_STYLE_1}"><div>TOTAL PAYMENT: </div>${deductSign}${formatCurrency(compPaymentsSum(payments))}</div>`
    }

    if (currency === 'sgd') {
      if (odbo) {
        comp += RECEIPT_DIVIDER
        comp += `<div style="${TOTAL_DIV_STYLE_1}"><div>---- THE ODBO COIN BALANCE ----</div></div>
                 <div style="${TOTAL_DIV_STYLE_2}"><div>PREVIOUS BALANCE : </div>${odbo.prevCoins}</div>
                 <div style="${TOTAL_DIV_STYLE_2}"><div>EARNED POINTS ${odbo.bonus ? odbo.bonus : ''} : </div>${odbo.earnedPts}</div>
                 <div style="${TOTAL_DIV_STYLE_1}"><div>NEW BALANCE : </div>${odbo.newCoins}<br/></div>`
      }
    }

    if (notes && notes.length !== 0) {
      comp += RECEIPT_DIVIDER
      comp += `<div style="${TOTAL_DIV_STYLE_1}"><div>Remarks: </div></div>`
      notes.map(note => {
        comp += `<div style="${TOTAL_DIV_STYLE_2}">${note.message}</div>`
      })
    }

    if (type === 'reprint' && refundId && duplicate) {
      comp += RECEIPT_DIVIDER
      comp += `<div style="${TOTAL_DIV_STYLE_1}"><div>REFUNDED AMOUNT: </div>${formatCurrency(refundAmt, currency)}</div>`
    }

    if (type === 'refund' && refundId) {
      comp += RECEIPT_DIVIDER
      comp += `<div style="${TOTAL_DIV_STYLE_1}"><div>REFUNDED ORDER: </div></div>
              <div style="${TOTAL_DIV_STYLE_1}"><div>REFUND ID: </div> ${refundId}</div>
              <div style="${TOTAL_DIV_STYLE_2}">${formatDate(dateRefunded)}</div>
              <div style="${TOTAL_DIV_STYLE_1}"><div>REFUNDED AMOUNT: </div>${formatCurrency(refundAmt, currency)}</div>
              </div>`
    }

    if (type === 'reprint') {
      comp += RECEIPT_DIVIDER
      comp += `<div style="${TOTAL_DIV_STYLE_2}">REPRINTED RECEIPT
              <div style="${TOTAL_DIV_STYLE_2}">${formatDate(new Date())}</div>
              </div>`
    }
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
