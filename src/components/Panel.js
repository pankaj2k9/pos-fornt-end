import React from 'react'

// import Level from './Level'
// import { FormattedMessage } from 'react-intl'

const Panel = (props) => {
  Panel.defaultProps = {
    panelName: 'Panel',
    buttonOne: undefined,
    buttonTwo: undefined
  }

  return (
    <div className={'content'}>
      <div className='panel is-clearfix'>
        {props.children}
      </div>
    </div>
  )
}

export default Panel
