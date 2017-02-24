import React, { Component } from 'react'
import { connect } from 'react-redux'

import { FormattedMessage } from 'react-intl'
import Tabs from '../components/Tabs'
import SettingsTab from './SettingsTab'

import {
  closeActiveModal,
  setActiveModal,
  storeGetDailyData
} from '../actions/app/mainUI'

import { setSettingsActiveTab } from '../actions/settings'

// import { fetchCustomers } from '../actions/data/customers'

class Settings extends Component {
  componentDidMount () {
    const {dispatch, storeId, cashdrawer} = this.props
    dispatch(storeGetDailyData(storeId, cashdrawer))
  }

  onClickTab (tabName) {
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
    const {activeTab, tabs} = this.props
    return (
      <div className='hero'>
        <div className='section' style={{padding: 10}}>
          <center style={{marginBottom: 20}}>
            <h1 className='title is-3'><FormattedMessage id={'app.page.settings.title'} /></h1>
          </center>
          <Tabs
            activeLink={activeTab}
            links={tabs}
            onClick={this.onClickTab.bind(this)}
            type='is-centered is-toggle is-fullwidth is-medium' />
          <SettingsTab />
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
    refundSuccess: state.settings.refundSuccess,
    cashdrawer: state.app.mainUI.cashdrawer,
    reprintSuccess: state.settings.reprintSuccess
  }
}

export default connect(mapStateToProps)(Settings)
