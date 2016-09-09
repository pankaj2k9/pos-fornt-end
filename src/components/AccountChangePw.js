import React, { Component } from 'react'
import { FormattedMessage, injectIntl } from 'react-intl'

class AccountChangePw extends Component {
  render () {
    const {
      intl,
      isChangingPw,
      oldPw,
      newPw,
      confirmPw,
      errorMessage,
      onChangePw,
      onOldPwChange,
      onNewPwChange,
      onConfirmPwChange,
      onToggleChangePwView
    } = this.props

    const btnBusy = isChangingPw ? 'is-loading' : ''
    const inputDisabled = isChangingPw
    const hasError = !!errorMessage

    return (
      <form className='form' onSubmit={onChangePw}>
        <label className='label'>
          <FormattedMessage id={'app.page.settings.oldPw'} />
        </label>
        <p className='control has-icon'>
          <input className={`input ${hasError ? 'is-danger' : ''}`}
            autofocus
            type='password'
            placeholder={intl.formatMessage({ id: 'app.page.settings.oldPw' })}
            disabled={inputDisabled}
            onChange={onOldPwChange}
            value={oldPw}
          />
          <i className='fa fa-lock'></i>
        </p>

        <label className='label'>
          <FormattedMessage id={'app.page.settings.newPw'} />
        </label>
        <p className='control has-icon'>
          <input className={`input ${hasError ? 'is-danger' : ''}`}
            autofocus
            type='password'
            placeholder={intl.formatMessage({ id: 'app.page.settings.newPw' })}
            disabled={inputDisabled}
            onChange={onNewPwChange}
            value={newPw}
          />
          <i className='fa fa-lock'></i>
        </p>

        <p className='control has-icon'>
          <input className={`input ${hasError ? 'is-danger' : ''}`}
            type='password'
            placeholder={intl.formatMessage({ id: 'app.page.settings.confirmPw' })}
            disabled={inputDisabled}
            onChange={onConfirmPwChange}
            value={confirmPw}
          />
          <i className='fa fa-lock'></i>
        </p>

        <div className='control is-grouped'>
          <p className='control'>
            <button className='button'
              disabled={inputDisabled}
              onClick={onToggleChangePwView}>
              <FormattedMessage id='app.button.cancel' />
            </button>
          </p>

          <p className='control'>
            <button className={`button is-primary ${btnBusy}`} type='submit'>
              <FormattedMessage id='app.page.settings.changePw' />
            </button>
          </p>
        </div>
      </form>
    )
  }
}

export default injectIntl(AccountChangePw)
