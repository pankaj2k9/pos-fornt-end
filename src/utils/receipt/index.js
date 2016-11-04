const RECEIPT_WIDTH = 240
const RECEIPT_MARGIN = 6
const RECEIPT_FONT = 'Courier New, Courier, monospace;'
const RECEIPT_FONT_SIZE = 12
const RECEIPT_LINE_HEIGHT = 18

export const RECEIPT_STYLES = '' +
  '.row { display: flex; justify-content: space-between; }\n' +
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

export const BODY_STYLE = `font-family: ${RECEIPT_FONT};
  font-size: ${RECEIPT_FONT_SIZE}px;
  line-height: ${RECEIPT_LINE_HEIGHT}px;
  width: ${RECEIPT_WIDTH}px;
  margin: ${RECEIPT_MARGIN}px;`

/**
 * Print receipt
 */
export const printReceiptFromString = (receiptHtmlString) => {
  const width = window.innderWidth
  const height = window.innderHeight

  const content = '<!DOCTYPE html>' +
                  '<html>' +
                  '<head>' +
                  '<title>Print Receipt</title>' +
                  '<style>' + RECEIPT_STYLES + '</style>' +
                  '</head>' +
                  '<body style="' + BODY_STYLE + '" onload="window.focus(); window.print(); window.close();">' +
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
