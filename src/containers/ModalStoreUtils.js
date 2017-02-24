import React, { Component } from 'react'
import { connect } from 'react-redux'
import { injectIntl } from 'react-intl'

import ModalCard from '../components/ModalCard'
import ContentDivider from '../components/ContentDivider'
import LoadingScreen from '../components/LoadingScreen'
import SyncModal from '../components/SyncModal'

import { closeActiveModal } from '../actions/app/mainUI'
import { setOverallDiscount } from '../actions/data/orderData'

import {
  syncOfflineOrders
} from '../actions/data/offlineOrders'

import { formatCurrency } from '../utils/string'

class ModalStoreUtils extends Component {
  _closeModal (event) {
    const { dispatch } = this.props
    dispatch(closeActiveModal())
  }

  _setOADisc (value) {
    const {dispatch} = this.props
    dispatch(setOverallDiscount(value > 100 ? 100 : value))
  }

  syncOrders () {
    const {dispatch, offlineOrdersData} = this.props
    let { failedOrders, processedOfflineOrders } = offlineOrdersData

    const allOfflineOrders = failedOrders.length > 0
      ? processedOfflineOrders.concat(failedOrders)
      : processedOfflineOrders
    dispatch(syncOfflineOrders(allOfflineOrders))
  }

  render () {
    const {
      activeModalId,
      overallDiscount,
      ordersOnHold,
      orderNote,
      offlineOrdersData,
      intl
    } = this.props

    let lblTR = (id) => { return (intl.formatMessage({id: id})).toUpperCase() }

    switch (activeModalId) {
      case 'overallDiscount':
        return (
          <ModalCard closeAction={this._closeModal.bind(this)}>
            <div className='content columns is-mobile is-multiline has-text-centered'>
              <div className='column is-8 is-offset-2'>
                <div className='control is-horizontal'>
                  <p className='control-label'><strong className='label'>Discount Percent</strong></p>
                  <form onSubmit={this._closeModal.bind(this)} >
                    <p className='control has-addons'>
                      <input id='overallDiscountInput' className='input is-large' type='Number' style={{maxWidth: 80}}
                        value={overallDiscount}
                        onChange={e => this._setOADisc(e.target.value)} />
                      <a className='button is-large'>%</a>
                    </p>
                  </form>
                </div>
              </div>
            </div>
          </ModalCard>
        )
      case 'recallOrder':
        return (
          <ModalCard closeAction={this._closeModal.bind(this)}>
            {ordersOnHold.map((order, key) => {
              return (
                <div className='box is-clearfix' key={key}>
                  <div className='media-content is-clearfix'>
                    <p className='is-pulled-left'>Order {key + 1}</p>
                    <a className='button is-pulled-right'>Recall</a>
                    <ContentDivider size={6} contents={[
                      order.orderItems.map((item, key) => {
                        return (
                          <p key={key}>{item.nameEn}</p>
                        )
                      }),
                      <div>
                        <p>currency: {order.currency}</p>
                        <p>order total: {formatCurrency(order.total.toFixed(2))}</p>
                      </div>
                    ]} />
                  </div>
                </div>
              )
            })}
          </ModalCard>
        )
      case 'notes':
        return (
          <ModalCard closeAction={this._closeModal.bind(this)}>
            {orderNote.length > 0
              ? orderNote.map((note, key) => {
                return (
                  <div className='card'>
                    <header className='card-header'>
                      <p className='card-header-title'>{note}</p>
                      <a className='card-header-icon'>
                        remove
                        <span><i className='fa fa-close' /></span>
                      </a>
                    </header>
                  </div>
                )
              })
              : <div>
                NO NOTES
              </div>
            }
          </ModalCard>
        )
      case 'processingOrder':
        return (
          <LoadingScreen loadingText={lblTR('app.ph.procOrder')} />
        )
      case 'printingReceipt':
        return (
          <LoadingScreen loadingText={lblTR('app.ph.printingRCT')} />
        )
      case 'orderSuccess':
        return (
          <ModalCard closeAction={this._closeModal.bind(this)} confirmAction={this._closeModal.bind(this)}>
            <div className='content has-text-centered'>
              <p className='title'>Order Success</p>
              <a>Reprint Receipt</a>
            </div>
          </ModalCard>
        )
      case 'orderFailed':
        return (
          <ModalCard closeAction={this._closeModal.bind(this)} retryAction={this._closeModal.bind(this)}>
            <div className='content has-text-centered'>
              <p className='title'>Order Failed</p>
              <p className='subtitle'>Try Again</p>
            </div>
          </ModalCard>
        )
      case 'syncModal':
        let { syncIsProcessing, syncSuccess, failedOrders, processedOfflineOrders, successOrders } = offlineOrdersData

        return (
          <SyncModal
            isProcessing={syncIsProcessing}
            syncSuccess={syncSuccess}
            failedOrders={failedOrders}
            offlineOrders={processedOfflineOrders}
            successOrders={successOrders}
            onSync={this.syncOrders.bind(this)}
            onClose={this._closeModal.bind(this)} />
        )
      default:
        return null
    }
  }
}

function mapStateToProps (state) {
  let mainUI = state.app.mainUI
  let orderData = state.data.orderData
  return {
    activeModalId: mainUI.activeModalId,
    overallDiscount: orderData.overallDiscount,
    orderNote: orderData.orderNote,
    orderInfo: orderData.orderInfo,
    ordersOnHold: state.ordersOnHold.items,
    offlineOrdersData: state.data.offlineOrders,
    intl: state.intl
  }
}

export default connect(mapStateToProps)(injectIntl(ModalStoreUtils))
