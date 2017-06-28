import React from 'react'
import { connect } from 'react-redux'
import { FormattedMessage } from 'react-intl'
import moment from 'moment'

import LoadingPane from '../components/LoadingPane'
import StoresDropdown from '../components/StoresDropdown'
import XZReadingReceiptPreview from '../components/XZReadingReceiptPreview'
import {
  completeSalesFetch,
  completeSalesChSource,
  sendXZReport
} from '../actions/reports'

import { setActiveModal } from '../actions/app/mainUI'

class SalesReportComplete extends React.Component {
  constructor (props) {
    super(props)

    this.getCompleteSalesData = this.getCompleteSalesData.bind(this)
    this.handleCloseDay = this.handleCloseDay.bind(this)
  }
  componentWillMount () {
    const { dispatch, storeId, selectedDate } = this.props
    dispatch(completeSalesChSource(storeId))
    dispatch(completeSalesFetch(storeId, selectedDate))
  }

  getCompleteSalesData () {
    const { completeSales, store, cashier, activeDrawer } = this.props
    let { cashDrawerOpenCount, float } = activeDrawer

    if (completeSales && activeDrawer) {
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
        openCashDrawerCount: cashDrawerOpenCount,
        cashInDrawer: Number(float || 0),
        cashInfo: { count: 0, value: 0 },
        floatInfo: {
          count: cashDrawerOpenCount,
          value: Number(float)
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
      let date1 = moment(drawer.date).format('L')
      let date2 = moment(csDate).format('L')
      return date1 === date2 && searchStoreId === drawer.storeId
    })
    return drawerData
  }

  _handleSourceChange (event) {
    const { dispatch, storeId, selectedDate } = this.props

    dispatch(completeSalesChSource(event.target.value))
    dispatch(completeSalesFetch(event.target.value || storeId, selectedDate))
  }

  isAllCashiersLogout () {
    const {cashiers, store} = this.props
    const activeStore = store.source
    let isAllCashiersLogout = true

    cashiers.forEach((cashier) => {
      if (cashier !== 'deleted' && cashier.storePermissions.includes(activeStore)) {
        if (cashier.workStatus === 'login') {
          isAllCashiersLogout = false
        }
      }
    })

    return isAllCashiersLogout
  }

  handleCloseDay () {
    const { dispatch, storeId, master } = this.props
    if (this.isAllCashiersLogout()) {
      dispatch(sendXZReport(new Date(), storeId, master.id))
    } else {
      dispatch(setActiveModal('promptToLogoutAllCashiers'))
    }
  }

  render () {
    const { isLoading, storeId, storeIds, selectedStore } = this.props
    const drawerData = {
      date: new Date(),
      float: 0,
      initialAmount: 0,
      cashDrawerOpenCount: 0
    }
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
              <XZReadingReceiptPreview data={salesData} handleCloseDay={this.handleCloseDay} />
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
    store: state.app.mainUI.activeStore,
    master: state.app.mainUI.activeStaff,
    cashiers: state.app.mainUI.activeStaff ? state.app.mainUI.activeStaff.staffs : [],
    cashier: state.app.mainUI.activeCashier &&
      state.app.mainUI.activeCashier.firstName ||
      state.app.mainUI.activeStaff.username,
    from: state.reports.completeSales.date,
    activeDrawer: state.app.mainUI.activeDrawer,
    cashdrawers: state.data.cashdrawers.cdList,
    storeId: state.app.mainUI.activeStore.source,
    storeIds: state.data.stores.stores,
    selectedStore: state.reports.completeSales.source,
    selectedDate: state.reports.date
  }
}

export default connect(mapStateToProps)(SalesReportComplete)
