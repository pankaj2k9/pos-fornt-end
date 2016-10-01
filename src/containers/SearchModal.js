import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'

import { FormattedMessage, FormattedDate, FormattedTime } from 'react-intl'

import SearchBar from '../components/SearchBar'
import Level from '../components/Level'
import Truncate from '../components/Truncate'

import {
  storeOrderFetch,
  storeOrdersSetSearchKey,
  reprintingReceipt
} from '../actions/settings'

import {
  refund
} from '../actions/refund'

import print from '../utils/printReceipt/print'

const List = (props) => {
  const {dispatch, items, listButton} = props
  return (
    <table className='table'>
      <tbody>
        {
          items.map(function (item, key) {
            let cartData = item
            return (
              <tr key={key}>
                <td>
                  {item.activeCustomer !== null || undefined
                    ? <div><strong>{item.activeCustomer.firstName}</strong><br /><p>member</p></div>
                    : item.walkinCustomer === ''
                      ? <p><strong>No Name</strong><br />Walk-in Customer</p>
                      : <p><strong>{item.walkinCustomer}</strong><br />Walk-in Customer</p>
                  }
                </td>
                <td><p><strong>{item.cartItemsArray.length}</strong><br />cart items</p></td>
                <td className='is-icon'>
                  <a className='button is-medium' onClick={listButton.event(dispatch, cartData, key)}>
                    {listButton.name}
                  </a>
                </td>
              </tr>
            )
          }, this)
        }
      </tbody>
    </table>
  )
}

const Details = (props) => {
  const {details, status, processing} = props
  return (
    <div className='content'>
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
                <br />- <FormattedMessage id='app.modal.type' />: {details.trans.type}
                <br />- <FormattedMessage id='app.general.total' />: {details.trans.total}
              </li>
              <li style={{margin: 0, padding: 10}}>
                <strong><FormattedMessage id='app.panel.products' />:</strong>
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
  orderSearchKeyInput (value) {
    const {dispatch, search} = this.props
    dispatch(search.onChange(value))
  }

  buttonConfirm (event) {
    event.preventDefault()
    const {dispatch, orderSearchKey} = this.props
    dispatch(storeOrderFetch(orderSearchKey))
  }

  buttonCancel () {
    const {dispatch} = this.props
    dispatch(storeOrdersSetSearchKey(''))
    document.getElementById('orderSearch').focus()
    document.getElementById('orderSearch').value = ''
  }

  onSubmitKey (event) {
    event.preventDefault()
    const {dispatch, orderSearchKey} = this.props
    dispatch(storeOrderFetch(orderSearchKey))
  }

  onClickOption () {
    const {dispatch, orderSearchKey, type, details} = this.props
    if (type === 'refundModal') {
      dispatch(refund(orderSearchKey))
    } else if (type === 'reprintModal') {
      print(details)
      dispatch(reprintingReceipt(true))
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
      items,
      search,
      closeButton,
      listButton,
      modalStatus,
      processing
    } = this.props

    return (
      <div id={id} className={'modal ' + (active === id ? 'is-active' : '')}>
        <div className='modal-background' />
        <div className='modal-card'>
          <header className='modal-card-head' style={{padding: 15}}>
            <div style={{flex: 1}}>
              {displayData === 'details'
                ? <SearchBar
                  id='orderSearch'
                  value={search.value}
                  placeholder={'app.ph.searchOrder'}
                  onChange={this.orderSearchKeyInput.bind(this)}
                  confirmButton={<i className='fa fa-check' />}
                  cancelButton={<i className='fa fa-undo' />}
                  confirmEvent={this.buttonConfirm.bind(this)}
                  cancelEvent={this.buttonCancel.bind(this)}
                  onSubmit={this.onSubmitKey.bind(this)}
                />
                : <SearchBar
                  id='orderSearch'
                  value={search.value}
                  placeholder={search.placeholder}
                  onChange={this.orderSearchKeyInput.bind(this)}
                />
              }
            </div>
          </header>
          <section className='modal-card-body' style={{padding: 15}}>
            {displayData === 'details'
              ? <Details type={type} details={details} status={modalStatus} processing={processing} />
              : <List items={items} dispatch={dispatch} listButton={listButton} />
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
  items: PropTypes.array,
  cancelButton: PropTypes.object,
  listButton: PropTypes.object,
  ordersSearchKey: PropTypes.string,
  modalStatus: PropTypes.object,
  processing: PropTypes.bool,
  storeDetails: PropTypes.object
}

export default connect()(SearchModal)
