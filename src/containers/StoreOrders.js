import React from 'react'
import { connect } from 'react-redux'
import { injectIntl, FormattedMessage } from 'react-intl'

import ViewOrder from '../components/ViewOrder'
import SimpleModal from '../components/SimpleModal'
import Table from '../components/Table'
import LoadingPane from '../components/LoadingPane'
import {
  storeOrdersFetch,
  storeOrdersSetPage,
  storeOrdersSetActiveId
} from '../actions/reports'

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

  _fetchOrdersToday (query) {
    const { dispatch, storeId, limit } = this.props

    // get sales today
    const from = new Date()
    from.setHours(0, 0, 0, 0)

    const to = new Date()

    let newSkip = !query ? 0 : query.skip < 10 ? 0 : query.skip
    to.setHours(23, 59, 59, 999)

    const params = {
      storeId,
      from,
      to,
      limit,
      skip: newSkip
    }

    dispatch(storeOrdersFetch(params))
  }

  _handleOrderClick (orderId) {
    const { dispatch } = this.props

    dispatch(storeOrdersSetActiveId(orderId))
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

    let sortedOrders = orderItems.sort(function (a, b) {
      // Turn your strings into dates, and then subtract them
      // to get a value that is either negative, positive, or zero.
      return new Date(b.dateCreated) - new Date(a.dateCreated)
    })

    const productOrderItems = sortedOrders.map((order, index) => {
      const currency = order.currency === 'sgd' ? 'SGD' : 'The Odbo coins'
      let isRefunded = order.isRefunded
        ? intl.formatMessage({ id: 'app.general.refundedOrder' })
        : ''
      return {
        id: `${order.id} ${isRefunded}`,
        dateCreated: {
          value: order.dateCreated,
          type: 'date'
        },
        type: {
          value: order.posTrans.type,
          type: 'string'
        },
        subtotal: {
          value: `${order.subtotal} ${currency}`,
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
    const { locale, isLoading, orderItems, activeModal, activeOrder } = this.props

    const productOrderItems = this._constructOrderItems(orderItems)
    const columnHeaders = [
      <FormattedMessage id='app.page.reports.id' />,
      <FormattedMessage id='app.page.reports.dateCreated' />,
      <FormattedMessage id='app.page.reports.currency' />,
      <FormattedMessage id='app.page.reports.total' />
    ]
    const modalTitle = <FormattedMessage id='app.modal.order' />
    const ViewComponent = activeOrder
      ? <ViewOrder orderItemData={activeOrder} />
      : null

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

        <SimpleModal
          modalClass={`modal ${activeModal === 'view' ? 'is-active' : null}`}
          modalTitle={modalTitle}
          modalBodyComponent={ViewComponent}
          modalBtnCloseClass={'delete'}
          modalCloseBtnOnClick={this._onClickModalClose}
          modalPrimaryBtnLabel={null}
          modalPrimaryBtnOnClick={null}
          modalPrimaryBtnClass={'button is-primary'}
          modalCancelBtnLabel={null}
          modalCancelBtnClass={'button'}
          modalCancelBtnOnClick={null} />
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
    storeId: state.application.storeId,
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
