import React from 'react'

import { FormattedMessage } from 'react-intl'

const LabeledControl = (props) => {
  const {
    label
  } = props

  return (
    <div className=''>
      <label className='label subtitle'>
        {label === undefined
          ? <span style={{color: 'transparent'}}>invisibile label</span>
          : <FormattedMessage id={label} />
        }
      </label>
      <div className='control'>
        {props.children}
      </div>
    </div>
  )
}

export default LabeledControl
