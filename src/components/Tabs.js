import React from 'react'
import { FormattedMessage } from 'react-intl'

const Tabs = (props) => {
  const {
    activeLink,
    links,
    onClick,
    type
  } = props
  var intFrameHeight = window.innerHeight
  var width = type === 'is-toggle' ? {width: intFrameHeight / 2} : {}
  return (
    <div className={`tabs ${type}`}>
      <ul className='is-marginless' style={width}>
        {
          links.map(function (link, key) {
            var active = activeLink === link.value ? 'is-active' : ''
            let boundItemClick = onClick.bind(this, link.value)
            return (
              <li key={key} className={`is-marginless ${active}`}>
                <a type='submit' onClick={boundItemClick}>
                  <span><FormattedMessage id={link.name} /></span>
                </a>
              </li>
            )
          }, this)
        }
      </ul>
    </div>
  )
}

export default Tabs
