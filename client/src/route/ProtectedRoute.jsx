import React from "react";
import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

/**
 * A component to protect routes based on user authentication and role.
 * @param {{ allowedRoles: string[] }} props - The roles allowed to access the route.
 */
const ProtectedRoute = ({ allowedRoles }) => {
  const { accessToken, userDetails } = useSelector((state) => state.user);

  // While userDetails are being fetched, show a loading state
  // This prevents a redirect before the user's role is confirmed.
  if (accessToken && !userDetails) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-150px)]">
        <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-green-500"></div>
      </div>
    );
  }

  // If user is not logged in, redirect to login page.
  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }

  // If the route requires a specific role and the user doesn't have it, redirect to home.
  if (allowedRoles && !allowedRoles.includes(userDetails?.role)) {
    return <Navigate to="/" replace />; // Or to a dedicated "Unauthorized" page
  }

  return <Outlet />; // Render the child route component (e.g., Dashboard)
};

export default ProtectedRoute;
