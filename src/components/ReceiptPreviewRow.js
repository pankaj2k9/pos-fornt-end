import React from 'react'

const RECEIPT_DIVIDER = '---------------------------------'
export const ReceiptRowDivider = () => {
  return <span className='divider'>{RECEIPT_DIVIDER}</span>
}

const RECEIPT_DIVIDER_DBL = '================================='
export const ReceiptRowDividerDbl = () => {
  return <span className='divider'>{RECEIPT_DIVIDER_DBL}</span>
}

export const ReceiptRowNewLine = () => {
  return <span><br /><br /></span>
}

const ReceiptPreviewRow = ({cols, colType, rowType}) => {
  const colCount = cols.length

  let rowClass = `row col${colCount || 1}`
  if (rowType) { rowClass += ` ${rowType}` }

  let colClass = `col`
  if (colType) { colClass += `col${colType}` }

  return (
    <div className={rowClass}>
      {cols.map((col) => {
        return (<div className={colClass}>{col}</div>)
      })}
    </div>
  )
}

export default ReceiptPreviewRow
