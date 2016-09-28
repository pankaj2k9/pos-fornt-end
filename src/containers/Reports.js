import React from 'react'
import { connect } from 'react-redux'
import { FormattedMessage, FormattedDate } from 'react-intl'

import SalesReport from './SalesReport'
import SalesReportComplete from './SalesReportComplete'
import StoreOrders from './StoreOrders'

import { reportsSetTab } from '../actions/reports'

class Reports extends React.Component {
  _onPressTab (tab) {
    this.props.dispatch(reportsSetTab(tab))
  }

  renderTab () {
    const { activeTab } = this.props
    switch (activeTab) {
      case 'sales':
        return <SalesReport />
      case 'completeSales':
        return <SalesReportComplete />
      case 'orders':
        return <StoreOrders />
      default:
        return <SalesReportComplete />
    }
  }

  render () {
    const { activeTab, storeId } = this.props
    const today = new Date()

    return (
      <section className='section is-fullheight'>
        <div className='container'>
          <div className='container'>
            <FormattedMessage id='app.page.reports.storeId' />
            <strong>{`: ${storeId}`}</strong>
          </div>
          <div className='container'>
            <FormattedMessage id='app.page.reports.date' />{': '}
            <strong><FormattedDate value={today} /></strong>
          </div>

          <div className='tabs is-centered'>
            <ul>
              <li className={activeTab === 'completeSales' ? 'is-active' : ''}
                onClick={this._onPressTab.bind(this, 'completeSales')}>
                <a><FormattedMessage id='app.general.completeSales' /></a>
              </li>
              <li className={activeTab === 'sales' ? 'is-active' : ''}
                onClick={this._onPressTab.bind(this, 'sales')}>
                <a><FormattedMessage id='app.page.reports.salesReport' /></a>
              </li>
              <li className={activeTab === 'orders' ? 'is-active' : ''}
                onClick={this._onPressTab.bind(this, 'orders')}>
                <a><FormattedMessage id='app.page.reports.storeOrders' /></a>
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
    activeTab: state.reports.activeTab,
    storeId: state.application.storeId
  }
}

export default connect(mapStateToProps)(Reports)
