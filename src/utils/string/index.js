/**
 * Format a number into price format
 * @param {string} str string to split
 * @param {number} max max line length
 *
 * @returns {array} of strings split from str that is below
 */
export const formatCurrency = (number, currency) => {
  number = Number(number)
  if (currency === 'odbo') {
    return String(number)
  } else if (currency === 'sgd' || !currency) {
    if (number < 0) {
      return `-$${Math.abs(number).toLocaleString('en', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}`
    }
    return `$${number.toLocaleString('en', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`
  }
}

export const formatNumber = (string) => {
  // let newValue = Number(`${newValue}`.replace(/\D/g, ''))
  let value = String(string)
  let newValue = Number(value.replace(/[^\d.]/g, ''))
  return newValue
}

export const formatDecimalStr = (string) => {
  let initial = string.replace(/[^\d.]/g, '')
  let i = parseFloat(initial)
  if (isNaN(i)) { i = 0.00 }
  let minus = ''
  if (i < 0) { minus = '-' }
  i = Math.abs(i)
  i = parseInt((i + 0.005) * 100)
  i = i / 100
  let s = String(i)
  if (s.indexOf('.') < 0) { s += '.00' }
  if (s.indexOf('.') === (s.length - 2)) { s += '0' }
  s = minus + s
  return `$${s}`
}

/**
 * Format a date to locale format
 * @param {Date} date to format
 * @param {Object} options for toLocaleDateString
 *
 * @returns {array} of strings split from str that is below
 */
export const formatDate = (value, options) => {
  let date = new Date(value)
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
 * @param {[object]} stores list of stores
 *
 * @returns {array} of strings split from str that is below
 */
export const buildOrderId = (store, id, idLength, stores) => {
  const ID_LENGTH_WITHOUT_PREFIX = idLength || 7

  if (!isNaN(id)) {
    const activeStore = stores.filter((st) => { return st.source === store })[0]
    let prefix = activeStore && activeStore.code || ''

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
