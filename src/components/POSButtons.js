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
    flexDirection: 'column',
    boxSizinig: 'border-box'
  }

  let imgBtn = { height: 40 }

  function onHover (key) { document.getElementById(key).style.borderColor = '#b5b5b5' }
  function onHoverOut (key) { document.getElementById(key).style.borderColor = 'transparent' }
  function onPress (key) {
    document.getElementById(key).style.borderColor = '#b5b5b5'
    document.getElementById(key).style.opacity = '0.5'
  }
  function onRelease (key) {
    document.getElementById(key).style.borderColor = 'transparent'
    document.getElementById(key).style.opacity = '1'
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
            altLbl,
            name,
            size
          } = button
          let btnKey = `posBtn${key}-${name}`
          let invertColor = {borderWidth: 5, borderColor: String(colors[color || 'blue']), borderStyle: 'double'}
          let normalColor = {backgroundColor: String(colors[color])}
          let imgBtnSLC = imgUrl ? inverted ? {opacity: 1} : {} : {}
          let btnColor = color
            ? inverted ? invertColor : normalColor
            : {}
          let lblColor = inverted ? {textShadow: `1px 1px 5px ${colors[color]}`} : {}
          let bountItemClick = isActive ? onClickButton.bind(this, name) : (name) => {}
          let btnLbl = !imgUrl
            ? label.match('app') ? <FormattedMessage id={label} /> : label
            : imgUrl
          let finalBtnStyle = imgUrl
            ? Object.assign({}, buttonStyle, btnColor, imgBtn, imgBtnSLC, {flexGrow: 1, boxSizinig: 'border-box', borderStyle: 'outset', borderColor: 'transparent'})
            : Object.assign({}, buttonStyle, btnColor, defaultBtn, imgBtnSLC, {flexGrow: 1, boxSizinig: 'border-box', borderStyle: 'outset', borderColor: 'transparent'})
          return (
            <div key={key} className={`column ${size}`} style={{padding: 7, display: 'flex', flexGrow: 1}} onClick={bountItemClick}>
              <div id={btnKey} className={!blank ? !imgUrl ? 'box' : '' : ''} style={finalBtnStyle}
                onMouseOver={e => onHover(btnKey)} onMouseOut={e => onHoverOut(btnKey)}
                onTouchStart={e => onPress(btnKey)} onTouchEnd={e => onRelease(btnKey)}>
                {imgUrl
                  ? <img style={{height: 40}} src={require(`../assets/card-${imgUrl}.png`)} />
                  : <div className='has-text-centered' style={{alignItems: 'center'}}>
                    <strong style={lblColor}>
                      {isActive ? btnLbl : ''}
                    </strong>
                    {isActive && altLbl ? <p>{altLbl}</p> : null}
                  </div>
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
    padding: 10,
    fontSize: 18
  },
  containerStyle: {},
  onClickButton: () => {}
}

export default POSButtons
