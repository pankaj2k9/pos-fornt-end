export const USER_SET_DATA = 'USER_SET_DATA'

export function userSetData (userData) {
  return {
    type: USER_SET_DATA,
    userData
  }
}
