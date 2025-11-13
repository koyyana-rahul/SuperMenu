import React, { useState, useEffect } from "react";
import Axios from "../utils/Axios";
import SummaryApi from "../common/summaryApi";
import AxiosToastError from "../utils/AxiosToastError";
import {
  FaDollarSign,
  FaShoppingCart,
  FaExclamationTriangle,
  FaTimesCircle,
  FaStar,
  FaStore,
} from "react-icons/fa";

const StatCard = ({ icon, title, value, color }) => (
  <div className="bg-white p-6 rounded-lg shadow-md flex items-center space-x-4">
    <div className={`p-3 rounded-full ${color}`}>
      {React.cloneElement(icon, { className: "h-6 w-6 text-white" })}
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  </div>
);

const BrandAdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [sortConfig, setSortConfig] = useState({
    key: "totalSales",
    direction: "descending",
  });
  const [branchPerformance, setBranchPerformance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30))
      .toISOString()
      .split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError("");
      try {
        // Fetch both sets of data concurrently
        const [statsResponse, performanceResponse] = await Promise.all([
          Axios.get(SummaryApi.getBrandDashboardReport.url, {
            params: dateRange,
          }),
          Axios.get(SummaryApi.getBrandSalesSummary.url, {
            params: dateRange,
          }),
        ]);

        if (statsResponse.data.success) {
          setStats(statsResponse.data.data);
        } else {
          throw new Error("Failed to fetch dashboard stats.");
        }

        if (performanceResponse.data.success) {
          setBranchPerformance(performanceResponse.data.data.salesByRestaurant);
        } else {
          throw new Error("Failed to fetch branch performance.");
        }
      } catch (err) {
        AxiosToastError(err);
        setError("Failed to fetch dashboard data. Please try again.");
        setStats(null); // Clear old data on error
        setBranchPerformance([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [dateRange]);

  const handleDateChange = (e) => {
    setDateRange((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const sortedBranchPerformance = React.useMemo(() => {
    let sortableItems = [...branchPerformance];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [branchPerformance, sortConfig]);

  const requestSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-150px)]">
        <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Brand Dashboard</h1>

      {/* Date Range Picker */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center bg-white p-4 rounded-lg shadow">
        <div className="w-full sm:w-auto">
          <label htmlFor="startDate" className="font-medium text-gray-700 mr-2">
            From:
          </label>
          <input
            type="date"
            id="startDate"
            name="startDate"
            value={dateRange.startDate}
            onChange={handleDateChange}
            className="p-2 border rounded-md"
          />
        </div>
        <div className="w-full sm:w-auto">
          <label htmlFor="endDate" className="font-medium text-gray-700 mr-2">
            To:
          </label>
          <input
            type="date"
            id="endDate"
            name="endDate"
            value={dateRange.endDate}
            onChange={handleDateChange}
            className="p-2 border rounded-md"
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={<FaDollarSign />}
          title="Total Sales"
          value={`$${stats?.salesSummary?.totalSales.toFixed(2) ?? "0.00"}`}
          color="bg-green-500"
        />
        <StatCard
          icon={<FaShoppingCart />}
          title="Total Orders"
          value={stats?.salesSummary?.totalOrders ?? 0}
          color="bg-blue-500"
        />
        <StatCard
          icon={<FaExclamationTriangle />}
          title="Suspicious Orders"
          value={stats?.operationalInsights?.totalSuspiciousOrders ?? 0}
          color="bg-yellow-500"
        />
        <StatCard
          icon={<FaTimesCircle />}
          title="Cancelled Orders"
          value={stats?.operationalInsights?.totalCancelledOrders ?? 0}
          color="bg-red-500"
        />
      </div>

      {/* Restaurant Performance & Top Selling Items */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <FaStore className="mr-2 text-blue-500" /> Restaurant Performance
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="p-3 font-semibold text-gray-600">
                    Restaurant
                  </th>
                  <th className="p-3 font-semibold text-gray-600 text-right">
                    Total Sales
                  </th>
                  <th className="p-3 font-semibold text-gray-600 text-right">
                    Total Orders
                  </th>
                </tr>
              </thead>
              <tbody>
                {branchPerformance.map((branch) => (
                  <tr key={branch._id} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-medium text-gray-800">
                      {branch.name}
                    </td>
                    <td className="p-3 text-gray-600 text-right">
                      ${branch.totalSales.toFixed(2)}
                    </td>
                    <td className="p-3 text-gray-600 text-right">
                      {branch.totalOrders}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {branchPerformance.length === 0 && (
              <p className="text-center text-gray-500 py-4">
                No restaurant sales data for this period.
              </p>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <FaStar className="mr-2 text-yellow-400" /> Top Selling Items
          </h2>
          <ul className="space-y-3">
            {stats?.topSellingItems?.length > 0 ? (
              stats.topSellingItems.map((item, index) => (
                <li
                  key={index}
                  className="flex justify-between items-center p-3 bg-gray-50 rounded-md"
                >
                  <span className="font-medium text-gray-700">{item._id}</span>
                  <span className="font-semibold text-green-600 bg-green-100 px-3 py-1 rounded-full text-sm">
                    {item.totalQuantitySold} sold
                  </span>
                </li>
              ))
            ) : (
              <p className="text-gray-500">No sales data for this period.</p>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BrandAdminDashboard;
