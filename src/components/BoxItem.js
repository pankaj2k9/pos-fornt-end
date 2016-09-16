import React from 'react'

import { FormattedMessage } from 'react-intl'

const BoxItem = (props) => {
  const {
    title,
    desc,
    image,
    button
  } = props

  return (
    <div className='box' style={{padding: 10}}>
      <article className='media'>
        <div className='media-left'>
          <figure className='image is-64x64'>
            {!image.src
              ? !image.icon
                ? null
                : <i className={image.icon} />
              : <img src={image.src} alt='Image' />
            }
          </figure>
        </div>
        <div className='media-content'>
          <div className='content'>
            <div>
              <p className='is-marginless' style={{fontSize: 20}}>
                <strong> {title.main} </strong>
                <small className='subtitle'>( {title.alt} )</small>
              </p>
              {!desc
                ? null
                : <p>{desc}</p>
              }
              {props.children}
            </div>
          </div>
          <nav className='level'>
            <div className='level-left' />
            <div className='level-right'>
              <div className='level-item'>
                <a className='button'
                  onClick={button.onClick}>
                  <span className='icon'>
                    <i className='fa fa-eye' />
                  </span>
                  <span><FormattedMessage id={button.name} /></span>
                </a>
              </div>
            </div>
          </nav>
        </div>
      </article>
    </div>
  )
}

export default BoxItem
