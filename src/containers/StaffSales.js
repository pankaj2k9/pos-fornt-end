import React from 'react'
import { FormattedMessage } from 'react-intl'
import { DatePicker } from 'react-input-enhancements'
import { connect } from 'react-redux'

import StaffsDropdown from '../components/StaffDropdown'

import moment from 'moment'
import {
  staffSalesFetch,
  staffSalesChangeInputTo,
  staffSalesChangeInputFr,
  staffSalesStaff
} from '../actions/reports'

class StaffSales extends React.Component {
  constructor (props) {
    super(props)

    this.renderFilters = this.renderFilters.bind(this)
    this.handleChangeStaff = this.handleChangeStaff.bind(this)
    this.handleSearchOrders = this.handleSearchOrders.bind(this)
  }

  handleSearchOrders () {
    const { dispatch, activeCashier, selectedStaffId, from, to } = this.props
    const searchStaffId = activeCashier && activeCashier.id || selectedStaffId

    dispatch(staffSalesFetch(searchStaffId, from, to))
  }

  handleChangeDatePicker (picker, value) {
    const { dispatch, from, to } = this.props
    const date = value.toDate()

    switch (picker) {
      case 'from':
        // set from to start of day
        const newFrom = moment(date).startOf('day').toDate()

        if (newFrom > to) {
          global.alert('from cannot be ahead to')
        }

        dispatch(staffSalesChangeInputFr(newFrom))
        break
      case 'to':
        if (date < from) {
          global.alert('to cannot be behind from')
        }

        dispatch(staffSalesChangeInputTo(date))
        break
    }
  }

  renderFilters () {
    const { staffs, selectedStaffId: selected, activeCashier: ac, from, to } = this.props
    const selectedStaff = selected || ac && ac.id || staffs[0].id

    return (
      <div id='trans-report-date' className='tile is-child is-primary is-6'>
        <StaffsDropdown
          staffs={staffs}
          selectedStaff={selectedStaff}
          onChange={this.handleChangeStaff} />

        <label className='label'>
          <FormattedMessage id='app.page.settings.from' />
        </label>
        <DatePicker
          value={moment(from).format('ddd DD/MM/YYYY')}
          pattern='ddd DD/MM/YYYY'
          onChange={this.handleChangeDatePicker.bind(this, 'from')}
          onValuePreUpdate={v => parseInt(v, 10) > 1e8
            ? moment(parseInt(v, 10)).format('ddd DD/MM/YYYY') : v
          }>
          {(inputProps, { registerInput }) =>
            <p className='control'>
              <input {...inputProps} className='input' type='text' />
            </p>
          }
        </DatePicker>

        <label className='label'>
          <FormattedMessage id='app.page.settings.to' />
        </label>
        <DatePicker
          style={{ display: 'block' }}
          value={moment(to).format('ddd DD/MM/YYYY')}
          pattern='ddd DD/MM/YYYY'
          onChange={this.handleChangeDatePicker.bind(this, 'to')}
          onValuePreUpdate={v => parseInt(v, 10) > 1e8
            ? moment(parseInt(v, 10)).format('ddd DD/MM/YYYY') : v
          }>
          {(inputProps, { registerInput }) =>
            <p className='control'>
              <input {...inputProps} className='input' type='text' />
            </p>
          }
        </DatePicker>
      </div>
    )
  }

  handleChangeStaff (event) {
    const { dispatch } = this.props

    dispatch(staffSalesStaff(event.target.value))
  }

  render () {
    const { isProcessing } = this.props

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
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  const { staffSales } = state.reports

  return {
    isProcessing: staffSales.isProcessing,
    activeCashier: state.application.activeCashier,
    selectedStaffId: staffSales.staffId,
    from: staffSales.from,
    to: staffSales.to,
    staffs: state.application.staff.data.staffs
  }
}

export default connect(mapStateToProps)(StaffSales)
