const userActions = {
  login: (state, action) => {
    state.user = action.payload;
    state.loginStatus = true;
  },
  logout: (state) => {
    state.user = null;
    state.loginStatus = false;
  },
};

export default userActions;
