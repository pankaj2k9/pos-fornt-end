import React from 'react'
import { connect } from 'react-redux'
import { injectIntl, FormattedMessage } from 'react-intl'
import moment from 'moment'
import { DateRangePicker } from 'react-dates'
import 'react-dates/lib/css/_datepicker.css'
import ViewBillReceiptPreview from '../components/ViewBillReceiptPreview'

// import { completeSalesFetch } from '../actions/reports'
import { viewBillsFetchOffline } from '../actions/data/offlineData'
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
    this.startFetch = this.startFetch.bind(this)
    this.handleChangeDatePicker = this.handleChangeDatePicker.bind(this)

    this.state = {
      focusedInput: 'START_DATE'
    }
  }

  componentDidMount () { this.startFetch() }
  handleSearchOrders () { this.startFetch() }
  startFetch () {
    const { dispatch, stores, store, from, to, idFrom, idTo, reportType, posMode } = this.props

    if (posMode === 'offline') {
      switch (reportType) {
        case 'id':
          dispatch(viewBillsFetchOffline(store.source, null, null, idFrom, idTo, stores))
          break
        case 'date':
          dispatch(viewBillsFetchOffline(store.source, from, to, null, null, stores))
          break
      }
    } else {
      switch (reportType) {
        case 'id':
          dispatch(viewBillsFetch(store.source, null, null, idFrom, idTo, stores))
          break
        case 'date':
          dispatch(viewBillsFetch(store.source, from, to, null, null, stores))
          break
      }
    }
  }

  handleChangeDatePicker ({startDate, endDate}) {
    const { dispatch } = this.props

    if (startDate) {
      dispatch(changeDatepickerFr(startDate.startOf('day').toDate()))
    } else {
      dispatch(changeDatepickerFr(undefined))
    }

    if (endDate) {
      dispatch(changeDatepickerTo(endDate.startOf('day').toDate()))
    } else {
      dispatch(changeDatepickerTo(undefined))
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
    const { reportType, orders, stores, isProcessing, idTo, idFrom } = this.props
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
                    onChange={this.handleChangeRadio.bind(this)} />{' '}
                  <FormattedMessage id='app.page.settings.date' />
                </label>

                <label className='radio'>
                  <input
                    type='radio'
                    name='id'
                    checked={reportType === 'id'}
                    onChange={this.handleChangeRadio.bind(this)} />{' '}
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
              <button className={`button is-primary${isProcessing ? ' is-loading' : ''}`}
                onClick={this.handleSearchOrders}>
                <FormattedMessage id='app.page.settings.process' />
              </button>
            </div>
          </div>

          {!isProcessing
            ? <div className='tile is-parent is-vertical'>
              <div className='tile is-child'>
                {orders.length
                  ? <ViewBillReceiptPreview orders={orders} idTo={idTo} idFrom={idFrom} stores={stores} />
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

function mapStateToProps (state) {
  const {
    from,
    to,
    idFrom,
    idTo,
    reportType,
    orders,
    isProcessing
  } = state.reports.viewBills

  return {
    intl: state.intl,
    stores: state.data.stores.stores,
    store: state.app.mainUI.activeStore,
    posMode: state.app.mainUI.posMode,
    from,
    to,
    idFrom,
    idTo,
    reportType,
    orders,
    isProcessing
  }
}

export default connect(mapStateToProps)(injectIntl(ViewBills))
