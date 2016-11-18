import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'

import { FormattedMessage, FormattedDate, FormattedTime } from 'react-intl'

import SearchBar from '../components/SearchBar'
import Level from '../components/Level'
import Truncate from '../components/Truncate'
import Dropdown from '../components/Dropdown'

import {
  setActiveModal
} from '../actions/application'

import {
  storeOrderFetch,
  storeOrdersSetSearchKey,
  customersSetFilter,
  customersSetSearchKeyOIDFR,
  customersSetSearchKeyOIDTO
} from '../actions/settings'

import {
  refund
} from '../actions/refund'

import {
  searchCustomer,
  printPreviewTotalReceipt
} from '../actions/helpers'

const List = (props) => {
  const {dispatch, items, listButton, id, isFetching} = props
  return (
    <div>
      {id === 'searchOdboUser'
        ? !isFetching
          ? null
          : <div className='container has-text-centered'>
            <i className='fa fa-spinner fa-pulse fa-5x fa-fw' />
            <h1>Searching ODBO Users...</h1>
          </div>
        : null
      }
      <table className='table'>
        <tbody>
          {
            items.map(function (item, key) {
              let data = item
              let odboId = String(item.odboId)
              let zeroes = ''
              if (id === 'searchOdboUser') {
                let odboId = String(item.odboId)
                for (var i = odboId.length; i < 7; i++) {
                  zeroes = zeroes + '0'
                }
              }
              return (
                id === 'searchOdboUser'
                ? <tr key={key}>
                  <td>{<div><strong>{`[${zeroes + odboId}] ${item.firstName} ${item.lastName}`}</strong><br /><p>[{item.membership}] member</p></div>}</td>
                  <td><p><strong>{item.odboCoins}</strong><br />coins</p></td>
                  <td className='is-icon'>
                    <a className='button is-medium' onClick={listButton.event(dispatch, data, key)}>
                      {listButton.name}
                    </a>
                  </td>
                </tr>
                : <tr key={key}>
                  <td>
                    {item.activeCustomer !== null || undefined
                      ? <div><strong>{item.activeCustomer.firstName}</strong><br /><p>member</p></div>
                      : item.walkinCustomer === ''
                        ? <p><strong>No Name</strong><br />Walk-in Customer</p>
                        : <p><strong>{item.walkinCustomer}</strong><br />Walk-in Customer</p>
                    }</td>
                  <td><p><strong>{item.cartItemsArray.length}</strong><br />cart items</p></td>
                  <td className='is-icon'>
                    <a className='button is-medium' onClick={listButton.event(dispatch, data, key)}>
                      {listButton.name}
                    </a>
                  </td>
                </tr>
              )
            }, this)
          }
        </tbody>
      </table>
    </div>
  )
}

const Details = (props) => {
  const {details, status, processing, type, inputPh, onClickOption} = props
  return (
    <div style={{margin: 10}}>
      <Level
        left={
          <h1 className='title is-marginless'>
            <strong>
              <FormattedMessage id='app.page.settings.orderDetails' />
            </strong>
          </h1>
        }
        right={
          <h1 className='title is-marginless'>
            {!details ? 'No Results' : 'ID: ' + details.info.orderId}
          </h1>
        } />

      {!details
        ? null
        : <div>
          <div>
            <ul style={{display: 'flex', listStyleType: 'none', fontSize: 16}}>
              <li style={{margin: 0, padding: 10}}>
                <strong><FormattedMessage id='app.modal.dateOrdered' />:</strong>
                <br />- <FormattedDate value={details.info.date} />
                <br />- <FormattedTime value={details.info.date} />
              </li>
              <li style={{margin: 0, padding: 10}}>
                <strong><FormattedMessage id='app.general.transDetails' />:</strong>
                <br />- <FormattedMessage id='app.modal.type' />: {details.trans.currency}
                <br />- <FormattedMessage id='app.general.total' />: {details.trans.computations.total}
              </li>
              <li style={{margin: 0, padding: 10}}>
                <strong>Products:</strong>
                {details.items.map((item, key) => {
                  return (
                    <div key={key}>
                      {` x(${item.qty}) - `}
                      <Truncate text={item.name} maxLength={12} />
                    </div>
                  )
                }
                )}
              </li>
            </ul>
            {type === 'refundModal'
              ? <form autoComplete='off' onSubmit={onClickOption}>
                <p className='control is-fullwidth'>
                  <label className='label'>Reason of Refund</label>
                  <input id='refundRemarks' autoComplete='off'
                    className='input is-large' type='text'
                    placeholder={inputPh} />
                </p>
              </form>
              : null
            }
            {!processing
              ? null
              : <p className='section has-text-centered'>
                <i className='fa fa-spinner fa-pulse fa-2x fa-fw' />
              </p>
            }
          </div>
          <h1 className='title has-text-centered'>
            {status.refund
              ? <FormattedMessage id='app.general.refundSuccess' />
              : status.reprint
                ? <FormattedMessage id='app.general.reprintSuccess' />
                : null
            }
          </h1>
        </div>
      }
    </div>
  )
}

class SearchModal extends Component {
  componentDidMount () {
    if (this.id === 'searchOdboUser') {
      document.getElementById('odboIdSearch1').focus()
    }
  }

  orderSearchKeyInput (value) {
    const {dispatch, search} = this.props
    dispatch(search.onChange(value))
  }

  buttonCancel () {
    const {dispatch} = this.props
    dispatch(storeOrdersSetSearchKey(''))
  }

  onSubmitKey (event) {
    if (event) { event.preventDefault() }
    const {dispatch, orderSearchKey, storeDetails} = this.props
    var params = {
      id: orderSearchKey,
      storeId: storeDetails.source
    }
    dispatch(storeOrderFetch(params))
  }

  _setCustomerFilter (value) {
    const {dispatch, id} = this.props
    dispatch(setActiveModal(id, 'odboIdSearch'))
    dispatch(customersSetFilter(value))
  }

  _setCustomerSearchKeyOIDFR (value) {
    const {dispatch} = this.props
    dispatch(customersSetSearchKeyOIDFR(value))
  }

  _setCustomerSearchKeyOIDTO (value) {
    const {dispatch} = this.props
    dispatch(customersSetSearchKeyOIDTO(value))
  }

  _searchCustomer (event) {
    if (event) { event.preventDefault() }
    const {dispatch, filter, search, odboIdFrom, odboIdTo} = this.props
    let customerSearchKey = search.value
    let query
    let queryAlt
    switch (filter) {
      case 'last name':
        query = {
          query: { lastName: { $like: `%${customerSearchKey.toUpperCase()}%` } }
        }
        break
      case 'first name':
        query = {
          query: { firstName: { $like: `%${customerSearchKey.toUpperCase()}%` } }
        }
        break
      case 'odbo id':
        if (!odboIdTo || odboIdTo === '') {
          query = {query: { odboID: Number(odboIdFrom) }}
        } else {
          queryAlt = { query: {odboId: {}, $sort: { odboId: 1 }} }
          queryAlt.query.odboId.$gte = Number(odboIdFrom)
          queryAlt.query.odboId.$lte = Number(odboIdTo)
        }
        break
      case 'phone number':
        query = {
          query: { phoneNumber: { $like: `%${customerSearchKey}%` } }
        }
        break
      default:
    }
    dispatch(searchCustomer(query || queryAlt))
  }

  onClickOption (event) {
    if (event) { event.preventDefault() }
    const {dispatch, type, details, closeButton, storeId} = this.props
    if (type === 'refundModal') {
      var refundRemarks = document.getElementById('refundRemarks').value
      details.trans.type = 'refund'
      dispatch(refund(details.info.orderId, refundRemarks, storeId, details))
    } else if (type === 'reprintModal') {
      details.trans.type = 'reprint'
      dispatch(printPreviewTotalReceipt(details))
      closeButton.event(dispatch)
    }
  }

  render () {
    const {
      dispatch,
      id,
      type,
      displayData,
      active,
      details,
      error,
      items,
      search,
      odboIdFrom,
      odboIdTo,
      closeButton,
      listButton,
      modalStatus,
      processing,
      filter,
      isFetching
    } = this.props
    const inputRef = id === 'searchOdboUser' ? 'odboUserSearch' : 'orderSearch'

    return (
      <div id={id} className={'modal ' + (active === id ? 'is-active' : '')}>
        <div className='modal-background' />
        <div className='modal-card'>
          <header className='modal-card-head columns is-marginless' style={{padding: 5}}>
            {id === 'searchOdboUser'
              ? <div className='column is-4'>
                <Dropdown
                  value={filter}
                  size='is-medium'
                  options={['odbo id', 'phone number', 'first name', 'last name']}
                  onChange={this._setCustomerFilter.bind(this)} />
              </div>
              : null
            }
            <div className={id === 'searchOdboUser' ? 'column is-8' : 'column is-12'}>
              {displayData === 'details'
                ? <SearchBar
                  id='orderSearch'
                  value={search.value}
                  placeholder={'app.ph.searchOrder'}
                  onChange={this.orderSearchKeyInput.bind(this)}
                  confirmButton={<i className='fa fa-check' />}
                  cancelButton={<i className='fa fa-undo' />}
                  confirmEvent={this.onSubmitKey.bind(this)}
                  cancelEvent={this.buttonCancel.bind(this)}
                  onSubmit={this.onSubmitKey.bind(this)} />
                : filter === 'odbo id'
                  ? <div className='columns'>
                    <div className='is-4' style={{paddingRight: 10}}>
                      <SearchBar
                        id='odboIdSearch1'
                        size='is-medium'
                        value={odboIdFrom}
                        placeholder={'app.ph.searchCustFr'}
                        onChange={this._setCustomerSearchKeyOIDFR.bind(this)}
                        onSubmit={this._searchCustomer.bind(this)}
                      />
                    </div>
                    <div className='is-4'>
                      <SearchBar
                        id='odboIdSearch2'
                        size='is-medium'
                        value={odboIdTo}
                        placeholder={'app.ph.searchCustTo'}
                        confirmButton={<i className='fa fa-search' />}
                        onChange={this._setCustomerSearchKeyOIDTO.bind(this)}
                        onSubmit={this._searchCustomer.bind(this)}
                        confirmEvent={this._searchCustomer.bind(this)}
                        />
                    </div>
                  </div>
                  : <SearchBar
                    id={inputRef}
                    ref={inputRef}
                    size='is-medium'
                    value={search.value}
                    placeholder={search.placeholder}
                    onChange={this.orderSearchKeyInput.bind(this)}
                    confirmButton={id === 'searchOdboUser' ? <i className='fa fa-search' /> : undefined}
                    onSubmit={id === 'searchOdboUser' ? this._searchCustomer.bind(this) : undefined}
                    confirmEvent={id === 'searchOdboUser' ? this._searchCustomer.bind(this) : undefined}
                />
              }
            </div>
          </header>
          <section className='modal-card-body' style={{padding: 15}}>
            {displayData === 'details'
              ? <div>
                <Details type={type} details={details} status={modalStatus}
                  processing={processing} onClickOption={this.onClickOption.bind(this)} />
                {error
                  ? <p className='subtitle has-text-centered' style={{color: 'red'}}>
                    {error}
                  </p>
                  : null
                }
              </div>
              : <List id={id} items={items} dispatch={dispatch} listButton={listButton} isFetching={isFetching} />
            }
          </section>
          <footer className='modal-card-foot'>
            <div className='columns' style={{flex: 1}}>
              <div className='column'>
                {displayData === 'details'
                  ? !processing
                    ? !details
                      ? null
                      : type === 'refundModal' && !modalStatus.refund
                        ? <p className='control'>
                          <a className='button is-large is-fullwidth is-info'
                            onClick={this.onClickOption.bind(this)}>
                            <FormattedMessage id={'app.page.settings.refundButton'} />
                          </a>
                        </p>
                        : type === 'reprintModal' && !modalStatus.reprint
                          ? <p className='control'>
                            <a className='button is-large is-fullwidth is-info'
                              onClick={this.onClickOption.bind(this)}>
                              <FormattedMessage id={'app.general.reprint'} />
                            </a>
                          </p>
                          : null
                    : null
                  : null
                }
                <p className='control'>
                  <a className='button is-large is-fullwidth' onClick={closeButton.event(dispatch)}>
                    {closeButton.name}
                  </a>
                </p>
              </div>
            </div>
          </footer>
        </div>
      </div>
    )
  }
}

SearchModal.PropTypes = {
  id: PropTypes.string,
  type: PropTypes.string,
  locale: PropTypes.string,
  activeCustomer: PropTypes.string,
  storeId: PropTypes.string,
  items: PropTypes.array,
  cancelButton: PropTypes.object,
  listButton: PropTypes.object,
  ordersSearchKey: PropTypes.string,
  modalStatus: PropTypes.object,
  error: PropTypes.string,
  processing: PropTypes.bool,
  storeDetails: PropTypes.object,
  inputPh: PropTypes.string,
  isFetching: PropTypes.bool,
  odboIdFrom: PropTypes.string,
  odboIdTo: PropTypes.string,
  customerFilter: PropTypes.string,
  focusedInput: PropTypes.string
}

export default connect()(SearchModal)
