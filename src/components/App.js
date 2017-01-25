import React from 'react'

import { connect } from 'react-redux'
import { browserHistory } from 'react-router'

import { injectIntl, FormattedMessage } from 'react-intl'

import NavBar from './NavBar'

import SyncModal from '../components/SyncModal'

import {
  hamburgerToggle,
  setActiveModal,
  closeActiveModal,
  resetStaffState,
  updateCashDrawer,
  setCashdrawerFailure,
  setCashierLoggedIn,
  toggleNetworkStatus,
  togglePosMode
} from '../actions/application'

import { verifyStorePin } from '../actions/settings'

import {
  syncOfflineOrders,
  clearMessages
} from '../actions/offlineOrders'

import { logout } from '../actions/login'
import { onLogout } from '../actions/helpers'
import '../assets/logo-horizontal.png' // navbar logo

class App extends React.Component {
  componentDidMount () {
    const {dispatch} = this.props
    window.addEventListener('offline', (e) => { dispatch(toggleNetworkStatus('offline')) })
    window.addEventListener('online', (e) => { dispatch(toggleNetworkStatus('online')) })
  }

  // componentWillMount () {
  //   const { dispatch, location } = this.props
  //   var currentLocation = location.pathname
  //   if (currentLocation === '/') {
  //     dispatch(logout(browserHistory))
  //     dispatch(onLogout())
  //   }
  // }

  handleHamburgerToggle () {
    const { dispatch } = this.props
    dispatch(hamburgerToggle())
  }

  changePosMode () {
    const { dispatch, posMode } = this.props
    const mode = posMode === 'online' ? 'offline' : 'online'
    dispatch(togglePosMode(mode))
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
    const {dispatch, activeModalId} = this.props
    dispatch(closeActiveModal())
    if (activeModalId === 'syncModal') {
      dispatch(clearMessages())
    }
  }

  syncOrders () {
    const {dispatch, processedOfflineOrders, failedOrders} = this.props
    const allOfflineOrders = failedOrders.length > 0
      ? processedOfflineOrders.concat(failedOrders)
      : processedOfflineOrders
    dispatch(syncOfflineOrders(allOfflineOrders))
  }

  onChange (staffId) {
    const {dispatch, staff} = this.props
    let staffs = staff.user.staffs
    for (var i = 0; i < staffs.length; i++) {
      if (staffs[i].id === staffId) {
        dispatch(setCashierLoggedIn(staffs[i]))
        dispatch(closeActiveModal())
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

  openChooseUserModal () {
    const { dispatch } = this.props
    dispatch(setActiveModal('verifyStaff'))
  }

  // updateCashdrawer (event) {
  //   event.preventDefault()
  //   const {dispatch, staff, storeId, activeCashdrawer} = this.props
  //   var amountToAdd = Number(document.getElementById('cashdrawerAmount').value)
  //   let query = {
  //     query: {
  //       store: storeId,
  //       pinCode: document.getElementById('storePinCode2').value
  //     }
  //   }
  //   let data = {
  //     date: activeCashdrawer.date,
  //     amount: amountToAdd,
  //     count: Number(activeCashdrawer.cashDrawerOpenCount) + 1
  //   }
  //   if (amountToAdd <= 0 || isNaN(amountToAdd)) {
  //     dispatch(setCashdrawerFailure('You have entered an invalid amount'))
  //   } else {
  //     dispatch(validateAndUpdateCashdrawer(query, staff, data))
  //   }
  // }

  updateCashdrawer (event) {
    event.preventDefault()
    const {dispatch, staff, activeCashdrawer, posMode} = this.props
    var amountToAdd = Number(document.getElementById('cashdrawerAmount').value)
    const receipt = {
      info: {
        date: new Date(),
        staff: `${staff.lastName || ''}, ${staff.firstName || ''}`
      },
      footerText: ['No sales']
    }
    let data = {
      id: activeCashdrawer.id,
      posMode: posMode,
      date: activeCashdrawer.date,
      float: amountToAdd,
      count: Number(activeCashdrawer.cashDrawerOpenCount) + 1
    }
    if (amountToAdd <= 0 || isNaN(amountToAdd)) {
      dispatch(setCashdrawerFailure('You have entered an invalid amount'))
    } else {
      dispatch(updateCashDrawer(data, receipt))
    }
  }

  onClickVerifyPin (event) {
    event.preventDefault()
    const {dispatch, storeId, activeCashier, activeCashdrawer, staff} = this.props
    let query = {
      query: {
        store: storeId,
        pinCode: document.getElementById('storePinCode').value
      }
    }
    let data = {count: Number(activeCashdrawer.cashDrawerOpenCount) + 1}
    let staffName = !activeCashier ? staff : activeCashier
    dispatch(verifyStorePin(query, staffName, data))
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
                  <form autoComplete='off' onSubmit={this.updateCashdrawer.bind(this)}>
                    <input id='cashdrawerAmount' className='input is-large' type='number'
                      placeholder={intl.formatMessage({ id: 'app.general.setCashAmount' })} />
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
    const { activeModalId, staff, error } = this.props
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
                      {staff.user.staffs.map(function (cashier, key) {
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
            </div>
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

  renderSyncModal () {
    const { failedOrders, processedOfflineOrders, successOrders, syncIsProcessing, syncSuccess } = this.props
    return (
      <SyncModal
        isProcessing={syncIsProcessing}
        syncSuccess={syncSuccess}
        failedOrders={failedOrders}
        offlineOrders={processedOfflineOrders}
        successOrders={successOrders}
        onSync={this.syncOrders.bind(this)}
        onClose={this.close.bind(this)} />
    )
  }

  renderModal () {
    const { activeModalId, staff } = this.props
    switch (activeModalId) {
      case 'updateCashDrawer':
        return this.renderCashDrawerModal()
      case 'verifyStaff':
        if (staff) { return this.chooseUserModal() }
        break
      case 'verifyStorePin':
        return this.renderVerifyStorePinCode()
      case 'syncModal':
        return this.renderSyncModal()
      default:
        return null
    }
  }

  render () {
    const { isHamburgerOpen, location, isLoggingOut, networkStatus, posMode,
            staff, activeCashier, adminToken } = this.props
    const shouldShowNavCtrl = location.pathname !== '/'
    const userLogedIn = staff === null ? 'Please Login' : staff.user
    const hideNetStat = networkStatus === 'online'
      ? 'is-hidden-widescreen is-hidden-tablet'
      : posMode === 'offline' ? 'is-hidden-widescreen is-hidden-tablet' : ''
    return (
      <div>
        <NavBar isHamburgerOpen={isHamburgerOpen}
          shouldShowControls={shouldShowNavCtrl}
          posMode={posMode}
          onLogout={this.handleLogout.bind(this)}
          onLogoutCashier={this.handleLogoutCashier.bind(this)}
          onHamburgerToggle={this.handleHamburgerToggle.bind(this)}
          staff={userLogedIn}
          activeCashier={activeCashier}
          adminToken={adminToken}
          isLoggingOut={isLoggingOut}
          openChooseUser={this.openChooseUserModal.bind(this)} />
        <div id='netStat' className={`notification is-warning ${hideNetStat}`} style={{height: 30, padding: 3, margin: 0}}>
          <article className='media is-marginless'>
            <div className='media-left' />
            <div className='media-content'>
              <div className='content has-text-centered'>
                <p><span className='icon'><i className='fa fa-exclamation-circle' /></span>
                  <FormattedMessage id='app.error.noNetwork' /> <a onClick={this.changePosMode.bind(this)}><FormattedMessage id='app.button.switchToOffline' /></a>
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
        {this.renderModal()}
      </div>
    )
  }
}

function mapStateToProps (state) {
  return {
    intl: state.intl,
    isHamburgerOpen: state.application.isHamburgerOpen,
    networkStatus: state.application.networkStatus,
    posMode: state.application.posMode,
    staff: state.application.staff,
    storeId: state.application.storeId,
    shouldUpdate: state.application.shouldUpdate,
    error: state.application.error,
    activeModalId: state.application.activeModalId,
    focusedInput: state.application.focusedInput || state.panelCart.focusedInput,
    activeCashdrawer: state.application.activeCashdrawer,
    activeCashier: state.application.activeCashier,
    adminToken: state.application.adminToken,
    failedOrders: state.offlineOrders.failedOrders,
    successOrders: state.offlineOrders.successOrders,
    processedOfflineOrders: state.offlineOrders.processedOfflineOrders,
    syncIsProcessing: state.offlineOrders.isProcessing,
    syncSuccess: state.offlineOrders.syncSuccess,
    isLoggingOut: state.login.isLoggingOut,
    customerFilter: state.settings.customerFilter
  }
}

export default connect(mapStateToProps)(injectIntl(App))
