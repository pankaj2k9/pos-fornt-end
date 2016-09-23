import React from 'react'

import Level from './Level'
import { FormattedMessage } from 'react-intl'

const Panel = (props) => {
  const {
    panelName,
    buttonOne,
    buttonTwo
  } = props

  Panel.defaultProps = {
    panelName: 'Panel',
    buttonOne: undefined,
    buttonTwo: undefined
  }

  const containerStyle = {
    margin: 10,
    paddingTop: 5,
    paddingBottom: 5,
    paddingLeft: 5,
    paddingRight: 5
  }

  return (
    <div className={'content'}>
      <div className='container'
        style={containerStyle}>
        <Level
          left={<h2 className='is-marginless'>{panelName}</h2>}
          right={
            <div className='control is-grouped'>
              {
                buttonOne && buttonOne.name !== undefined
                ? <p className='control'>
                  <a className={'button ' + buttonOne.class}
                    onClick={buttonOne.onClick}>
                    <span className={!buttonOne.icon ? '' : 'icon'}>
                      <i className={buttonOne.icon} />
                    </span>
                    <span><FormattedMessage id={buttonOne.name} /></span>
                  </a>
                </p>
                : <div style={{maxWidth: 200, maxHeight: 33}}>{buttonOne}</div>
              }
              {
                buttonTwo && buttonTwo.name !== undefined
                ? <p className='control'>
                  <a className={'button ' + buttonTwo.class}
                    onClick={buttonTwo.onClick}>
                    <FormattedMessage id={buttonTwo.name} />
                  </a>
                </p>
                : null
              }
            </div>
          }
        />
      </div>
      <div className='panel is-clearfix'>
        {props.children}
      </div>
    </div>
  )
}

export default Panel
