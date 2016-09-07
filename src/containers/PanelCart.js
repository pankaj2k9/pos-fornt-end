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
  validateCustomerOdboId,
  setCurrencyType,
  setCartItemQty,
  setCustomDiscount,
  removeCartItem,
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
  closeActiveModal,
  setActiveModal
} from '../actions/application'

class PanelCart extends Component {
  onClickPanelHeaderBtns (inputAction) {
    const {dispatch} = this.props
    dispatch(setCustomerInputActive(inputAction))
    document.getElementById('customerInput').focus()
  }

  keyInput (inputValue) {
    const {dispatch, inputAction} = this.props
    inputAction === 'search'
    ? dispatch(setInputOdboID(inputValue))
    : dispatch(setWalkinCustomer(inputValue))
  }

  buttonConfirm () {
    const {dispatch, searchKey, customersArray, inputAction} = this.props
    inputAction === 'search'
    ? dispatch(validateCustomerOdboId(customersArray, searchKey))
    : dispatch(setCustomerInputDisabled()) && document.getElementById('productsSearch').focus()
  }

  buttonCancel () {
    const {dispatch} = this.props
    dispatch(setCustomerInputDisabled())
    document.getElementById('productsSearch').focus()
  }

  onSubmitKey (event) {
    event.preventDefault()
    const {dispatch, searchKey, customersArray, inputAction} = this.props
    inputAction === 'search'
    ? dispatch(validateCustomerOdboId(customersArray, searchKey))
    : dispatch(setCustomerInputDisabled())
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
      activeCustomer, walkinCustomer, cartItemsArray,
      totalPrice, totalOdboPrice
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
    const { dispatch, cartItemsArray, currency, locale, shouldUpdate, subTotalPrice } = this.props
    const notEmpty = (cartItemsArray !== null || undefined)
    // const add = this.addProductQty
    return cartItemsArray.map(function (item, key) {
      function plus () {
        dispatch(panelCartShouldUpdate())
        dispatch(setCartItemQty(item.id, 'plus'))
        document.getElementById('productsSearch').focus()
      }
      function minus () {
        dispatch(panelCartShouldUpdate())
        dispatch(setCartItemQty(item.id, 'minus'))
        document.getElementById('productsSearch').focus()
      }
      function remove () {
        dispatch(panelCartShouldUpdate())
        dispatch(removeCartItem(item.id))
        document.getElementById('orderSearch').value = 0
        document.getElementById('productsSearch').focus()
      }
      function setDiscount (value) {
        dispatch(panelCartShouldUpdate())
        dispatch(setCustomDiscount(value, item.id))
      }
      let productName = locale === 'en' ? item.nameEn : item.nameZh
      let discountPH = item.customDiscount === 0
        ? item.isDiscounted
          ? currency === 'sgd'
            ? parseFloat(item.priceDiscount)
            : parseFloat(item.odboPriceDiscount).toFixed(0)
          : 0.00
        : currency === 'sgd'
          ? parseFloat(item.customDiscount)
          : parseFloat(item.customDiscount).toFixed(0)
      let discount = item.customDiscount === 0
        ? item.isDiscounted
          ? currency === 'sgd'
            ? (parseFloat(item.priceDiscount) / 100) * item.price
            : (parseInt(item.odboPriceDiscount) / 100) * item.odboPrice
          : 0.00
        : currency === 'sgd'
          ? (parseFloat(item.customDiscount) / 100) * item.price
          : (parseFloat(item.customDiscount).toFixed(0) / 100) * item.odboPrice
      let computedDiscount = currency === 'sgd'
        ? parseFloat(item.price) - discount
        : parseFloat(item.odboPrice) - discount
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
          <td>
            <p className='control has-addons' style={{width: 50}}>
              <input id='itemDiscount' className='input is-small' type='number'
                placeholder={discountPH}
                onChange={e => setDiscount(e.target.value)} />
              <a className='button is-small'>%</a>
            </p>
          </td>
          <td>
            <p>
              {shouldUpdate
                ? null
                : currency === 'sgd'
                  ? parseFloat(parseFloat(item.qty) * computedDiscount).toFixed(2)
                  : parseInt(item.qty) * parseFloat(computedDiscount)}
            </p>
            <p hidden>{parseFloat(parseFloat(subTotalPrice) - computedDiscount).toFixed(2)}</p>
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
        search={{id: 'searchEvent', value: ordersSearchKey,
          placeholder: 'app.ph.searchCust2', onChange: setOrderSearchKey}}
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
      ordersOnHold
    } = this.props
    const emptyOrdersOnHold = (ordersOnHold.length === 0) || (ordersOnHold === null || undefined)
    const empty = (cartItemsArray.length === 0) || (cartItemsArray === null || undefined)
    const buttonOne = empty
      ? undefined
      : {
        name: 'app.button.holdOrder', class: '', type: 'button',
        onClick: this.onClickHoldOrder.bind(this)
      }
    const buttonTwo = emptyOrdersOnHold
    ? undefined
    : {
      name: 'app.button.recallOrder', class: 'is-dark',
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
              confirmButton={<i className='fa fa-plus'></i>}
              cancelButton={<i className='fa fa-times'></i>}
              confirmEvent={this.buttonConfirm.bind(this)}
              cancelEvent={this.buttonCancel.bind(this)}
              onChange={this.keyInput.bind(this)}
              onKeyDown={this.onSubmitKey.bind(this)}
              icon={inputAction === 'search' ? 'fa fa-search' : 'fa fa-user'} />
            : <Level
              left={
                <div>
                  {walkinCustomer !== ''
                    ? <FormattedMessage id='app.general.cust' /> : null}
                  {activeCustomer !== null || undefined
                  ? <h4 className='is-marginless'>
                    {activeCustomer.firstName}
                  </h4>
                  : <div>
                    {walkinCustomer === ''
                      ? <h4 className='is-marginless'>
                        <FormattedMessage id='app.general.walkinCust' />
                        <a style={{marginLeft: 12}}
                          onClick={this.onClickPanelHeaderBtns.bind(this, 'add')}>
                          <FormattedMessage id='app.button.add' />+
                        </a>
                      </h4>
                      : <h4 className='is-marginless'>
                        {walkinCustomer}
                        <a style={{marginLeft: 12}}
                          onClick={this.onClickPanelHeaderBtns.bind(this, 'add')}>
                          +<FormattedMessage id='app.button.edit' />
                        </a>
                      </h4>
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
                ? <FormattedMessage id='app.button.edit' />
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
                  <th><FormattedMessage id='app.general.discount' /></th>
                  <th><FormattedMessage id='app.general.subtotal' /></th>
                  <th></th>
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
    ordersSearchKey: state.ordersOnHold.searchKey
  }
}

export default connect(mapStateToProps)(PanelCart)
