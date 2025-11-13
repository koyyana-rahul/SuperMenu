import React from "react";
import {
  FaBuilding,
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaSort,
  FaSortUp,
  FaSortDown,
} from "react-icons/fa";
import EmptyState from "./EmptyState";

const SortableHeader = ({ children, sortKey, sortConfig, requestSort }) => {
  const getIcon = () => {
    if (sortConfig.key !== sortKey) {
      return <FaSort className="text-gray-400" />;
    }
    return sortConfig.direction === "ascending" ? <FaSortUp /> : <FaSortDown />;
  };

  return (
    <th
      className="p-3 font-semibold text-gray-600 cursor-pointer hover:bg-gray-100"
      onClick={() => requestSort(sortKey)}
    >
      <div className="flex items-center gap-2">
        {children} {getIcon()}
      </div>
    </th>
  );
};

const RestaurantTab = ({
  restaurants,
  managers,
  performanceData,
  onAdd,
  onEdit,
  onArchive,
  searchTerm,
  setSearchTerm,
  sortConfig,
  requestSort,
  isMobile,
}) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-4">
        <div className="relative w-full md:max-w-xs">
          <input
            type="text"
            placeholder="Search by name, address, manager..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 pl-10 border rounded-md focus:ring-2 focus:ring-green-500"
          />
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>
        <button
          onClick={onAdd}
          className="w-full md:w-auto bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 flex items-center justify-center gap-2 transition-colors duration-200"
        >
          <FaPlus /> Add Restaurant
        </button>
      </div>

      {restaurants.length === 0 && (
        <EmptyState
          title={searchTerm ? "No Restaurants Found" : "No Restaurants Created"}
          message={
            searchTerm
              ? "Try adjusting your search terms."
              : "Get started by adding your first restaurant."
          }
          action={
            !searchTerm && (
              <button
                onClick={onAdd}
                className="bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 flex items-center justify-center gap-2 mx-auto"
              >
                <FaPlus /> Add Restaurant
              </button>
            )
          }
        />
      )}
      {isMobile ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {
            restaurants.length > 0
              ? restaurants.map((r) => {
                  const manager = managers.find(
                    (m) => m.restaurantId === r._id
                  );
                  const performance = performanceData.find(
                    (p) => p._id === r._id
                  ) || { totalSales: 0, totalOrders: 0 };

                  return (
                    <div
                      key={r._id}
                      className="p-4 bg-gray-50 rounded-lg border"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold text-lg text-gray-800">
                            {r.name}
                          </p>
                          <p className="text-sm text-gray-600">{r.address}</p>
                        </div>
                        <div className="flex gap-3">
                          <button
                            onClick={() => onEdit(r)}
                            className="text-gray-500 hover:text-blue-600 cursor-pointer"
                            title="Edit Restaurant"
                          >
                            <FaEdit size={18} />
                          </button>
                          <button
                            onClick={() => onArchive(r)}
                            className="text-gray-500 hover:text-red-600 cursor-pointer"
                            title="Archive Restaurant"
                          >
                            <FaTrash size={18} />
                          </button>
                        </div>
                      </div>
                      <div className="mt-3 border-t pt-3 space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500">Manager:</span>
                          <span className="font-medium text-gray-700">
                            {manager ? manager.name : "Unassigned"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500">Sales (30d):</span>
                          <span className="font-medium text-gray-700">
                            ${performance.totalSales.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500">Orders (30d):</span>
                          <span className="font-medium text-gray-700">
                            {performance.totalOrders}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              : !searchTerm && <div /> // Handled by EmptyState
          }
        </div>
      ) : (
        // Desktop Table View
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b bg-gray-100">
                <SortableHeader
                  sortKey="name"
                  sortConfig={sortConfig}
                  requestSort={requestSort}
                >
                  Restaurant Details
                </SortableHeader>
                <th className="p-3 font-semibold text-gray-600">Manager</th>
                <SortableHeader
                  sortKey="totalSales"
                  sortConfig={sortConfig}
                  requestSort={requestSort}
                >
                  <div className="text-right">Sales (30d)</div>
                </SortableHeader>
                <SortableHeader
                  sortKey="totalOrders"
                  sortConfig={sortConfig}
                  requestSort={requestSort}
                >
                  <div className="text-right">Orders (30d)</div>
                </SortableHeader>
                <th className="p-3 font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {
                restaurants.length > 0
                  ? restaurants.map((r) => {
                      const manager = managers.find(
                        (m) => m.restaurantId === r._id
                      );
                      const performance = performanceData.find(
                        (p) => p._id === r._id
                      ) || { totalSales: 0, totalOrders: 0 };

                      return (
                        <tr
                          key={r._id}
                          className="border-b even:bg-gray-50 hover:bg-green-50 transition-colors duration-150"
                        >
                          <td className="p-4">
                            <p className="font-semibold text-gray-800">
                              {r.name}
                            </p>
                            <p className="text-sm text-gray-500">{r.address}</p>
                            <p className="text-sm text-gray-500 mt-1">
                              {r.phone}
                            </p>
                          </td>
                          <td className="p-4 text-gray-600">
                            {manager ? manager.name : "Unassigned"}
                          </td>
                          <td className="p-4 text-gray-800 text-right font-medium">
                            ${performance.totalSales.toFixed(2)}
                          </td>
                          <td className="p-4 text-gray-800 text-right font-medium">
                            {performance.totalOrders}
                          </td>
                          <td className="p-4">
                            <div className="flex gap-3">
                              <button
                                onClick={() => onEdit(r)}
                                className="text-gray-500 hover:text-blue-600 cursor-pointer"
                                title="Edit Restaurant"
                              >
                                <FaEdit size={18} />
                              </button>
                              <button
                                onClick={() => onArchive(r)}
                                className="text-gray-500 hover:text-red-600 cursor-pointer"
                                title="Archive Restaurant"
                              >
                                <FaTrash size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  : !searchTerm && <tr /> // Handled by EmptyState
              }
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RestaurantTab;
