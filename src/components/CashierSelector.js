import React from 'react'
import { connect } from 'react-redux'
import { injectIntl } from 'react-intl'
import { startQuickLogin } from '../actions/app/mainUI'

class CashierButton extends React.Component {
  constructor (props) {
    super(props)
    this.onClick = this.onClick.bind(this)
  }

  onClick () {
    this.props.handleToggleWorkStatus(this.props.master, this.props.cashier, this.props.activeStore, this.props.pinCode)
  }

  render () {
    return (
      <div className={'cashier-button ' + this.props.cashier.workStatus} key={String(this.props.cashier.id)} onClick={this.onClick}>
        { this.props.cashier.firstName }
      </div>
    )
  }
}

const CashierSelector = ({master, cashiers, activeStore, handleToggleWorkStatus}) => {
  let style = {}
  if (cashiers.length > 1) {
    style = {maxWidth: 155 * ((cashiers.length % 2 === 0) ? cashiers.length / 2 : (cashiers.length + 1) / 2)}
  }
  return (
    <div className='cashier-selector' style={style}>
      {
        cashiers.length === 0 &&
        <div style={{color: 'white'}}>No cashiers</div>
      }
      <div>
        {
          cashiers.length > 0 &&
          cashiers.map((cashier) => {
            return <CashierButton master={master} cashier={cashier} key={String(cashier.id)} activeStore={activeStore} handleToggleWorkStatus={handleToggleWorkStatus} />
          })
        }
      </div>
    </div>
  )
}

function mapStateToProps (state) {
  let mainUI = state.app.mainUI
  let activeStaff = mainUI.activeStaff
  let cashiers = activeStaff ? activeStaff.staffs : []

  return {
    master: activeStaff,
    cashiers: cashiers,
    activeStore: mainUI.activeStore
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    handleToggleWorkStatus: (master, cashier, activeStore, pinCode) => {
      dispatch(startQuickLogin(cashier.id))
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(CashierSelector))
