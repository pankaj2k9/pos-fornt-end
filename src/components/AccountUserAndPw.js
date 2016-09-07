import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'

export default class AccountUserAndPw extends Component {
  render () {
    const { staff, onToggleChangePwView } = this.props
    const role = staff.role

    return (
      <div className='container'>
        <div className='columns'>
          <div className='column'>
            <p className='subtitle'>
              <strong>{`${staff.username} (${role})`}</strong>
            </p>
          </div>

          <div className='column'>
            {role === 'staff'
              ? <a className='button is-link'
                onClick={onToggleChangePwView}>
                <FormattedMessage id='app.page.settings.changePw' />
              </a>
              : <span className='help'>
                <FormattedMessage id='app.page.settings.changePwInfo1' />
                {role}
                <FormattedMessage id='app.page.settings.changePwInfo2' />
              </span>
            }
          </div>
        </div>
      </div>
    )
  }
}
