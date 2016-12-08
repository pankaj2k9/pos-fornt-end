import React from 'react'
import { connect } from 'react-redux'
import { browserHistory } from 'react-router'
import { storeGetIds, storeSetId, storeSetActive } from '../actions/application'

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
    storeId,
    cashdrawer,
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
      storeId={storeId}
      cashdrawer={cashdrawer}
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
    storeId: state.application.storeId,
    cashdrawer: state.application.cashdrawer,
    storeIds
  }
}

const mapDispatchToProps = (dispatch, storeId) => {
  return {
    handleLogin: (username, password, storeId, cashdrawer) => {
      const loginDetails = {
        username,
        password,
        store: storeId
      }
      dispatch(login(loginDetails, browserHistory, storeId, cashdrawer))
    },

    handleGetStoreIds: () => {
      dispatch(storeGetIds())
    },

    handleSetStoreId: (storeId, storeIds) => {
      dispatch(storeSetId(storeId))
      storeIds.forEach(item => {
        if (item.source === storeId) {
          dispatch(storeSetActive(item))
        }
      })
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Login)
