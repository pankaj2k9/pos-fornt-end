import React from 'react'

const Level = (props) => {
  const {
    leftSide,
    center,
    rightSide
  } = props

  return (
    <nav className='level is-marginless'>
      <div className='level-left'>
        <div className='level-item'>
          {leftSide}
        </div>
      </div>
      {center
        ? <div className='level-right'>
          <div className='level-item'>
            {center}
          </div>
        </div>
        : null
      }
      <div className='level-right'>
        <div className='level-item'>
          {rightSide}
        </div>
      </div>
    </nav>
  )
}

Level.defaultProps = {
  leftSide: '',
  center: '',
  rightSide: ''
}

export default Level
