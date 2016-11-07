import React from 'react'
import { connect } from 'react-redux'
import { FormattedMessage } from 'react-intl'

import LoadingPane from '../components/LoadingPane'
import StoresDropdown from '../components/StoresDropdown'
import XZReadingReceiptPreview from '../components/XZReadingReceiptPreview'
import {
  completeSalesFetch,
  completeSalesChSource
} from '../actions/reports'

// import printEODS from '../utils/printEODS/print'

class SalesReportComplete extends React.Component {
  constructor (props) {
    super(props)

    this.getCompleteSalesData = this.getCompleteSalesData.bind(this)
  }
  componentWillMount () {
    const { dispatch, storeId, selectedDate } = this.props

    dispatch(completeSalesFetch(storeId, selectedDate))
  }

  getCompleteSalesData () {
    let { completeSales, store, cashier } = this.props
    var drawerData = this.cashdrawerData()
    console.log('DRAWER DATA', drawerData)

    if (completeSales) {
      // put real store address here
      const addr = store.address ? store.address.split('\\n') : ['200 Victoria Street']
      completeSales.headerText = [
        'The ODBO',
        store.name,
        ...addr
      ]

      // put real sales info here
      completeSales.info = {
        cashier: cashier,
        storeId: store.source,
        openCashDrawerCount: drawerData.cashDrawerOpenCount,
        cashInDrawer: Number(drawerData.float),
        cashInfo: { count: 0, value: 0 },
        floatInfo: {
          count: drawerData.cashDrawerOpenCount,
          value: Number(drawerData.float)
        },
        PO: { count: 0, value: 0 },
        RA: { count: 0, value: 0 }
      }

      return completeSales
      // printEODS(completeSales)
    }
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

  _handleSourceChange (event) {
    const { dispatch, storeId, selectedDate } = this.props

    dispatch(completeSalesChSource(event.target.value))
    dispatch(completeSalesFetch(event.target.value || storeId, selectedDate))
  }

  render () {
    const { isLoading, storeId, storeIds, selectedStore } = this.props
    const drawerData = this.cashdrawerData()

    const salesData = this.getCompleteSalesData()

    // Filter products by source
    const filterSource = selectedStore || storeId

    return (isLoading
      ? <LoadingPane
        headerMessage={<FormattedMessage id='app.page.reports.loadingSalesReport' />} />
      : <div className='tile is-ancestor'>
        <div className='tile is-parent is-vertical'>
          <StoresDropdown
            storeIds={storeIds}
            selectedStore={filterSource}
            onChange={this._handleSourceChange.bind(this)} />

          {drawerData && salesData
            ? <div className='tile is-child'>
              Display receipt preview here
              <XZReadingReceiptPreview data={salesData} />
            </div>
            : <div className='tile is-child'>
              <FormattedMessage id='app.page.reports.noData' />
            </div>
          }

          {/*
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
          */}
        </div>
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
    cashInDrawer: state.application.activeCashdrawer.initialAmount,
    storeId: state.application.storeId,
    storeIds: state.application.storeIds,
    selectedStore: state.reports.completeSales.source,
    selectedDate: state.reports.date
  }
}

export default connect(mapStateToProps)(SalesReportComplete)
