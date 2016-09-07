import React from 'react'
import { connect } from 'react-redux'
import LanguageToggleButton from './LanguageToggleButton'

export class ToggleGroup extends React.Component {
  render () {
    return (
      <div className='control has-addons'>
        <LanguageToggleButton isActive={this.props.locale === 'en'} locale='en'>
          ENGLISH
        </LanguageToggleButton>
        <LanguageToggleButton isActive={this.props.locale === 'zh'} locale='zh'>
          CHINESE
        </LanguageToggleButton>
      </div>
    )
  }
}

function mapStateToProps (state) {
  return {
    locale: state.intl.locale
  }
}

export default connect(mapStateToProps)(ToggleGroup)
