import React, { Component } from 'react'
import { connect } from 'react-redux'
import { injectIntl, FormattedMessage } from 'react-intl'

import ModalCard from '../components/ModalCard'
import {
  setCashierLoggedIn,
  closeActiveModal
} from '../actions/appMainUI'

class ModalApp extends Component {
  _closeModal () {
    const { dispatch } = this.props
    dispatch(closeActiveModal())
  }

  _activeCashier () {
    const { intl, activeCashier } = this.props
    let active = activeCashier === null
      ? intl.formatMessage({id: 'app.general.chooseUser'})
      : intl.formatMessage({id: 'app.ph.youChoose'}) + activeCashier.username
    return active
  }

  renderChooseUser () {
    const { dispatch, staff } = this.props
    let staffs = staff.staffs
    let changeUser = (staffId) => {
      for (var i = 0; i < staffs.length; i++) {
        if (staffs[i].id === staffId) {
          dispatch(setCashierLoggedIn(staffs[i]))
          dispatch(closeActiveModal())
        }
      }
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
  }
  renderUpdateDrawer () {
    const { activeDrawer } = this.props
    return (
      <ModalCard title='app.ph.cashdrawerData' closeAction={e => this._closeModal(e)}>
        <div className='content has-text-centered'>
          {activeDrawer
            ? <h1 className='title'><FormattedMessage id='app.general.cashDrawerEmpty' /></h1>
            : null
          }
          <p className='subtitle'><FormattedMessage id='app.general.updateCashDrawer' /></p>
        </div>
      </ModalCard>
    )
  }
  renderVfySTRpin () {
    return (
      <ModalCard title='app.general.storePin' closeAction={e => this._closeModal(e)}>
        <div>asdf</div>
      </ModalCard>
    )
  }
  renderSyncData () {
    return (
      <ModalCard title='app.button.syncData' closeAction={e => this._closeModal(e)}>
        <div>asdf</div>
      </ModalCard>
    )
  }
  render () {
    const { activeModalId } = this.props
    switch (activeModalId) {
      case 'chooseUser':
        return this.renderChooseUser()
      case 'updateDrawer':
        return this.renderUpdateDrawer()
      case 'vfySTRpin':
        return this.renderVfySTRpin()
      case 'syncData':
        return this.renderSyncData()
      default:
        return null
    }
  }
}

export default connect()(injectIntl(ModalApp))
