import React from 'react'

const Counter = (props) => {
  const {
    size,
    plus,
    minus,
    count
  } = props
  return (
    <p className='control has-addons has-addons-centered'>
      <a className='button is-small is-dark' onClick={minus} style={styles[size]}> - </a>
      <input className='input is-small' type='text' readOnly value={count} style={{maxWidth: 32, fontSize: 16}} />
      <a className='button is-small is-dark' onClick={plus} style={styles[size]}> + </a>
    </p>
  )
}

const styles = {
  large: {
    fontSize: 24,
    height: 60,
    textAlign: 'center',
    width: 60
  },
  normal: {
    height: 40
  },
  small: {
    fontSize: 16,
    fontWeight: 900
  }
}

export default Counter
