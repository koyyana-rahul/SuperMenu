import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Axios from "../utils/Axios";
import SummaryApi from "../common/summaryApi";
import { logout, setUserDetails } from "../store/userSlice";

/**
 * A custom hook to fetch user details if an access token is present but userDetails are not.
 * This is useful for rehydrating the user's session on page load/refresh.
 */
const useFetchUserDetails = () => {
  const dispatch = useDispatch();
  const { accessToken, userDetails } = useSelector((state) => state.user);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await Axios.get(SummaryApi.getProfile.url);
        if (response.data.success) {
          dispatch(setUserDetails(response.data.data));
        }
      } catch (error) {
        console.error("Failed to fetch user details:", error);
        // If the error is 401 or a network error on this specific call, log the user out.
        if (error.response?.status === 401 || error.code === "ERR_NETWORK") {
          dispatch(logout());
        }
      }
    };

    if (accessToken && !userDetails) {
      fetchUserDetails();
    }
  }, [accessToken, userDetails, dispatch]);
};

export default useFetchUserDetails;
