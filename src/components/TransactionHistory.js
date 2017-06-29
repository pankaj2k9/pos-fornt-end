import React from 'react'
import {connect} from 'react-redux'
import { FormattedMessage, FormattedDate, FormattedTime, injectIntl } from 'react-intl'
import { fetchTransactionHistory } from '../actions/transactionHistory'
import LoadingScreen from '../components/LoadingScreen'

class TransactionHistory extends React.Component {
  componentDidMount () {
    const {dispatch} = this.props
    dispatch(fetchTransactionHistory())
  }

  render () {
    const {orders, isLoading, intl} = this.props

    const lblTR = (id) => { return (intl.formatMessage({id: id})).toUpperCase() }
    let emptyListLbl = (data, lbl) => {
      if (data.length === 0) {
        return (
          <div className='box has-text-centered' style={{height: '400px'}}>
            <span className='icon is-large'><i className='fa fa-info-circle' /></span>
            <p className='title'>{lblTR(lbl)}</p>
          </div>
        )
      }
    }

    if (isLoading) {
      return (
        <LoadingScreen loadingText={'LOADING . . . '} />
      )
    }

    if (orders.length === 0) {
      return emptyListLbl(orders, 'No transactions')
    }
    return (
      <table className='table is-striped is-bordered'>
        <thead>
          <tr>
            <td><FormattedMessage id='app.transactionHistory.orderId' /></td>
            <td><FormattedMessage id='app.transactionHistory.date' /></td>
            <td><FormattedMessage id='app.transactionHistory.total' /></td>
            <td><FormattedMessage id='app.transactionHistory.currency' /></td>
          </tr>
        </thead>

        <tbody>
          {orders.map((data) => {
            return (
              <tr key={data.id + 'Show all'}>
                <td>{data.id}</td>
                <td>
                  <FormattedDate value={data.dateOrdered} /> - <FormattedTime value={data.dateOrdered} />
                </td>
                <td>{data.subtotal}</td>
                <td>
                  {data.currency === 'odbo'
                  ? <FormattedMessage id='app.transactionHistory.odbo' />
                  : <FormattedMessage id='app.transactionHistory.sgd' />
                }
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    )
  }
}

function mapStateToProps (state) {
  return {
    orders: state.transactionHistory.items,
    total: state.transactionHistory.total,
    page: state.transactionHistory.page,
    isLoading: state.transactionHistory.isLoading,
    limit: state.transactionHistory.limit
  }
}

export default connect(mapStateToProps)(injectIntl(TransactionHistory))
