import React from 'react'
import { connect } from 'react-redux'
import { FormattedMessage } from 'react-intl'

import LoadingPane from '../components/LoadingPane'
// import { completeSalesFetch } from '../actions/reports'

import printEODS from '../utils/printEODS/print'

class SalesReportComplete extends React.Component {
  printEndOfDaySales () {
    let { completeSales, store, cashier } = this.props
    var drawerData = this.cashdrawerData()
    // put real store address here
    completeSales.headerText = [
      'The ODBO',
      store.name,
      store.address || '200 Victoria Street',
      'SINGAPORE',
      'Telephone : 6238 1337'
    ]

    // put real sales info here
    completeSales.info = {
      cashier: cashier,
      storeId: store.source,
      openCashDrawerCount: drawerData.openCount,
      cashInDrawer: drawerData.initialAmount,
      cashInfo: { count: 0, value: 0 },
      floatInfo: { count: drawerData.openCount, value: drawerData.initialAmount },
      PO: { count: 0, value: 0 },
      RA: { count: 0, value: 0 }
    }

    printEODS(completeSales)
  }

  cashdrawerData () {
    const { cashdrawers, csDate } = this.props
    var drawerData
    cashdrawers.find(function (drawer) {
      let date1 = new Date(drawer.date).toISOString().slice(0, 10)
      let date2 = new Date(csDate).toISOString().slice(0, 10)
      if (date1 === date2) {
        drawerData = drawer
      }
    })
    return drawerData
  }

  render () {
    const { isLoading } = this.props
    var drawerData = this.cashdrawerData()
    return (
      isLoading
        ? <LoadingPane
          headerMessage={<FormattedMessage id='app.page.reports.loadingSalesReport' />} />
        : <div>
          {drawerData
            ? <div className='tile is-ancestor box'>
              <div className='tile is-vertical is-8'>
                <article className='tile is-child'>
                  <p className='title' style={{maxWidth: 250}}>{'Print the summary of sales this day'}</p>
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
            : <div className='content box hero is-medium has-text-centered'>
              <p className='title hero-body'>
                <FormattedMessage id='app.page.reports.noData' />
              </p>
            </div>
          }
        </div>
    )
  }
}

function mapStateToProps (state) {
  return {
    locale: state.intl.locale,
    isLoading: state.reports.completeSales.isLoading,
    date: state.reports.date,
    csDate: state.reports.completeSales.date,
    completeSales: state.reports.completeSales.completeSales,
    store: state.application.store,
    cashier: state.application.activeCashier &&
      state.application.activeCashier.firstName ||
      state.application.staff.data.username,
    from: state.reports.completeSales.date,
    cashdrawers: state.application.cashdrawer,
    openCount: state.application.activeCashdrawer.openCount,
    cashInDrawer: state.application.activeCashdrawer.initialAmount
  }
}

export default connect(mapStateToProps)(SalesReportComplete)
