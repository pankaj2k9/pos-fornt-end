import React from 'react'
import { connect } from 'react-redux'
import { FormattedMessage } from 'react-intl'

import Table from '../components/Table'
import LoadingPane from '../components/LoadingPane'
import { productSalesFetchOffline } from '../actions/data/offlineData'
import { productSalesFetch } from '../actions/reports'

class SalesReport extends React.Component {
  componentDidMount () {
    const { dispatch, storeId, date, posMode } = this.props

    // get sales today
    const today = date || new Date()

    if (posMode === 'offline') {
      dispatch(productSalesFetchOffline(storeId, today, today))
    } else {
      dispatch(productSalesFetch(storeId, today, today))
    }
  }

  _constructSalesItems () {
    const { locale, productSales } = this.props

    const productSalesItems = productSales.map(product => {
      return {
        id: product.id,
        name: {
          value: locale === 'en' ? product.nameEn : product.nameZh,
          type: 'string'
        },
        salesSgd: {
          value: product.salesSgd,
          type: 'string'
        },
        salesOdbo: {
          value: product.salesOdbo || 'N/A',
          type: 'string'
        }
      }
    })

    return productSalesItems
  }

  render () {
    const { locale, isLoading, productSales } = this.props

    const productSalesItems = this._constructSalesItems(productSales)
    const columnHeaders = [
      <FormattedMessage id='app.page.reports.id' />,
      <FormattedMessage id='app.page.reports.name' />,
      <FormattedMessage id='app.page.reports.sgd' />,
      <FormattedMessage id='app.page.reports.odbo' />
    ]

    return (isLoading
      ? <LoadingPane
        headerMessage={<FormattedMessage id='app.page.reports.loadingSalesReport' />} />
      : <Table
        locale={locale}
        tableName={'Sales Report'}
        columnHeaders={columnHeaders}
        rowItems={productSalesItems}
      />
    )
  }
}

function mapStateToProps (state) {
  return {
    locale: state.intl.locale,
    date: state.reports.date,
    isLoading: state.reports.productSales.isLoading,
    productSales: state.reports.productSales.productSales,
    storeId: state.app.mainUI.activeStore.source,
    from: state.reports.productSales.from,
    to: state.reports.productSales.to,
    posMode: state.app.mainUI.posMode
  }
}

export default connect(mapStateToProps)(SalesReport)
