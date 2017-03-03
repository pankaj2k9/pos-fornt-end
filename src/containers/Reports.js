import React from 'react'
import { connect } from 'react-redux'
import { FormattedMessage } from 'react-intl'
import moment from 'moment'

import SalesReport from './SalesReport'
import SalesReportComplete from './SalesReportComplete'
import StoreOrders from './StoreOrders'
import ViewBills from './ViewBills'
import StaffSales from './StaffSales'
import OutletStock from './OutletStock'
import ExportSales from './ExportSales'

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
    const { dispatch, store, activeTab, limit, completeSalesSource } = this.props

    let storeId = store.source

    dispatch(reportsSetDate(selectedDate))
    if (activeTab === 'completeSales') {
      dispatch(completeSalesFetch(completeSalesSource || store.source, selectedDate))
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
      case 'staffSales':
        return <StaffSales />
      case 'completeSales':
        return <SalesReportComplete />
      case 'orders':
        return <StoreOrders />
      case 'stocks':
        return <OutletStock />
      case 'exportSales':
        return <ExportSales />
      default:
        return <SalesReportComplete />
    }
  }

  render () {
    const { activeTab, csDate, staff } = this.props
    const hasStaffs = staff.staffs.length > 0
    return (
      <section className='section is-fullheight'>
        <div className='container'>
          <div className='content is-clearfix'>
            <div className='title is-marginless'>
              <strong>Currently Viewing:</strong>
              <p>{moment(csDate).format('ddd DD/MMM/YYYY')}</p>
            </div>
          </div>

          <div className='tabs is-centered'>
            <ul>
              <li className={activeTab === 'completeSales' ? 'is-active' : ''}
                onClick={this._onPressTab.bind(this, 'completeSales')}>
                <a><FormattedMessage id='app.general.xzReading' /></a>
              </li>
              <li className={activeTab === 'bills' ? 'is-active' : ''}
                onClick={this._onPressTab.bind(this, 'bills')}>
                <a><FormattedMessage id='app.general.viewBills' /></a>
              </li>
              {
                hasStaffs
                ? <li className={activeTab === 'staffSales' ? 'is-active' : ''}
                  onClick={this._onPressTab.bind(this, 'staffSales')}>
                  <a><FormattedMessage id='app.general.staffSales' /></a>
                </li>
                : ''
              }
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
              <li className={activeTab === 'exportSales' ? 'is-active' : ''}
                onClick={this._onPressTab.bind(this, 'exportSales')}>
                <a><FormattedMessage id='app.general.exportSales' /></a>
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
    store: state.app.mainUI.store,
    staff: state.app.mainUI.activeStaff,
    page: state.reports.storeOrders.page,
    limit: state.reports.storeOrders.limit,
    skip: state.reports.storeOrders.skip,
    completeSalesSource: state.reports.completeSales.source
  }
}

export default connect(mapStateToProps)(Reports)
