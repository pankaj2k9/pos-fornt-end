import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { changeLanguage } from '../actions/intl'

export class ToggleButton extends React.Component {
  render () {
    const active = this.props.isActive ? 'is-active' : 'is-inverted'
    return (
      <a className={`button is-small is-dark is-marginless ${active}`}
        onClick={this.props.onClick.bind(null, this.props.locale)}>
        <span>
          {this.props.children}
        </span>
      </a>
    )
  }
}

ToggleButton.PropTypes = {
  locale: PropTypes.string.isRequired
}

function mapDispatchToProps (dispatch) {
  return {
    onClick: locale => {
      dispatch(changeLanguage(locale))
    }
  }
}

export default connect(null, mapDispatchToProps)(ToggleButton)
