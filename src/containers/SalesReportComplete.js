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

    if (completeSales && drawerData) {
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
    }
  }

  cashdrawerData () {
    const { cashdrawers, csDate, selectedStore, storeId } = this.props
    const searchStoreId = selectedStore || storeId

    const drawerData = cashdrawers.find(function (drawer) {
      let date1 = new Date(drawer.date).toISOString().slice(0, 10)
      let date2 = new Date(csDate).toISOString().slice(0, 10)

      return date1 === date2 && searchStoreId === drawer.storeId
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
    const reportCanBeGenerated = !!drawerData && !!salesData

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

          {reportCanBeGenerated
            ? <div className='tile is-child'>
              <XZReadingReceiptPreview data={salesData} />
            </div>
            : <div className='tile is-child'>
              <FormattedMessage id='app.page.reports.noData' />
            </div>
          }
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
