import React, { Component } from 'react'
import { connect } from 'react-redux'

import POSButtons from '../components/POSButtons'

import {
  setActiveModal
} from '../actions/appMainUI'

import {
  holdOrderAndReset
} from '../actions/helpers'

class PanelButtons extends Component {

  _onClickPanelButtons (name) {
    const {
      dispatch,
      orderData
    } = this.props

    switch (name) {
      case 'prodList':
        return (dispatch(setActiveModal('productsList')))
      case 'addDiscount':
        return (dispatch(setActiveModal('overallDiscount')))
      case 'holdOrder':
        return (dispatch(holdOrderAndReset(orderData)))
      case 'recallOrder':
        return (dispatch(setActiveModal('recallOrder')))
      default:
    }
  }

  render () {
    let isActive = true

    let buttons = [
      {name: 'online', isActive, color: 'yellow', label: 'app.button.switchOnline', size: 'is-6'},
      {name: 'staffSales', isActive, color: 'blue', label: 'app.button.staffSales', size: 'is-3'},
      {name: 'searchCust', isActive, color: 'blue', label: 'app.button.cust', size: 'is-3'},
      {name: 'sync', isActive, color: 'yellow', label: 'app.button.syncData', size: 'is-6'},
      {name: 'holdOrder', isActive, color: 'purple', label: 'app.button.holdOrder', size: 'is-3'},
      {name: 'recallOrder', isActive, color: 'purple', label: 'app.button.recallOrder', size: 'is-3'},
      {name: 'outletStock', isActive, color: 'blue', label: 'app.button.outletStock', size: 'is-3'},
      {name: 'outletSales', isActive, color: 'blue', label: 'app.button.outletStock', size: 'is-3'},
      {name: 'viewBill', isActive, color: 'blue', label: 'app.button.viewBill', size: 'is-3'},
      {name: 'refund', isActive, color: 'blue', label: 'app.button.repRef', size: 'is-3'},
      {name: 'doublePoints', isActive, color: 'purple', label: 'app.button.doublePoints', size: 'is-3'},
      {name: 'useOdbo', isActive, color: 'purple', label: 'app.button.useOC', size: 'is-3'},
      {name: 'adjustPoints', isActive, color: 'purple', label: 'app.button.adjustPts', size: 'is-3'},
      {name: 'prodList', isActive, color: 'purple', label: 'app.button.prodList', size: 'is-3'},
      {name: 'reading', isActive, color: 'pink', label: 'app.button.xzReading', size: 'is-3'},
      {name: 'admin', isActive, color: 'blue', label: 'app.button.admin', size: 'is-3'},
      {name: 'addDiscount', isActive, color: 'blue', label: 'app.button.addOD', size: 'is-3'},
      {name: 'cancelOrder', isActive, color: 'pink', label: 'app.button.cancelOrder', size: 'is-3'}
    ]
    return (
      <div className='panel'>
        <POSButtons buttons={buttons} onClickButton={this._onClickPanelButtons.bind(this)} />
      </div>
    )
  }
}

function mapStateToProps (state) {
  return {
    orderData: state.data.dataORDinfo
  }
}

export default connect(mapStateToProps)(PanelButtons)
