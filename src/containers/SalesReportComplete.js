import React from 'react'
import { connect } from 'react-redux'
import { FormattedMessage } from 'react-intl'

import LoadingPane from '../components/LoadingPane'
import { completeSalesFetch } from '../actions/reports'

import printEODS from '../utils/printEODS/print'

class SalesReportComplete extends React.Component {
  componentDidMount () {
    const { dispatch, storeId } = this.props

    // get sales today
    const today = new Date()

    dispatch(completeSalesFetch(storeId, today))
  }

  printEndOfDaySales () {
    let { completeSales, storeId, cashier, openCount, cashInDrawer } = this.props

    // put real store address here
    completeSales.headerText = [
      'The ODBO',
      '200 Victoria Street',
      'Bugis Junction #02-22',
      'SINGAPORE',
      'Telephone : 6238 1337'
    ]

    // put real sales info here
    completeSales.info = {
      cashier: cashier,
      storeId: storeId,
      openCashDrawerCount: openCount,
      cashInDrawer: cashInDrawer
    }

    printEODS(completeSales)
  }

  render () {
    const { isLoading } = this.props

    return (
      isLoading
        ? <LoadingPane
          headerMessage={<FormattedMessage id='app.page.reports.loadingSalesReport' />} />
        : <div>
          <button onClick={this.printEndOfDaySales.bind(this)}>
            Print End of Day Sales
          </button>
        </div>
    )
  }
}

function mapStateToProps (state) {
  return {
    locale: state.intl.locale,
    isLoading: state.reports.completeSales.isLoading,
    completeSales: state.reports.completeSales.completeSales,
    storeId: state.application.storeId,
    cashier: state.application.activeCashier.firstName,
    from: state.reports.completeSales.date,
    openCount: state.application.activeCashdrawer.openCount,
    cashInDrawer: state.application.activeCashdrawer.initialAmount
  }
}

export default connect(mapStateToProps)(SalesReportComplete)
