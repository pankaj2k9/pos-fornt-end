import api from './api'

const login = {
  login ({ username, password }) {
    return api.authenticate({
      type: 'local',
      username: username,
      password: password
    })
  },

  logout () {
    return api.logout()
  }
}

export default login
