import React, { Component } from 'react'
import { connect } from 'react-redux'
import { injectIntl } from 'react-intl'

import {
  createDailyData,
  updateDailyData
} from '../actions/data/cashdrawers'

import {
  syncOfflineOrders
} from '../actions/data/offlineData'

import ModalCard from '../components/ModalCard'
import ContentDivider from '../components/ContentDivider'

import {
  setCashierLoggedIn,
  closeActiveModal
} from '../actions/app/mainUI'

class ModalApp extends Component {
  _closeModal () {
    const { dispatch } = this.props
    dispatch(closeActiveModal())
  }

  _activeCashier () {
    const { intl, mainUI } = this.props
    let active = mainUI.activeCashier === null
      ? intl.formatMessage({id: 'app.general.chooseUser'})
      : intl.formatMessage({id: 'app.ph.youChoose'}) + mainUI.activeCashier.username
    return active
  }

  _updateCashdrawer () {
    const { dispatch, mainUI } = this.props
    let { activeDrawer, activeDrawerOffline, activeStore, posMode, networkStatus } = mainUI
    let amount = Number(document.getElementById('drawerAmtInput').value) || 0
    if (activeDrawer) {
      dispatch(updateDailyData(activeDrawer, amount))
    } else if (!activeDrawer) {
      if (posMode === 'online' || networkStatus === 'online') {
        dispatch(createDailyData(activeStore.source, amount))
      } else {
        dispatch(updateDailyData(activeDrawerOffline, amount, activeStore.source))
      }
    }
  }

  _syncOrders () {
    const {dispatch, offlineOrdersData} = this.props
    let { failedOrders, processedOfflineOrders } = offlineOrdersData

    const allOfflineOrders = failedOrders.length > 0
      ? processedOfflineOrders.concat(failedOrders)
      : processedOfflineOrders
    dispatch(syncOfflineOrders(allOfflineOrders))
  }

  render () {
    const { intl, dispatch, mainUI, offlineData } = this.props
    let { activeModalId, activeStaff } = mainUI

    let lblTR = (id) => { return (intl.formatMessage({id: id})).toUpperCase() }

    switch (activeModalId) {
      case 'chooseUser':
        let staffs = activeStaff.staffs
        let changeUser = (staffId) => {
          staffs.forEach(staff => {
            if (staff.id === staffId) {
              dispatch(setCashierLoggedIn(staff))
              dispatch(closeActiveModal())
            }
          })
        }
        return (
          <ModalCard title='app.button.logCashier' closeAction={e => this._closeModal(e)}>
            <div className='control is-horizontal'>
              <div className='control'>
                <span className='select is-large is-fullwidth'>
                  <select
                    onChange={e => changeUser(e.target.value)}
                    value={this._activeCashier()}
                    style={{backgroundColor: 'rgba(255,255,255,0.0)'}}>
                    <option>{this._activeCashier()}</option>
                    {staffs.map(function (cashier, key) {
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
          </ModalCard>
        )
      case 'updateCashdrawer':
        return (
          <ModalCard closeAction={e => this._closeModal()} title={'Update Cashdrawer'} confirmAction={e => this._updateCashdrawer()}>
            <div className='content columns is-mobile is-multiline has-text-centered'>
              <div className='column is-4 is-offset-4 has-text-centered'>
                <form onSubmit={e => this._updateCashdrawer()} >
                  <p className='control has-icon has-icon-right is-marginless'>
                    <input id='drawerAmtInput' className='input is-large' type='Number'
                      style={{fontSize: '2.75rem', textAlign: 'right', paddingLeft: '0em', paddingRight: '1.5em'}} />
                    <span className='icon' style={{fontSize: '5rem', top: '3rem', right: '3rem'}}>
                      <i className='fa fa-usd' />
                    </span>
                  </p>
                </form>
              </div>
            </div>
          </ModalCard>
        )
      case 'syncModal':
        let { isProcessing, offlineOrders, failedOrders, offlineDrawers, failedDrawers } = offlineData
        let haveDatatoSync = offlineOrders.length > 0 || failedOrders.length > 0 || offlineDrawers.length > 0 || failedDrawers.length > 0
        let container = (type, data, icon, lbl) => {
          return (
            data.length > 0
            ? <div className='box' style={{margin: 10}}>
              <article className='media'>
                <div className='media-left'><span className='icon is-large'><i className={`fa fa-${icon}`} /></span></div>
                <div className='media-content'>
                  <div className='content'>
                    <p className='subtitle'><strong>{data.length}</strong> {lblTR(`app.lbl.${lbl}`)}</p>
                    <p>{type === 'orders' ? lblTR('app.lbl.offlineOrders') : lblTR('app.lbl.cashdrawerData')}</p>
                  </div>
                </div>
              </article>
            </div>
            : null
          )
        }
        return (
          <ModalCard closeAction={e => this._closeModal()} title={lblTR('app.button.syncData')}>
            {haveDatatoSync
              ? <div className='has-text-centered'>
                <ContentDivider contents={[
                  container('orders', offlineOrders, 'list-alt', 'notSynced'),
                  container('orders', failedOrders, 'close', 'syncFailed'),
                  container('drawer', offlineDrawers, 'upload', 'notSynced'),
                  container('drawer', failedDrawers, 'close', 'syncFailed')
                ]} size={6} />
                <a className={`button is-large is-success ${isProcessing ? 'is-outlined' : ''}`} onClick={e => dispatch(syncOfflineOrders(offlineOrders))}>
                  <span className='icon is-large'><i className={`fa fa-refresh ${isProcessing ? 'fa-spin fa-3x' : 'fa-2x'}`} /></span>
                  <span>{isProcessing ? lblTR('app.lbl.syncing') : lblTR('app.button.syncOrders')}</span>
                </a>
              </div>
              : <p className='title has-text-centered'>{lblTR('app.lbl.noDataToSync')}</p>
            }
          </ModalCard>
        )
      case 'reprintModal':
        return (
          <ModalCard>
            <p className='control has-addons'>
              <input id='custSearchKey' className='input is-large is-expanded' type='text' placeholder={lblTR('app.ph.keyword')} onChange={e => this._setSearchCustFilters()} />
              <a className='button is-large is-success' onClick={e => this._setSearchCustFilters()}>{lblTR('app.button.search')}</a>
            </p>
          </ModalCard>
        )
      default:
        return null
    }
  }
}

function mapStateToProps (state) {
  return {
    mainUI: state.app.mainUI,
    orderData: state.data.orderData,
    custData: state.data.customers,
    offlineData: state.data.offlineData,
    intl: state.intl
  }
}

export default connect(mapStateToProps)(injectIntl(ModalApp))
