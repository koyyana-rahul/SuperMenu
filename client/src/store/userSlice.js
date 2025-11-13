import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  userDetails: null,
  accessToken: localStorage.getItem("accessToken") || "",
  refreshToken: localStorage.getItem("refreshToken") || "",
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUserDetails: (state, action) => {
      // This reducer now populates the userDetails object from the API response
      state.userDetails = action.payload;
    },
    setTokens: (state, action) => {
      // This reducer handles saving the authentication tokens
      const { accessToken, refreshToken } = action.payload;
      state.accessToken = accessToken;
      state.refreshToken = refreshToken;
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
    },
    logout: (state) => {
      // On logout, clear everything and return to the initial state
      state.userDetails = null;
      state.accessToken = "";
      state.refreshToken = "";
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    },
  },
});

export const { setUserDetails, setTokens, logout } = userSlice.actions;

export default userSlice.reducer;
