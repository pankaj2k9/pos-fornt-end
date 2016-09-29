import React from 'react'
import { connect } from 'react-redux'
import { FormattedMessage } from 'react-intl'

import LoadingPane from '../components/LoadingPane'
import { completeSalesFetch } from '../actions/reports'

class SalesReportComplete extends React.Component {
  componentDidMount () {
    const { dispatch, storeId } = this.props

    // get sales today
    const today = new Date()

    dispatch(completeSalesFetch(storeId, today))
  }

  render () {
    const { isLoading } = this.props
    return (
      isLoading
        ? <LoadingPane
          headerMessage={<FormattedMessage id='app.page.reports.loadingSalesReport' />} />
        : <div>
          Hello world
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
    from: state.reports.completeSales.date
  }
}

export default connect(mapStateToProps)(SalesReportComplete)
