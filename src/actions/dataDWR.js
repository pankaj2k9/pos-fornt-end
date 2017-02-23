// import {
//   setActiveModal
// } from './appMainUI'
//
// export const DAILYDATA_CREATE_REQUEST = 'DAILYDATA_CREATE_REQUEST'
// export const DAILYDATA_CREATE_SUCCESS = 'DAILYDATA_CREATE_SUCCESS'
// export const DAILYDATA_CREATE_FAILURE = 'DAILYDATA_CREATE_FAILURE'
// export function dailyDataCreateRequest () {
//   return { type: DAILYDATA_CREATE_REQUEST }
// }
// export function dailyDataCreateSuccess (data, mode) {
//   return { type: DAILYDATA_CREATE_SUCCESS, data, mode }
// }
// export function dailyDataCreateFailure (error) {
//   return { type: DAILYDATA_CREATE_FAILURE, error }
// }
//
// export function createDailyData (storeId, posMode) {
//   return (dispatch) => {
//     dispatch(dailyDataCreateRequest())
//     let initial = {
//       storeId: storeId,
//       date: new Date().toISOString().slice(0, 10),
//       cashDrawerOpenCount: 0,
//       float: 0
//     }
//     if (posMode === 'online') {
//       return dailyDataService.create(initial)
//         .then(response => {
//           dispatch(dailyDataCreateSuccess(response, 'online'))
//           dispatch(setActiveCashdrawer(response))
//         })
//         .catch(error => {
//           dispatch(dailyDataCreateFailure(error))
//         })
//     } else {
//       dispatch(dailyDataCreateSuccess(initial, 'offline'))
//     }
//   }
// }
//
// export const DAILYDATA_FETCH_REQUEST = 'DAILYDATA_FETCH_REQUEST'
// export const DAILYDATA_FETCH_SUCCESS = 'DAILYDATA_FETCH_SUCCESS'
// export const DAILYDATA_FETCH_FAILURE = 'DAILYDATA_FETCH_FAILURE'
// export function dailyDataFetchDataRequest () {
//   return { type: DAILYDATA_FETCH_REQUEST }
// }
//
// export function dailyDataFetchDataSuccess (storeDailyData) {
//   return { type: DAILYDATA_FETCH_SUCCESS, storeDailyData }
// }
//
// export function dailyDataFetchDataFailure (error) {
//   return { type: DAILYDATA_FETCH_FAILURE, error }
// }
//
// export function storeGetDailyData (storeId, cashdrawer, staff, posMode) {
//   return (dispatch) => {
//     dispatch(dailyDataFetchDataRequest())
//     function validateCashdrawer (data) {
//       let matchedDrawer
//       data.find(function (drawer) {
//         let date1 = new Date(drawer.date).toISOString().slice(0, 10)
//         let date2 = new Date().toISOString().slice(0, 10)
//         if (date1 === date2) {
//           matchedDrawer = drawer
//         }
//       })
//       if (!matchedDrawer) {
//         dispatch(createDailyData(storeId, posMode))
//         dispatch(setActiveModal('updateCashDrawer'))
//       } else {
//         dispatch(setActiveCashdrawer(matchedDrawer))
//         if (Number(matchedDrawer.float) === 0) {
//           dispatch(setActiveModal('updateCashDrawer'))
//         }
//       }
//     }
//     if (posMode === 'online') {
//       return dailyDataService.find({query: { storeId: storeId }})
//         .then(response => {
//           // set store id with the first item
//           if (response.data.length > 0) {
//             validateCashdrawer(response.data)
//             dispatch(dailyDataFetchDataSuccess(response.data))
//           } else if (response.data.length === 0) {
//             validateCashdrawer(cashdrawer)
//           }
//         })
//         .catch(error => {
//           dispatch(dailyDataFetchDataFailure(error))
//         })
//     } else {
//       validateCashdrawer(cashdrawer)
//     }
//   }
// }
