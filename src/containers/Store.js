import React, { Component } from 'react'
import { connect } from 'react-redux'
import { injectIntl, FormattedMessage } from 'react-intl'

import PanelProducts from './PanelProducts'
import PanelCart from './PanelCart'
import PanelCheckout from './PanelCheckout'

import { fetchAllProducts } from '../actions/products'
import { fetchCustomers } from '../actions/customers'
import {
  setActiveModal,
  setCashierLoggedIn,
  authCashierStaff
} from '../actions/application'

class Store extends Component {
  componentWillMount () {
    const {
      dispatch,
      locale,
      productsById,
      productsFilter
    } = this.props
    if (!productsById) {
      dispatch(fetchAllProducts(locale, productsFilter))
      dispatch(fetchCustomers())
    }
  }

  componentDidUpdate () {
    const { activeCashier, activeModalId } = this.props
    if (activeModalId === 'verifyStaff' && activeCashier) {
      document.getElementById('staffPassword').focus()
    }
    if (activeModalId === '' || !activeModalId) {
      if (activeCashier) {
        document.getElementById('productsSearch').focus()
      }
    }
  }

  onChange (staffId) {
    const {dispatch, staff} = this.props
    let staffs = staff.staffs
    for (var i = 0; i < staffs.length; i++) {
      if (staffs[i].id === staffId) {
        dispatch(setCashierLoggedIn(staffs[i]))
      }
    }
    document.getElementById('staffPassword').focus()
  }

  close () {
    const {dispatch} = this.props
    dispatch(setActiveModal(''))
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

  activeCashier () {
    const { intl, activeCashier } = this.props
    let active = activeCashier === null
      ? intl.formatMessage({id: 'app.general.chooseUser'})
      : intl.formatMessage({id: 'app.ph.youChoose'}) + activeCashier.username
    return active
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
                          {staff.staffs.map(function (cashier, key) {
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
                  {activeCashier === null
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

  renderDisabledStore () {
    const { staff } = this.props
    return (
      <div className='hero is-large'>
        <div className='hero-body'>
          <div className='container has-text-centered'>
            {staff.role === 'master'
              ? <div>
                <h1 className='title'>
                  <FormattedMessage id='app.general.noCashier' />
                </h1>
                <h2 className='subtitle'>
                  <FormattedMessage id='app.general.loginFirst' />
                </h2>
              </div>
              : <div>
                <h1 className='title'>
                  <FormattedMessage id='app.general.forbidden' />
                </h1>
                <h2 className='subtitle'>
                  <FormattedMessage id='app.general.onlyMaster' />
                </h2>
              </div>
            }
          </div>
        </div>
      </div>
    )
  }

  renderStore () {
    const {
      locale,
      activeModalId,
      customersArefetching,
      customersArray,
      customersById,
      cartItemsArray,
      productsAreFetching,
      productsArray,
      productsById,
      items, // ordersOnHold,
      staff,
      storeId
    } = this.props
    return (
      <div className='hero'>
        <div className='hero-body' style={{padding: 0}}>
          <div className='content'>
            <div className='tile is-ancestor is-fullwidth'>
              <div className='tile is-parent is-6'>
                <div className='tile is-child'>
                  <PanelProducts
                    locale={locale}
                    productsAreFetching={productsAreFetching}
                    productsArray={productsArray}
                    productById={productsById}
                    staff={staff}
                    storeId={storeId}
                    />
                </div>
              </div>
              <div className='tile is-parent is-vertical'>
                <div>
                  <div className='tile is-child'>
                    <PanelCart
                      locale={locale}
                      activeModalId={activeModalId}
                      cartItemsArray={cartItemsArray}
                      customersArefetching={customersArefetching}
                      customersArray={customersArray}
                      customersById={customersById}
                      ordersOnHold={items} />
                  </div>
                </div>
                <div>
                  <div className='tile is-child'>
                    <PanelCheckout
                      activeModalId={activeModalId}
                      cartItemsArray={cartItemsArray}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  render () {
    const {adminToken} = this.props
    return (
      <div>
      {
        !adminToken
        ? this.renderDisabledStore()
        : this.renderStore()
      }
        {this.chooseUserModal()}
      </div>
    )
  }
}

function mapStateToProps (state) {
  return {
    locale: state.intl.locale,
    activeModalId: state.application.activeModalId,
    activeCashier: state.application.activeCashier,
    adminToken: state.application.adminToken,
    shouldUpdate: state.application.shouldUpdate,
    error: state.application.error,
    customersArefetching: state.data.customers.isFetching,
    customersArray: state.data.customers.customersArray,
    customersById: state.data.customers.customersById,
    productsAreFetching: state.data.products.isFetching,
    productsArray: state.data.products.productsArray,
    productsById: state.data.products.productsById,
    productsShouldUpdate: state.data.products.shouldUpdate,
    items: state.ordersOnHold.items, // ordersOnHold
    cartItemsArray: state.panelCart.items,
    staff: state.application.staff.data,
    storeId: state.application.storeId,
    intl: state.intl
  }
}

export default connect(mapStateToProps)(injectIntl(Store))
