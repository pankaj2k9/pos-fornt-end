import React from 'react'

const Level = (props) => {
  const {
    left,
    center,
    right,
    action,
    button,
    buttonIcon
  } = props
  return (
    <div className='level is-marginless is-mobile'>
      {left !== null || undefined
        ? <div className={'level-left is-marginless'} style={{width: 180}}>
          {left}
        </div>
        : null
      }
      {center !== null || undefined
        ? <div className='level-item has-text-centered is-fullwidth' style={{justifyContent: 'center'}}>
          <center>
            {center}
          </center>
        </div>
        : null
      }
      {right !== null || undefined
        ? <div className='level-right' style={{maxHeight: 27}}>
          {button
            ? <button onClick={action} className='button is-link'>
              <span className='icon'><i className={buttonIcon} /></span>
              <span>{button}</span>
            </button>
            : null
          }
          <div style={{padding: 5}}>
            {right}
          </div>
        </div>
        : null
      }
    </div>
  )
}

export default Level
