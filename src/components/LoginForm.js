// Login components
import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'

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

    return (
      <div className='hero is-fullheight'>
        <div className='hero-body'>
          <div className='container has-text-centered' style={{alignItems: 'center'}}>
            <center>
              <div className='card'>
                <div className='card-content'>
                  <form className='form' onSubmit={this.onPressLogin.bind(this)}>
                    <div className='control is-horizontal'>
                      <div className='control-label'>
                        <label className='label'>StoreID</label>
                      </div>
                      <div className='control'>
                        <div className={storeIdSelectClass}>
                          <select onChange={this.handleStoreIdChange.bind(this)}>
                            {storeIds.map(store => {
                              let storeName = !store.name ? store.source : store.name
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
                      <i className='fa fa-user'></i>
                    </p>
                    <p className='control has-icon'>
                      <input className='input'
                        type='password'
                        placeholder='Password'
                        onChange={this.handlePasswordChange.bind(this)}
                        />
                      <i className='fa fa-lock'></i>
                    </p>
                    <div className='control'>
                      {isLoggingIn || isFetchingStoreIds
                        ? <p className='has-text-centered'><i className='fa fa-spinner fa-pulse fa-2x fa-fw'></i></p>
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
    )
  }
}

export default LoginForm
