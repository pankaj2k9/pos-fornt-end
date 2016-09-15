import React from 'react'
import { Link } from 'react-router'
import { FormattedMessage } from 'react-intl'
import LanguageToggle from './LanguageToggle'
import Truncate from '../components/Truncate'

const NavLink = (props) => {
  return <Link {...props} className='nav-item' activeClassName='is-active' style={{fontSize: 16}} />
}

const NavBar = ({
  isHamburgerOpen,
  onHamburgerToggle,
  shouldShowControls,
  staff,
  activeModalId,
  activeCashier,
  adminToken,
  onLogout,
  onLogoutCashier,
  isLoggingOut,
  openChooseUser
}) => {
  const toggleClass = isHamburgerOpen ? 'is-active' : null
  let staffName = !activeCashier
    ? null
    : `${activeCashier.firstName} ${activeCashier.lastName}`
  return (
    <div className='hero is-black'>
      <div className='hero-head'>
      {shouldShowControls
        ? <nav className='nav dark'>
          <div className='nav-left'>
            <div className='nav-item' style={{padding: 5}}>
              <span style={{margin: 5}}>
                <i className='fa fa-user fa-2x'
                  style={{textAlign: 'center', borderWidth: 3,
                          borderColor: 'white', borderStyle: 'solid',
                          borderRadius: 50, padding: 5, width: 45}} />
              </span>
              {staff.role === 'master'
                ? <div>
                  {adminToken === null
                    ? <a className={`button is-light is-outlined ${isLoggingOut
                      ? 'is-loading' : null}`} onClick={openChooseUser}>
                      <span><FormattedMessage id='app.button.logCashier' /></span>
                      <span className='icon'>
                        <i className='fa fa-user' />
                      </span>
                    </a>
                    : activeCashier === null
                      ? null
                      : <p style={{fontSize: 24, lineHeight: 0.7, textAlign: 'left'}}>
                        <Truncate text={staffName} maxLength={12} />
                        <br />
                        <em style={{fontSize: 14}}>
                          <a onClick={openChooseUser}>
                            <FormattedMessage id='app.button.changeCashier' />
                          </a>
                        </em>
                      </p>
                  }
                </div>
                : !staff
                  ? null
                  : <p style={{fontSize: 24, lineHeight: 0.7, textAlign: 'left'}}>
                    {`${staff.firstName} ${staff.lastName}`}<br />
                    <em style={{fontSize: 14}}>
                      <FormattedMessage id='app.general.loggedStaff' />
                    </em>
                  </p>
              }
            </div>
            <span className='nav-item' style={{ paddingRight: 10 }}>
              <a className={`button is-light is-outlined ${isLoggingOut
                ? 'is-loading' : null}`}
                onClick={adminToken === null ? onLogout : onLogoutCashier}>
                <span>
                {adminToken === null
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
            <span></span>
            <span></span>
            <span></span>
          </span>

          <div className={`nav-right nav-menu ${toggleClass}`}>
            {staff.role === 'master'
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
