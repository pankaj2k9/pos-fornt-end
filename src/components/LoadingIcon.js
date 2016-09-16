import React from 'react'

const LoadingIcon = ({ iconSize }) => {
  const iconClass = `icon is-${iconSize}`

  return (
    <span className={iconClass}>
      <i className='fa fa-cog fa-spin' />
    </span>
  )
}

export default LoadingIcon
