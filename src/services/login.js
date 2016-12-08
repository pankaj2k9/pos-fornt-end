import api from './api'

const login = {
  login ({ username, password, store }) {
    return api.authenticate({
      strategy: 'local',
      username: username,
      password: password,
      store: store
    })
    .then(result => {
      api.set('token', result.accessToken)
      api.set('user', result.user)
      return result
    })
  },

  logout () {
    return api.logout()
  }
}

export default login
