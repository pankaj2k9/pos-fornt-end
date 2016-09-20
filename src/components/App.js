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
import { onLogout } from '../actions/helpers'
import '../assets/logo-horizontal.png' // navbar logo

class App extends React.Component {

  componentDidMount () {
    document.getElementById('appSection').style.overflowY = 'hidden'
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
        <section id='appSection' className='section' style={{padding: 10}}>
          <div style={{paddingLeft: 15, paddingRight: 15}}>
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
