import React, { Component } from 'react'
import { connect } from 'react-redux'

import ModalCard from '../components/ModalCard'
import ContentDivider from '../components/ContentDivider'

import { closeActiveModal } from '../actions/appMainUI'
import { setOverallDiscount } from '../actions/dataORDinfo'

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

  render () {
    const {
      activeModalId,
      overallDiscount,
      ordersOnHold,
      orderNote
    } = this.props
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
      default:
        return null
    }
  }
}

function mapStateToProps (state) {
  return {
    activeModalId: state.app.appMainUI.activeModalId,
    overallDiscount: state.data.dataORDinfo.overallDiscount,
    orderNote: state.data.dataORDinfo.orderNote,
    ordersOnHold: state.ordersOnHold.items
  }
}

export default connect(mapStateToProps)(ModalStoreUtils)
