import ordersService from '../../services/orders'
import dailyDataService from '../../services/dailyData'
import workHistoryService from '../../services/workHistory'

import {
  updateDailyData
} from './cashdrawers'

import {
  setNewLastID,
  setActiveModal,
  updateCashierWorkStatus,
  setQuickLoginPinCode,
  setQuickLoginCashier,
  setInvalidQuickLoginPinCode,
  closeActiveModal
} from '../app/mainUI'

export const OFFLINE_TOGGLE_WORK_STATE = 'OFFLINE_TOGGLE_WORK_STATE'
export function offlineToggleWorkState (masterId, cashierId, storeId, pinCode) {
  return (dispatch, getState) => {
    const state = getState()
    const cashiers = state.app.mainUI.activeStaff ? state.app.mainUI.activeStaff.staffs : []

    let isPinCodeRight = false
    let cashierData
    cashiers.forEach((cashier) => {
      if (cashier.id === cashierId &&
          cashier.pinCode === pinCode) {
        isPinCodeRight = true
        cashierData = cashier
      }
    })

    const newStatus = cashierData.workStatus === 'logout' ? 'login' : 'logout'

    if (isPinCodeRight) {
      dispatch({
        type: OFFLINE_TOGGLE_WORK_STATE,
        newItem: {
          date: new Date(),
          storeId,
          masterId,
          cashierId,
          action: newStatus
        }
      })

      dispatch(updateCashierWorkStatus(cashierId, newStatus))
      dispatch(setQuickLoginPinCode(undefined))
      dispatch(setQuickLoginCashier(undefined))
      dispatch(setInvalidQuickLoginPinCode(false))
      dispatch(closeActiveModal())
    } else {
      dispatch(setInvalidQuickLoginPinCode(true))
    }
  }
}

export const PROCESS_OFFLINE_ORDER = 'PROCESS_OFFLINE_ORDER'
export function processOfflineOrder (orderInfo) {
  return {
    type: PROCESS_OFFLINE_ORDER,
    orderInfo
  }
}

export function makeOfflineOrder (orderInfo, receipt, activeDrawer) {
  return (dispatch) => {
    dispatch(setActiveModal('processingOrder'))
    setTimeout(e => {
      dispatch(processOfflineOrder(orderInfo))
      dispatch(setActiveModal('orderSuccess'))
      dispatch(setNewLastID())
      dispatch(updateDailyData(activeDrawer))
    }, 1000)
  }
}

export const SYNC_CASHDRAWERS_REQUEST = 'SYNC_CASHDRAWERS_REQUEST'
export function syncDrawersRequest () {
  return {
    type: SYNC_CASHDRAWERS_REQUEST
  }
}

export const SYNC_CASHDRAWER_SUCCESS = 'SYNC_CASHDRAWER_SUCCESS'
export function syncDrawerSuccess (successDrawer) {
  return {
    type: SYNC_CASHDRAWER_SUCCESS,
    successDrawer
  }
}

export const SYNC_CASHDRAWERS_DONE = 'SYNC_CASHDRAWERS_DONE'
export function syncDrawersDone () {
  return {
    type: SYNC_CASHDRAWERS_DONE
  }
}

export const SYNC_CASHDRAWER_FAILED = 'SYNC_CASHDRAWER_FAILED'
export function syncDrawerFailed (error, failedOrder) {
  return {
    type: SYNC_CASHDRAWER_FAILED,
    error,
    failedOrder
  }
}

export const SYNC_ORDERS_REQUEST = 'SYNC_ORDERS_REQUEST'
export function syncOrdersRequest () {
  return {
    type: SYNC_ORDERS_REQUEST
  }
}

export const SYNC_ORDER_SUCCESS = 'SYNC_ORDER_SUCCESS'
export function syncOrderSuccess (successOrder) {
  return {
    type: SYNC_ORDER_SUCCESS,
    successOrder
  }
}

export const SYNC_WORK_HISTORY_ITEM_DONE = 'SYNC_WORK_HISTORY_ITEM_DONE'
export function syncWorkHistoryItemDone (item) {
  return {
    type: SYNC_WORK_HISTORY_ITEM_DONE,
    item
  }
}

export const SYNC_ORDERS_DONE = 'SYNC_ORDERS_DONE'
export function syncOrdersDone () {
  return {
    type: SYNC_ORDERS_DONE
  }
}

export const SYNC_ORDER_FAILED = 'SYNC_ORDER_FAILED'
export function syncOrderFailed (error, failedOrder) {
  return {
    type: SYNC_ORDER_FAILED,
    error,
    failedOrder
  }
}

export const SAVE_RECEIPT = 'SAVE_RECEIPT'
export function saveReceipt (receipt) {
  return {
    type: SAVE_RECEIPT,
    receipt
  }
}

export const UPDATE_SAVED_RECEIPT = 'UPDATE_SAVED_RECEIPT'
export function updateSavedReceipt (receipt) {
  return {
    type: UPDATE_SAVED_RECEIPT,
    receipt
  }
}

export const UPDATE_SYNC_LOG = 'UPDATE_SYNC_LOG'
export function updateSyncLog (syncLog) {
  var elem = document.getElementById('syncLog')
  elem.scrollTop = elem.scrollHeight
  return {
    type: UPDATE_SYNC_LOG,
    syncLog
  }
}

export const CLEAR_SYNC_LOG = 'CLEAR_SYNC_LOG'
export function clearSyncLog (syncLog) {
  return {
    type: CLEAR_SYNC_LOG
  }
}

export const SAVE_UPDATE_FAILED_DRAWER = 'SAVE_UPDATE_FAILED_DRAWER'
export function saveUpdateFailedDrawer (drawer) {
  return {
    type: SAVE_UPDATE_FAILED_DRAWER,
    drawer
  }
}

export const SAVE_CREATE_FAILED_DRAWER = 'SAVE_CREATE_FAILED_DRAWER'
export function saveCreateFailedDrawer (drawer) {
  return {
    type: SAVE_CREATE_FAILED_DRAWER,
    drawer
  }
}

export const CLEAR_SAVED_RECEIPTS = 'CLEAR_SAVED_RECEIPTS'
export function clearSavedReceipts () {
  return {
    type: CLEAR_MESSAGES
  }
}

export const CLEAR_MESSAGES = 'CLEAR_MESSAGES'
export function clearMessages () {
  return {
    type: CLEAR_MESSAGES
  }
}

export function syncWorkHistory () {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      const state = getState()
      const workHistory = state.data.offlineData.workHistory

      if (workHistory.length === 0) {
        return resolve()
      }

      const promises = []
      workHistory.forEach((item) => {
        const promise = workHistoryService.create({
          date: item.date,
          master_id: item.masterId,
          cashier_id: item.cashierId,
          source_id: item.storeId,
          action: item.action
        })
          .then(response => {
            dispatch(syncWorkHistoryItemDone(item))
            resolve()
          })
          .catch(() => {
            reject()
          })
        promises.push(promise)
      })

      return Promise.all(promises)
    })
  }
}
export function syncOfflineData (offlineOrders, offlineDrawers) {
  return (dispatch) => {
    dispatch(syncOrdersRequest())
    dispatch(updateSyncLog({start: 'Syncing Process Started'}))
    dispatch(syncWorkHistory())
    const syncOrders = new Promise((resolve, reject) => {
      let syncOrderCount = 0
      let syncOrderSuccessCount = 0
      if (offlineOrders.length > 0) {
        offlineOrders.forEach(offlineOrder => {
          return ordersService.create(offlineOrder)
          .then(response => {
            syncOrderCount++
            syncOrderSuccessCount++
            dispatch(updateSyncLog({type: 'Order', id: offlineOrder.id}))
            dispatch(syncOrderSuccess(offlineOrder))
            if (syncOrderCount === offlineOrders.length) {
              resolve(syncOrderSuccessCount)
            }
          })
          .catch(error => {
            syncOrderCount++
            dispatch(updateSyncLog({type: 'Order', id: offlineOrder.id, error: error.message}))
            dispatch(syncOrderFailed(error.message, offlineOrder))
            if (syncOrderCount === offlineOrders.length) {
              resolve(syncOrderSuccessCount)
            }
          })
        })
      } else {
        resolve(syncOrderSuccessCount)
      }
    })
    const syncDrawers = new Promise((resolve, reject) => {
      let syncDrawerCount = 0
      let syncDrawerSuccessCount = 0
      if (offlineDrawers.length > 0) {
        offlineDrawers.forEach(offlineDrawer => {
          return dailyDataService.patch(offlineDrawer)
          .then(response => {
            syncDrawerCount++
            syncDrawerSuccessCount++
            dispatch(updateSyncLog({type: 'Drawer', id: offlineDrawer.id}))
            dispatch(syncDrawerSuccess(offlineDrawer))
            if (syncDrawerCount === offlineDrawers.length) {
              resolve(syncDrawerSuccessCount)
            }
          })
          .catch(error => {
            syncDrawerCount++
            dispatch(updateSyncLog({type: 'Drawer', id: offlineDrawer.id, error: error.message}))
            dispatch(syncDrawerFailed(error.message, offlineDrawer))
            if (syncDrawerCount === offlineDrawers.length) {
              resolve(syncDrawerSuccessCount)
            }
          })
        })
      } else {
        resolve(syncDrawerSuccessCount)
      }
    })
    return global.Promise.all([syncOrders, syncDrawers])
      .then((response) => {
        let orderFailCount = offlineOrders.length - response[0]
        let drawerFailCount = offlineDrawers.length - response[1]
        dispatch(updateSyncLog({type: 'success', end: `${response[0]} orders synced`}))
        dispatch(updateSyncLog({type: 'success', end: `${response[1]} drawers synced`}))
        if (orderFailCount > 0 || drawerFailCount > 0) {
          dispatch(updateSyncLog({type: 'failed', end: `${orderFailCount} orders failed`}))
          dispatch(updateSyncLog({type: 'failed', end: `${drawerFailCount} drawers failed`}))
        }
        dispatch(syncOrdersDone())
        dispatch(syncDrawersDone())
        dispatch(updateSyncLog({type: 'success', end: 'Syncing Process Done'}))
      })
  }
}
