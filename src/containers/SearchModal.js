import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'

import { FormattedMessage, FormattedDate, FormattedTime } from 'react-intl'

import SearchBar from '../components/SearchBar'
import Level from '../components/Level'

import {
  storeOrderFetch,
  storeOrdersSetSearchKey
} from '../actions/settings'

import {
  refund
} from '../actions/refund'

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
  const {type, details, status, processing} = props
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
            {!details ? 'No Results' : 'ID: ' + details.id}
          </h1>
        } />

      {!details
        ? null
        : <div>
          {type === 'refundModal'
            ? !status.refund
              ? <div>
                <Level
                  left={
                    <h1 className='title is-marginless'>
                      <FormattedMessage id='app.modal.dateOrdered' />:
                    </h1>
                  }
                  right={
                    <h1 className='title is-marginless'>
                      <FormattedDate value={details.dateOrdered} format='short' />
                    </h1>
                  } />
                <Level
                  right={
                    <h1 className='title is-marginless'>
                      <FormattedTime value={details.dateOrdered} format='hhmm' />
                    </h1>
                  } />
                {!processing
                  ? null
                  : <p className='section has-text-centered'>
                    <i className='fa fa-spinner fa-pulse fa-2x fa-fw' />
                  </p>
                }
              </div>
              : <div className='section has-text-centered'>
                <h1 className='title'>Refund Success</h1>
              </div>
            : null
          }
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
    const {dispatch, orderSearchKey, type} = this.props
    type === 'refundModal'
    ? dispatch(refund(orderSearchKey))
    : null
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
                ? !modalStatus.refund && !processing
                  ? !details
                    ? null
                    : <p className='control'>
                      <a className='button is-large is-fullwidth is-info' onClick={this.onClickOption.bind(this)}>
                        <FormattedMessage id={'app.page.settings.refundButton'} />
                      </a>
                    </p>
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
  activeCustomer: PropTypes.string,
  items: PropTypes.array,
  cancelButton: PropTypes.object,
  listButton: PropTypes.object,
  ordersSearchKey: PropTypes.string,
  modalStatus: PropTypes.object,
  processing: PropTypes.bool
}

export default connect()(SearchModal)
