import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import Home from "../pages/Home";
import About from "../pages/About";
import Contact from "../pages/Contact";
import RegisterBrand from "../pages/RegisterBrand";
import Login from "../pages/Login";
import BrandAdminDashboard from "../pages/BrandAdminDashboard";
import BrandManagement from "../pages/BrandManagement";
import ProtectedRoute from "./ProtectedRoute";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "",
        element: <Home />,
      },
      {
        path: "/about",
        element: <About />,
      },
      {
        path: "/contact",
        element: <Contact />,
      },
      {
        path: "/register",
        element: <RegisterBrand />,
      },
      {
        path: "/login",
        element: <Login />,
      },
      {
        element: <ProtectedRoute allowedRoles={["BRAND_ADMIN", "MANAGER"]} />,
        children: [
          { path: "/dashboard", element: <BrandAdminDashboard /> },
          {
            path: "/manage",
            element: <BrandManagement />,
          },
        ],
      },
    ],
  },
]);

export default router;
