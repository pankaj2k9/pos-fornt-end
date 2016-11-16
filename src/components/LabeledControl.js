import React from 'react'

import { FormattedMessage } from 'react-intl'

const LabeledControl = (props) => {
  const {
    label,
    labelAlt
  } = props

  return (
    <div className=''>
      <label className='label subtitle'>
        {!label
          ? labelAlt
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
