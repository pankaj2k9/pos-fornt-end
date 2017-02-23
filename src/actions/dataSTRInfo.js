import storesService from '../services/stores'

import { storeSetActive } from './appMainUI.js'

export const STORE_GET_IDS_REQUEST = 'STORE_GET_IDS_REQUEST'
export const STORE_GET_IDS_SUCCESS = 'STORE_GET_IDS_SUCCESS'
export const STORE_GET_IDS_FAILURE = 'STORE_GET_IDS_FAILURE'
export function storeGetIdsRequest () {
  return { type: STORE_GET_IDS_REQUEST }
}
export function storeGetIdsSuccess (storeIds) {
  return { type: STORE_GET_IDS_SUCCESS, storeIds }
}
export function storeGetIdsFailure (error) {
  return { type: STORE_GET_IDS_FAILURE, error }
}

export function storeGetIds () {
  return (dispatch) => {
    dispatch(storeGetIdsRequest())

    return storesService.find()
      .then(response => {
        dispatch(storeGetIdsSuccess(response.data))

        // set store id with the first item
        if (response.data.length > 0) {
          const firstStore = response.data[0]
          dispatch(storeSetActive(firstStore))
        }
      })
      .catch(error => {
        dispatch(storeGetIdsFailure(error))
      })
  }
}
