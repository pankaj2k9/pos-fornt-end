import React, { Component } from 'react'
import { connect } from 'react-redux'

import { injectIntl } from 'react-intl'
import LoadingPane from '../components/LoadingPane'
import ModalCard from '../components/ModalCard'
import POSButtons from '../components/POSButtons'
// import MoneyInput from '../components/MoneyInput'
import { addCustomer, customerAddSetData, customerAddResetData } from '../actions/data/customers'

import {
  closeActiveModal
} from '../actions/app/mainUI'

function isEmailValid (email) {
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  return re.test(email)
}

class TextInputLabel extends Component {
  render () {
    return (
      <div className='column is-4 has-text-centered' style={styles.center}>
        <p className={'title is-4' + (this.props.isError ? ' red-color' : ' black-color')}>
          <strong>{this.props.title}</strong>
        </p>
      </div>
    )
  }
}

class DateInput extends Component {
  render () {
    return (
      <div className='column is-8'>
        <form onSubmit={e => this._setFinalValue(e)}>
          <p className='control has-addons'>
            <input id={this.props.id} className='input is-large is-success' style={styles.input} type='date'
              onChange={e => {
                this.props.onChange(this.props.fieldName, e.target.value)
              }} value={this.props.value} />
          </p>
        </form>
      </div>
    )
  }
}

class TextInput extends Component {
  render () {
    return (
      <div className='column is-8'>
        <form onSubmit={e => this._setFinalValue(e)}>
          <p className='control has-addons'>
            <input id={this.props.id} className={'input is-large ' + ((this.props.isError) ? 'is-danger' : 'is-success')} style={styles.input}
              type={this.props.isPassword ? 'password' : 'text'}
              onChange={e => {
                this.props.onChange(this.props.fieldName, e.target.value)
              }} value={this.props.value} />
          </p>
        </form>
      </div>
    )
  }
}

class ModalAddMember extends Component {
  constructor (props) {
    super(props)
    this._onChangeField = this._onChangeField.bind(this)
  }

  _onChangeField (fieldName, value) {
    const {dispatch, data} = this.props
    const newState = {}
    if (value && value.trim().length === 0) {
      value = undefined
    }

    if (fieldName === 'firstName' || fieldName === 'lastName') {
      value = value.toUpperCase()
    }
    newState[fieldName] = value
    dispatch(customerAddSetData(Object.assign({}, data, newState)))
  }

  _close () {
    const { dispatch } = this.props
    dispatch(closeActiveModal())
    dispatch(customerAddResetData())
  }

  _confirm () {
    const { dispatch, data } = this.props
    const errorFields = []

    if (!data.firstName || data.firstName.length === 0) {
      errorFields.push('firstName')
    }

    if (!data.membership) {
      errorFields.push('membership')
    }

    if (!data.gender) {
      errorFields.push('gender')
    }

    if (!data.email || !isEmailValid(data.email)) {
      errorFields.push('email')
    }

    if (data.address1 && !data.postalCode) {
      errorFields.push('postalCode')
    }

    if (!data.password || data.password.trim().length < 8 ||
      !(data.password.match(/[A-Z]/) !== null && data.password.match(/[a-z]/) !== null && data.password.match(/[0-9]/) !== null)) {
      errorFields.push('password')
    }

    if (!data.pincode || data.pincode.length !== 4 || data.pincode.match(/^[0-9]+$/) === null) {
      errorFields.push('pincode')
    }

    if (errorFields.length > 0) {
      dispatch(customerAddSetData(Object.assign({}, data, {
        errorFields
      })))
    } else {
      const s = data
      dispatch(addCustomer({
        id: null,
        status: 'active',
        firstName: s.firstName,
        lastName: s.lastName,
        gender: s.gender === 'male' ? 'm' : 'f',
        birthDate: s.birthDate,
        emailAddress: s.email,
        password: s.password,
        pincode: s.pincode,
        homeNumber: s.homeNumber,
        phoneNumber: s.phoneNumber,
        workNumber: s.workNumber,
        address: s.address1 ? {lineAddress1: s.address1, lineAddress2: s.address2, postalCode: s.postalCode} : null,
        membership: s.membership
      }))
    }
  }

  render () {
    const { intl, data, dispatch, isLoading } = this.props

    const isFirstNameError = data.errorFields.indexOf('firstName') !== -1
    const isGenderError = data.errorFields.indexOf('gender') !== -1
    const isMembershipError = data.errorFields.indexOf('membership') !== -1
    const isEmailError = data.errorFields.indexOf('email') !== -1
    const isPasswordError = data.errorFields.indexOf('password') !== -1
    const isPincodeError = data.errorFields.indexOf('pincode') !== -1
    const isPostalCodeError = data.errorFields.indexOf('postalCode') !== -1

    let genderBtns = [
      {name: 'Male', label: 'Male', isActive: true, inverted: data.gender === 'male', color: 'blue', size: 'is-6'},
      {name: 'Female', label: 'Female', isActive: true, inverted: data.gender === 'female', color: 'pink', size: 'is-6'}
    ]

    let membershipBtns = [
      {name: 'Bronze', label: 'Bronze', isActive: true, color: 'blue', size: 'is-3', inverted: data.membership === 'bronze'},
      {name: 'Silver', label: 'Silver', isActive: true, color: 'blue', size: 'is-3', inverted: data.membership === 'silver'},
      {name: 'Gold', label: 'Gold', isActive: true, color: 'blue', size: 'is-3', inverted: data.membership === 'gold'},
      {name: 'Platinum', label: 'Platinum', isActive: true, color: 'blue', size: 'is-3', inverted: data.membership === 'platinum'}
    ]

    // Buttons

    // let lbl = (id) => { return intl.formatMessage({id: id}) } // translated lbl
    let lblAC = (id) => { return (intl.formatMessage({id: id})).toUpperCase() } // lbl all caps

    return (
      <ModalCard title={'app.modal.addMember'}
        closeAction={e => this._close()}
        confirmAction={isLoading ? null : e => this._confirm()} >
        {
          isLoading &&
          <LoadingPane headerMessage={'Proccessing...'} />
        }
        {
          !isLoading &&
          <div className='columns is-multiline is-mobile is-fullwidth is-marginless'>
            <TextInputLabel title={lblAC('app.lbl.firstName')} isError={isFirstNameError} />
            <TextInput fieldName='firstName' id='firstNameInput' isError={isFirstNameError} onChange={this._onChangeField} value={data.firstName} />

            <TextInputLabel title={lblAC('app.lbl.lastName')} />
            <TextInput id='lastNameInput' fieldName='lastName' onChange={this._onChangeField} value={data.lastName} />

            <TextInputLabel title={lblAC('app.lbl.gender')} isError={isGenderError} />
            <div className='column is-8 has-text-centered'>
              <POSButtons
                containerStyle={styles.btnCtnr}
                buttonStyle={styles.btnStyle}
                buttons={genderBtns}
                onClickButton={(value) => {
                  const newState = Object.assign({}, data, {gender: value.toLowerCase()})
                  dispatch(customerAddSetData(newState))
                }}
              />
            </div>

            <TextInputLabel title={lblAC('app.lbl.birthDay')} />
            <DateInput id='birthDayInput' onChange={this._onChangeField} fieldName='birthDate' value={data.birthDate} />

            <TextInputLabel title={lblAC('app.lbl.email')} isError={isEmailError} />
            <TextInput id='emailInput' fieldName='email' onChange={this._onChangeField} isError={isEmailError} value={data.email} />

            <TextInputLabel title={lblAC('app.lbl.homeNumber')} />
            <TextInput id='homeNumberInput' fieldName='homeNumber' onChange={this._onChangeField} value={data.homeNumber} />

            <TextInputLabel title={lblAC('app.lbl.phoneNumber')} />
            <TextInput id='phoneNumberInput' fieldName='phoneNumber' onChange={this._onChangeField} value={data.phoneNumber} />

            <TextInputLabel title={lblAC('app.lbl.workNumber')} />
            <TextInput id='workNumberInput' fieldName='workNumber' onChange={this._onChangeField} value={data.workNumber} />

            <TextInputLabel title={lblAC('app.lbl.address1')} />
            <TextInput id='address1Input' fieldName='address1' onChange={this._onChangeField} value={data.address1} />

            <TextInputLabel title={lblAC('app.lbl.address2')} />
            <TextInput id='address2Input' fieldName='address2' onChange={this._onChangeField} value={data.address2} />

            <TextInputLabel title={lblAC('app.lbl.postalCode')} />
            <TextInput id='postalCodeInput' fieldName='postalCode' onChange={this._onChangeField} isError={isPostalCodeError} value={data.postalCode} />

            <TextInputLabel title={lblAC('app.lbl.membership')} isError={isMembershipError} />
            <div className='column is-8 has-text-centered'>
              <POSButtons
                containerStyle={styles.btnCtnr}
                buttonStyle={styles.btnStyle}
                buttons={membershipBtns}
                onClickButton={(value) => {
                  const newState = Object.assign({}, data, {membership: value.toLowerCase()})
                  dispatch(customerAddSetData(newState))
                }} />
            </div>

            <TextInputLabel title={lblAC('app.lbl.password')} isError={isPasswordError} />
            <TextInput id='passwordInput' fieldName='password' onChange={this._onChangeField} isPassword isError={isPasswordError} value={data.password} />
            {
              isPasswordError &&
              <div className='column is-4 has-text-centered' style={styles.center} />
            }
            {
              isPasswordError &&
              <div className='column is-8'>
                <p style={{color: 'red'}}>The password must contain: upper case letter, lower case letter and number and be at least eight 8 characters.</p>
              </div>
            }

            <TextInputLabel title={lblAC('app.lbl.pincode')} isError={isPincodeError} />
            <TextInput id='pincodeInput' fieldName='pincode' onChange={this._onChangeField} isPassword isError={isPincodeError} value={data.pincode} />
            {
              isPincodeError &&
              <div className='column is-4 has-text-centered' style={styles.center} />
            }
            {
              isPincodeError &&
              <div className='column is-8'>
                <p style={{color: 'red'}}>The pincode must contain only 4 digits</p>
              </div>
            }

          </div>
        }

      </ModalCard>
    )
  }
}

const styles = {
  center: {
    display: 'flex',
    justifyContent: 'center',
    flexDirection: 'column'
  },
  input: {
    height: 'inherit',
    fontSize: '2.1rem',
    fontWeight: 600,
    paddingTop: ' 0.0em',
    textAlign: 'center'
  },
  btnStyle: {
    height: 60,
    padding: 10
  },
  btnCtnr: { margin: 10 },
  cardCtnr: { margin: 10 },
  cardProv: {
    opacity: 0.2,
    padding: 0
  }
}

function mapStateToProps (state) {
  let mainUI = state.app.mainUI
  let storeUI = state.app.storeUI
  return {
    mainUI,
    storeUI,
    intl: state.intl,
    locale: state.intl.locale,
    data: state.data.customers.addCustomerData,
    isLoading: state.data.customers.isProccessAddCustomer
  }
}

export default connect(mapStateToProps)(injectIntl(ModalAddMember))
