import React, { Component } from 'react'
import { connect } from 'react-redux'

import { FormattedMessage } from 'react-intl'
import Tabs from '../components/Tabs'
import SettingsTab from './SettingsTab'

import {
  closeActiveModal,
  setActiveModal
} from '../actions/application'

import {
  setSettingsActiveTab
} from '../actions/settings'

class Settings extends Component {

  onClickTab (tabName) {
    const {dispatch} = this.props
    dispatch(setSettingsActiveTab(tabName))
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
          <center>
            <h1 className='title is-3'><FormattedMessage id={'app.page.settings.title'} /></h1>
            <h2 className='subtitle is-5'><FormattedMessage id={'app.page.settings.subtitle'} /></h2>
          </center>
          <hr />
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
    activeModalId: state.application.activeModalId,
    storeId: state.application.storeId,
    activeTab: state.settings.activeTab,
    tabs: state.settings.tabs,
    orderDetails: state.settings.orderFromGet,
    orderSearchKey: state.settings.orderSearchKey,
    refundSuccess: state.settings.refundSuccess,
    reprintSuccess: state.settings.reprintSuccess
  }
}

export default connect(mapStateToProps)(Settings)
