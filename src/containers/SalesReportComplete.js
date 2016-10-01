import React from 'react'
import { connect } from 'react-redux'
import { FormattedMessage } from 'react-intl'

import LoadingPane from '../components/LoadingPane'
import { completeSalesFetch } from '../actions/reports'

import printEODS from '../utils/printEODS/print'

class SalesReportComplete extends React.Component {
  componentWillMount () {
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
      cashInDrawer: cashInDrawer,
      cashInfo: { count: openCount, value: 0 },
      floatInfo: { count: 1, value: cashInDrawer },
      PO: { count: 0, value: 0 },
      RA: { count: 0, value: 0 }
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
          <div className='tile is-ancestor box'>
            <div className='tile is-vertical is-8'>
              <article className='tile is-child'>
                <p className='title'>POS SALES</p>
                <p className='subtitle'>print the summary of sales this day</p>
              </article>
            </div>
            <div className='tile is-vertical is-4 has-text-centered'>
              <article className='tile is-child'>
                <div className='content'>
                  <button className='button is-success is-large'
                    onClick={this.printEndOfDaySales.bind(this)}>
                    Print Summary
                  </button>
                </div>
              </article>
            </div>
          </div>
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
    cashier: state.application.activeCashier &&
      state.application.activeCashier.firstName ||
      state.application.staff.data.username,
    from: state.reports.completeSales.date,
    openCount: state.application.activeCashdrawer.openCount,
    cashInDrawer: state.application.activeCashdrawer.initialAmount
  }
}

export default connect(mapStateToProps)(SalesReportComplete)
