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

/**
 * Build order ID string
 * @param {string} store id of store
 * @param {string || number} id order id
 * @param {number} idLength default `7`
 *
 * @returns {array} of strings split from str that is below
 */
export const buildOrderId = (store, id, idLength) => {
  const ID_LENGTH_WITHOUT_PREFIX = idLength || 7

  if (!isNaN(id)) {
    let prefix = ''

    switch (store) {
      case 's1': // Bugis
        prefix = 'BG'
        break
      case 's2': // Dhoby
        prefix = 'DG'
        break
      case 's3': // Tampines
        prefix = 'TP'
        break
    }

    let zeros = ''
    for (let i = 0; i < ID_LENGTH_WITHOUT_PREFIX - String(id).length; i++) {
      zeros += '0'
    }

    const newId = `${prefix}${zeros}${id}`
    return newId
  } else {
    return id
  }
}
