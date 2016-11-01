import React from 'react'
// import { FormattedMessage } from 'react-intl'

const FunctionButtons = (props) => {
  const {
    buttons,
    onClickButton
  } = props
  // var intFrameHeight = window.innerHeight

  const container = {height: 80, padding: 20, paddingLeft: 10, paddingRight: 10}

  return (
    <div style={{padding: 5}}>
      <div className='columns is-multiline is-mobile is-fullwidth'>
        {
          buttons.map(function (button, key) {
            let boundItemClick = onClickButton.bind(this, button.name)
            return (
              <div key={key} className={`column is-one-third`} onClick={boundItemClick}>
                <div className={`box has-text-centered notification ${button.color || ''}`} style={container}>
                  <div className='media'>
                    <div className='media-left'>
                      {button.icon
                        ? <span className='icon is-medium'>
                          <i className={button.icon} />
                        </span>
                        : null
                      }
                    </div>
                    <div className='media-content'>
                      <h3 className='title is-marginless'>{button.name}</h3>
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
