import React, { useState } from "react";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa6";
import toast from "react-hot-toast"; // Ensure react-hot-toast is installed
import Axios from "../utils/Axios";
import SummaryApi from "../common/summaryApi";
import AxiosToastError from "../utils/AxiosToastError";
import { Link, useNavigate } from "react-router-dom";

const RegisterBrand = () => {
  const [data, setData] = useState({
    brandName: "",
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;

    setData((preve) => {
      return {
        ...preve,
        [name]: value,
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (data.password !== data.confirmPassword) {
      toast.error("Password and Confirm Password must be the same");
      return;
    }

    // Enhanced client-side validation
    if (data.password.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(data.email)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    setLoading(true); // Start loading state
    try {
      // Exclude confirmPassword from the data sent to the API
      const { confirmPassword, ...apiData } = data;

      const response = await Axios({
        url: SummaryApi.registerBrand.url,
        method: SummaryApi.registerBrand.method,
        data: apiData,
      });

      if (response.data.success) {
        toast.success(
          response.data.message ||
            "Brand registered successfully! Please log in."
        );
        setData({
          brandName: "",
          name: "",
          email: "",
          password: "",
          confirmPassword: "",
        });
        navigate("/login");
      }
    } catch (error) {
      AxiosToastError(error);
    } finally {
      setLoading(false); // End loading state regardless of outcome
    }
  };

  return (
    <section className="w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200 p-4">
      <div className="bg-white my-8 w-full max-w-lg mx-auto rounded-xl shadow-2xl p-8 md:p-10">
        <h2 className="text-3xl font-bold text-center text-gray-800">
          Create Your SuperMenu Account
        </h2>
        <p className="text-center text-gray-500 mb-6">
          Start by registering your brand.
        </p>

        <form className="grid gap-5 mt-8" onSubmit={handleSubmit}>
          <div className="grid gap-1.5">
            <label htmlFor="brandName" className="font-medium text-gray-700">
              Brand Name:
            </label>
            <input
              type="text"
              id="brandName"
              autoFocus
              className="bg-slate-100 p-3 border rounded-lg outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500 transition-all duration-300"
              name="brandName"
              value={data.brandName}
              onChange={handleChange}
              placeholder='e.g., "The Pizza Palace"'
              required
              disabled={loading}
            />
          </div>
          <div className="grid gap-1.5">
            <label htmlFor="name" className="font-medium text-gray-700">
              Your Name:
            </label>
            <input
              type="text"
              id="name"
              className="bg-slate-100 p-3 border rounded-lg outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500 transition-all duration-300"
              name="name"
              value={data.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              required
              disabled={loading}
            />
          </div>
          <div className="grid gap-1.5">
            <label htmlFor="email" className="font-medium text-gray-700">
              Email:
            </label>
            <input
              type="email"
              id="email"
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
          <div className="grid gap-1.5">
            <label
              htmlFor="confirmPassword"
              className="font-medium text-gray-700"
            >
              Confirm Password:
            </label>
            <div className="bg-slate-100 p-3 border rounded-lg flex items-center focus-within:ring-2 focus-within:ring-green-400 focus-within:border-green-500 transition-all duration-300">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                className="w-full outline-none bg-transparent"
                name="confirmPassword"
                value={data.confirmPassword}
                onChange={handleChange}
                placeholder="Enter your confirm password"
                required
                disabled={loading}
              />
              <div
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="cursor-pointer text-gray-500 hover:text-green-600 transition-colors"
              >
                {showConfirmPassword ? <FaRegEye /> : <FaRegEyeSlash />}
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
                Registering...
              </>
            ) : (
              "Register"
            )}
          </button>
        </form>

        <p className="text-center mt-4 text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            to={"/login"}
            className="font-semibold text-green-600 hover:text-green-700 hover:underline transition-colors"
          >
            Login
          </Link>
        </p>
      </div>
    </section>
  );
};

export default RegisterBrand;
