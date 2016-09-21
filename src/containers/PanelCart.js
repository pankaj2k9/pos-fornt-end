import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { FormattedMessage } from 'react-intl'

import Counter from '../components/Counter'
import Panel from '../components/Panel'
import Level from '../components/Level'
import SearchModal from './SearchModal'
import SearchBar from '../components/SearchBar'
import Toggle from '../components/Toggle'
import Truncate from '../components/Truncate'

import {
  setCustomerInputActive,
  setCustomerInputDisabled,
  setWalkinCustomer,
  setInputOdboID,
  setCurrencyType,
  setCartItemQty,
  setCustomDiscount,
  removeCartItem,
  removeCustomer,
  panelCartShouldUpdate
} from '../actions/panelCart'

import {
  setOrderSearchKey
} from '../actions/ordersOnHold'

import {
  holdOrderAndReset,
  recallOrderOnHold,
  closeAndResetRecallModal
} from '../actions/helpers'

import {
  fetchCustomerByOdboId
} from '../actions/customers'

import {
  closeActiveModal,
  setActiveModal
} from '../actions/application'

class PanelCart extends Component {
  onClickPanelHeaderBtns (inputAction) {
    const {dispatch} = this.props
    dispatch(setCustomerInputActive(inputAction))
    document.getElementById('customerInput').focus()
  }

  onClickRemoveCustomer () {
    const {dispatch} = this.props
    dispatch(removeCustomer())
  }

  keyInput (inputValue) {
    const {dispatch, inputAction} = this.props
    inputAction === 'search'
    ? dispatch(setInputOdboID(inputValue))
    : dispatch(setWalkinCustomer(inputValue))
  }

  buttonConfirm (event) {
    event.preventDefault()
    const {dispatch, searchKey, inputAction} = this.props
    inputAction === 'search'
    ? dispatch(fetchCustomerByOdboId(searchKey))
    : dispatch(setCustomerInputDisabled()) && document.getElementById('productsSearch').focus()
  }

  buttonCancel () {
    const {dispatch} = this.props
    dispatch(setCustomerInputDisabled())
    document.getElementById('productsSearch').focus()
  }

  onClickCurrencyToggle () {
    const {dispatch, currency} = this.props
    currency === 'sgd'
    ? dispatch(setCurrencyType('odbo'))
    : dispatch(setCurrencyType('sgd'))
  }

  onClickHoldOrder () {
    const {
      dispatch, activeCustomer,
      walkinCustomer, cartItemsArray,
      totalPrice, totalOdboPrice
    } = this.props
    let orderData = {
      activeCustomer,
      walkinCustomer,
      cartItemsArray,
      totalPrice,
      totalOdboPrice
    }
    dispatch(holdOrderAndReset(orderData))
  }

  recallModal () {
    const {dispatch, activeModalId} = this.props
    activeModalId === null || undefined || ''
    ? dispatch(setActiveModal('recallOrder'))
    : dispatch(closeActiveModal())
    document.getElementById('productsSearch').focus()
  }

  renderChildren () {
    const { dispatch, cartItemsArray, currency,
            locale, shouldUpdate, overallDiscount } = this.props
    const notEmpty = (cartItemsArray !== null || undefined)
    // const add = this.addProductQty
    return cartItemsArray.map(function (item, key) {
      function plus () {
        dispatch(panelCartShouldUpdate(true))
        dispatch(setCartItemQty(item.id, 'plus'))
        document.getElementById('productsSearch').focus()
      }
      function minus () {
        dispatch(panelCartShouldUpdate(true))
        dispatch(setCartItemQty(item.id, 'minus'))
        document.getElementById('productsSearch').focus()
      }
      function remove () {
        dispatch(panelCartShouldUpdate(true))
        dispatch(removeCartItem(item.id))
        document.getElementById('orderSearch').value = 0
        document.getElementById('productsSearch').focus()
      }
      function setDiscount (value) {
        let discount = Number(value) > 100 ? 100 : value
        dispatch(panelCartShouldUpdate(true))
        dispatch(setCustomDiscount(discount, item.id))
      }
      let productName = locale === 'en' ? item.nameEn : item.nameZh
      // placeholder value: displays default discount
      let discountPH = item.customDiscount === 0
        ? item.isDiscounted
          ? currency === 'sgd'
            ? Number(item.priceDiscount)
            : Number(item.odboPriceDiscount)
          : 0.00
        : Number(item.customDiscount)
      // input value: 100 is max value
      let discountVal = item.customDiscount === 0
        ? ''
        : Number(item.customDiscount)
      let discount = item.customDiscount === 0
        ? item.isDiscounted
          ? currency === 'sgd'
            ? (Number(item.priceDiscount) / 100) * item.price
            : (parseInt(item.odboPriceDiscount) / 100) * item.odboPrice
          : 0.00
        : currency === 'sgd'
          ? (Number(item.customDiscount) / 100) * item.price
          : (Number(item.customDiscount) / 100) * item.odboPrice
      let computedDiscount = currency === 'sgd'
        ? Number(item.price) - discount
        : Number(item.odboPrice) - discount
      return (
        notEmpty
        ? <tr key={key}>
          <td className='is-icon'>
            <Counter
              size='small'
              count={item.qty}
              plus={plus}
              minus={minus} />
          </td>
          <td><Truncate text={productName} maxLength={26} /></td>
          {
            !overallDiscount || overallDiscount === 0
              ? <td>
                <p className='control has-addons' style={{width: 50}}>
                  <input id='itemDiscount' className='input is-small' type='Number'
                    placeholder={discountPH} value={discountVal}
                    onChange={e => setDiscount(e.target.value)} />
                  <a className='button is-small'>%</a>
                </p>
              </td>
              : null
          }
          <td>
            <p>
              {shouldUpdate
                ? null
                : currency === 'sgd'
                  ? Number(Number(item.qty) * computedDiscount).toFixed(2)
                  : parseInt(item.qty) * Number(computedDiscount)}
            </p>
          </td>
          <td className='is-icon'>
            <a
              className='button is-inverted is-danger is-small'
              style={{padding: 0}}
              onClick={remove}>
              <span className='icon fa fa-times is-marginless' />
            </a>
          </td>
        </tr>
        : <tr />
      )
    })
  }

  renderModal () {
    const {activeModalId, ordersOnHold, ordersSearchKey} = this.props
    let filteredOrders = []
    if (ordersSearchKey === '') {
      filteredOrders = ordersOnHold
    } else if (ordersSearchKey !== '') {
      filteredOrders = ordersOnHold.filter(function (order) {
        if (order.activeCustomer !== null) {
          return order.activeCustomer.firstName.toLowerCase().match(ordersSearchKey)
        } else {
          return order.walkinCustomer.toLowerCase().match(ordersSearchKey)
        }
      })
    }

    return (
      <SearchModal
        id='recallOrder'
        title='Orders On Hold'
        active={activeModalId}
        items={filteredOrders}
        search={{id: 'searchEvent',
          value: ordersSearchKey,
          placeholder: 'app.ph.searchCust2',
          onChange: setOrderSearchKey}}
        closeButton={{name: <FormattedMessage id='app.button.cancel' />,
          event: closeAndResetRecallModal}}
        listButton={{name: <FormattedMessage id='app.button.recallOrder' />,
          event: recallOrderOnHold}} />
    )
  }

  render () {
    var intFrameHeight = window.innerHeight
    const {
      activeCustomer,
      walkinCustomer,
      cartItemsArray,
      currency,
      inputActive,
      inputAction,
      searchKey,
      customerSearchError,
      ordersOnHold,
      overallDiscount,
      shouldUpdate
    } = this.props
    const emptyOrdersOnHold = (ordersOnHold.length === 0) || (ordersOnHold === null || undefined)
    const empty = (cartItemsArray.length === 0) || (cartItemsArray === null || undefined)
    const buttonOne = empty
      ? undefined
      : {
        name: 'app.button.holdOrder',
        class: '',
        type: 'button',
        onClick: this.onClickHoldOrder.bind(this)
      }
    const buttonTwo = emptyOrdersOnHold
    ? undefined
    : {
      name: 'app.button.recallOrder',
      class: 'is-dark',
      onClick: this.recallModal.bind(this)
    }
    return (
      <Panel
        panelName={<FormattedMessage id='app.panel.sales' />}
        buttonOne={buttonOne}
        buttonTwo={buttonTwo}
      >
        <div className='panel-block'>
          {inputActive
            ? !shouldUpdate
              ? <SearchBar
                id='customerInput'
                autoFocus={inputActive}
                value={inputAction === 'search' ? searchKey : walkinCustomer}
                placeholder={
                  inputAction === 'search'
                  ? customerSearchError === null
                    ? 'app.ph.searchCust' : 'app.ph.searchCustErr'
                  : 'app.ph.placeCustName'
                }
                confirmButton={<i className='fa fa-plus' />}
                cancelButton={<i className='fa fa-times' />}
                confirmEvent={this.buttonConfirm.bind(this)}
                cancelEvent={this.buttonCancel.bind(this)}
                onChange={this.keyInput.bind(this)}
                onSubmit={this.buttonConfirm.bind(this)}
                icon={inputAction === 'search' ? 'fa fa-search' : 'fa fa-user'} />
              : <div className='has-text-centered'>
                <i className='fa fa-spinner fa-pulse fa-fw' />
              </div>
            : <Level
              left={
                <div>
                  {activeCustomer !== null || undefined
                  ? <div>
                    <p className='is-marginless'>
                      <FormattedMessage id='app.general.cust' />:
                      <strong>{` ${activeCustomer.firstName}`}</strong>
                    </p>
                    <a style={{color: 'orange'}}
                      onClick={this.onClickRemoveCustomer.bind(this)}>
                      <i className='fa fa-times' />
                      <FormattedMessage id='app.button.remove' />
                    </a>
                  </div>
                  : <div>
                    {walkinCustomer === ''
                      ? <h4 className='is-marginless'>
                        <FormattedMessage id='app.general.walkinCust' />
                        <a style={{marginLeft: 12}}
                          onClick={this.onClickPanelHeaderBtns.bind(this, 'add')}>
                          <FormattedMessage id='app.button.add' />{' '}
                          <i className='fa fa-plus' />
                        </a>
                      </h4>
                      : <div>
                        <p className='is-marginless'>
                          <FormattedMessage id='app.general.cust' />:
                          <strong>{` ${walkinCustomer}`}</strong>
                        </p>
                        <a style={{color: 'orange'}}
                          onClick={this.onClickRemoveCustomer.bind(this)}>
                          <i className='fa fa-times' />
                          <FormattedMessage id='app.button.remove' />
                        </a>
                      </div>
                    }
                  </div>
                  }
                </div>
              }
              center={
                activeCustomer !== null
                ? <Toggle
                  switchAction={this.onClickCurrencyToggle.bind(this)}
                  active={currency}
                  toggleOne={{name: '$SGD', value: 'sgd'}}
                  toggleTwo={{name: 'ODBO', value: 'odbo'}}
                  buttonWidth={60} />
                : null
              }
              action={this.onClickPanelHeaderBtns.bind(this, 'search')}
              button={activeCustomer !== null || undefined
                ? <FormattedMessage id='app.button.change' />
                : <FormattedMessage id='app.button.searchCust' />}
              buttonIcon={
                activeCustomer !== null || undefined
                ? 'fa fa-pencil' : 'fa fa-search'} />
          }
        </div>
        <div className='panel-block' style={{padding: 0}}>
          <div className='content'
            style={{height: intFrameHeight / 3.5, overflowY: 'scroll'}}>
          {!empty
            ? <table className='table'>
              <thead>
                <tr>
                  <th><FormattedMessage id='app.general.qty' /></th>
                  <th><FormattedMessage id='app.general.product' /></th>
                  {!overallDiscount || overallDiscount === 0
                    ? <th><FormattedMessage id='app.general.discount' /></th>
                    : null
                  }
                  <th><FormattedMessage id='app.general.subtotal' /></th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {this.renderChildren()}
              </tbody>
            </table>
            : <div className='section has-text-centered is-fullheight'
              style={{height: intFrameHeight / 4, overflowY: 'scroll'}}>
              <p>
                <strong><FormattedMessage id='app.error.noCartItems' /></strong>
              </p>
            </div>
          }
          </div>
        </div>
        {
          ordersOnHold === undefined || null || ordersOnHold.length === 0
          ? null
          : this.renderModal()
        }
      </Panel>
    )
  }
}

PanelCart.propTypes = {
  locale: PropTypes.string,
  activeModalId: PropTypes.string,
  cartItemsArray: PropTypes.array,
  customersArefetching: PropTypes.bool,
  customersArray: PropTypes.array,
  customersById: PropTypes.object,
  ordersOnHold: PropTypes.array
}

function mapStateToProps (state) {
  return {
    activeCustomer: state.panelCart.activeCustomer,
    walkinCustomer: state.panelCart.walkinCustomer,
    customerSearchError: state.panelCart.customerSearchError,
    currency: state.panelCart.currency,
    customDiscount: state.panelCart.customDiscount,
    shouldUpdate: state.panelCart.shouldUpdate,
    inputActive: state.panelCart.customerInputActive,
    inputAction: state.panelCart.customerInputAction,
    searchKey: state.panelCart.customerSearchKey,
    totalPrice: state.panelCart.totalPrice,
    totalOdboPrice: state.panelCart.totalOdboPrice,
    overallDiscount: state.panelCheckout.customDiscount,
    ordersSearchKey: state.ordersOnHold.searchKey
  }
}

export default connect(mapStateToProps)(PanelCart)
