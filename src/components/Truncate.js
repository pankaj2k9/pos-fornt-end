import React from 'react'

const Truncate = (props) => {
  const {
    text,
    maxLength
  } = props
  if (text.length > maxLength) {
    return <p>{text.substring(0, maxLength) + '...'}</p>
  } else {
    return <p>{text}</p>
  }
}

export default Truncate
