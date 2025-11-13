import React, { useState } from "react";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa6";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Axios from "../utils/Axios";
import SummaryApi from "../common/summaryApi";
import AxiosToastError from "../utils/AxiosToastError";
import { useDispatch } from "react-redux";
import { setTokens, setUserDetails } from "../store/userSlice";

const Login = () => {
  const [data, setData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic client-side validation
    if (!data.email || !data.password) {
      toast.error("Please enter both email and password.");
      return;
    }

    setLoading(true);
    try {
      const response = await Axios({
        url: SummaryApi.login.url,
        method: SummaryApi.login.method,
        data: data,
      });

      if (response.data.success) {
        toast.success(response.data.message || "Login successful!");

        const { accessToken, refreshToken, user } = response.data.data;

        // Dispatch actions to update global Redux store
        dispatch(setTokens({ accessToken, refreshToken }));
        dispatch(setUserDetails(user));

        // Redirect based on user role
        if (user.role === "BRAND_ADMIN") {
          navigate("/dashboard"); // Redirect Brand Admin to their dashboard
        } else if (user.role === "MANAGER") {
          navigate("/manager/dashboard"); // Example: Redirect Manager to their dashboard
        } else {
          navigate("/"); // Fallback redirect
        }
      }
    } catch (error) {
      AxiosToastError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200 p-4">
      <div className="bg-white my-8 w-full max-w-md mx-auto rounded-xl shadow-2xl p-8 md:p-10">
        <h2 className="text-3xl font-bold text-center text-gray-800">
          Welcome Back
        </h2>
        <p className="text-center text-gray-500 mb-6">
          Login to your SuperMenu account.
        </p>

        <form className="grid gap-5 mt-8" onSubmit={handleSubmit}>
          <div className="grid gap-1.5">
            <label htmlFor="email" className="font-medium text-gray-700">
              Email:
            </label>
            <input
              type="email"
              id="email"
              autoFocus
              className="bg-slate-100 p-3 border rounded-lg outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500 transition-all duration-300"
              name="email"
              value={data.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
              disabled={loading}
            />
          </div>
          <div className="grid gap-1.5">
            <label htmlFor="password" className="font-medium text-gray-700">
              Password:
            </label>
            <div className="bg-slate-100 p-3 border rounded-lg flex items-center focus-within:ring-2 focus-within:ring-green-400 focus-within:border-green-500 transition-all duration-300">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                className="w-full outline-none bg-transparent"
                name="password"
                value={data.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
                disabled={loading}
              />
              <div
                onClick={() => setShowPassword((prev) => !prev)}
                className="cursor-pointer text-gray-500 hover:text-green-600 transition-colors"
              >
                {showPassword ? <FaRegEye /> : <FaRegEyeSlash />}
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-3 rounded-lg font-semibold my-3 tracking-wide transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Logging in...
              </>
            ) : (
              "Login"
            )}
          </button>
        </form>

        <p className="text-center mt-4 text-sm text-gray-600">
          Don't have an account?{" "}
          <Link
            to={"/register"}
            className="font-semibold text-green-600 hover:text-green-700 hover:underline transition-colors"
          >
            Register here
          </Link>
        </p>
      </div>
    </section>
  );
};

export default Login;
