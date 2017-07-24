import React from 'react'
import {connect} from 'react-redux'
import { injectIntl } from 'react-intl'
import {customersSetFilter, customersSetActivePage} from '../actions/data/customers'

class CustomerListHeader extends React.Component {
  constructor (props) {
    super(props)
    this._setSearchCustFilters = this._setSearchCustFilters.bind(this)
    this._searchCustomer = this._searchCustomer.bind(this)
  }

  _searchCustomer (e) {
    e && e.preventDefault()
    const { dispatch } = this.props
    // let { customerFilter, customerSearchKey } = custData
    // dispatch(fetchCustomerByFilter(customerFilter, customerSearchKey))
    dispatch(customersSetActivePage(1))
  }

  _setSearchCustFilters () {
    const { dispatch } = this.props
    let filter = document.getElementById('custFilter').value
    let searchKey = document.getElementById('custSearchKey').value
    if (searchKey) {
      searchKey = searchKey.toUpperCase()
      document.getElementById('custSearchKey').value = searchKey
    }
    dispatch(customersSetFilter(filter, searchKey))
    dispatch(customersSetActivePage(1))
  }

  render () {
    const {custData, intl} = this.props
    const {customerSearchKey} = custData
    const lblTR = (id) => {
      return (intl.formatMessage({id: id})).toUpperCase()
    }
    return (
      <form id='searchCust' onSubmit={e => this._searchCustomer(e)}>
        <p className='control has-addons'>
          <span className='select is-large'>
            <select id='custFilter'>
              <option value='byId'>odbo ID</option>
              <option value='byName'>First Name</option>
              <option value='bySurName'>Last Name</option>
              <option value='byContactNum'>phone number</option>
            </select>
          </span>
          <input id='custSearchKey' className='input is-large is-expanded'
            type='text' placeholder={lblTR('app.ph.keyword')}
            value={customerSearchKey} onChange={e => this._setSearchCustFilters()} />
        </p>
      </form>
    )
  }
}

function mapStateToProps (state) {
  return {
    intl: state.intl,
    custData: state.data.customers
  }
}

export default connect(mapStateToProps)(injectIntl(CustomerListHeader))
