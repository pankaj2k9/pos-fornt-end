/**
 * Draws the "View Bills" receipt
 * @param {object} data contain info needed to print the receipt
 */
import { buildReceipt, printReceiptFromString } from './printText'

const printReceipt = (data) => {
  // build
  buildReceipt(data)

  // print receipt
  printReceiptFromString()
}

export default printReceipt
