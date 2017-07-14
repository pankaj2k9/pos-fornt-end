import React from 'react'
import { connect } from 'react-redux'
import { injectIntl, FormattedMessage } from 'react-intl'

import Table from '../components/Table'
import LoadingPane from '../components/LoadingPane'

import {
  closeActiveModal,
  setActiveModal
} from '../actions/app/mainUI'

import {
  storeOrdersFetch,
  storeOrdersSetPage,
  storeOrdersSetActiveId
} from '../actions/reports'
import {
  storeOrdersFetchOffline
} from '../actions/data/offlineData'

class StoreOrders extends React.Component {
  constructor (props) {
    super(props)

    this._fetchOrdersToday = this._fetchOrdersToday.bind(this)
    this._renderPagination = this._renderPagination.bind(this)
    this._getClickPageAction = this._getClickPageAction.bind(this)
    this._handleOrderClick = this._handleOrderClick.bind(this)
    this._onClickModalClose = this._onClickModalClose.bind(this)
  }

  componentDidMount () {
    this._fetchOrdersToday()
  }

  onClickCloseModal () {
    const {dispatch} = this.props
    dispatch(closeActiveModal())
  }

  _fetchOrdersToday (query) {
    const { dispatch, store, limit, date, posMode } = this.props
    let storeId = store.source
    // get sales today
    const from = date || new Date()
    from.setHours(0, 0, 0, 0)

    const to = date ? new Date(date) : new Date()
    let newSkip = !query ? 0 : query.skip < 10 ? 0 : query.skip
    to.setHours(23, 59, 59, 999)

    const params = {
      storeId,
      from,
      to,
      limit,
      skip: newSkip
    }

    if (posMode === 'offline') {
      dispatch(storeOrdersFetchOffline(params))
    } else {
      dispatch(storeOrdersFetch(params))
    }
  }

  _handleOrderClick (orderId) {
    const { dispatch } = this.props
    dispatch(storeOrdersSetActiveId(orderId))
    dispatch(setActiveModal('orderDetails'))
  }

  _onClickModalClose () {
    const { dispatch } = this.props

    dispatch(storeOrdersSetActiveId(null))
  }

  _handlePageClick (page) {
    const { dispatch, limit } = this.props
    const skip = (page - 1) * limit
    dispatch(storeOrdersSetPage(page))
    this._fetchOrdersToday({ skip })
  }

  _getClickPageAction (page) {
    return this._handlePageClick.bind(this, page)
  }

  _constructOrderItems () {
    const { orderItems, intl } = this.props
    const from = new Date()
    from.setHours(0, 0, 0, 0)

    const to = new Date()
    to.setHours(23, 59, 59, 999)

    // let sortedOrders = orderItems.sort(function (a, b) {
    //   // Turn your strings into dates, and then subtract them
    //   // to get a value that is either negative, positive, or zero.
    //   return new Date(b.dateCreated) - new Date(a.dateCreated)
    // })

    const productOrderItems = orderItems.map((order, index) => {
      var remarkLength = 15
      var refundRemark = order.refundRemarks
      const currency = order.currency === 'sgd' ? 'SGD' : 'The Odbo coins'
      let isRefunded = order.isRefunded
        ? `${intl.formatMessage({id: 'app.general.refundedOrder'})} "${refundRemark.substring(0, remarkLength) + '...'}"`
        : ''
      let type = 'N/A'

      const paymentsCount = order.payments && order.payments.length
      if (paymentsCount) {
        type = ''

        order.payments.forEach((payment, index) => {
          type += payment.type

          if (index + 1 < paymentsCount) { type += `, ` }
        })
      } else if (order.posTrans && order.posTrans.type) {
        type = order.posTrans.type
      }

      return {
        id: order.id,
        dateCreated: {
          value: order.dateCreated,
          type: 'date'
        },
        type: {
          value: type,
          type: 'string'
        },
        subtotal: {
          value: `${order.isRefunded ? '-' : ''}${order.subtotal} ${currency} ${isRefunded}`,
          type: 'string'
        }
      }
    })

    return productOrderItems
  }

  _renderPagination () {
    const { total, limit, page } = this.props

    const PAGINATION_LAST_PAGE = Math.ceil(total / limit)
    const PAGINATION_FIRST_PAGE = 1
    const CURRENT_PAGE = page
    const PAGINATION_MAIN_PAGES = []
    const PAGINATION_MAIN_PAGES_LIMIT = 3

    const START_PAGE = CURRENT_PAGE === 1 ? 1 : CURRENT_PAGE - 1
    for (let i = 0; i < PAGINATION_MAIN_PAGES_LIMIT; i++) {
      if (START_PAGE + i <= PAGINATION_LAST_PAGE) {
        PAGINATION_MAIN_PAGES.push(START_PAGE + i)
      } else if (START_PAGE - 1 > 0) {
        PAGINATION_MAIN_PAGES.unshift(START_PAGE - 1)
        break
      }
    }

    const prevBtnClass = `button ${CURRENT_PAGE === PAGINATION_FIRST_PAGE
      ? 'is-disabled' : null}`
    const nextBtnClass = `button ${CURRENT_PAGE === PAGINATION_LAST_PAGE
      ? 'is-disabled' : null}`

    return (
      <nav className='pagination' style={{ marginBottom: '20px' }}>
        <a className={prevBtnClass}
          onClick={this._getClickPageAction(CURRENT_PAGE - 1)}>
          <FormattedMessage id='app.general.previous' />
        </a>
        <a className={nextBtnClass}
          onClick={this._getClickPageAction(CURRENT_PAGE + 1)}>
          <FormattedMessage id='app.general.nextPage' />
        </a>

        <ul>
          {PAGINATION_MAIN_PAGES.map(THIS_PAGE =>
            <li key={`topups-table-page-${THIS_PAGE}`}>
              <a className={`button ${THIS_PAGE === CURRENT_PAGE ? 'is-primary' : null}`}
                onClick={THIS_PAGE === CURRENT_PAGE
                  ? null : this._getClickPageAction(THIS_PAGE)}>
                {THIS_PAGE}
              </a>
            </li>
          )}
        </ul>
      </nav>
    )
  }

  render () {
    const { locale, isLoading, orderItems, activeOrder, intl } = this.props

    const productOrderItems = this._constructOrderItems(orderItems)
    const columnHeaders = [
      <FormattedMessage id='app.page.reports.id' />,
      <FormattedMessage id='app.page.reports.dateCreated' />,
      <FormattedMessage id='app.page.reports.currency' />,
      <FormattedMessage id='app.page.reports.total' />
    ]

    let details = []
    if (activeOrder) {
      details = [
        {name2: 'Order Id', desc: activeOrder.id},
        {name: 'app.general.custName',
          desc: `${!activeOrder.users ? 'Walkin Customer' : activeOrder.users.firstName}`},
        {name2: 'Date Ordered',
          desc: `${intl.formatDate(activeOrder.dateCreated)}, ${intl.formatTime(activeOrder.dateCreated)}`},
        {name2: 'Order Summary'}
      ]

      if (activeOrder.vouchers) {
        details = [...details, {name2: 'Vouchers'}]

        activeOrder.vouchers.forEach((voucher, index) => {
          const voucherNumber = index + 1
          details = [
            ...details,
            {
              name2: `Deduction (Voucher #${voucherNumber}`,
              desc: voucher.deduction
            },
            {
              name2: `Remarks (Voucher #${voucherNumber}`,
              desc: voucher.remarks
            }
          ]
        })
      }

      if (activeOrder.posTrans) {
        details = [
          ...details,
          {desc: `Mode of Payment: ${activeOrder.posTrans && activeOrder.posTrans.type}`},
          {desc: `Payment: ${activeOrder.posTrans && activeOrder.posTrans.payment}`},
          {desc: `Subtotal: ${activeOrder.subtotal}`},
          {desc: `Total: ${activeOrder.total}`}
        ]
      } else if (activeOrder.payments) {
        let orderTotal = 0

        activeOrder.payments.forEach((payment, index) => {
          orderTotal += Number(payment.amount)
          details = [
            ...details,
            {desc: `Payment #${index + 1}: ${payment.type}`},
            {desc: `Subtotal: SGD ${payment.amount}`}
          ]
        })

        details = [
          ...details,
          {
            name2: 'Order Total',
            desc: `SGD ${intl.formatNumber(orderTotal, {
              minimumFractionDigits: 2, maximumFractionDigits: 2
            })}`
          }
        ]
      }
    }

    return (isLoading
      ? <LoadingPane
        headerMessage={<FormattedMessage id='app.page.reports.loadingStoreOrders' />} />
      : <div>
        {this._renderPagination()}
        <Table
          locale={locale}
          tableName={'Order Items'}
          columnHeaders={columnHeaders}
          rowItems={productOrderItems}
          onClickRow={this._handleOrderClick}
        />
        {this._renderPagination()}
      </div>
    )
  }
}

function mapStateToProps (state) {
  const activeOrderId = state.reports.storeOrders.activeOrderId
  const orderById = state.reports.storeOrders.byId
  const activeOrder = orderById[activeOrderId]

  return {
    locale: state.intl.locale,
    activeModalId: state.app.mainUI.activeModalId,
    posMode: state.app.mainUI.posMode,
    store: state.app.mainUI.activeStore,
    date: state.reports.date,
    isLoading: state.reports.storeOrders.isLoading,
    orderItems: state.reports.storeOrders.orderItems,
    page: state.reports.storeOrders.page,
    total: state.reports.storeOrders.total,
    limit: state.reports.storeOrders.limit,
    skip: state.reports.storeOrders.skip,
    activeModal: state.reports.storeOrders.activeModal,
    activeOrderId,
    activeOrder,
    intl: state.intl
  }
}

export default connect(mapStateToProps)(injectIntl(StoreOrders))
