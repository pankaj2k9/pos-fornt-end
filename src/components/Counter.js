import React from 'react'

const Counter = (props) => {
  const {
    plus,
    minus,
    count
  } = props
  return (
    <p className='control has-addons has-addons-centered'>
      <a className='button is-big is-dark' onClick={minus}> - </a>
      <input className='input is-big' type='text' readOnly value={count} style={{maxWidth: 32}} />
      <a className='button is-big is-dark' onClick={plus}> + </a>
    </p>
  )
}

export default Counter
