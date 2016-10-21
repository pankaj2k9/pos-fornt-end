import React from 'react'
import { connect } from 'react-redux'
import moment from 'moment'
import { DatePicker } from 'react-input-enhancements'

// import { completeSalesFetch } from '../actions/reports'
import { salesReportFetch } from '../actions/tempSalesReport'

class DailyReport extends React.Component {
  componentDidMount () {
    const { dispatch, store } = this.props

    const today = new Date()
    const lastMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)

    dispatch(salesReportFetch(store.source, lastMonth, today))
  }

  render () {
    return (
      <div className='tile is-ancestor'>
        <div className='tile is-vertical'>
          <div className='tile is-parent'>
            <div className='tile is-child is-primary'>
              <DatePicker
                value={moment().format('ddd DD/MM/YYYY')}
                pattern='ddd DD/MM/YYYY'
                onValuePreUpdate={v => parseInt(v, 10) > 1e8
                  ? moment(parseInt(v, 10)).format('ddd DD/MM/YYYY') : v
                }>
                {(inputProps, { registerInput }) =>
                  <p className='control'>
                    <label className='label'>From</label>
                    <input {...inputProps} className='input is-medium' type='text' />
                  </p>
                }
              </DatePicker>
            </div>

            <div className='tile is-child is-warning'>
              <DatePicker
                value={moment().format('ddd DD/MM/YYYY')}
                pattern='ddd DD/MM/YYYY'
                onValuePreUpdate={v => parseInt(v, 10) > 1e8
                  ? moment(parseInt(v, 10)).format('ddd DD/MM/YYYY') : v
                }>
                {(inputProps, { registerInput }) =>
                  <p className='control'>
                    <label className='label'>To</label>
                    <input {...inputProps} className='input is-medium' type='text' />
                  </p>
                }
              </DatePicker>
            </div>
          </div>
        </div>

        <div className='tile is-vertical'>
          <div className='tile is-parent'>
            <div className='tile is-child'>
              <p className='control'>
                <label className='label'>From (Transaction ID)</label>
                <input className='input' type='text' placeholder='From' />
              </p>
            </div>

            <div className='tile is-child'>
              <p className='control'>
                <label className='label'>To (Transaction ID)</label>
                <input className='input' type='text' placeholder='To' />
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

function mapStateToProps (state) {
  return {
    store: state.application.store
  }
}

export default connect(mapStateToProps)(DailyReport)
