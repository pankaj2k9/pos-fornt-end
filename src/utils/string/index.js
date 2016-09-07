/**
 * Format a number into price format
 * @param {string} str string to split
 * @param {number} max max line length
 *
 * @returns {array} of strings split from str that is below
 */
export const formatCurrency = (number) => {
  return Number(number).toLocaleString('en', { minimumFractionDigits: 2 })
}

/**
 * Format a date to locale format
 * @param {Date} date to format
 * @param {Object} options for toLocaleDateString
 *
 * @returns {array} of strings split from str that is below
 */
export const formatDate = (date, options) => {
  const opt = options || {
    hour: '2-digit',
    minute: '2-digit'
  }

  return date.toLocaleDateString('en', opt)
}

/**
 * Splits strings into multiple lines
 * @param {string} str string to split
 * @param {number} max max line length
 *
 * @returns {array} of strings split from str that is below
 */
export const splitStringByWordIntoLines = (str, max) => {
  const words = str.split(' ')

  let line = 0
  const lines = []
  words.forEach(word => {
    if (!lines.length) {
      lines[line] = word
    } else if ((lines[line].length + word.length) > max) {
      line += 1
      lines[line] = word
    } else {
      lines[line] = `${lines[line]} ${word}`
    }
  })

  return lines
}
