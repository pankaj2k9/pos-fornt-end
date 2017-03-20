import React from 'react'

import { connect } from 'react-redux'
// import { browserHistory } from 'react-router'

import { injectIntl, FormattedMessage } from 'react-intl'

import NavBar from './NavBar'
import ModalApp from '../containers/ModalApp'

import {
  hamburgerToggle,
  setActiveModal,
  resetStaffState,
  toggleNetworkStatus,
  togglePosMode,
  resetErrorState
} from '../actions/app/mainUI'

import { logout } from '../actions/login'
import { onLogout } from '../actions/helpers'

import '../assets/logo-horizontal.png' // navbar logo

class App extends React.Component {
  componentWillMount () {
    const { dispatch } = this.props
    dispatch(resetErrorState())
  }

  componentDidMount () {
    const { dispatch } = this.props
    window.addEventListener('offline', (e) => { dispatch(toggleNetworkStatus('offline')) })
    window.addEventListener('online', (e) => { dispatch(toggleNetworkStatus('online')) })
  }

  hideNetStat () {
    const { dispatch, networkStatus, posMode } = this.props
    var d = document.getElementById('netStat')
    d.className += ' is-hidden-widescreen is-hidden-tablet'
    if (posMode === 'online' && networkStatus === 'offline') {
      dispatch(togglePosMode('offline'))
    }
  }

  _logout () {
    const { dispatch } = this.props
    dispatch(logout())
    dispatch(onLogout())
  }

  _logoutCashier () {
    const { dispatch } = this.props
    dispatch(resetStaffState())
  }

  _chooseUser () {
    const { dispatch } = this.props
    dispatch(setActiveModal('chooseUser'))
  }

  _hamburgerToggle () {
    const { dispatch } = this.props
    dispatch(hamburgerToggle())
  }

  render () {
    const {
      isHamburgerOpen,
      location,
      authProcessing,
      networkStatus,
      posMode,
      staff,
      activeCashier,
      adminToken
    } = this.props

    const shouldShowNavCtrl = location.pathname !== '/'
    const userLogedIn = staff === null ? 'Please Login' : staff
    let hideNetStat
    if (networkStatus === 'online' && posMode === 'online') {
      hideNetStat = 'is-hidden-widescreen is-hidden-tablet'
    } else if (networkStatus === 'online' && posMode === 'offline') {
      hideNetStat = 'is-success'
    } else if (networkStatus === 'offline' && posMode === 'online') {
      hideNetStat = 'is-warning'
    } else if (networkStatus === 'online' && posMode === 'offline') {
      hideNetStat = 'is-hidden-widescreen is-hidden-tablet'
    } else if (networkStatus === 'offline' && posMode === 'offline') {
      hideNetStat = 'is-hidden-widescreen is-hidden-tablet'
    }
    return (
      <div>
        <NavBar isHamburgerOpen={isHamburgerOpen}
          shouldShowControls={shouldShowNavCtrl}
          posMode={posMode}
          onLogout={this._logout.bind(this)}
          onLogoutCashier={this._logoutCashier.bind(this)}
          onHamburgerToggle={this._hamburgerToggle.bind(this)}
          staff={userLogedIn}
          activeCashier={activeCashier}
          adminToken={adminToken}
          authProcessing={authProcessing}
          openChooseUser={this._chooseUser.bind(this)} />
        <div id='netStat' className={`notification ${hideNetStat}`} style={{height: 30, padding: 3, margin: 0}}>
          <article className='media is-marginless'>
            <div className='media-left' />
            <div className='media-content'>
              <div className='content has-text-centered'>
                <p><span className='icon'><i className={`fa fa-${networkStatus === 'online' ? 'check' : 'exclamation'}-circle`} /></span>
                  {networkStatus === 'offline'
                    ? <FormattedMessage id='app.error.noNetwork' />
                    : <FormattedMessage id='app.ph.connected' />
                  }
                  <a className onClick={this.hideNetStat.bind(this)}>
                    <strong style={{color: 'black', textDecoration: 'underline'}}>
                      {posMode === 'online' && networkStatus === 'offline'
                        ? <FormattedMessage id='app.button.switchToOffline' />
                        : <FormattedMessage id='app.button.hideBar' />
                      }
                    </strong>
                  </a>
                </p>
              </div>
            </div>
          </article>
        </div>
        <section id='appSection' className='section' style={{padding: 10}}>
          <div className='is-clearfix' style={{paddingLeft: 15, paddingRight: 15}}>
            {this.props.children}
          </div>
        </section>
        <ModalApp currentPath={location.pathname} />
      </div>
    )
  }
}

function mapStateToProps (state) {
  let mainUI = state.app.mainUI
  let activeDrawer = mainUI.posMode === 'online'
    ? state.app.mainUI.activeDrawer
    : state.app.mainUI.activeDrawerOffline
  return {
    intl: state.intl,
    isHamburgerOpen: mainUI.isHamburgerOpen,
    networkStatus: mainUI.networkStatus,
    posMode: mainUI.posMode,
    staff: mainUI.activeStaff,
    storeId: mainUI.storeId,
    shouldUpdate: mainUI.shouldUpdate,
    error: mainUI.error,
    activeModalId: mainUI.activeModalId,
    activeDrawer,
    activeCashier: mainUI.activeCashier,
    adminToken: mainUI.adminToken,
    authProcessing: state.login.isProcessing
  }
}

export default connect(mapStateToProps)(injectIntl(App))
