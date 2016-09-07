/**
 * Draws the receipt into the canvas
 * @param {object} receipt contain info needed to print the receipt
 * @param {object} canvas info about canvas to print
 */
import { buildReceipt, printReceiptFromString } from './printText'

const printReceipt = (receipt) => {
  // draw receipt
  buildReceipt(receipt)

  // print receipt
  printReceiptFromString()
}

export default printReceipt
