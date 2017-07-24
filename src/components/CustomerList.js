import React from 'react'

import {connect} from 'react-redux'
import { formatDate } from '../utils/string'
import { processOdboID, processCustomers } from '../utils/computations'
import ContentDivider from '../components/ContentDivider'
import CustomerListHeader from '../components/CustomerListHeader'
import { injectIntl } from 'react-intl'

import {
  setActiveCustomer
} from '../actions/data/orderData'

import {
  customersSetActivePage
} from '../actions/data/customers'

import {
  transactionsSetOdboId
} from '../actions/transactionHistory'

import {
  setActiveModal
} from '../actions/app/mainUI'
import SimplePagination from '../components/SimplePagination'
const PAGINATION_MARGIN_BOTTOM = 10

const bold = (txt) => { return <strong>{txt}</strong> }

class CustomerListItem extends React.Component {
  render () {
    const { customer, key, buttonText, onClickButton, onClickHistoryButton } = this.props
    let {firstName, lastName, odboCoins, odboId, membership, status, dateUpdated, phoneNumber} = customer
    return (
      <div className='box is-clearfix' key={key}>
        <div className='media-content is-clearfix'>
          <p className='is-pulled-left title is-4'>
            {bold(`[ID#${processOdboID(odboId)}] `)}
            {`< ${firstName} ${lastName || ''} >`}
          </p>
          <div style={{float: 'right', marginBottom: '10px'}}>
            {
              buttonText &&
              <a className='button is-success is-pulled-right'
                onClick={e => { onClickButton(customer) }}>
                {buttonText}
              </a>
            }
            <a className='button is-success is-pulled-right'
              style={{marginRight: '10px'}}
              onClick={e => { onClickHistoryButton(customer) }}>
              History
            </a>
          </div>

          <ContentDivider contents={[
            <div>
              <p>{bold('membership:')} {membership}</p>
              <p>{bold('odbo coins:')} {odboCoins || 0}</p>
              <p>{bold('contact number:')} {phoneNumber || 'N/A'}</p>
            </div>,
            <div>
              <p>{bold('status:')} {status}</p>
              <p>{bold('last update:')} {formatDate(dateUpdated)}</p>
            </div>
          ]} size={6} />
        </div>
      </div>
    )
  }
}

class CustomerList extends React.Component {
  constructor (props) {
    super(props)
    this._renderPagination = this._renderPagination.bind(this)
    this.setActivePage = this.setActivePage.bind(this)
    this.onClickCustomerHistoryButton = this.onClickCustomerHistoryButton.bind(this)
  }

  componentWillMount () {
    const {dispatch} = this.props
    dispatch(customersSetActivePage(1))
  }

  setActivePage (page) {
    const {dispatch} = this.props
    dispatch(customersSetActivePage(page))
  }

  _renderPagination () {
    const { total, limit, currentPage } = this.props

    return (
      <SimplePagination
        total={total}
        limit={limit}
        page={currentPage}
        getClickPageAction={this.setActivePage}
        style={{ marginBottom: PAGINATION_MARGIN_BOTTOM }} />
    )
  }

  onClickCustomerHistoryButton (customer) {
    const { dispatch, isModal } = this.props

    let onBack
    if (isModal) {
      onBack = 'searchCustomer'
    }

    dispatch(transactionsSetOdboId(customer.odboId))
    dispatch(setActiveModal('transactionHistory', undefined, {
      customer,
      onBack
    }))
  }

  render () {
    const {activeCustomer, dispatch, custData, range, intl, customerButtonText, onClickCustomerButton, showActiveCustomer, isModal} = this.props
    const {isFetching, customersArray, customerFilter, customerSearchKey, customerSearch} = custData
    let fromFetched = processCustomers(customersArray, customerFilter, customerSearchKey)
    let fromSearch = customerSearch
    let customers = fromFetched.length > 0 ? fromFetched : fromSearch

    const lblTR = (id) => { return (intl.formatMessage({id: id})).toUpperCase() }

    let isFetchingLbl = (lbl) => {
      return (
        <div className='box has-text-centered'>
          <span className='icon is-large'><i className='fa fa-spinner fa-pulse fa-fw' /></span>
          <p className='title'>{lbl ? lblTR(lbl) : 'Searching . . .'}</p>
        </div>
      )
    }

    let emptyListLbl = (data, lbl) => {
      if (data.length === 0) {
        return (
          <div className='box has-text-centered'>
            <span className='icon is-large'><i className='fa fa-info-circle' /></span>
            <p className='title'>{lblTR(lbl)}</p>
          </div>
        )
      }
    }

    return (
      <div>
        <CustomerListHeader
          intl={intl}
          setSearchCustFilters={this._setSearchCustFilters}
          searchCustomer={this._searchCustomer}
          isCustomersExist={customers.length > 0}
          customerSearchKey={customerSearchKey} />
        {
          showActiveCustomer && activeCustomer &&
          <div className='box is-clearfix'>
            <p className='is-pulled-left title is-marginless'>
              <strong>Current Customer: </strong>
              {`${activeCustomer.firstName} ${activeCustomer.lastName || ''}`}
            </p>
            <a className='button is-danger is-pulled-right' onClick={e => dispatch(setActiveCustomer(null))}>REMOVE</a>
          </div>
        }
        {
          !isFetching &&
          customers.length > 0 &&
          customers.slice(0, range).map((customer, key) => {
            return <CustomerListItem
              customer={customer}
              key={key}
              buttonText={customerButtonText}
              onClickButton={onClickCustomerButton}
              isModal={isModal}
              onClickHistoryButton={this.onClickCustomerHistoryButton} />
          })
        }
        {isFetching
          ? isFetchingLbl()
          : emptyListLbl(customers, 'app.lbl.noCustomers')
        }

        {this._renderPagination()}
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  let custData = state.data.customers
  return {
    custData,
    range: state.data.customers.currentRange,
    activeCustomer: state.data.orderData.activeCustomer,
    intl: state.intl,
    total: custData.total,
    limit: custData.limit,
    currentPage: custData.page
  }
}

export default connect(mapStateToProps)(injectIntl(CustomerList))

