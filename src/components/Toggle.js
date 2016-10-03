import React from 'react'

const Toggle = (props) => {
  const {
    active,
    switchAction,
    buttonWidth,
    toggleOne,
    toggleTwo,
    size
  } = props

  Toggle.defaultProps = {
    buttonWidth: 'auto',
    size: ''
  }

  return (
    <p className='control has-addons' style={{justifyContent: 'center'}}>
      <a className={toggleOne.value === active
        ? `button is-active is-success ${size}`
        : `button ${size}`}
        style={{width: buttonWidth}}
        onClick={switchAction}>
        {toggleOne.name}
      </a>
      <a className={toggleTwo.value === active
        ? `button is-active is-info ${size}`
        : `button ${size}`}
        style={{width: buttonWidth}}
        onClick={switchAction}
        >
        {toggleTwo.name}
      </a>
    </p>
  )
}

export default Toggle
