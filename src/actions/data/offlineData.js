import moment from 'moment'
import reportsService from '../../services/reports'
import {
  productSalesFetchRequest,
  productSalesFetchSuccess,
  staffSalesStoreOrders,
  staffSalesFetchRequest,
  staffSalesFetchSuccess,
  storeOrdersFetchRequest,
  storeOrdersFetchSuccess,
  viewBillsFetchRequest,
  viewBillsFetchSuccess,
  viewBillsStoreOrders,
  completeSalesFetchSuccess,
  completeSalesFetchRequest,
  sendXZReportRequest,
  sendXZReportSuccess,
  reportsSetDate,
  completeSalesChSource
} from '../reports'
import ordersService from '../../services/orders'
import dailyDataService from '../../services/dailyData'
import workHistoryService from '../../services/workHistory'
import {
  storeOrderFetchRequest,
  storeOrderFetchSuccess,
  setActiveOrderDetails
} from '../settings'

import {
  refundSuccess,
  refundRequest,
  storeOrdersSetActiveOrder
} from '../refund'
import { compPaymentsSum, compCashChange } from '../../utils/computations'
import { buildOrderId } from '../../utils/string'

import {
  updateDailyData,
  dailyDataFetchDataSuccess
} from './cashdrawers'

import {
  setNewLastID,
  setActiveModal,
  updateCashierWorkStatus,
  setQuickLoginPinCode,
  setQuickLoginCashier,
  setInvalidQuickLoginPinCode,
  closeActiveModal,
  setActiveCashdrawer
} from '../app/mainUI'

export const OFFLINE_LOGOUT_ALL_CASHIERS = 'OFFLINE_LOGOUT_ALL_CASHIERS'
export function offlineLogoutAllCashiers () {
  return (dispatch, getState) => {
    const state = getState()
    const mainUI = state.app.mainUI
    const master = mainUI.activeStaff
    const cashiers = master ? master.staffs : []
    const storeId = mainUI.activeStore.source
    cashiers.forEach((cashier) => {
      if (cashier.workStatus === 'logout') {
        return
      }

      dispatch({
        type: OFFLINE_TOGGLE_WORK_STATE,
        newItem: {
          date: new Date(),
          storeId,
          masterId: master.id,
          cashierId: cashier.id,
          action: 'logout'
        }
      })

      dispatch(updateCashierWorkStatus(cashier.id, 'logout'))
    })
  }
}

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
  return (dispatch, getState) => {
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
        dispatch(updateSavedOrders())
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

        const state = getState()
        const closeDayPromises = []
        state.data.offlineData.closedDays.forEach((item) => {
          closeDayPromises.push(reportsService.sendXZReport(item.date, item.source, item.masterId))
        })

        return Promise.all(closeDayPromises)
          .then((response) => {
            state.data.offlineData.closedDays = []
          })
      })
  }
}

export const UPDATE_SAVED_ORDERS_SUCCESS = 'UPDATE_SAVED_ORDERS_SUCCESS'
export function updateSavedOrdersSuccess (savedOrders) {
  return {
    type: UPDATE_SAVED_ORDERS_SUCCESS,
    savedOrders
  }
}
export function updateSavedOrders () {
  return (dispatch, getState) => {
    const state = getState()
    const mainUI = state.app.mainUI
    if (!mainUI || !mainUI.activeStore) {
      return
    }
    const source = mainUI.activeStore.source
    const date = new Date(new Date().getTime() - 15 * 24 * 60 * 60 * 1000)

    ordersService.findDirect({
      $eager: '[users, items, items.product, payments, vouchers, staff]',
      source,
      dateOrdered: {
        $gt: moment(date).startOf('day').toDate()
      }
    }).then((response) => {
      dispatch(updateSavedOrdersSuccess(response.data))
    })
  }
}

function findOrdersOffline (savedOrders, params) {
  const result = []
  savedOrders.forEach((order) => {
    let isSuitable = true
    if (params.id !== undefined) {
      if (params.id !== order.id) {
        isSuitable = false
      }
    }
    if (params.storeId !== undefined) {
      if (params.storeId !== order.source) {
        isSuitable = false
      }
    }
    if (params.refundId !== undefined) {
      if (params.refundId !== order.refundId) {
        isSuitable = false
      }
    }

    if (params.from) {
      const fromStr = params.from.toISOString()
      if (!(order.dateOrdered >= fromStr)) {
        isSuitable = false
      }
    }

    if (params.to) {
      const toStr = params.to.toISOString()
      if (!(order.dateOrdered <= toStr)) {
        isSuitable = false
      }
    }

    if (params.adminId) {
      if (order.adminId !== params.adminId) {
        isSuitable = false
      }
    }
    if (params.idFrom) {
      const orderId = buildOrderId(params.storeId, params.idFrom, null, params.stores)
      if (!((order.id >= orderId) || (order.refundId >= orderId))) {
        isSuitable = false
      }
    }

    if (params.idTo) {
      const orderId = buildOrderId(params.storeId, params.idTo, null, params.stores)
      if (!((order.id <= orderId) || (order.refundId <= orderId))) {
        isSuitable = false
      }
    }

    if (isSuitable) {
      const copy = Object.assign({}, order)
      result.push(copy)
    }
  })

  return result
}

function processOrders (orders) {
  let orderSearchResults = []
  orders.forEach(order => {
    let original = order
    orderSearchResults.push(original)
    if (order.refundId) {
      let duplicate = Object.assign({duplicate: true}, order)
      orderSearchResults.push(duplicate)
    }
  })
  orderSearchResults.sort(function (a, b) {
    let aValue = a.duplicate ? a.refundId : a.id
    let bValue = b.duplicate ? b.refundId : b.id

    if (aValue > bValue) {
      return -1
    }

    if (aValue < bValue) {
      return 1
    }

    return 0
  })

  return orderSearchResults
}

export function storeOrderFetchOffline (params) {
  return (dispatch, getState) => {
    dispatch(storeOrderFetchRequest())
    const state = getState()
    const savedOfflineOrders = state.data.offlineData.savedOfflineOrders
    const result = findOrdersOffline(savedOfflineOrders, params)
    const orderSearchResults = processOrders(result)
    dispatch(storeOrderFetchSuccess(orderSearchResults))
  }
}

export function storeOrdersFetchOffline (params) {
  return (dispatch, getState) => {
    dispatch(storeOrdersFetchRequest())
    const state = getState()
    const savedOfflineOrders = state.data.offlineData.savedOfflineOrders
    const result = findOrdersOffline(savedOfflineOrders, params)
    const orderSearchResults = processOrders(result)
    dispatch(storeOrdersFetchSuccess({
      limit: orderSearchResults.length,
      skip: 0,
      data: orderSearchResults,
      total: orderSearchResults.length
    }))
  }
}

export function refundOffline (refundParams, storeData, activeOrder, currentPath) {
  return (dispatch, getState) => {
    dispatch(refundRequest())
    const state = getState()
    const savedOfflineOrders = state.data.offlineData.savedOfflineOrders
    const savedOrdersCopy = savedOfflineOrders.slice()
    let refundData

    savedOrdersCopy.forEach((order, index) => {
      if (refundParams.id === order.id) {
        refundData = Object.assign({}, order)
        savedOrdersCopy[index] = refundData
      }
    })

    let offlineOrder
    state.data.offlineData.offlineOrders.forEach((order) => {
      if (refundParams.id === order.id) {
        offlineOrder = order
      }
    })

    dispatch(refundSuccess())

    refundData.refundId = refundParams.refundId
    refundData.isRefunded = true
    refundData.dateRefunded = new Date().toISOString()
    refundData.dateUpdated = refundData.dateRefunded

    dispatch(refundSuccess())
    dispatch(setNewLastID())
    if (refundData.storeAddress) {
      refundData.type = 'refund'
      refundData.paymentInfo.refundId = refundData.refundId
      refundData.paymentInfo.refundAmt = compPaymentsSum(refundData.paymentInfo.payments, false, refundData.vouchers) - compCashChange(refundData.paymentInfo.payments)
      refundData.paymentInfo.dataRefunded = new Date()
      dispatch(updateSavedReceipt(refundData))
    }

    if (offlineOrder) {
      offlineOrder.refundId = refundParams.refundId
      offlineOrder.isRefunded = true
      offlineOrder.dateRefunded = new Date().toISOString()
      offlineOrder.dateUpdated = offlineOrder.dateRefunded

      if (offlineOrder.storeAddress) {
        offlineOrder.type = 'refund'
        offlineOrder.paymentInfo.refundId = offlineOrder.refundId
        offlineOrder.paymentInfo.refundAmt = compPaymentsSum(offlineOrder.paymentInfo.payments, false, offlineOrder.vouchers) - compCashChange(refundData.paymentInfo.payments)
        offlineOrder.paymentInfo.dataRefunded = new Date()
        dispatch(updateSavedReceipt(offlineOrder))
      }
    } else {
      offlineOrder = Object.assign({}, refundData)
      dispatch(processOfflineOrder(offlineOrder))
    }

    if (currentPath === 'settings' ||
        currentPath === '/settings') {
      dispatch(setActiveOrderDetails(refundData))
    } else {
      dispatch(storeOrdersSetActiveOrder(refundData))
    }

    const orderSearchResults = processOrders(savedOrdersCopy)
    dispatch(storeOrderFetchSuccess(orderSearchResults))
    dispatch(updateSavedOrdersSuccess(savedOrdersCopy))
    dispatch(setActiveModal('refundSuccess'))
  }
}

function findProductSalesOffline (savedOrders, source, from, to) {
  const productsWithOrders = []
  const fromStr = moment(from).startOf('day').toDate().toISOString()
  const toStr = moment(to).endOf('day').toDate().toISOString()

  const filteredOrders = savedOrders.filter((order) => {
    if (order.source === source &&
        order.dateOrdered >= fromStr &&
        order.dateOrdered <= toStr) {
      return true
    }

    return false
  })

  filteredOrders.forEach((order) => {
    order.items.forEach((item) => {
      productsWithOrders.push({
        id: item.id,
        nameEn: item.product.nameEn,
        nameZh: item.product.nameZh,
        salesSgd: order.currency === 'sgd' ? Number(item.totalCost) : 0,
        quantitySgd: order.currency === 'sgd' ? Number(item.quantity) : 0,
        salesOdbo: order.currency === 'odbo' ? Number(item.totalCost) : 0,
        quantityOdbo: order.currency === 'odbo' ? Number(item.quantity) : 0
      })
    })
  })

  const grouped = []
  productsWithOrders.forEach((item) => {
    let summary
    grouped.forEach((groupedItem) => {
      if (groupedItem.id === item.id) {
        summary = groupedItem
      }
    })

    if (!summary) {
      summary = {
        id: item.id,
        nameEn: item.nameEn,
        nameZh: item.nameZh,
        salesSgd: 0,
        quantitySgd: 0,
        salesOdbo: 0,
        quantityOdbo: 0
      }
      grouped.push(summary)
    }

    summary.salesSgd += item.salesSgd
    summary.quantitySgd += item.quantitySgd
    summary.salesOdbo += item.salesOdbo
    summary.quantityOdbo += item.quantityOdbo
  })

  return productsWithOrders
}

export function productSalesFetchOffline (source, from, to) {
  return (dispatch, getState) => {
    dispatch(productSalesFetchRequest())

    const state = getState()
    const savedOfflineOrders = state.data.offlineData.savedOfflineOrders

    const response = findProductSalesOffline(savedOfflineOrders, source, from, to)
    dispatch(productSalesFetchSuccess(response))
  }
}

export function staffSalesFetchOffline (staffId, dateFrom, dateTo) {
  return (dispatch, getState) => {
    dispatch(staffSalesFetchRequest())

    const params = {
      from: dateFrom,
      to: dateTo,
      adminId: staffId
    }

    const state = getState()
    const savedOfflineOrders = state.data.offlineData.savedOfflineOrders
    const allOrders = findOrdersOffline(savedOfflineOrders, params)

    dispatch(staffSalesStoreOrders({ data: allOrders }))
    dispatch(staffSalesFetchSuccess())
  }
}

export function viewBillsFetchOffline (source, dateFrom, dateTo, idFrom, idTo, stores) {
  return (dispatch, getState) => {
    const state = getState()
    dispatch(viewBillsFetchRequest())

    const params = {
      from: dateFrom,
      to: dateTo,
      idFrom,
      idTo,
      storeId: source,
      stores: state.data.stores.stores
    }

    const savedOfflineOrders = state.data.offlineData.savedOfflineOrders
    const allOrders = findOrdersOffline(savedOfflineOrders, params)

    dispatch(viewBillsStoreOrders({ data: allOrders }))
    dispatch(viewBillsFetchSuccess())
  }
}

export function completeSalesFetchOffline (source, date) {
  return (dispatch, getState) => {
    dispatch(completeSalesFetchRequest())
    const state = getState()
    const savedOfflineOrders = state.data.offlineData.savedOfflineOrders
    const closedDays = state.data.offlineData.closedDays

    const refunds = endOfDayRefunds(savedOfflineOrders, source, date)
    const orders = endOfDayOrders(savedOfflineOrders, source, date)
    const response = {
      summary: endOfDaySummary(savedOfflineOrders, source, date),
      voucherSummary: endOfDayVoucherSummary(savedOfflineOrders, source, date),
      refundSummary: endOfDayRefundSummary(savedOfflineOrders, source, date),
      refundCount: {
        count: refunds.length
      },
      orderCount: {
        count: orders.length
      },
      orders: endOfDayOrders(savedOfflineOrders, source, date),
      staffs: endOfDayStaffs(savedOfflineOrders, source, date),
      isDayClosed: isDayClosed(closedDays, date),
      lastClosedDay: closedDays.length > 0 ? new Date(closedDays[0].date) : undefined
    }

    dispatch(completeSalesFetchSuccess(response, date))
  }
}

function isDayClosed (closedDays, date) {
  const day = moment(date).startOf('day').toISOString()

  closedDays.forEach((item) => {
    const date = moment(item.date).startOf('day').toISOString()

    if (date === day) {
      return true
    }
  })

  return false
}

function endOfDayOrders (orders, source, date) {
  const dateStart = moment(date).startOf('day').toISOString()
  const dateEnd = moment(date).endOf('day').toISOString()
  return orders.filter((order) => {
    if (order.dateOrdered >= dateStart &&
        order.dateOrdered <= dateEnd &&
        order.source === source &&
        !order.isRefunded) {
      return true
    }

    return false
  })
}

function endOfDayRefunds (orders, source, date) {
  return orders.filter((order) => {
    const dateOrdered = new Date(order.dateOrdered)
    if (dateOrdered >= date &&
      order.source === source &&
      order.isRefunded) {
      return true
    }

    return false
  })
}

function endOfDayStaffs (savedOrders, source, date) {
  let staffWithSales = []
  const orders = endOfDayOrders(savedOrders, source, date).filter((order) => order.currency !== 'odbo')

  orders.forEach((order) => {
    let summary

    staffWithSales.forEach((resultItem) => {
      if (resultItem.id === order.adminId) {
        summary = resultItem
      }
    })

    if (!summary) {
      summary = {
        id: order.adminId,
        username: order.staff.username,
        firstname: order.staff.firstname,
        total: 0
      }
      staffWithSales.push(summary)
    }

    summary.total += Number(order.total)
  })

  return staffWithSales
}

function endOfDaySummary (savedOrders, source, date) {
  const filteredOrders = savedOrders.filter((order) => {
    const dateOrdered = new Date(order.dateOrdered)
    if (dateOrdered >= date &&
      order.source === source) {
      return true
    }

    return false
  })

  let summary = []

  filteredOrders.forEach((order) => {
    order.payments.forEach((paymentItem) => {
      let summaryItem

      summary.forEach((item) => {
        if (item.provider === paymentItem.provider &&
            item.type === paymentItem.type) {
          summaryItem = item
        }
      })

      if (!summaryItem) {
        summaryItem = {
          type: paymentItem.type,
          provider: paymentItem.provider,
          count: 0,
          subtotal: 0
        }
        summary.push(summaryItem)
      }

      summaryItem.count += 1
      summaryItem.subtotal += Number(paymentItem.amount)
    })
  })

  return summary
}

function endOfDayVoucherSummary (savedOrders, source, date) {
  const filteredOrders = savedOrders.filter((order) => {
    const dateOrdered = new Date(order.dateOrdered)
    if (dateOrdered >= date &&
      order.source === source) {
      return true
    }

    return false
  })

  let summary = {
    count: 0,
    subtotal: 0
  }

  filteredOrders.forEach((order) => {
    order.vouchers.forEach((voucherItem) => {
      summary.count += 1
      summary.subtotal += Number(voucherItem.deduction)
    })
  })

  return [summary]
}

export const CLOSE_DAY_OFFLINE = 'CLOSE_DAY_OFFLINE'
function closeDayOffline (date, source, masterId) {
  return (dispatch, getState) => {
    const state = getState()
    const cashdrawers = state.data.cashdrawers.cdList
    dispatch(dailyDataFetchDataSuccess(cashdrawers, date))
    return {
      type: CLOSE_DAY_OFFLINE,
      date,
      source,
      masterId
    }
  }
}

export function sendXZReportOffline (date, source, masterId) {
  return (dispatch, getState) => {
    const state = getState()
    const cashdrawers = state.data.cashdrawers.cdList

    dispatch(sendXZReportRequest())
    dispatch(closeDayOffline(date, source, masterId))
    dispatch(sendXZReportSuccess())
    dispatch(completeSalesChSource(source))
    dispatch(setActiveCashdrawer(null))
    dispatch(dailyDataFetchDataSuccess(cashdrawers, date))
    dispatch(reportsSetDate(new Date()))
  }
}

function endOfDayRefundSummary (savedOrders, source, date) {
  const filteredOrders = savedOrders.filter((order) => {
    const dateRefunded = new Date(order.dateRefunded)
    if (order.isRefunded &&
        dateRefunded >= date &&
        order.source === source) {
      return true
    }

    return false
  })

  let summary = []

  filteredOrders.forEach((order) => {
    order.payments.forEach((paymentItem) => {
      let summaryItem

      summary.forEach((item) => {
        if (item.provider === paymentItem.provider &&
          item.type === paymentItem.type) {
          summaryItem = item
        }
      })

      if (!summaryItem) {
        summaryItem = {
          type: paymentItem.type,
          provider: paymentItem.provider,
          count: 0,
          subtotal: 0
        }
        summary.push(summaryItem)
      }

      summaryItem.count += 1
      summaryItem.subtotal += Number(paymentItem.amount)
    })
  })

  return summary
}
