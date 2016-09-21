// Login components
import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'

const intFrameHeight = window.innerHeight

class LoginForm extends Component {

  constructor (props) {
    super(props)

    this.state = {
      username: '',
      password: '',
      storeId: '1'
    }
  }

  handleUserChange (event) {
    this.setState({
      username: event.target.value
    })
  }
  handlePasswordChange (event) {
    this.setState({
      password: event.target.value
    })
  }
  handleStoreIdChange (event) {
    const { onSetStoreId, storeIds } = this.props
    onSetStoreId(event.target.value, storeIds)
  }

  onPressLogin (event) {
    event.preventDefault()

    const { onLogin } = this.props
    const { username, password } = this.state

    onLogin(username, password)
  }

  componentWillMount () {
    const { onGetStoreIds } = this.props
    onGetStoreIds()
  }

  render () {
    const { errorMessage, isLoggingIn, isFetchingStoreIds, storeIds } = this.props
    const formIsDisabled = isFetchingStoreIds || isLoggingIn ? 'is-disabled' : ''
    const storeIdSelectClass = `select is-fullwidth ${formIsDisabled}`

    const containerHeight = intFrameHeight - 80

    return (
      <div style={{height: containerHeight}}>
        <div>
          <div className='container has-text-centered' style={{alignItems: 'center'}}>
            <div className='columns'>
              <div className='column is-half is-offset-one-quarter'>
                <center>
                  <div className='section'>
                    <center>
                      <img src={require('../assets/logo.png')} style={{height: 200, width: 'auto'}} />
                      <h1 style={{fontWeight: 100, fontSize: 50}}>POS APPLICATION</h1>
                    </center>
                    <br />
                  </div>
                  <div className='box'>
                    <div className='content'>
                      <h1 className='title'>Login Details</h1>
                      <form className='form' autoComplete='off'
                        onSubmit={this.onPressLogin.bind(this)}>
                        <div className='control is-horizontal'>
                          <div className='control-label'>
                            <label className='label'>StoreID</label>
                          </div>
                          <div className='control'>
                            <div className={storeIdSelectClass}>
                              <select onChange={this.handleStoreIdChange.bind(this)}>
                                {storeIds.map(store => {
                                  let storeName = !store.name ? 'The ODBO Pte. Ltd' : store.name
                                  return (
                                    <option key={`store-id-${store.source}`} value={store.source}>
                                    {storeName}
                                    </option>
                                  )
                                }
                                )}
                              </select>
                            </div>
                          </div>
                        </div>
                        <p className='control has-icon'>
                          <input className='input'
                            type='username'
                            placeholder='Username'
                            onChange={this.handleUserChange.bind(this)}
                            />
                          <i className='fa fa-user' />
                        </p>
                        <p className='control has-icon'>
                          <input className='input'
                            type='password'
                            placeholder='Password'
                            onChange={this.handlePasswordChange.bind(this)}
                            />
                          <i className='fa fa-lock' />
                        </p>
                        <div className='control'>
                          {isLoggingIn || isFetchingStoreIds
                            ? <p className='has-text-centered'><i className='fa fa-spinner fa-pulse fa-2x fa-fw' /></p>
                            : <button className='button is-success is-fullwidth' type='submit'>
                              <FormattedMessage id='app.button.login' />
                            </button>
                          }
                        </div>
                      </form>
                    </div>
                    {errorMessage
                      ? <div className='box'>
                        <div className='content'>
                          {errorMessage}
                        </div>
                      </div>
                      : null
                    }
                  </div>
                </center>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default LoginForm
