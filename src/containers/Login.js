import React from 'react'
import { connect } from 'react-redux'
import {
  storeSetActive,
  closeActiveModal
} from '../actions/app/mainUI'

import {
  storeGetIds
} from '../actions/data/stores'

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
    stores,
    activeStore,
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
      stores={stores}
      errorMessage={errorMessage}
      isLoggingIn={isLoggingIn}
      storeId={activeStore ? activeStore.source : []}
      networkStatus={networkStatus}
    />
  )
}

const mapStateToProps = (state) => {
  const stores = state.data.stores.stores.filter(store => {
    if (store) { return store.source !== 'ecomm' }
  })

  return {
    errorMessage: state.login.errorMessage,
    isLoggingIn: state.login.isLoggingIn,
    isFetchingStoreIds: state.data.stores.isProcessing,
    activeStore: state.app.mainUI.activeStore,
    networkStatus: state.app.mainUI.networkStatus,
    stores
  }
}

const mapDispatchToProps = (dispatch, activeStore) => {
  return {
    handleLogin: (username, password, storeId) => {
      const loginDetails = {
        username,
        password,
        store: storeId
      }
      dispatch(login(loginDetails))
    },

    handleGetStoreIds: () => {
      dispatch(storeGetIds())
    },

    closeModal: () => {
      dispatch(closeActiveModal())
    },

    handleSetStoreId: (storeId, stores) => {
      stores.forEach(item => {
        if (item.source === storeId) {
          dispatch(storeSetActive(item))
        }
      })
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Login)
