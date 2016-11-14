import React from 'react'

const DataListItem = ({ dataName, dataValue, keyStyle, valStyle }) => {
  return (
    <div className='tile data-list'>
      <div className='tile is-parent is-4'>
        <div className='tile is-child'>
          <p className={`${keyStyle || 'title is-5'} has-text-right is-hidden-mobile`}>
            {dataName}
          </p>
          <p className={`${keyStyle || 'title is-5'} is-hidden-tablet`}>{dataName}</p>
        </div>
      </div>
      <div className='tile is-parent is-8'>
        <div className='tile is-child'>
          {typeof dataValue === 'string'
            ? <p className={`${valStyle || 'subtitle is-5'}`}>
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
