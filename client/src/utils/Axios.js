import axios from "axios";
import SummaryApi, { baseURL } from "../common/summaryApi";
import { store } from "../store/store";
import { logout } from "../store/userSlice";

const Axios = axios.create({
  baseURL: baseURL,
  withCredentials: true,
});

// Add a request interceptor to include the access token in every request.
Axios.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("accessToken");

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
// Add a response interceptor to handle token refresh on 401 errors.
Axios.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originRequest = error.config;

    // Check if the error is a 401 and we haven't retried yet.
    if (error.response?.status === 401 && !originRequest._retry) {
      originRequest._retry = true; // Use a private property to avoid conflicts

      const refreshToken = localStorage.getItem("refreshToken");

      if (refreshToken) {
        const newAccessToken = await refreshAccessToken(refreshToken);

        if (newAccessToken) {
          originRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return Axios(originRequest);
        }
      }
      // If refresh fails or no refresh token, logout the user
      if (error.response?.status === 401) {
        store.dispatch(logout());
      }
    }

    return Promise.reject(error);
  }
);

const refreshAccessToken = async (refreshToken) => {
  try {
    const response = await Axios({
      url: SummaryApi.refreshToken.url,
      method: SummaryApi.refreshToken.method,
      headers: {
        Authorization: `Bearer ${refreshToken}`,
      },
    });

    const accessToken = response.data.data.accessToken;
    localStorage.setItem("accessToken", accessToken);
    return accessToken;
  } catch (error) {
    console.error("Failed to refresh access token:", error);
  }
};

export default Axios;
