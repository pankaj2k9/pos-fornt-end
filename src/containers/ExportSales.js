import React from 'react'
import moment from 'moment'
import { connect } from 'react-redux'
import { FormattedMessage } from 'react-intl'
import { DatePicker } from 'react-input-enhancements'
import FileSaver from 'file-saver'

import DataList from '../components/DataList'
import { exportSalesChDate, exportSalesFetch } from '../actions/reports'

class ExportSales extends React.Component {
  constructor (props) {
    super(props)

    this.fetchTransactions = this.fetchTransactions.bind(this)
    this.handleChangeDate = this.handleChangeDate.bind(this)
    this.handleClickGenerate = this.handleClickGenerate.bind(this)
    this.handleClickExport = this.handleClickExport.bind(this)
  }

  componentDidMount () { this.fetchTransactions() }
  handleClickGenerate () { this.fetchTransactions() }
  fetchTransactions () {
    const { dispatch, date, storeId } = this.props

    dispatch(exportSalesFetch(date, storeId))
  }

  handleClickExport () {
    const { salesData, date } = this.props
    const outputText = this.buildOutputText(salesData, date)
    const blob = new global.Blob([outputText], {type: 'text/plain;charset=utf-8'})
    const filename = 'XXXXXXXX' + moment(date).format('YYYYMMDD')

    FileSaver.saveAs(blob, filename)
  }

  handleChangeDate (date) {
    const { dispatch } = this.props

    dispatch(exportSalesChDate(date.toDate()))
  }

  buildOutputText (salesData, date) {
    let outputText = `${(salesData.tSalesAftTax || 0).toFixed(2)}|`
    outputText += `${(salesData.tSalesBefTax || 0).toFixed(2)}|`
    outputText += `${(salesData.tTaxCollected || 0).toFixed(2)}|`
    outputText += `${salesData.transCount || 0}|`
    outputText += moment(date).format('DD-MM-YYYY')

    return outputText
  }

  render () {
    const { isProcessing, salesData, date } = this.props
    const outputText = this.buildOutputText(salesData, date)
    const data = Object.assign({}, salesData, { salesDate: date, outputText })

    return (
      <div className='tile is-ancestor'>
        <div className='tile is-vertical'>
          <div className='tile is-parent is-vertical'>

            <div id='trans-report-date' className='tile is-child is-primary is-6'>
              <label className='label'>
                <FormattedMessage id='app.page.reports.salesDate' />
              </label>
              <DatePicker
                value={moment(date).format('ddd DD/MM/YYYY')}
                pattern='ddd DD/MM/YYYY'
                onChange={this.handleChangeDate.bind(this)}
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

            <div className='tile is-child'>
              <div className='control is-grouped'>
                <p className='control'>
                  <button
                    className={`button is-primary${isProcessing ? ' is-loading' : ''}`}
                    onClick={this.handleClickGenerate}>
                    <FormattedMessage id='app.button.generate' />
                  </button>
                </p>

                <p className='control'>
                  <button
                    className={`button is-success${isProcessing ? ' is-disabled' : ''}`}
                    onClick={this.handleClickExport}>
                    <FormattedMessage id='app.button.exportToText' />
                  </button>
                </p>
              </div>
            </div>

            <div className='tile is-child'>
              <DataList
                data={data}
                listName={'export-sales'}
                keyClass={' '}
                valClass={' '}
              />
            </div>

          </div>
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  const { exportSales: exp } = state.reports
  console.log(exp)

  return {
    storeId: state.application.storeId,
    isProcessing: exp.isProcessing,
    date: exp.salesDate,
    salesData: exp.data
  }
}

export default connect(mapStateToProps)(ExportSales)
