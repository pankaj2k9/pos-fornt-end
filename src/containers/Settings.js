import React, { Component } from 'react'
import { connect } from 'react-redux'

import { FormattedMessage } from 'react-intl'
import SettingsTab from './SettingsTab'

import {
  closeActiveModal,
  setActiveModal
} from '../actions/app/mainUI'

import { setSettingsActiveTab } from '../actions/settings'

class Settings extends Component {
  onClickOption (tabName) {
    const {dispatch} = this.props
    dispatch(setSettingsActiveTab(tabName))
    if (tabName === 'customers') {
      // dispatch(fetchCustomers())
    }
  }

  onClickRefund () {
    const {dispatch} = this.props
    dispatch(setActiveModal('refundModal'))
  }

  onClickReprint () {
    const {dispatch} = this.props
    dispatch(setActiveModal('reprintModal'))
  }

  onClickCloseModal () {
    const {dispatch} = this.props
    dispatch(closeActiveModal())
  }

  render () {
    const {activeTab} = this.props
    return (
      <div className='hero'>
        <div className='section' style={{padding: 10}}>
          <p className='title is-1'>
            <FormattedMessage id={'app.page.settings.title'} />
          </p>
          <div className='columns is-multiline is-mobile is-fullwidth'>
            <div className='column is-3'>
              <aside className='menu box'>
                <p className='menu-label'>
                  settings options
                </p>
                <ul className='menu-list'>
                  <li>
                    <a className={activeTab === 'main' && 'is-active'} onClick={this.onClickOption.bind(this, 'main')}>
                      Main
                    </a>
                  </li>
                  <li>
                    <a className={activeTab.match('order') && 'is-active'} onClick={this.onClickOption.bind(this, 'orderSearch')}>
                      <FormattedMessage id={'app.page.settings.tabOrders'} />
                    </a>
                    <ul>
                      <li>
                        <a className={activeTab === 'orderSearch' && 'is-active'} onClick={this.onClickOption.bind(this, 'orderSearch')}>
                          Search
                        </a>
                      </li>
                      <li>
                        <a className={activeTab === 'ordersCached' && 'is-active'} onClick={this.onClickOption.bind(this, 'ordersCached')}>
                          Cached
                        </a>
                      </li>
                    </ul>
                  </li>
                  <li>
                    <a className={activeTab === 'customers' && 'is-active'} onClick={this.onClickOption.bind(this, 'customers')}>
                      <FormattedMessage id={'app.page.settings.customers'} />
                    </a>
                  </li>
                  <li>
                    <a className={activeTab === 'account' && 'is-active'} onClick={this.onClickOption.bind(this, 'account')}>
                      <FormattedMessage id={'app.page.settings.account'} />
                    </a>
                  </li>
                </ul>
              </aside>
            </div>
            <div className='column is-9'>
              <SettingsTab />
            </div>
          </div>
        </div>
      </div>
    )
  }
}

function mapStateToProps (state) {
  return {
    activeModalId: state.app.mainUI.activeModalId,
    storeId: state.app.mainUI.storeId,
    activeTab: state.settings.activeTab,
    tabs: state.settings.tabs,
    orderDetails: state.settings.orderFromGet,
    orderSearchKey: state.settings.orderSearchKey,
    cashdrawer: state.app.mainUI.cashdrawer,
    reprintSuccess: state.settings.reprintSuccess
  }
}

export default connect(mapStateToProps)(Settings)
