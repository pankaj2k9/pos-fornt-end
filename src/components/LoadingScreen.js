import React from 'react'

const LoadingScreen = (props) => {
  const {
    loadingText
  } = props

  return (
    <div className='modal is-active'>
      <div className='modal-background' />
      <div className='modal-content'>
        <div className='box has-text-centered' style={{backgroundColor: 'transparent'}}>
          <i className='fa fa-spinner fa-pulse fa-5x fa-fw' style={{color: 'white'}} />
          <h1 className='title is-1' style={{color: 'white'}}>{loadingText}</h1>
        </div>
      </div>
    </div>
  )
}

export default LoadingScreen
