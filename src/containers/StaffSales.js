import React from 'react'
import { FormattedMessage } from 'react-intl'
import { DatePicker } from 'react-input-enhancements'
import { connect } from 'react-redux'

import moment from 'moment'
import {
  staffSalesFetch,
  staffSalesChangeInputTo,
  staffSalesChangeInputFr
} from '../actions/reports'

class StaffSales extends React.Component {
  constructor (props) {
    super(props)

    this.renderDatePickers = this.renderDatePickers.bind(this)
  }

  componentDidMount () {
    const { dispatch, activeCashier, selectedStaffId } = this.props
    const searchStaffId = activeCashier && activeCashier.id || selectedStaffId

    const from = moment().subtract(100, 'days').startOf('day').toDate()
    const to = new Date()

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

  renderDatePickers () {
    const { from, to } = this.props

    return (
      <div id='trans-report-date' className='tile is-child is-primary is-6'>
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

  render () {
    return (
      <div className='tile is-ancestor'>
        <div className='tile is-vertical'>
          <div className='tile is-parent is-vertical'>
            {this.renderDatePickers()}
          </div>
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  const { staffSales } = state.reports

  return {
    activeCashier: state.application.activeCashier,
    selectedStaffId: staffSales.staffId,
    from: staffSales.from,
    to: staffSales.tot
  }
}

export default connect(mapStateToProps)(StaffSales)
