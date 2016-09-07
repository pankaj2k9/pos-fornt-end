import React from 'react'
import { connect } from 'react-redux'
import { browserHistory } from 'react-router'

import NavBar from './NavBar'

import {
  hamburgerToggle,
  setActiveModal,
  resetStaffState
} from '../actions/application'

import { logout } from '../actions/login'
import '../assets/logo-horizontal.png' // navbar logo

class App extends React.Component {
  handleHamburgerToggle () {
    const { dispatch } = this.props
    dispatch(hamburgerToggle())
  }

  handleLogout () {
    const { dispatch } = this.props
    dispatch(logout(browserHistory))
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
        <section className='section' style={{padding: 10}}>
          <div className='container'>
            {this.props.children}
          </div>
        </section>
      </div>
    )
  }
}

function mapStateToProps (state) {
  return {
    isHamburgerOpen: state.application.isHamburgerOpen,
    staff: state.application.staff,
    activeCashier: state.application.activeCashier,
    adminToken: state.application.adminToken,
    isLoggingOut: state.login.isLoggingOut
  }
}

export default connect(mapStateToProps)(App)
