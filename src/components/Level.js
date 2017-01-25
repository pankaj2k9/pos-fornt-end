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
    <nav className='level is-marginless'>
      {left !== null || undefined
        ? <div className={'level-left'} style={{width: 180}}>
          <div className='level-item'>{left}</div>
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
            <div className='level-item has-text-right'>{right}</div>
          </div>
        </div>
        : null
      }
    </nav>
  )
}

export default Level
