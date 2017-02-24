import React, { Component } from 'react'
import { connect } from 'react-redux'
import { browserHistory } from 'react-router'

import POSButtons from '../components/POSButtons'

import {
  setActiveModal,
  togglePosMode
} from '../actions/app/mainUI'

import {
  holdOrderAndReset,
  cancelOrder
} from '../actions/helpers'

import {
  setCurrencyType
} from '../actions/data/orderData'

import {
  reportsSetTab
} from '../actions/reports'

import {
  setSettingsActiveTab
} from '../actions/settings'

class PanelButtons extends Component {

  _onClickPanelButtons (name) {
    const {
      dispatch,
      orderData
    } = this.props

    switch (name) {
      case 'online':
        return dispatch(togglePosMode('online'))
      case 'offline':
        return dispatch(togglePosMode('offline'))
      case 'prodList':
        return dispatch(setActiveModal('productsList'))
      case 'addDiscount':
        return dispatch(setActiveModal('overallDiscount'))
      case 'holdOrder':
        return dispatch(holdOrderAndReset(orderData))
      case 'recallOrder':
        return dispatch(setActiveModal('recallOrder'))
      case 'useOdbo':
        return dispatch(setCurrencyType('odbo'))
      case 'useSgd':
        return dispatch(setCurrencyType('sgd'))
      case 'staffSales':
        dispatch(reportsSetTab('staffSales'))
        browserHistory.push('reports')
        break
      case 'searchCust':
        return dispatch(setActiveModal('searchCust'))
      case 'sync':
        return dispatch(setActiveModal('syncModal'))
      case 'outletStock':
        dispatch(reportsSetTab('stocks'))
        browserHistory.push('reports')
        break
      case 'outletSales':
        dispatch(reportsSetTab('sales'))
        browserHistory.push('reports')
        break
      case 'viewBill':
        dispatch(reportsSetTab('bills'))
        browserHistory.push('reports')
        break
      case 'refund':
        dispatch(setSettingsActiveTab('orders'))
        browserHistory.push('settings')
        break
      case 'doublePoints':
        return
      case 'adjustPoints':
        dispatch(setSettingsActiveTab('customers'))
        browserHistory.push('settings')
        break
      case 'reading':
        dispatch(reportsSetTab('completeSales'))
        browserHistory.push('reports')
        break
      case 'admin':
        return
      case 'cancelOrder':
        return dispatch(cancelOrder())
      default:
    }
  }

  render () {
    const { currency, posMode } = this.props
    let isActive = posMode === 'online'
    let posModeToggleButton = posMode === 'online'
      ? {name: 'offline', isActive: true, color: 'yellow', label: 'SWITCH TO OFFLINE', altLbl: '切换到离线模式', size: 'is-6'}
      : {name: 'online', isActive: true, color: 'yellow', label: 'SWITCH TO ONLINE', altLbl: '切换到在线模式', size: 'is-6'}

    let currencyButton = currency === 'sgd'
      ? {name: 'useOdbo', isActive, color: 'purple', label: 'USE "The odbo" COINS', altLbl: '电子钱包', size: 'is-3'}
      : {name: 'useSgd', isActive, color: 'purple', label: 'USE SGD', altLbl: '使用SGD', size: 'is-3'}

    let buttons = [
      posModeToggleButton,
      {name: 'staffSales', isActive, color: 'blue', label: 'STAFF SALES', altLbl: '个人业绩', size: 'is-3'},
      {name: 'searchCust', isActive, color: 'blue', label: 'app.button.cust', altLbl: '搜寻会员', size: 'is-3'},
      {name: 'sync', isActive: true, color: 'yellow', label: 'SYNC OFFLINE DATA', altLbl: '同步与数据库', size: 'is-6'},
      {name: 'holdOrder', isActive: true, color: 'purple', label: 'HOLD ORDER', altLbl: '锁住订单', size: 'is-3'},
      {name: 'recallOrder', isActive: true, color: 'purple', label: 'RECALL_ORDER', altLbl: '找回订单', size: 'is-3'},
      {name: 'outletStock', isActive, color: 'blue', label: 'OUTLET STOCK', altLbl: '各分店库存', size: 'is-3'},
      {name: 'outletSales', isActive, color: 'blue', label: 'OUTLET SALES', altLbl: '各分店业绩', size: 'is-3'},
      {name: 'viewBill', isActive, color: 'blue', label: 'VIEW BILL', altLbl: '历史账单', size: 'is-3'},
      {name: 'refund', isActive, color: 'blue', label: 'REFUND / REPRINT', altLbl: '从新打印', size: 'is-3'},
      {name: 'doublePoints', isActive, color: 'purple', label: 'DOUBLE POINTS', altLbl: '双倍积分', size: 'is-3'},
      currencyButton,
      {name: 'adjustPoints', isActive, color: 'purple', label: 'ADJUST POINTS', altLbl: '修改分数', size: 'is-3'},
      {name: 'prodList', isActive: true, color: 'purple', label: 'PRODUCTS LIST', altLbl: '产品明细', size: 'is-3'},
      {name: 'reading', isActive, color: 'pink', label: 'X/Z READING', altLbl: '结算关机', size: 'is-3'},
      {name: 'admin', isActive, color: 'blue', label: 'ADMIN', altLbl: '管理', size: 'is-3'},
      {name: 'addDiscount', isActive: true, color: 'blue', label: 'ADD OVERALL DISCOUNT', altLbl: '整单打折', size: 'is-3'},
      {name: 'cancelOrder', isActive: true, color: 'pink', label: 'CANCEL ORDER', altLbl: '取消订单', size: 'is-3'}
    ]
    return (
      <div className='panel'>
        <POSButtons buttons={buttons} onClickButton={this._onClickPanelButtons.bind(this)} />
      </div>
    )
  }
}

function mapStateToProps (state) {
  let orderData = state.data.orderData
  let mainUI = state.app.mainUI
  return {
    orderData,
    currency: orderData.currency,
    posMode: mainUI.posMode
  }
}

export default connect(mapStateToProps)(PanelButtons)
