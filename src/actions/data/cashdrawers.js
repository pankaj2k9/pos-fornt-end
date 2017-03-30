// import moment from 'moment'

import {
  setActiveModal,
  closeActiveModal,
  setActiveCashdrawer
} from '../app/mainUI'

import {
  validateCashdrawers
} from '../helpers'

import {
  saveUpdateFailedDrawer
} from '../data/offlineData'

import dailyDataService from '../../services/dailyData'

export const DAILYDATA_CREATE_REQUEST = 'DAILYDATA_CREATE_REQUEST'
export const DAILYDATA_CREATE_SUCCESS = 'DAILYDATA_CREATE_SUCCESS'
export const DAILYDATA_CREATE_FAILURE = 'DAILYDATA_CREATE_FAILURE'
export function dailyDataCreateRequest () {
  return { type: DAILYDATA_CREATE_REQUEST }
}
export function dailyDataCreateSuccess () {
  return { type: DAILYDATA_CREATE_SUCCESS }
}
export function dailyDataCreateFailure (error) {
  return { type: DAILYDATA_CREATE_FAILURE, error }
}

export function createDailyData (storeId, amount, openCount, option) {
  return (dispatch) => {
    dispatch(dailyDataCreateRequest())
    let initial = {
      storeId: storeId,
      date: new Date().toISOString().slice(0, 10),
      cashDrawerOpenCount: openCount || 1,
      float: amount
    }
    return dailyDataService.create(initial)
      .then(response => {
        dispatch(dailyDataCreateSuccess())
        dispatch(setActiveCashdrawer(response))
        dispatch(closeActiveModal())
      })
      .catch(error => {
        if (option === 'updateTempData') {
          dispatch(setActiveCashdrawer(initial))
        } else {
          dispatch(setActiveModal('updateCDFailed'))
        }
        dispatch(dailyDataCreateFailure(error))
      })
  }
}

export const DAILYDATA_UPDATE_REQUEST = 'DAILYDATA_UPDATE_REQUEST'
export const DAILYDATA_UPDATE_SUCCESS = 'DAILYDATA_UPDATE_SUCCESS'
export const DAILYDATA_UPDATE_FAILURE = 'DAILYDATA_UPDATE_FAILURE'

export function dailyDataUpdateRequest () {
  return {
    type: DAILYDATA_UPDATE_REQUEST
  }
}

export function dailyDataUpdateSuccess () {
  return {
    type: DAILYDATA_UPDATE_SUCCESS
  }
}

export function dailyDataUpdateFailure (error) {
  return {
    type: DAILYDATA_UPDATE_FAILURE,
    error
  }
}

export function updateDailyData (activeDrawer, amount, option) {
  return (dispatch) => {
    if (activeDrawer.id) {
      dispatch(dailyDataUpdateRequest())
      let updatedData = {
        id: activeDrawer.id,
        float: amount || Number(activeDrawer.float),
        cashDrawerOpenCount: activeDrawer.cashDrawerOpenCount + 1
      }
      return dailyDataService.patch(updatedData)
        .then(response => {
          dispatch(dailyDataUpdateSuccess())
          dispatch(setActiveCashdrawer(response))
          option === 'closeModal' && dispatch(closeActiveModal())
        })
        .catch(error => {
          option === 'updateCDModal' && dispatch(setActiveModal('updateCDFailed'))
          dispatch(setActiveCashdrawer(Object.assign(activeDrawer, updatedData)))
          dispatch(saveUpdateFailedDrawer(updatedData))
          dispatch(dailyDataUpdateFailure(error))
        })
    } else {
      dispatch(createDailyData(activeDrawer.storeId, activeDrawer.float, activeDrawer.cashDrawerOpenCount + 1, 'updateTempData'))
    }
  }
}

export const DAILYDATA_FETCH_REQUEST = 'DAILYDATA_FETCH_REQUEST'
export const DAILYDATA_FETCH_SUCCESS = 'DAILYDATA_FETCH_SUCCESS'
export const DAILYDATA_FETCH_FAILURE = 'DAILYDATA_FETCH_FAILURE'
export function dailyDataFetchDataRequest () {
  return { type: DAILYDATA_FETCH_REQUEST }
}

export function dailyDataFetchDataSuccess (cashdrawers) {
  return { type: DAILYDATA_FETCH_SUCCESS, cashdrawers }
}

export function dailyDataFetchDataFailure (error) {
  return { type: DAILYDATA_FETCH_FAILURE, error }
}

export function fetchCashdrawers (storeId) {
  return (dispatch) => {
    dispatch(dailyDataFetchDataRequest())
    return dailyDataService.find({query: {
      storeId: storeId,
      date: new Date().toISOString().slice(0, 10)
    }})
      .then(response => {
        dispatch(dailyDataFetchDataSuccess(response.data))
        dispatch(validateCashdrawers(response.data))
      })
      .catch(error => {
        dispatch(dailyDataFetchDataFailure(error))
      })
  }
}
