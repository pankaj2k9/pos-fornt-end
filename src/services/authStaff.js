import api from './api'

const authStaffService = api.service('/auth/staff')

const authStaff = {
  create (staffData) {
    return authStaffService.create(staffData)
  }
}

export default authStaff
