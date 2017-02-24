import React, { Component } from 'react'
import { connect } from 'react-redux'
import { FormattedMessage } from 'react-intl'

import AccountUserAndPw from '../components/AccountUserAndPw'
import AccountChangePw from '../components/AccountChangePw'

import {
  accountChangePwToggleView,
  accountChangePwOldPwSetValue,
  accountChangePwNewPwSetValue,
  accountChangePwConfirmPwSetValue,
  accountChangePw,
  accountChangePwClearMessages,
  accountChangePwFailure
} from '../actions/settings'

class Account extends Component {
  componentWillUnmount () {
    const { dispatch } = this.props

    dispatch(accountChangePwClearMessages())
    dispatch(accountChangePwConfirmPwSetValue(''))
    dispatch(accountChangePwNewPwSetValue(''))
    dispatch(accountChangePwOldPwSetValue(''))
  }

  handleToggleChangePwView (event) {
    event.preventDefault()
    const { dispatch } = this.props

    dispatch(accountChangePwClearMessages())
    dispatch(accountChangePwToggleView())
    dispatch(accountChangePwConfirmPwSetValue(''))
    dispatch(accountChangePwNewPwSetValue(''))
    dispatch(accountChangePwOldPwSetValue(''))
  }

  handleOldPwChange (event) {
    event.preventDefault()
    const { dispatch } = this.props

    dispatch(accountChangePwOldPwSetValue(event.target.value))
  }

  handleNewPwChange (event) {
    event.preventDefault()
    const { dispatch } = this.props

    dispatch(accountChangePwNewPwSetValue(event.target.value))
  }

  handleConfirmPwChange (event) {
    event.preventDefault()
    const { dispatch } = this.props

    dispatch(accountChangePwConfirmPwSetValue(event.target.value))
  }

  handleChangePw (event) {
    event.preventDefault()
    const { dispatch, staff, oldPw, newPw, confirmPw } = this.props

    if (newPw !== confirmPw) {
      dispatch(accountChangePwFailure('app.page.settings.changePwDoNotMatch'))
    } else if (newPw.length < 3) {
      dispatch(accountChangePwFailure('app.page.settings.changePwMin3Chars'))
    } else {
      dispatch(accountChangePw(staff.id, newPw, oldPw))
    }
  }

  handleClearMessages (event) {
    event.preventDefault()
    const { dispatch } = this.props

    dispatch(accountChangePwClearMessages())
  }

  render () {
    const {
      intl,
      staff,
      isChangePwActive,
      isChangingPw,
      oldPw,
      newPw,
      confirmPw,
      successMessage,
      errorMessage
    } = this.props

    const successNotify = successMessage ? (
      <span className='help is-success'>
        <FormattedMessage id={successMessage} />
      </span>
    ) : null
    const errorNotify = errorMessage ? (
      <span className='help is-danger'>
        <FormattedMessage id={errorMessage} />
      </span>
    ) : null

    return (
      <div className='container'>
        <div className='columns'>
          <div className='column'>
            <h1 className='title'>
              <FormattedMessage id='app.page.settings.account' />
            </h1>
          </div>
        </div>

        <div className='columns'>
          <div className='column'>
            <p className='subtitle'>
              <FormattedMessage id='app.page.settings.usernameAndPw' />
            </p>
          </div>
        </div>

        <div className='columns'>
          <div className='column'>
            {isChangePwActive
              ? <AccountChangePw
                intl={intl}
                isChangingPw={isChangingPw}
                oldPw={oldPw}
                newPw={newPw}
                confirmPw={confirmPw}
                errorMessage={errorMessage}
                onChangePw={this.handleChangePw.bind(this)}
                onOldPwChange={this.handleOldPwChange.bind(this)}
                onNewPwChange={this.handleNewPwChange.bind(this)}
                onConfirmPwChange={this.handleConfirmPwChange.bind(this)}
                onToggleChangePwView={this.handleToggleChangePwView.bind(this)}
              />
              : <AccountUserAndPw
                staff={staff}
                onToggleChangePwView={this.handleToggleChangePwView.bind(this)} />
            }
          </div>
        </div>

        <div className='columns'>
          <div className='column'>
            {successNotify}
            {errorNotify}
          </div>
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    staff: state.mainUI.activeStaff,
    isChangePwActive: state.settings.account.isChangePwActive,
    isChangingPw: state.settings.account.isChangingPw,
    oldPw: state.settings.account.oldPw,
    newPw: state.settings.account.newPw,
    confirmPw: state.settings.account.confirmPw,
    successMessage: state.settings.account.successMessage,
    errorMessage: state.settings.account.errorMessage
  }
}

export default connect(mapStateToProps)(Account)
