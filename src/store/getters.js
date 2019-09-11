const getters = {
  // user
  avatar: function (state) {
    if (localStorage.getItem('avatar')) {
      state.user.avatar = localStorage.getItem('avatar')
    }
    return state.user.avatar
  }
}
export default getters
