import React from 'react'
import { connect } from 'react-redux'
import { browserHistory } from 'react-router'
import { storeGetIds, storeSetId, storeSetActive, closeActiveModal } from '../actions/application'

// components/containers
import LoginForm from '../components/LoginForm'

// actions/etc.
import { login } from '../actions/login.js'

const Login = (props) => {
  const {
    closeModal,
    handleLogin,
    handleGetStoreIds,
    errorMessage,
    isLoggingIn,
    isFetchingStoreIds,
    storeIds,
    storeId,
    handleSetStoreId,
    networkStatus
  } = props
  return (
    <LoginForm
      closeModal={closeModal}
      onLogin={handleLogin}
      onGetStoreIds={handleGetStoreIds}
      isFetchingStoreIds={isFetchingStoreIds}
      onSetStoreId={handleSetStoreId}
      storeIds={storeIds}
      errorMessage={errorMessage}
      isLoggingIn={isLoggingIn}
      storeId={storeId}
      networkStatus={networkStatus}
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
    networkStatus: state.application.networkStatus,
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

    closeModal: () => {
      dispatch(closeActiveModal())
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
