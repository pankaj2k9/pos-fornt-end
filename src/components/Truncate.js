import React from 'react'

const Truncate = (props) => {
  const {
    text,
    maxLength
  } = props
  if (text.length > maxLength) {
    return <span>{text.substring(0, maxLength) + '...'}</span>
  } else {
    return <span>{text}</span>
  }
}

export default Truncate
