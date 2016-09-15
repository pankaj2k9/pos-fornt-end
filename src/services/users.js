import api from './api'

const users = api.service('/users')

export default {
  patch (id, newPw, oldPw) {
    console.log('pw', { password: newPw, oldPassword: oldPw })
    return users.patch(id, { password: newPw, oldPassword: oldPw })
  }
}
