import React, { Component, PropTypes } from 'react'
import { browserHistory } from 'react-router'
import { connect } from 'react-redux'
import { FormattedMessage } from 'react-intl'

// import Level from '../components/Level'
import SearchModal from './SearchModal'
import FunctionButtons from '../components/FunctionButtons'

import {
  setWalkinCustomer,
  setInputOdboID,
  removeCustomer,
  setCurrencyType,
  panelCartShouldUpdate
} from '../actions/panelCart'

import {
  addItemToCart
} from '../actions/panelProducts'

import {
  setDiscount,
  panelCheckoutShouldUpdate,
  setPaymentMode,
  toggleBonusPoints,
  printPreviewTotal
} from '../actions/panelCheckout'

import {
  setOrderSearchKey
} from '../actions/ordersOnHold'

import {
  customersSetSearchKey,
  setSettingsActiveTab
} from '../actions/settings'

import {
  reportsSetTab
} from '../actions/reports'

import {
  holdOrderAndReset,
  recallOrderOnHold,
  closeAndResetRecallModal,
  closeAndResetCustomerModal,
  setActiveCustomerAndFocus
} from '../actions/helpers'

import {
  closeActiveModal,
  setActiveModal,
  togglePosMode
} from '../actions/application'

const focusProductSearch = 'productsSearch'
const focusOrderSearch = 'orderSearch'
const focusOdboUserSearch = 'odboIdSearch1'
const focusDiscountInput = 'overallDiscountInput'

class PanelCart extends Component {
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

  _openModal (modalToOpen, inputToFocus) {
    const { dispatch, activeModalId } = this.props
    if (activeModalId === null || undefined || '') {
      dispatch(setActiveModal(modalToOpen, inputToFocus || null))
    } else {
      dispatch(closeActiveModal())
      dispatch(setActiveModal(modalToOpen, inputToFocus || null))
    }
  }

  _closeModal (event) {
    const { activeModalId, dispatch } = this.props
    if (activeModalId === 'addCustomDiscount') {
      event.preventDefault()
      dispatch(closeActiveModal(focusProductSearch))
    }
    dispatch(closeActiveModal(focusProductSearch))
  }

  onClickProduct (productId) {
    const {dispatch, productsById} = this.props
    const product = productsById[productId]
    dispatch(addItemToCart(product))
    this._closeModal()
    document.getElementById('productsSearch').focus()
  }

  _clickButtons (buttonName) {
    const {dispatch, cartItemsArray, posMode, networkStatus} = this.props
    const button = buttonName.toLowerCase()
    if (cartItemsArray.length > 0) {
      switch (button) {
        case 'hold order':
          this._clickHoldOrder()
          break
        case 'recall order':
          this._openModal('recallOrder', focusOrderSearch)
          break
        case 'add overall discount':
          this._openModal('addCustomDiscount', focusDiscountInput)
          break
        case 'print total':
          if (cartItemsArray.length > 0) {
            let print = true
            let shouldUpdate = true
            dispatch(printPreviewTotal(print, shouldUpdate))
            dispatch(setActiveModal('printingPreview'))
          }
          break
        default:
      }
    } else {
      document.getElementById('productsSearch').focus()
    }
    if (posMode === 'online') {
      switch (button) {
        case 'switch to offline':
          dispatch(togglePosMode('offline'))
          if (networkStatus === 'online') {
            var d = document.getElementById('netStat')
            setTimeout(function () {
              d.className += ' is-hidden-widescreen is-hidden-tablet'
            }, 1)
          }
          break
        case 'x/z reading':
          dispatch(reportsSetTab('completeSales'))
          browserHistory.push('reports')
          break
        case 'view bill':
          dispatch(reportsSetTab('bills'))
          browserHistory.push('reports')
          break
        case 'staff sales':
          dispatch(reportsSetTab('staffSales'))
          browserHistory.push('reports')
          break
        case 'outlet stock':
          dispatch(reportsSetTab('stocks'))
          browserHistory.push('reports')
          break
        case 'reprint/ refund':
          dispatch(setSettingsActiveTab('orders'))
          browserHistory.push('settings')
          break
        case 'sync data':
          dispatch(setActiveModal('syncModal'))
          break
        default:
      }
    } else {
      switch (button) {
        case 'switch to online':
          dispatch(togglePosMode('online'))
          break
        default:
      }
    }
  }

  _clickOtherButtons (buttonName) {
    const { dispatch } = this.props
    let mode = buttonName.toLowerCase()
    if (mode === 'admin') {
      window.open('https://uat-admin.theodbocare.com/', '_blank') // temporary link
    } else if (mode === 'product list') {
      dispatch(setActiveModal('productsList'))
    } else if (mode === 'search customer') {
      this._openModal('searchOdboUser', focusOdboUserSearch)
    } else if (mode === 'adjust points') {
      dispatch(setSettingsActiveTab('customers'))
      browserHistory.push('settings')
    }
  }

  _clickPaymentButtons (buttonName) {
    const { dispatch, currency, activeCustomer, cartItemsArray } = this.props
    let mode = buttonName.toLowerCase()
    if (activeCustomer && cartItemsArray.length > 0 && mode === 'use odbo coins' || mode === 'double points') {
      if (mode === 'use odbo coins') {
        currency === 'sgd'
        ? dispatch(setCurrencyType('odbo'))
        : dispatch(setCurrencyType('sgd'))
      } else if (mode === 'double points') {
        dispatch(toggleBonusPoints())
      }
      document.getElementById('productsSearch').focus()
    } else if (cartItemsArray.length > 0 && mode !== 'use odbo coins' && mode !== 'double points') {
      dispatch(panelCartShouldUpdate(true))
      if (mode !== 'voucher') {
        dispatch(setActiveModal('paymentModal', 'paymentValue'))
      } else {
        dispatch(setActiveModal('paymentModal', 'voucherAmount'))
      }
      dispatch(setPaymentMode(mode))
    } else {
      document.getElementById('productsSearch').focus()
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
        ? Number(sumOfDiscounts.toFixed(2))
        : Number(sumOfDiscounts.toFixed(0))
    return updatedDiscount
  }

  sumOfPayments () {
    const { payments } = this.props
    let x = payments
    let voucherTotal = this.vouchers() ? this.vouchers().voucherTotal : 0
    let sumOfPayments = 0
    if (x) {
      for (var i = 0; i < x.length; i++) {
        sumOfPayments = sumOfPayments + (Number(x[i].amount) || 0)
      }
    }
    if (!sumOfPayments) {
      return 0
    } else {
      return sumOfPayments + voucherTotal
    }
  }

  overAllDeduct () {
    const {customDiscount, currency} = this.props
    let discount = !customDiscount || customDiscount === '' || customDiscount === 0
      ? 0 : Number(customDiscount)
    let overAllDeduct = currency === 'sgd'
      ? (discount / 100) * this.sumOfCartItems()
      : Math.round((discount / 100) * this.sumOfCartItems())
    return overAllDeduct
  }

  orderTotal () {
    const { customDiscount } = this.props
    let subtotal = !customDiscount || customDiscount === 0
      ? Number(this.sumOfCartItems() - this.sumOfCartDiscounts())
      : this.sumOfCartItems() - this.overAllDeduct()
    return Number(subtotal)
  }

  paymentMinusOrderTotal () {
    return this.sumOfPayments() - this.orderTotal()
  }

  vouchers () {
    const {payments} = this.props
    let voucherToString = ''
    let voucherList = []
    let voucherTotal = 0
    let vouchers
    if (payments) {
      payments.forEach(payment => {
        if (payment.type === 'voucher' && payment.vouchers.length > 0) {
          payment.vouchers.forEach(voucher => {
            let v1 = `${voucher.deduction}, `
            voucherList.push(voucher)
            voucherTotal += Number(voucher.deduction)
            voucherToString = voucherToString.concat(v1)
            vouchers = {
              voucherToString: voucherToString,
              voucherList: voucherList,
              voucherTotal: voucherTotal
            }
          })
        }
      })
    }
    return vouchers
  }

  render () {
    const {
      activeCustomer,
      cartItemsArray,
      ordersOnHold,
      shouldUpdate,
      posMode
    } = this.props
    let disableAddPayment
    let disableOtherButtons
    if (cartItemsArray.length === 0) {
      disableAddPayment = true
      disableOtherButtons = true
    } else if (!shouldUpdate) {
      disableAddPayment = this.sumOfPayments() - this.orderTotal() >= 0
      disableOtherButtons = false
    }

    const disabled = posMode === 'offline'

    const toggleMode = posMode === 'offline'
      ? {name: 'Switch to Online', label: 'app.button.switchOnline', icon: 'fa fa-window-minimize', customColor: 'blue', size: 'is-3'}
      : {name: 'Switch to Offline', label: 'app.button.switchOffline', icon: 'fa fa-wifi', customColor: 'green', size: 'is-3'}

    var buttons1 = [
      toggleMode,
      {name: 'Recall Order', label: 'app.button.recallOrder', icon: 'fa fa-hand-lizard-o', customColor: ordersOnHold.length > 0 ? '#23d160' : 'grey', size: 'is-3'},
      {name: 'Hold Order', label: 'app.button.holdOrder', icon: 'fa fa-hand-rock-o', customColor: disableOtherButtons ? 'grey' : 'black', size: 'is-3'},
      {name: 'Print Total', label: 'app.button.printTotal', icon: 'fa fa-print', customColor: disableOtherButtons ? 'grey' : 'black', size: 'is-3'},
      {name: 'Sync Data', disabled, label: 'app.button.syncData', icon: 'fa fa-refresh', size: 'is-3'},
      {name: 'X/Z Reading', disabled, label: 'app.button.xzReading', icon: 'fa fa-files-o', size: 'is-3'},
      {name: 'View Bill', disabled, label: 'app.button.viewBill', icon: 'fa fa-files-o', size: 'is-3'},
      {name: 'Staff Sales', disabled, label: 'app.button.staffSales', icon: 'fa fa-files-o', size: 'is-3'},
      {name: 'Outlet Stock', disabled, label: 'app.button.outletStock', icon: 'fa fa-files-o'},
      {name: 'Reprint/ Refund', disabled, label: 'app.button.repRef', icon: 'fa fa-cog'},
      {name: 'Add Overall Discount', label: 'app.button.addOD', icon: 'fa fa-calendar-minus-o', customColor: disableOtherButtons ? 'grey' : 'black'}
    ]

    var buttons2 = [
      {name: 'Cash', label: 'app.button.cash', icon: 'fa fa-money', customColor: disableAddPayment ? 'grey' : '#4A235A'},
      {name: 'Credit', label: 'app.button.credit', icon: 'fa fa-credit-card', customColor: disableAddPayment ? 'grey' : '#4A235A'},
      {name: 'Nets', label: 'app.button.nets', icon: 'fa fa-credit-card', customColor: disableAddPayment ? 'grey' : '#4A235A'},
      {name: 'Double Points', disabled, label: 'app.button.doublePoints', icon: 'fa fa-star-o', customColor: activeCustomer ? 'orange' : 'grey'},
      {name: 'Use Odbo Coins', disabled, label: 'app.button.useOC', icon: 'fa fa-asterisk', customColor: activeCustomer ? '#23d160' : 'grey'},
      {name: 'Voucher', label: 'app.button.voucher', icon: 'fa fa-file-excel-o', customColor: disableAddPayment ? 'grey' : '#4A235A'}
    ]

    var buttons3 = [
      {name: 'Admin', disabled, label: 'app.button.admin', icon: 'fa fa-user-secret fa-lg', size: 'is-3'},
      {name: 'Product List', label: 'app.button.prodList', icon: 'fa fa-shopping-bag fa-lg', size: 'is-3'},
      {name: 'Search Customer', disabled, label: 'app.button.cust', icon: 'fa fa-search fa-lg', size: 'is-3'},
      {name: 'Adjust Points', disabled, label: 'app.button.adjustPts', icon: 'fa fa-arrows-v fa-lg', size: 'is-3'}
    ]

    return (
      <div>
        <div className='panel'>
          <div className='panel-block' style={{padding: 5}}>
            <FunctionButtons buttons={buttons3} onClickButton={this._clickOtherButtons.bind(this)} />
          </div>
        </div>
        <div className='panel'>
          <div className='panel-block' style={{padding: 5}}>
            <FunctionButtons buttons={buttons1} onClickButton={this._clickButtons.bind(this)} />
          </div>
        </div>
        <div className='panel'>
          <div className='panel-block' style={{padding: 5}}>
            <FunctionButtons buttons={buttons2} onClickButton={this._clickPaymentButtons.bind(this)} />
          </div>
        </div>
        {this.renderModal()}
      </div>
    )
  }

  renderProductItems () {
    const {
      locale,
      productsArray,
      productsSearchKey,
      productsFilter,
      storeId
    } = this.props
    let filterString = productsFilter.trim().toLowerCase()
    let searchKey = productsSearchKey.trim().toLowerCase()
    let firstFilter = []
    let filteredProducts = []

    if (productsFilter === 'all' && productsSearchKey === '') {
      filteredProducts = productsArray
    } else if (productsFilter === 'all' && productsSearchKey !== '') {
      filteredProducts = productsArray.filter(function (product) {
        return product.nameEn.toLowerCase().match(searchKey) ||
          product.descriptionEn.toLowerCase().match(searchKey) ||
          product.nameZh.toLowerCase().match(searchKey) ||
          product.descriptionZh.toLowerCase().match(searchKey)
      })
    } else if (productsFilter !== 'all' && productsSearchKey === '') {
      filteredProducts = productsArray.filter(function (product) {
        return product.type.toLowerCase().match(filterString)
      })
    } else if (productsFilter !== 'all' || productsSearchKey !== '') {
      firstFilter = productsArray.filter(function (product) {
        return product.type.toLowerCase().match(filterString)
      })
      filteredProducts = firstFilter.filter(function (product) {
        return product.nameEn.toLowerCase().match(searchKey) ||
          product.descriptionEn.toLowerCase().match(searchKey) ||
          product.nameZh.toLowerCase().match(searchKey) ||
          product.descriptionZh.toLowerCase().match(searchKey)
      })
    }
    return filteredProducts.map(function (product, key) {
      let productStock = {}
      product.stock.forEach(obj => {
        if (obj.storeId === storeId) {
          let tagColor
          if (obj.stock >= 51) {
            tagColor = {color: 'green'}
          } else if (obj.stock <= 50) {
            if (obj.stock > 20) {
              tagColor = {color: 'orange'}
            } else if (obj.stock < 20) {
              tagColor = {color: 'red'}
            }
          }
          productStock = {stock: obj.stock, tag: tagColor}
        }
      })
      let tag = productStock.tag
      let productName = locale === 'en' ? product.nameEn : product.nameZh

      return (
        <div
          key={key}
          className={`column is-4`}
          onClick={this.onClickProduct.bind(this, product.id)}>
          <div className='card' style={{height: 140}}>
            <div className='section' style={{padding: 20, backgroundColor: 'transparent'}}>
              <div className='title is-5'>
                {productName}
              </div>

              {product.stock.length === 0 || Object.keys(productStock).length === 0
                ? <p style={{
                  color: 'red',
                  fontSize: 16 }}>
                  update stock on admin
                </p>
                : <div>
                  {'stock: '}
                  <span
                    style={{fontSize: 18}}>
                    <strong style={tag}>
                      {productStock.stock}
                    </strong>
                  </span>
                </div>
              }
            </div>
          </div>
        </div>
      )
    }, this)
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
    } else if (activeModalId === 'productsList') {
      return this.renderProductsList()
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

  renderProductsList () {
    const {activeModalId} = this.props
    var modalActive = activeModalId === 'productsList'
      ? 'modal is-active'
      : 'modal'
    return (
      <div className={modalActive}>
        <div className='modal-background'>
          <div className='modal-card'>
            <header className='modal-card-head'>
              <p className='modal-card-title is-marginless has-text-centered'>
                Products List
              </p>
              <button className='delete' onClick={this._closeModal.bind(this)} />
            </header>
            <div className='modal-card-body'>
              <div className='columns is-multiline is-mobile'>
                {this.renderProductItems()}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
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
                      <input id='overallDiscountInput' className='input is-large' type='Number' style={{maxWidth: 80}}
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
      customerSearchKeyOIDFR,
      customerSearchKeyOIDTO,
      fetchingCustomers
    } = this.props
    return (
      <SearchModal
        id='searchOdboUser'
        title='ODBO Users'
        active={activeModalId}
        items={customersArray}
        filter={customerFilter}
        odboIdFrom={customerSearchKeyOIDFR}
        odboIdTo={customerSearchKeyOIDTO}
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
    storeId: state.application.storeId,
    posMode: state.application.posMode,
    networkStatus: state.application.networkStatus,
    productsArray: state.data.products.productsArray,
    productsById: state.data.products.productsById,
    productsSearchKey: state.panelProducts.productsSearchKey,
    productsFilter: state.panelProducts.productsFilter,
    processedOfflineOrders: state.offlineOrders.processedOfflineOrders,
    fetchingCustomers: state.data.customers.isFetching,
    customerSearchKey: state.settings.customerSearchKey,
    customerSearchKeyOIDFR: state.settings.customerSearchKeyOIDFR,
    customerSearchKeyOIDTO: state.settings.customerSearchKeyOIDTO,
    customerFilter: state.settings.customerFilter,
    activeCustomer: state.panelCart.activeCustomer,
    walkinCustomer: state.panelCart.walkinCustomer,
    customerSearchError: state.panelCart.customerSearchError,
    currency: state.panelCart.currency,
    customDiscount: state.panelCart.customDiscount,
    shouldUpdate: state.panelCart.shouldUpdate,
    searchKey: state.panelCart.customerSearchKey,
    totalPrice: state.panelCart.totalPrice,
    totalOdboPrice: state.panelCart.totalOdboPrice,
    overallDiscount: state.panelCheckout.customDiscount,
    ordersSearchKey: state.ordersOnHold.searchKey
  }
}

export default connect(mapStateToProps)(PanelCart)
