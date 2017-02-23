import React from 'react'
import { FormattedMessage } from 'react-intl'

const POSButtons = (props) => {
  const {
    buttons,
    buttonStyle,
    containerStyle,
    onClickButton
  } = props

  let colors = {
    'pink': '#ff688d',
    'blue': '#8adcec',
    'purple': '#ccbae8',
    'yellow': '#fcfa00'
  }

  let defaultBtn = {
    display: 'flex',
    justifyContent: 'center',
    flexDirection: 'column'
  }

  let imgBtn = {
    height: 40
  }

  return (
    <div className='columns is-multiline is-mobile is-fullwidth is-marginless' style={containerStyle}>
      {
        buttons.map(function (button, key) {
          const {
            blank,
            color,
            imgUrl,
            inverted,
            isActive,
            label,
            name,
            size
          } = button
          let invertColor = {borderWidth: 5, borderColor: String(colors[color || 'blue']), borderStyle: 'double'}
          let normalColor = {backgroundColor: String(colors[color])}
          let imgBtnSLC = imgUrl ? inverted ? {opacity: 1} : {} : {}
          let btnColor = isActive
            ? color
              ? inverted ? invertColor : normalColor
              : {}
            : {}
          let lblColor = inverted ? {textShadow: `1px 1px 5px ${colors[color]}`} : {}
          let bountItemClick = isActive ? onClickButton.bind(this, name) : (name) => { console.log('name', name) }
          let btnLbl = !imgUrl
            ? label.match('app') ? <FormattedMessage id={label} /> : label
            : imgUrl
          let finalBtnStyle = imgUrl
            ? Object.assign({}, buttonStyle, btnColor, imgBtn, imgBtnSLC)
            : Object.assign({}, buttonStyle, btnColor, defaultBtn, imgBtnSLC)
          return (
            <div key={key} className={`column ${size}`} style={{padding: 7}} onClick={bountItemClick}>
              <div className={!blank ? !imgUrl ? 'box' : '' : ''} style={finalBtnStyle}>
                {imgUrl
                  ? <img style={{height: 40}} src={require(`../assets/card-${imgUrl}.png`)} />
                  : <p className='has-text-centered' style={{alignItems: 'center'}}>
                    <strong style={lblColor}>
                      {isActive ? btnLbl : ''}
                    </strong>
                  </p>
                }
              </div>
            </div>
          )
        })
      }
    </div>
  )
}

POSButtons.defaultProps = {
  buttonStyle: {
    height: 98,
    padding: 10
  },
  containerStyle: {},
  onClickButton: (name) => { console.log('name', name) }
}

export default POSButtons
