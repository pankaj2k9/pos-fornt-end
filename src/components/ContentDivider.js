import React from 'react'

const ContentDivider = (props) => {
  const {
    containerStyle,
    contents,
    contentStyle,
    offset,
    size
  } = props

  let validatedContents = Array.isArray(contents)
    ? contents
    : [contents]

  let defaultContainerStyle = {width: '100%', padding: 0}
  let customContainerStyle = containerStyle
    ? Object.assign({}, defaultContainerStyle, containerStyle)
    : defaultContainerStyle

  return (
    <div className='columns is-multiline is-mobile is-fullwidth is-marginless' style={customContainerStyle}>
      {offset ? <div className={`column is-${offset}`} /> : null}
      {
        validatedContents.map(function (content, key) {
          return (
            <div key={key} className={`column is-${size} is-paddingless`} style={contentStyle}>
              {content}
            </div>
          )
        })
      }
      {offset ? <div className={`column is-${offset}`} /> : null}
    </div>
  )
}

ContentDivider.defaultProps = {
  containerStyle: {},
  contentStyle: {}
}

export default ContentDivider
