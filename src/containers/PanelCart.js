import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { FormattedMessage } from 'react-intl'

import Counter from '../components/Counter'
import Panel from '../components/Panel'
import Level from '../components/Level'
import SearchModal from './SearchModal'
// import SearchBar from '../components/SearchBar'
import Truncate from '../components/Truncate'
import FunctionButtons from '../components/FunctionButtons'

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
  setDiscount,
  panelCheckoutShouldUpdate
} from '../actions/panelCheckout'

import {
  setOrderSearchKey
} from '../actions/ordersOnHold'

import { customersSetSearchKey } from '../actions/settings'

import {
  holdOrderAndReset,
  recallOrderOnHold,
  closeAndResetRecallModal,
  closeAndResetCustomerModal,
  setActiveCustomerAndFocus
} from '../actions/helpers'

import {
  fetchCustomerByOdboId
} from '../actions/customers'

import {
  closeActiveModal,
  setActiveModal
} from '../actions/application'

class PanelCart extends Component {

  componentDidUpdate () {
    const {activeModalId} = this.props
    if (activeModalId === 'recallOrder') {
      document.getElementById('orderSearch').focus()
    }
  }

  _clickPanelHeaderBtns (inputAction) {
    const {dispatch} = this.props
    dispatch(setCustomerInputActive(inputAction))
    document.getElementById('customerInput').focus()
  }

  _clickRemoveCustomer () {
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

  _clickCurrencyToggle () {
    const {dispatch, currency} = this.props
    currency === 'sgd'
    ? dispatch(setCurrencyType('odbo'))
    : dispatch(setCurrencyType('sgd'))
    document.getElementById('productsSearch').focus()
  }

  _clickHoldOrder () {
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

  _openModal (modalToOpen) {
    const { dispatch, activeModalId } = this.props
    if (activeModalId === null || undefined || '') {
      dispatch(setActiveModal(modalToOpen))
    } else {
      dispatch(closeActiveModal())
      dispatch(setActiveModal(modalToOpen))
    }
  }

  _closeModal (event) {
    const { activeModalId, dispatch } = this.props
    if (activeModalId === 'addCustomDiscount') {
      event.preventDefault()
      dispatch(closeActiveModal())
    }
    dispatch(closeActiveModal())
  }

  _clickButtons (buttonName) {
    const button = buttonName.toLowerCase()
    switch (button) {
      case 'recall order':
        this._openModal('recallOrder')
        break
      case 'hold order':
        this._clickHoldOrder()
        break
      case 'search customer':
        this._openModal('searchOdboUser')
        break
      case 'add overall discount':
        this._openModal('addCustomDiscount')
        break
      default:
    }
  }

  /*
  / COMPUTATIONS
  */

  sumOfCartItems () {
    const {cartItemsArray, currency} = this.props

    let x = cartItemsArray
    let sumOfItemsSgd = 0.00
    let sumOfItemsOdbo = 0

    for (var i = 0; i < x.length; i++) {
      sumOfItemsSgd = sumOfItemsSgd + Number(x[i].subTotalPrice)
      sumOfItemsOdbo = sumOfItemsOdbo + Number(x[i].subTotalOdboPrice)
    }

    let sumOfItems = currency === 'sgd'
      ? Number(sumOfItemsSgd.toFixed(2))
      : Number(sumOfItemsOdbo.toFixed(0))

    return sumOfItems
  }

  sumOfCartDiscounts () {
    const {cartItemsArray, currency, shouldUpdate} = this.props
    let x = cartItemsArray
    let sumOfDiscounts = 0
    for (var i = 0; i < x.length; i++) {
      // validate if there is no custom discount
      sumOfDiscounts = x[i].customDiscount === 0
        // if none then check if product has default discount
        ? x[i].isDiscounted
          // if isDiscounted then compute the default discounts
          ? currency === 'sgd'
            ? (x[i].qty * (Number(x[i].priceDiscount) / 100) * x[i].price) + sumOfDiscounts
            : (x[i].qty * Math.round((Number(x[i].odboPriceDiscount) / 100) * x[i].odboPrice)) + sumOfDiscounts
          // else value is zero
          : sumOfDiscounts
        /* if custom discount then is creater than zero then computed the custom
         discount together with the price of the product */
        : currency === 'sgd'
          ? (x[i].qty * (Number(x[i].customDiscount) / 100) * x[i].price) + sumOfDiscounts
          : (x[i].qty * Math.round((Number(x[i].customDiscount) / 100) * x[i].odboPrice)) + sumOfDiscounts
    }

    let updatedDiscount = shouldUpdate // detects changes in discount
      ? null
      : currency === 'sgd'
        ? Math.round(sumOfDiscounts)
        : Math.round(sumOfDiscounts)
    return updatedDiscount
  }

  overAllDeduct () {
    const {overallDiscount, currency} = this.props
    let discount = overallDiscount === 0
      ? 0 : Number(overallDiscount)
    let overAllDeduct = currency === 'sgd'
      ? (discount / 100) * this.sumOfCartItems()
      : Math.round((discount / 100) * this.sumOfCartItems())
    return overAllDeduct
  }

  orderTotal () {
    const { overallDiscount } = this.props
    let subtotal = overallDiscount === 0
      ? Number(this.sumOfCartItems() - this.sumOfCartDiscounts()).toFixed(2)
      : Number(this.sumOfCartItems() - this.overAllDeduct()).toFixed(2)
    return subtotal
  }

  renderOrderItems () {
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
      let itemDiscount = Number(item.priceDiscount)
      let odboDiscount = Number(item.odboPriceDiscount)
      let customDiscount = Number(item.customDiscount)
      let price = Number(item.price)
      let odboPrice = Number(item.odboPrice)

      // validate customDiscount is equal to 0
      let discountPH = item.customDiscount === 0
        ? item.isDiscounted
          ? currency === 'sgd'
            ? itemDiscount
            : odboDiscount
          : 0.00
        : customDiscount

      // input value: 100 is max value
      let discountVal = odboDiscount === 0
        ? ''
        : customDiscount

      // validate customDiscount is equal to 0
      let discount = customDiscount === 0
        // if true then validate if item discount is enabled
        ? item.isDiscounted
          ? currency === 'sgd'
            ? Math.round((itemDiscount / 100) * price)
            : Math.round((odboDiscount / 100) * odboPrice)
          // else if item discount not enabled, discount is zero
          : 0.00
        // else if customDiscount is not zero, compute overall discount of sale
        : currency === 'sgd'
          ? Math.round((customDiscount / 100) * price)
          : Math.round((customDiscount / 100) * odboPrice)

      let computedDiscount = currency === 'sgd'
        ? price - discount
        : odboPrice - Math.round(discount)

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
            Number(overallDiscount) === 0
              ? <td>
                <form onSubmit={e => {
                  e.preventDefault()
                  document.getElementById('productsSearch').focus()
                }}>
                  <p className='control has-addons' style={{width: 50}}>
                    <input id='itemDiscount' className='input is-small' type='Number'
                      placeholder={discountPH} value={discountVal}
                      onChange={e => setDiscount(e.target.value)} />
                    <a className='button is-small'>%</a>
                  </p>
                </form>
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

  render () {
    var intFrameHeight = window.innerHeight
    const {
      activeCustomer,
      walkinCustomer,
      cartItemsArray,
      // currency,
      overallDiscount,
      shouldUpdate
    } = this.props
    const empty = (cartItemsArray.length === 0) || (cartItemsArray === null || undefined)

    var buttons = [
      {name: 'Reprint/ Refund', icon: 'fa fa-cog'},
      {name: 'Reports', icon: 'fa fa-files-o'},
      {name: 'Add Overall Discount', icon: 'fa fa-calendar-minus-o'},
      {name: 'Hold Order', icon: 'fa fa-hand-rock-o'},
      {name: 'Recall Order', icon: 'fa fa-hand-lizard-o'},
      {name: 'Search Customer', icon: 'fa fa-search'}
    ]

    return (
      <div>
        <Panel>
          <div className='panel-block'>
            <FunctionButtons buttons={buttons} onClickButton={this._clickButtons.bind(this)} />
          </div>
        </Panel>
        <Panel
          panelName={<FormattedMessage id='app.panel.sales' />}>
          <div className='panel-block'>
            {!shouldUpdate
              ? <Level
                left={
                  <h4 className='title is-4 is-marginless'>
                    Order Items
                  </h4>
                }
                right={
                  <div>
                    {activeCustomer !== null || undefined
                    ? <div>
                      <p className='is-marginless'>
                        <FormattedMessage id='app.general.cust' />:
                        <strong>{` ${activeCustomer.firstName}`}</strong>
                      </p>
                      <a style={{color: 'orange'}}
                        onClick={this._clickRemoveCustomer.bind(this)}>
                        <i className='fa fa-times' />
                        <FormattedMessage id='app.button.remove' />
                      </a>
                    </div>
                    : <div>
                      {walkinCustomer === ''
                        ? <h4 className='is-marginless'>
                          <FormattedMessage id='app.general.walkinCust' />
                        </h4>
                        : <div>
                          <p className='is-marginless'>
                            <FormattedMessage id='app.general.cust' />:
                            <strong>{` ${walkinCustomer}`}</strong>
                          </p>
                          <a style={{color: 'orange'}}
                            onClick={this._clickRemoveCustomer.bind(this)}>
                            <i className='fa fa-times' />
                            <FormattedMessage id='app.button.remove' />
                          </a>
                        </div>
                      }
                    </div>
                    }
                  </div>
                } />
              : <div className='has-text-centered'>
                <i className='fa fa-spinner fa-pulse fa-fw' />
              </div>
            }
          </div>
          <div className='panel-block' style={{padding: 0}}>
            <div className='content'
              style={{height: intFrameHeight / 2.7, overflowY: 'scroll'}}>
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
                    {this.renderOrderItems()}
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
          <div className='panel-block' style={{paddingTop: 5, paddingBottom: 5}}>
            <Level left={
              <strong>Subtotal</strong>
              }
              right={<strong>{this.sumOfCartItems()}</strong>} />
            <Level left={
              <strong>Discounts</strong>
              }
              right={<strong>{
                overallDiscount === 0
                ? this.sumOfCartDiscounts()
                : this.overAllDeduct()
              }</strong>} />
            <Level left={
              <strong>Order Total</strong>
              }
              right={
                <h3 className='is-marginless'>
                  <strong>{this.orderTotal()}</strong>
                </h3>
            } />
          </div>
          {this.renderModal()}
        </Panel>
      </div>
    )
  }

  renderModal () {
    const { activeModalId, ordersOnHold } = this.props
    if (activeModalId === 'recallOrder') {
      let modalToRender
      if (ordersOnHold || ordersOnHold.length > 0) {
        modalToRender = this.renderRecallOrderModal()
      }
      return modalToRender
    } else if (activeModalId === 'searchOdboUser') {
      return this.renderCustomerModal()
    } else if (activeModalId === 'addCustomDiscount') {
      return this.renderCustomDiscount()
    }
  }

  _setOverallDiscount (value) {
    const {dispatch} = this.props
    dispatch(panelCheckoutShouldUpdate(true))
    let discount = value === ''
      ? 0
      : Number(value) > 100 ? 100 : value
    dispatch(setDiscount(discount))
  }

  renderCustomDiscount () {
    const { activeModalId, overallDiscount } = this.props
    let modalActive = activeModalId === 'addCustomDiscount'
      ? 'modal is-active'
      : 'modal'
    // @discountPH: Discount Placeholder
    let discountPH = overallDiscount === '' || !overallDiscount
      ? 0
      : Number(overallDiscount)
    // @discount: discount value to be displayed
    let discount = overallDiscount === '' || !overallDiscount
      ? ''
      : Number(overallDiscount) > 100 ? 100 : overallDiscount
    // @subtotal: display apropriate computation of discounts
    return (
      <div className={modalActive}>
        <div className='modal-background' />
        <div className='modal-card'>
          <header className='modal-card-head'>
            <p className='modal-card-title is-marginless has-text-centered'>
              Set Overall Discount
            </p>
            <button className='delete' onClick={this._closeModal.bind(this)} />
          </header>
          <div className='modal-card-body'>
            <div className='content columns is-mobile is-multiline has-text-centered'>
              <div className='column is-8 is-offset-2'>
                <div className='control is-horizontal'>
                  <p className='control-label'><h3 className='label'>Discount Percent</h3></p>
                  <p className='control has-addons'>
                    <form onSubmit={this._closeModal.bind(this)} >
                      <input id='itemDiscount' className='input is-large' type='Number' style={{maxWidth: 80}}
                        placeholder={discountPH} value={discount}
                        onChange={e => this._setOverallDiscount(e.target.value)} />
                      <a className='button is-large'>%</a>
                    </form>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  renderRecallOrderModal () {
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

  renderCustomerModal () {
    const {
      activeModalId,
      customersArray,
      customerSearchKey,
      customerFilter,
      fetchingCustomers
    } = this.props
    return (
      <SearchModal
        id='searchOdboUser'
        title='ODBO Users'
        active={activeModalId}
        items={customersArray}
        filter={customerFilter}
        isFetching={fetchingCustomers}
        search={{id: 'searchEvent',
          value: customerSearchKey,
          placeholder: 'app.ph.searchCust2',
          onChange: customersSetSearchKey}}
        closeButton={{name: <FormattedMessage id='app.button.cancel' />,
          event: closeAndResetCustomerModal}}
        listButton={{name: 'Select Customer',
          event: setActiveCustomerAndFocus}} />
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
    fetchingCustomers: state.data.customers.isFetching,
    customerSearchKey: state.settings.customerSearchKey,
    customerFilter: state.settings.customerFilter,
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
