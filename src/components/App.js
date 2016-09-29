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
  setCashdrawerFailure
} from '../actions/application'

import { logout } from '../actions/login'
import { onLogout } from '../actions/helpers'
import '../assets/logo-horizontal.png' // navbar logo

class App extends React.Component {

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

  renderCashDrawerModal () {
    const { activeModalId, intl, error, shouldUpdate } = this.props
    let active = activeModalId === 'updateCashDrawer' ? 'is-active' : ''
    return (
      active === 'is-active'
      ? <div id='updateCashDrawer' className={`modal ${active}`}>
        <div className='modal-background' />
        <div className='modal-card'>
          <header className='modal-card-head'>
            <div className='modal-card-title is-marginless has-text-centered'>
              <h1 className='title'>Cash Drawer</h1>
            </div>
          </header>
          <div className='modal-card-body'>
            <div className='content has-text-centered'>
              <h1 className='title' style={{color: 'red'}}>
                <FormattedMessage id='app.general.cashDrawerEmpty' />
              </h1>
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
                <form autoComplete={false} onSubmit={this.updateCashdrawer.bind(this)}>
                  <div className='control is-expanded'>
                    <input id='cashdrawerAmount' className='input is-large' type='number'
                      placeholder={intl.formatMessage({ id: 'app.general.setCashAmount' })} />
                  </div>
                  <div className='control'>
                    <input id='storePinCode2' className='input is-large' type='password'
                      placeholder={intl.formatMessage({ id: 'app.ph.storePin' })} />
                  </div>
                </form>
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

  render () {
    const { isHamburgerOpen, location, isLoggingOut,
            staff, activeCashier, adminToken } = this.props
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
        {
          this.renderCashDrawerModal()
        }
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
