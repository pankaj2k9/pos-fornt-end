/**
 * Draws the "End of day sales" receipt
 * @param {object} data contain info needed to print the EODS
 */
import { buildReceipt, printReceiptFromString } from './printText'

const printReceipt = (data) => {
  // build
  buildReceipt(data)

  // print receipt
  printReceiptFromString()
}

export default printReceipt
