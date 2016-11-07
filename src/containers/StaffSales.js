import React from 'react'
import { connect } from 'react-redux'

import moment from 'moment'
import { staffSalesFetch } from '../actions/reports'

class StaffSales extends React.Component {
  componentDidMount () {
    const { dispatch, activeCashier, selectedStaffId } = this.props
    const searchStaffId = activeCashier && activeCashier.id || selectedStaffId

    const from = moment().subtract(100, 'days').startOf('day').toDate()
    const to = new Date()

    dispatch(staffSalesFetch(searchStaffId, from, to))
  }

  render () {
    return (
      <div>
        Staff Sales
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    activeCashier: state.application.activeCashier,
    selectedStaffId: state.reports.staffSales.staffId
  }
}

export default connect(mapStateToProps)(StaffSales)
