import React from 'react'
import { connect } from 'react-redux'
import { injectIntl, FormattedMessage } from 'react-intl'
import moment from 'moment'
import { DatePicker } from 'react-input-enhancements'

// import { completeSalesFetch } from '../actions/reports'
import {
  viewBillsFetch,
  changeDatepickerTo,
  changeDatepickerFr,
  changeInputIdTo,
  changeInputIdFr,
  changeReportType
} from '../actions/reports'

class ViewBills extends React.Component {
  constructor (props) {
    super(props)

    this.renderDatePickers = this.renderDatePickers.bind(this)
    this.renderIdInputs = this.renderIdInputs.bind(this)
    this.handleChangeRadio = this.handleChangeRadio.bind(this)
    this.handleSearchOrders = this.handleSearchOrders.bind(this)
  }

  handleSearchOrders () {
    const { dispatch, stores, store, to, idFrom, idTo, reportType } = this.props
    let { from } = this.props

    switch (reportType) {
      case 'id':
        dispatch(viewBillsFetch(store.source, null, null, idFrom, idTo, stores))
        break
      case 'date':
        dispatch(viewBillsFetch(store.source, from, to, null, null, stores))
        break
    }
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

        dispatch(changeDatepickerFr(newFrom))
        break
      case 'to':
        if (date < from) {
          global.alert('to cannot be behind from')
        }

        dispatch(changeDatepickerTo(date))
        break
    }
  }

  handleChangeInputId (input, event) {
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

  renderIdInputs () {
    const { intl, idFrom, idTo } = this.props

    return (
      <div className='tile is-child is-6'>
        <p className='control'>
          <label className='label'>
            <FormattedMessage id='app.page.settings.transFrom' />
          </label>
          <input
            className='input'
            type='text'
            placeholder={intl.formatMessage({ id: 'app.page.settings.transFrom' })}
            value={idFrom}
            onChange={this.handleChangeInputId.bind(this, 'idFrom')}
          />
        </p>

        <p className='control'>
          <label className='label'>
            <FormattedMessage id='app.page.settings.transTo' />
          </label>
          <input
            className='input'
            type='text'
            placeholder={intl.formatMessage({ id: 'app.page.settings.transTo' })}
            value={idTo}
            onChange={this.handleChangeInputId.bind(this, 'idTo')}
          />
        </p><p />
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
                    onChange={this.handleChangeRadio.bind(this)} />
                  <FormattedMessage id='app.page.settings.date' />
                </label>

                <label className='radio'>
                  <input
                    type='radio'
                    name='id'
                    checked={reportType === 'id'}
                    onChange={this.handleChangeRadio.bind(this)} />
                  <FormattedMessage id='app.page.settings.transID' />
                </label>
              </p>
            </div>
          </div>

          <div className='tile is-parent is-vertical'>
            {reportType === 'date'
              ? this.renderDatePickers()
              : this.renderIdInputs()
            }

            <div className='tile is-child'>
              <button className='button is-primary'
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

function mapStateToProps (state) {
  const { from, to, idFrom, idTo, reportType, orders } = state.reports.viewBills

  return {
    intl: state.intl,
    stores: state.application.storeIds,
    store: state.application.store,
    from,
    to,
    idFrom,
    idTo,
    reportType,
    orders
  }
}

export default connect(mapStateToProps)(injectIntl(ViewBills))
