import React from 'react'
import { connect } from 'react-redux'
import { FormattedMessage } from 'react-intl'
import moment from 'moment'
import { DatePicker } from 'react-input-enhancements'

import SalesReport from './SalesReport'
import SalesReportComplete from './SalesReportComplete'
import StoreOrders from './StoreOrders'
import ViewBills from '../containers/ViewBills'
import ProductsStock from './ProductsStock'

import {
  completeSalesFetch,
  storeOrdersFetch,
  productSalesFetch,
  reportsSetTab,
  reportsSetDate
} from '../actions/reports'

class Reports extends React.Component {
  _onPressTab (tab) {
    this.props.dispatch(reportsSetTab(tab))
  }

  onChangeDate (event) {
    event.preventDefault
    var selectedDate = event.toDate()
    const { dispatch, store, activeTab, limit } = this.props

    let storeId = store.source

    dispatch(reportsSetDate(selectedDate))
    if (activeTab === 'completeSales') {
      dispatch(completeSalesFetch(store.source, selectedDate))
    } else if (activeTab === 'orders') {
      // get sales today
      const from = selectedDate
      from.setHours(0, 0, 0, 0)

      const to = event.toDate()
      let newSkip = 0
      to.setHours(23, 59, 59, 999)
      const params = {
        storeId,
        from,
        to,
        limit,
        skip: newSkip
      }
      dispatch(storeOrdersFetch(params))
    } else if (activeTab === 'sales') {
      dispatch(productSalesFetch(storeId, selectedDate, selectedDate))
    }
  }

  renderTab () {
    const { activeTab } = this.props
    switch (activeTab) {
      case 'sales':
        return <SalesReport />
      case 'bills':
        return <ViewBills />
      case 'completeSales':
        return <SalesReportComplete />
      case 'orders':
        return <StoreOrders />
      case 'stocks':
        return <ProductsStock />
      default:
        return <SalesReportComplete />
    }
  }

  render () {
    const { activeTab, csDate } = this.props

    return (
      <section className='section is-fullheight'>
        <div className='container'>
          <div className='content is-clearfix'>
            <div className='control is-pulled-right' style={{marginRight: 100}}>
              <label className='label'>Select Date</label>
              <DatePicker
                value={moment(csDate).format('ddd DD/MMM/YYYY')}
                onChange={this.onChangeDate.bind(this)}
                // this callback will parse inserted timestamp
                onValuePreUpdate={v => parseInt(v, 10) > 1e8
                  ? moment(parseInt(v, 10)).format('ddd DD/MMM/YYYY') : v
                }
              >
                {(inputProps, { registerInput }) =>
                  <p className='control'>
                    <input
                      {...inputProps}
                      className='input is-medium'
                      style={{ fontFamily: 'monospace' }}
                      id='selectedDate'
                      type='text'
                    />
                  </p>
                }
              </DatePicker>
            </div>
            <div className='title is-marginless'>
              <strong>Currently Viewing:</strong>
              <p>{moment(csDate).format('ddd DD/MMM/YYYY')}</p>
            </div>
          </div>

          <div className='tabs is-centered'>
            <ul>
              <li className={activeTab === 'completeSales' ? 'is-active' : ''}
                onClick={this._onPressTab.bind(this, 'completeSales')}>
                <a><FormattedMessage id='app.general.completeSales' /></a>
              </li>
              <li className={activeTab === 'bills' ? 'is-active' : ''}
                onClick={this._onPressTab.bind(this, 'bills')}>
                <a><FormattedMessage id='app.general.viewBills' /></a>
              </li>
              <li className={activeTab === 'sales' ? 'is-active' : ''}
                onClick={this._onPressTab.bind(this, 'sales')}>
                <a><FormattedMessage id='app.page.reports.salesReport' /></a>
              </li>
              <li className={activeTab === 'orders' ? 'is-active' : ''}
                onClick={this._onPressTab.bind(this, 'orders')}>
                <a><FormattedMessage id='app.page.reports.storeOrders' /></a>
              </li>
              <li className={activeTab === 'stocks' ? 'is-active' : ''}
                onClick={this._onPressTab.bind(this, 'stocks')}>
                <a><FormattedMessage id='app.general.outletStock' /></a>
              </li>
            </ul>
          </div>
          {
            this.renderTab()
          }
        </div>
      </section>
    )
  }
}

function mapStateToProps (state) {
  return {
    csDate: state.reports.completeSales.date,
    activeTab: state.reports.activeTab,
    store: state.application.store,
    page: state.reports.storeOrders.page,
    limit: state.reports.storeOrders.limit,
    skip: state.reports.storeOrders.skip
  }
}

export default connect(mapStateToProps)(Reports)
