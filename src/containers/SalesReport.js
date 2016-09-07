import React from 'react'
import { connect } from 'react-redux'
import { FormattedMessage } from 'react-intl'

import Table from '../components/Table'
import LoadingPane from '../components/LoadingPane'
import { salesReportFetch } from '../actions/reports'

class SalesReport extends React.Component {
  componentDidMount () {
    const { dispatch, storeId } = this.props

    // get sales today
    const today = new Date()

    dispatch(salesReportFetch(storeId, today, today))
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
    isLoading: state.reports.salesReport.isLoading,
    productSales: state.reports.salesReport.productSales,
    storeId: state.application.storeId,
    from: state.reports.salesReport.from,
    to: state.reports.salesReport.to
  }
}

export default connect(mapStateToProps)(SalesReport)
