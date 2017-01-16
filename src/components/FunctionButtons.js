import React from 'react'
import { FormattedMessage } from 'react-intl'

const FunctionButtons = (props) => {
  const {
    buttons,
    onClickButton
  } = props
  // var intFrameHeight = window.innerHeight

  const container = {height: 70, padding: 15, paddingLeft: 5, paddingRight: 5}

  return (
    <div style={{padding: 5}}>
      <div className='columns is-multiline is-mobile is-fullwidth'>
        {
          buttons.map(function (button, key) {
            let boundItemClick = onClickButton.bind(this, button.name)
            let buttonColor = button.disabled ? 'grey' : button.customColor
            return (
              <div key={key} className={`column ${button.size || 'is-one-third'}`} onClick={boundItemClick}>
                <div className={`box has-text-centered notification ${button.color || ''}`} style={container}>
                  <div className='media' style={{color: buttonColor}}>
                    <div className='media-left'>
                      {button.icon
                        ? <span className={!button.size ? 'icon is-medium' : ''}>
                          <i className={button.icon} />
                        </span>
                        : null
                      }
                    </div>
                    <div className='media-content' style={{color: button.customColor}}>
                      <h4 className='title is-marginless'><FormattedMessage id={String(button.label)} /></h4>
                    </div>
                  </div>
                </div>
              </div>
            )
          }, this)
        }
      </div>
    </div>
  )
}

export default FunctionButtons
