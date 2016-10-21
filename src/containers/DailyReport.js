import React from 'react'
import { connect } from 'react-redux'
import moment from 'moment'
import { DatePicker } from 'react-input-enhancements'

// import { completeSalesFetch } from '../actions/reports'
import {
  salesReportFetch,
  changeDatepickerTo,
  changeDatepickerFr,
  changeInputIdTo,
  changeInputIdFr,
  changeReportType
} from '../actions/tempSalesReport'

class DailyReport extends React.Component {
  constructor (props) {
    super(props)

    this.renderDatePickers = this.renderDatePickers.bind(this)
    this.renderIdInputs = this.renderIdInputs.bind(this)
    this.handleChangeRadio = this.handleChangeRadio.bind(this)
  }

  componentDidMount () {
    const { dispatch, store } = this.props

    const today = new Date()
    const lastMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)

    dispatch(salesReportFetch(store.source, lastMonth, today))
  }

  onChangeDatePicker (picker, value) {
    const { dispatch, from, to } = this.props
    const date = value.toDate()

    switch (picker) {
      case 'from':
        if (date > to) {
          global.alert('from cannot be ahead to')
        }

        dispatch(changeDatepickerFr(date))
        break
      case 'to':
        if (date < from) {
          global.alert('to cannot be behind from')
        }

        dispatch(changeDatepickerTo(date))
        break
    }
  }

  onChangeInputId (input, event) {
    console.log('evt', event)
    console.log('input', input)

    const { dispatch } = this.props

    switch (input) {
      case 'idFrom':
        dispatch(changeInputIdFr(event.target.value))
        break
      case 'idTo':
        dispatch(changeInputIdTo(event.target.value))
        break
    }
  }

  handleChangeRadio (event) {
    const { dispatch } = this.props
    const { name } = event.target

    dispatch(changeReportType(name))
  }

  renderDatePickers () {
    const { from, to } = this.props

    return (
      <div className='tile is-child is-primary'>
        <label className='label'>From</label>
        <DatePicker
          value={moment(from).format('ddd DD/MM/YYYY')}
          pattern='ddd DD/MM/YYYY'
          onChange={this.onChangeDatePicker.bind(this, 'from')}
          onValuePreUpdate={v => parseInt(v, 10) > 1e8
            ? moment(parseInt(v, 10)).format('ddd DD/MM/YYYY') : v
          }>
          {(inputProps, { registerInput }) =>
            <p className='control'>
              <input {...inputProps} className='input' type='text' />
            </p>
          }
        </DatePicker>

        <label className='label'>To</label>
        <DatePicker
          value={moment(to).format('ddd DD/MM/YYYY')}
          pattern='ddd DD/MM/YYYY'
          onChange={this.onChangeDatePicker.bind(this, 'to')}
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

  renderIdInputs () {
    const { idFrom, idTo } = this.props

    return (
      <div className='tile is-child'>
        <p className='control'>
          <label className='label'>From (Transaction ID)</label>
          <input
            className='input'
            type='text'
            placeholder='Input transaction ID'
            value={idFrom}
            onChange={this.onChangeInputId.bind(this, 'idFrom')}
          />
        </p>

        <p className='control'>
          <label className='label'>To (Transaction ID)</label>
          <input
            className='input'
            type='text'
            placeholder='Input transaction ID'
            value={idTo}
            onChange={this.onChangeInputId.bind(this, 'idTo')}
          />
        </p>
      </div>
    )
  }

  render () {
    const { reportType } = this.props

    return (
      <div className='tile is-ancestor'>
        <div className='tile is-vertical'>
          <div className='tile is-parent'>
            <div className='tile is-child'>
              <p className='control'>
                <label className='radio'>
                  <input
                    type='radio'
                    name='date'
                    checked={reportType === 'date'}
                    onChange={this.handleChangeRadio.bind(this)} /> Date
                </label>

                <label className='radio'>
                  <input
                    type='radio'
                    name='id'
                    checked={reportType === 'id'}
                    onChange={this.handleChangeRadio.bind(this)} /> Transaction ID
                </label>
              </p>
            </div>
          </div>

          <div className='tile is-parent'>
            {reportType === 'date'
              ? this.renderDatePickers()
              : this.renderIdInputs()
            }
          </div>
        </div>
      </div>
    )
  }
}

function mapStateToProps (state) {
  return {
    store: state.application.store,
    from: state.tempSalesReport.from,
    to: state.tempSalesReport.to,
    reportType: state.tempSalesReport.reportType
  }
}

export default connect(mapStateToProps)(DailyReport)
