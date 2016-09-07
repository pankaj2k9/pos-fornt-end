import api from './api'

const users = api.service('/users')

export default {
  patch (id, params) {
    return users.patch(id, params)
  }
}
