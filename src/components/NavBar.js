import React from 'react'
import { Link } from 'react-router'
import { FormattedMessage } from 'react-intl'
import LanguageToggle from './LanguageToggle'
import CashiersSelector from '../components/CashierSelector'

const NavLink = (props) => {
  return <Link {...props} className='nav-item' activeClassName='is-active' style={{fontSize: 18}} />
}

const NavBar = ({
  isHamburgerOpen,
  onHamburgerToggle,
  shouldShowControls,
  staff,
  activeModalId,
  activeCashier,
  adminToken,
  posMode,
  onLogout,
  onLogoutCashier,
  authProcessing,
  openChooseUser
}) => {
  const toggleClass = isHamburgerOpen ? 'is-active' : null
  // let staffName = !activeCashier
  //   ? null
  //   : `${activeCashier.firstName} ${!activeCashier.lastName ? '' : activeCashier.lastName}`

  const userIconStyle = {
    textAlign: 'center',
    borderWidth: 3,
    borderColor: 'white',
    borderStyle: 'solid',
    borderRadius: 50,
    padding: 5,
    width: 45
  }

  const userNameStyle = {fontSize: 24, lineHeight: 0.7, textAlign: 'left'}

  // Choose staff color
  const STAFF_COLORS = [ 'white', 'red', 'green', 'blue', 'yellow', 'orange', 'turquoise', 'purple' ]
  let colorIndex = 0
  if (staff && staff.staffs) {
    staff.staffs.forEach((st, i) => {
      if (activeCashier && activeCashier.id === st.id) {
        colorIndex = i
      }
    })
  }
  const staffColor = `st-clr-${STAFF_COLORS[colorIndex] || 0}`
  return (
    <div className='is-paddingless'>
      <div className='hero' style={{ backgroundColor: 'black' }}>
        {shouldShowControls
        ? <nav className='nav'>
          <div className='nav-left'>
            <div className='nav-item' style={{padding: 5}}>
              <span style={{margin: 5}}>
                <i className={`fa fa-user fa-2x st-icon ${staffColor}`}
                  style={userIconStyle} />
              </span>
              {staff && staff.role === 'master'
                ? <div />
                : !staff
                  ? null
                  : <p style={userNameStyle}>
                    {`${staff.firstName} ${!staff.lastName ? '' : staff.lastName}`}<br />
                    <em style={{fontSize: 14}}>
                      <FormattedMessage id='app.general.loggedStaff' />
                    </em>
                  </p>
              }
            </div>
            <CashiersSelector />
            <span className='nav-item' style={{ paddingRight: 10 }}>
              <a className={`button is-light is-outlined ${authProcessing
                ? 'is-loading' : null}`}
                onClick={!activeCashier ? onLogout : onLogoutCashier}>
                <span>
                  {!activeCashier
                  ? <FormattedMessage id='app.button.logout' />
                  : <FormattedMessage id='app.button.logoutCashier' />
                  }
                </span>
                <span className='icon'>
                  <i className='fa fa-sign-out' />
                </span>
              </a>
            </span>
          </div>

          <div className='nav-center'>
            <a className='nav-item' style={{maxHeight: 70}}>
              <img src={require('../assets/logo-horizontal.png')} style={{maxHeight: 60}} />
            </a>
          </div>

          <span className={`nav-toggle ${toggleClass}`} onClick={onHamburgerToggle}>
            <span />
            <span />
            <span />
          </span>

          {
            posMode === 'offline' &&
            <NavLink to='/reports'>
              <FormattedMessage id='app.navBar.reports.title' />
            </NavLink>
          }
          {posMode === 'online'
            ? <div className={`nav-right nav-menu ${toggleClass}`}>
              {staff && staff.role === 'master'
                ? <NavLink to='/store'>
                  <FormattedMessage id='app.navBar.store.title' />
                </NavLink>
                : null
              }
              <NavLink to='/settings'>
                <FormattedMessage id='app.navBar.settings.title' />
              </NavLink>
              <NavLink to='/reports'>
                <FormattedMessage id='app.navBar.reports.title' />
              </NavLink>
              <div className='nav-item'>
                <LanguageToggle />
              </div>
            </div>
            : <div className={`nav-right nav-menu ${toggleClass}`}>
              <NavLink to='/store'>
                <FormattedMessage id='app.navBar.offlineStore' />
              </NavLink>
              <div className='nav-item'>
                <LanguageToggle />
              </div>
            </div>
          }
        </nav>
        : <nav className='nav dark'>
          <div className='nav-left'>
            <div className='nav-item'>
              <div className='nav-logo' />
            </div>
          </div>
          <div className='nav-center'>
            <div className='nav-item'>
              <LanguageToggle />
            </div>
            <div className='nav-item'>
              <h1 className='title'>POS</h1>
            </div>
          </div>
        </nav>
      }
      </div>
      <div>
        <chooseUserModal />
      </div>
    </div>
  )
}

export default NavBar
