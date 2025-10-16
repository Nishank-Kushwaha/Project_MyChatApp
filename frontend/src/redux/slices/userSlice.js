import { createSlice } from "@reduxjs/toolkit";
import userActions from "../actions/userActions";

const initialState = {
  user: null,
  loginStatus: false,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: userActions,
});

export const { login, logout } = userSlice.actions;
export default userSlice.reducer;
