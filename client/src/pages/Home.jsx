import React from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { FaStore, FaUserPlus, FaArrowRight, FaBookOpen } from "react-icons/fa";

const Home = () => {
  const { userDetails, accessToken } = useSelector((state) => state.user);
  const isAdmin = accessToken && userDetails?.role === "BRAND_ADMIN";

  const AdminGuide = () => (
    <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-200 max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-800 mb-4">
        Welcome, {userDetails.name}!
      </h2>
      <p className="text-lg text-gray-600 mb-8">
        Here’s how to get your brand set up on SuperMenu:
      </p>

      <div className="space-y-6">
        {/* Step 1 */}
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0 w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
            <span className="font-bold text-xl">1</span>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-800">
              Go to Your Brand Management Page
            </h3>
            <p className="text-gray-600 mt-1">
              This is your central hub for managing everything related to your
              brand.
            </p>
            <Link
              to="/manage"
              className="inline-flex items-center mt-2 text-green-600 font-semibold hover:text-green-700 transition-colors"
            >
              Manage Your Brand <FaArrowRight className="ml-2" />
            </Link>
          </div>
        </div>

        {/* Step 2 */}
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0 w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
            <FaStore size={24} />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-800">
              Add Your Restaurants
            </h3>
            <p className="text-gray-600 mt-1">
              On the "Restaurants" tab, you can add each of your locations. This
              will allow you to track their performance and assign managers.
            </p>
          </div>
        </div>

        {/* Step 3 */}
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0 w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
            <FaUserPlus size={24} />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-800">
              Add and Assign Managers
            </h3>
            <p className="text-gray-600 mt-1">
              Switch to the "Managers" tab to create accounts for your managers
              and assign them to their respective restaurants.
            </p>
          </div>
        </div>

        {/* Step 4 */}
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0 w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
            <FaBookOpen size={24} />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-800">
              Create Your Master Menu
            </h3>
            <p className="text-gray-600 mt-1">
              Finally, go to the "Master Menu" tab to add all the dishes and
              drinks your brand offers. Your managers will use this list to
              build their local menus.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const GeneralWelcome = () => (
    <div className="text-center">
      <h1 className="text-4xl font-bold text-gray-800 mb-4">
        Welcome to SuperMenu
      </h1>
      <p className="text-xl text-gray-600">
        The ultimate solution for managing your restaurant brand.
      </p>
    </div>
  );

  return (
    <main className="container mx-auto p-4 sm:p-6 lg:p-8">
      {isAdmin ? <AdminGuide /> : <GeneralWelcome />}
    </main>
  );
};

export default Home;
