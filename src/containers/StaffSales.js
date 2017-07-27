import React from 'react'
import { FormattedMessage } from 'react-intl'
import { connect } from 'react-redux'

import { DateRangePicker } from 'react-dates'
import 'react-dates/lib/css/_datepicker.css'
import StaffsDropdown from '../components/StaffDropdown'
import StaffSalesReceiptPreview from '../components/StaffSalesReceiptPreview'

import moment from 'moment'
import {
  staffSalesFetch,
  staffSalesChangeInputTo,
  staffSalesChangeInputFr,
  staffSalesStaff
} from '../actions/reports'

import {
  staffSalesFetchOffline
} from '../actions/data/offlineData'

class StaffSales extends React.Component {
  constructor (props) {
    super(props)

    this.renderFilters = this.renderFilters.bind(this)
    this.handleChangeStaff = this.handleChangeStaff.bind(this)
    this.handleSearchOrders = this.handleSearchOrders.bind(this)
    this.startFetch = this.startFetch.bind(this)
    this.handleChangeDatePicker = this.handleChangeDatePicker.bind(this)

    this.state = {
      focusedInput: 'START_DATE'
    }
  }

  componentDidMount () { this.startFetch() }
  handleSearchOrders () { this.startFetch() }
  startFetch () {
    const { dispatch, activeCashier, selectedStaffId, from, to, staffs, posMode } = this.props
    const searchStaffId = this.getSelectedStaff(selectedStaffId, activeCashier, staffs).id

    if (posMode === 'offline') {
      dispatch(staffSalesFetchOffline(searchStaffId, from, to))
    } else {
      dispatch(staffSalesFetch(searchStaffId, from, to))
    }
  }

  getSelectedStaff (selected, active, staffs) {
    const searchStaffId = selected || active && active.id || staffs[0].id || {}

    return staffs.filter((staff) => staff.id === searchStaffId)[0]
  }

  handleChangeDatePicker ({startDate, endDate}) {
    const { dispatch } = this.props

    if (startDate) {
      dispatch(staffSalesChangeInputFr(startDate.startOf('day').toDate()))
    } else {
      dispatch(staffSalesChangeInputFr(undefined))
    }

    if (endDate) {
      dispatch(staffSalesChangeInputTo(endDate.startOf('day').toDate()))
    } else {
      dispatch(staffSalesChangeInputTo(undefined))
    }
  }

  renderFilters () {
    const { staffs, selectedStaffId: selected, activeCashier: ac, from, to } = this.props
    const searchStaffId = this.getSelectedStaff(selected, ac, staffs).id

    return (
      <div id='trans-report-date' className='tile is-child is-primary is-6'>
        <StaffsDropdown
          staffs={staffs}
          selectedStaff={searchStaffId}
          onChange={this.handleChangeStaff} />

        <label className='label'>
          <FormattedMessage id='app.page.settings.from' /> - <FormattedMessage id='app.page.settings.to' />
        </label>
        <DateRangePicker
          startDate={from ? moment(from) : undefined} // momentPropTypes.momentObj or null,
          endDate={to ? moment(to) : undefined} // momentPropTypes.momentObj or null,
          onDatesChange={this.handleChangeDatePicker} // PropTypes.func.isRequired,
          focusedInput={this.state.focusedInput}
          onFocusChange={focusedInput => this.setState({ focusedInput })}
          isOutsideRange={() => false}
          minimumNights={0}
          displayFormat='DD/MM/YYYY'
          showClearDates
        />
      </div>
    )
  }

  handleChangeStaff (event) {
    const { dispatch } = this.props

    dispatch(staffSalesStaff(event.target.value))
  }

  render () {
    const {
      isProcessing,
      orders,
      staffs,
      selectedStaffId,
      activeCashier,
      from,
      to
    } = this.props

    const selectedStaff = this.getSelectedStaff(selectedStaffId, activeCashier, staffs)

    const data = {
      orders,
      staff: selectedStaff,
      from,
      to
    }

    return (
      <div className='tile is-ancestor'>
        <div className='tile is-vertical'>
          <div className='tile is-parent is-vertical'>
            {this.renderFilters()}

            <div className='tile is-child'>
              <button className={`button is-primary${isProcessing ? ' is-loading' : ''}`}
                onClick={this.handleSearchOrders}>
                <FormattedMessage id='app.page.settings.process' />
              </button>
            </div>
          </div>

          {!isProcessing
            ? <div className='tile is-parent is-vertical'>
              <div className='tile is-child'>
                {orders.length && !isProcessing
                  ? <StaffSalesReceiptPreview data={data} />
                  : <FormattedMessage id='app.page.reports.noData' />
                }
              </div>
            </div>
            : null
          }

        </div>
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  const { staffSales } = state.reports
  return {
    isProcessing: staffSales.isProcessing,
    activeCashier: state.app.mainUI.activeCashier,
    posMode: state.app.mainUI.posMode,
    selectedStaffId: staffSales.staffId,
    from: staffSales.from,
    to: staffSales.to,
    staffs: state.app.mainUI.activeStaff.staffs,
    orders: staffSales.orders
  }
}

export default connect(mapStateToProps)(StaffSales)
