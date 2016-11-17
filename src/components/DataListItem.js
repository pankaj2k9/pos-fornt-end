import React from 'react'

const DataListItem = ({ dataName, dataValue, keyClass, valClass, keyStyle, valStyle }) => {
  return (
    <div className='tile data-list'>
      <div className='tile is-parent is-4'>
        <div className='tile is-child'>
          <p className={`${keyClass || 'title is-5'} has-text-right is-hidden-mobile`}
            style={keyStyle}>
            {dataName}
          </p>
          <p className={`${keyClass || 'title is-5'} is-hidden-tablet`}
            style={keyStyle}>
            {dataName}
          </p>
        </div>
      </div>
      <div className='tile is-parent is-8'>
        <div className='tile is-child'>
          {typeof dataValue === 'string'
            ? <p className={`${valClass || 'subtitle is-5'}`} style={valStyle}>
              {dataValue}
            </p>
            : dataValue
          }
        </div>
      </div>
    </div>
  )
}

export default DataListItem
