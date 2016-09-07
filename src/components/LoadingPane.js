import React from 'react'

import LoadingIcon from './LoadingIcon'

const LoadingPane = ({ iconSize, headerMessage, subheaderMessage, paneSize, isFetching }) => {
  const header = headerMessage || 'Loading'
  const subheader = subheaderMessage || null
  const size = paneSize || 'is-large'
  iconSize = iconSize || 'large'

  return (
    <div className='container'>
      <div className={`hero ${size}`}>
        <div className='hero-body'>
          <div className='container has-text-centered'>
            {isFetching ? <LoadingIcon iconSize={iconSize} /> : null}
            <div className='content'>
              <p className='title is-3'>{header}</p>
              <p className='subtitle is-5'>{subheader}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoadingPane
