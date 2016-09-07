import React from 'react'
import { connect } from 'react-redux'
import { browserHistory } from 'react-router'
import { storeGetIds, storeSetId } from '../actions/application'

// components/containers
import LoginForm from '../components/LoginForm'

// actions/etc.
import { login } from '../actions/login.js'

const Login = (props) => {
  const {
    handleLogin,
    handleGetStoreIds,
    errorMessage,
    isLoggingIn,
    isFetchingStoreIds,
    storeIds,
    handleSetStoreId
  } = props

  return (
    <LoginForm
      onLogin={handleLogin}
      onGetStoreIds={handleGetStoreIds}
      isFetchingStoreIds={isFetchingStoreIds}
      onSetStoreId={handleSetStoreId}
      storeIds={storeIds}
      errorMessage={errorMessage}
      isLoggingIn={isLoggingIn}
    />
  )
}

const mapStateToProps = (state) => {
  const storeIds = state.application.storeIds.filter(store => {
    return store.source !== 'ecomm'
  })

  return {
    errorMessage: state.login.errorMessage,
    isLoggingIn: state.login.isLoggingIn,
    isFetchingStoreIds: state.application.isFetchingStoreIds,
    storeIds
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    handleLogin: (username, password) => {
      const loginDetails = {
        username,
        password
      }

      dispatch(login(loginDetails, browserHistory))
    },

    handleGetStoreIds: () => {
      dispatch(storeGetIds())
    },

    handleSetStoreId: (storeId) => {
      dispatch(storeSetId(storeId))
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Login)
