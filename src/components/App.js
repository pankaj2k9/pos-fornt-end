import React from 'react'
import { connect } from 'react-redux'
import { browserHistory } from 'react-router'

import { injectIntl, FormattedMessage } from 'react-intl'

import NavBar from './NavBar'

import {
  hamburgerToggle,
  setActiveModal,
  resetStaffState,
  validateAndUpdateCashdrawer,
  setCashdrawerFailure,
  setCashierLoggedIn,
  authCashierStaff
} from '../actions/application'

import { verifyStorePin } from '../actions/settings'

import { logout } from '../actions/login'
import { onLogout } from '../actions/helpers'
import '../assets/logo-horizontal.png' // navbar logo

class App extends React.Component {

  componentWillMount () {
    const { dispatch, location } = this.props
    var currentLocation = location.pathname
    if (currentLocation === '/') {
      dispatch(logout(browserHistory))
      dispatch(onLogout())
    }
  }

  componentDidUpdate () {
    const { activeCashier, activeCashdrawer, activeModalId, shouldUpdate } = this.props
    if (!activeCashdrawer || activeCashdrawer.initialAmount > 0) {
      if (activeModalId === 'verifyStaff' && activeCashier && !shouldUpdate) {
        document.getElementById('staffPassword').focus()
      }
    }
  }

  handleHamburgerToggle () {
    const { dispatch } = this.props
    dispatch(hamburgerToggle())
  }

  handleLogout () {
    const { dispatch } = this.props
    dispatch(logout(browserHistory))
    dispatch(onLogout())
  }

  handleLogoutCashier () {
    const { dispatch } = this.props
    dispatch(resetStaffState())
  }

  close () {
    const {dispatch} = this.props
    dispatch(setActiveModal(''))
  }

  onChange (staffId) {
    const {dispatch, staff} = this.props
    let staffs = staff.data.staffs
    for (var i = 0; i < staffs.length; i++) {
      if (staffs[i].id === staffId) {
        dispatch(setCashierLoggedIn(staffs[i]))
      }
    }
  }

  activeCashier () {
    const { intl, activeCashier } = this.props
    let active = activeCashier === null
      ? intl.formatMessage({id: 'app.general.chooseUser'})
      : intl.formatMessage({id: 'app.ph.youChoose'}) + activeCashier.username
    return active
  }

  verifyStaff (event) {
    event.preventDefault()
    const {dispatch, activeCashier} = this.props
    let staffData = {
      username: activeCashier.username,
      password: document.getElementById('staffPassword').value
    }
    dispatch(authCashierStaff(staffData))
  }

  openChooseUserModal () {
    const { dispatch } = this.props
    dispatch(resetStaffState())
    dispatch(setActiveModal('verifyStaff'))
  }

  updateCashdrawer (event) {
    event.preventDefault()
    const {dispatch, staff, storeId, activeCashdrawer} = this.props
    var amountToAdd = Number(document.getElementById('cashdrawerAmount').value)
    let query = {
      query: {
        store: storeId,
        pinCode: document.getElementById('storePinCode2').value
      }
    }
    let data = {
      date: activeCashdrawer.date,
      amount: amountToAdd
    }
    if (amountToAdd <= 0 || isNaN(amountToAdd)) {
      dispatch(setCashdrawerFailure('You have entered an invalid amount'))
    } else {
      dispatch(validateAndUpdateCashdrawer(query, staff, data))
    }
  }

  onClickVerifyPin (event) {
    event.preventDefault()
    const {dispatch, storeId, activeCashier, staff} = this.props
    let query = {
      query: {
        store: storeId,
        pinCode: document.getElementById('storePinCode').value
      }
    }
    let staffName = !activeCashier ? staff : activeCashier
    dispatch(verifyStorePin(query, staffName))
  }

  openCashdrawerModal () {
    const {dispatch} = this.props
    dispatch(setActiveModal('updateCashDrawer'))
  }

  renderCashDrawerModal () {
    const { activeModalId, intl, error, shouldUpdate } = this.props
    let active = activeModalId === 'updateCashDrawer' ? 'is-active' : ''
    var currentLocation = this.props.location.pathname
    return (
      active === 'is-active'
      ? <div id='updateCashDrawer' className={`modal ${active}`}>
        <div className='modal-background' />
        <div className='modal-card'>
          <header className='modal-card-head'>
            <div className='modal-card-title is-marginless has-text-centered'>
              <h1 className='title'>Cash Drawer</h1>
            </div>
            {currentLocation === '/settings'
              ? <button className='delete' onClick={this.close.bind(this)} />
              : null
            }
          </header>
          <div className='modal-card-body'>
            <div className='content has-text-centered'>
              {currentLocation === '/settings'
                ? null
                : <h1 className='title' style={{color: 'red'}}>
                  <FormattedMessage id='app.general.cashDrawerEmpty' />
                </h1>
              }
              <p className='subtitle'>
                <FormattedMessage id='app.general.updateCashDrawer' />
              </p>
              {!error
                ? null
                : <p className='subtitle' style={{color: 'red'}}>
                  {error}
                </p>
              }
              <div>
                <div className='control is-expanded'>
                  <form autoComplete='off'>
                    <input id='cashdrawerAmount' className='input is-large' type='number'
                      placeholder={intl.formatMessage({ id: 'app.general.setCashAmount' })} />
                  </form>
                </div>
                <div className='control'>
                  <form autoComplete='off' onSubmit={this.updateCashdrawer.bind(this)}>
                    <input id='storePinCode2' className='input is-large' type='password'
                      placeholder={intl.formatMessage({ id: 'app.ph.storePin' })} />
                  </form>
                </div>
              </div>
              <div className='columns' style={{margin: 20}}>
                <div className='column is-6 is-offset-3'>
                  {!shouldUpdate
                    ? <a className='button is-large is-fullwidth is-success'
                      onClick={this.updateCashdrawer.bind(this)} >
                      <FormattedMessage id='app.button.confirm' />
                    </a>
                    : <a className='button is-large is-fullwidth is-success is-disabled'>
                      <p className='has-text-centered'>
                        <i className='fa fa-spinner fa-pulse fa-fw' />
                      </p>
                    </a>
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      : null
    )
  }

  chooseUserModal () {
    const {intl, activeModalId, staff,
           activeCashier, shouldUpdate, error} = this.props
    const active = activeModalId === 'verifyStaff' ? 'is-active' : ''
    return (
      <div id='verifyStaff' className={`modal ${active}`}>
        <div className='modal-background' />
        <div className='modal-card'>
          <header className='modal-card-head'>
            <div className='modal-card-title is-marginless has-text-centered'>
              <h1 className='title'><FormattedMessage id='app.button.logCashier' /></h1>
            </div>
            <button className='delete' onClick={this.close.bind(this)} />
          </header>
          <div className='modal-card-body'>
            {shouldUpdate
              ? <div className='content has-text-centered'>
                <h1 className='subtitle'>
                  <FormattedMessage id='app.general.verifyingStaff' />
                </h1>
                <p className='has-text-centered'>
                  <i className='fa fa-spinner fa-pulse fa-2x fa-fw' />
                </p>
                <div />
              </div>
              : <div>
                <div className='content has-text-centered'>
                  {!error
                    ? null
                    : <p className='subtitle'>
                      {error}
                    </p>
                  }
                  <div className='control is-horizontal'>
                    <div className='control'>
                      <span className='select is-large is-fullwidth'>
                        <select
                          onChange={e => this.onChange(e.target.value)}
                          value={this.activeCashier()}
                          style={{backgroundColor: 'rgba(255,255,255,0.0)'}}>
                          <option>{this.activeCashier()}</option>
                          {staff.data.staffs.map(function (cashier, key) {
                            return (
                              <option key={key} value={cashier.id}>
                                {cashier.username}
                              </option>
                            )
                          }, this)
                          }
                        </select>
                      </span>
                    </div>
                  </div>
                  {!activeCashier
                    ? null
                    : <div>
                      <div className='container'>
                        <form autoComplete='off' onSubmit={this.verifyStaff.bind(this)}>
                          <p className='control is-fullwidth'>
                            <input id='staffPassword' autoComplete='off'
                              className='input is-large' type='password'
                              placeholder={intl.formatMessage({ id: 'app.ph.enterPassword' })} />
                          </p>
                        </form>
                        <hr />
                      </div>
                      <div className='columns'>
                        <p className='column is-6 is-offset-3'>
                          <a className='button is-large is-fullwidth is-success'
                            onClick={this.verifyStaff.bind(this)} >
                            <FormattedMessage id='app.button.verify' />
                          </a>
                        </p>
                      </div>
                    </div>
                  }
                </div>
              </div>
            }
          </div>
        </div>
      </div>
    )
  }

  renderVerifyStorePinCode () {
    const {intl, activeModalId, error, errorMessage, isProcessing} = this.props
    const active = activeModalId === 'verifyStorePin' ? 'is-active' : ''
    return (
      <div id='verifyStorePin' className={`modal ${active}`}>
        <div className='modal-background' />
        <div className='modal-card'>
          <header className='modal-card-head'>
            <div className='modal-card-title is-marginless has-text-centered'>
              <h1 className='title'><FormattedMessage id='app.general.storePin' /></h1>
            </div>
            <button className='delete' onClick={this.close.bind(this)} />
          </header>
          <div className='modal-card-body'>
            <div className='content'>
              {!error
                ? null
                : <p className='subtitle'>
                  {errorMessage}
                </p>
              }
              <p className='subtitle'>
                <FormattedMessage id='app.general.updateCD' />
                <a onClick={this.openCashdrawerModal.bind(this)}>
                  <FormattedMessage id='app.button.clickHere' />
                </a>
              </p>
              <div className='control is-expanded'>
                <form autoComplete={false} onSubmit={this.onClickVerifyPin.bind(this)}>
                  <input id='storePinCode' className='input is-large' type='password'
                    placeholder={intl.formatMessage({ id: 'app.ph.storePin' })} />
                </form>
              </div>
              <div className='columns'>
                <div className='column is-6 is-offset-3'>
                  {!isProcessing
                    ? <a className='button is-large is-fullwidth is-success'
                      onClick={this.onClickVerifyPin.bind(this)}>
                      <FormattedMessage id='app.button.verify' />
                    </a>
                    : <a className='button is-large is-fullwidth is-success is-disabled'>
                      <p className='has-text-centered'>
                        <i className='fa fa-spinner fa-pulse fa-fw' />
                      </p>
                    </a>
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  render () {
    const { isHamburgerOpen, location, isLoggingOut,
            staff, activeCashier, adminToken, activeModalId } = this.props
    const shouldShowNavCtrl = location.pathname !== '/'
    const userLogedIn = staff === null ? 'Please Login' : staff.data

    return (
      <div>
        <NavBar isHamburgerOpen={isHamburgerOpen}
          shouldShowControls={shouldShowNavCtrl}
          onLogout={this.handleLogout.bind(this)}
          onLogoutCashier={this.handleLogoutCashier.bind(this)}
          onHamburgerToggle={this.handleHamburgerToggle.bind(this)}
          staff={userLogedIn}
          activeCashier={activeCashier}
          adminToken={adminToken}
          isLoggingOut={isLoggingOut}
          openChooseUser={this.openChooseUserModal.bind(this)} />
        <section id='appSection' className='section' style={{padding: 10}}>
          <div style={{paddingLeft: 15, paddingRight: 15}}>
            {this.props.children}
          </div>
        </section>
        {this.renderCashDrawerModal()}
        {
          staff && activeModalId === 'verifyStaff'
          ? this.chooseUserModal()
          : null
        }
        {this.renderVerifyStorePinCode()}
      </div>
    )
  }
}

function mapStateToProps (state) {
  return {
    intl: state.intl,
    isHamburgerOpen: state.application.isHamburgerOpen,
    staff: state.application.staff,
    storeId: state.application.storeId,
    shouldUpdate: state.application.shouldUpdate,
    error: state.application.error,
    activeModalId: state.application.activeModalId,
    activeCashdrawer: state.application.activeCashdrawer,
    activeCashier: state.application.activeCashier,
    adminToken: state.application.adminToken,
    isLoggingOut: state.login.isLoggingOut
  }
}

export default connect(mapStateToProps)(injectIntl(App))
