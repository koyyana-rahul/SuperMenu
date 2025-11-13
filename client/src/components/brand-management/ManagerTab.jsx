import React from "react";
import {
  FaPlus,
  FaUserPlus,
  FaEdit,
  FaToggleOn,
  FaToggleOff,
  FaSearch,
  FaSort,
  FaSortUp,
  FaSortDown,
} from "react-icons/fa";
import ManagerSkeleton from "./ManagerSkeleton";
import EmptyState from "./EmptyState";

const SortableHeader = ({
  children,
  sortKey,
  sortConfig,
  setSortConfig,
  setCurrentPage,
}) => {
  const requestSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
    setCurrentPage(1);
  };

  const getIcon = () => {
    if (sortConfig.key !== sortKey) return <FaSort className="text-gray-400" />;
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

const ManagerTab = ({
  managers,
  restaurants,
  unassignedRestaurants,
  onAdd,
  onEdit,
  onToggleStatus,
  canAddManager,
  searchTerm,
  setSearchTerm,
  sortConfig,
  setSortConfig,
  setCurrentPage,
  isMobile,
}) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-4">
        <div className="relative w-full md:max-w-xs">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 pl-10 border rounded-md focus:ring-2 focus:ring-green-500"
          />
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>
        <button
          onClick={onAdd}
          disabled={!canAddManager}
          className="w-full md:w-auto bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
          title={
            restaurants.length > 0 && unassignedRestaurants.length === 0
              ? "All restaurants are already assigned"
              : restaurants.length === 0
              ? "You must create a restaurant before adding a manager"
              : "Add a new manager"
          }
        >
          <FaPlus /> Add Manager
        </button>
      </div>

      {managers.length === 0 && (
        <EmptyState
          title={searchTerm ? "No Managers Found" : "No Managers Created"}
          message={
            searchTerm
              ? "Try adjusting your search terms."
              : "Get started by adding your first manager."
          }
          action={
            !searchTerm && (
              <button
                className="bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 flex items-center justify-center gap-2 mx-auto"
                onClick={onAdd} // onAdd is null if cannot add, so button is disabled
                disabled={!canAddManager}
              >
                <FaUserPlus /> Add Manager
              </button>
            )
          }
        />
      )}
      {isMobile ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {
            managers.length > 0
              ? managers.map((m) => {
                  const restaurant = restaurants.find(
                    (r) => r._id === m.restaurantId
                  );
                  return (
                    <div
                      key={m._id}
                      className="p-4 bg-gray-50 rounded-lg border"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold text-lg text-gray-800">
                            {m.name}
                          </p>
                          <p className="text-sm text-gray-600">{m.email}</p>
                        </div>
                        <div className="flex gap-3">
                          <button
                            onClick={() => onEdit(m)}
                            className="text-gray-500 hover:text-blue-600 cursor-pointer"
                            title="Edit Manager"
                          >
                            <FaEdit size={18} />
                          </button>
                          <button
                            onClick={() => onToggleStatus(m)}
                            className={`p-1 rounded-full cursor-pointer`}
                            title={m.isActive ? "Deactivate" : "Activate"}
                          >
                            {m.isActive ? (
                              <FaToggleOff
                                size={22}
                                className="text-red-500 hover:text-red-600"
                              />
                            ) : (
                              <FaToggleOn
                                size={22}
                                className="text-green-500 hover:text-green-600"
                              />
                            )}
                          </button>
                        </div>
                      </div>
                      <div className="mt-3 border-t pt-3 space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500">Restaurant:</span>
                          <span className="font-medium text-gray-700">
                            {restaurant?.name || "N/A"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500">Status:</span>
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              m.isActive
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {m.isActive ? "Active" : "Inactive"}
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
                  {...{ sortConfig, setSortConfig, setCurrentPage }}
                >
                  Name
                </SortableHeader>
                <SortableHeader
                  sortKey="email"
                  {...{ sortConfig, setSortConfig, setCurrentPage }}
                >
                  Email
                </SortableHeader>
                <th className="p-4 font-semibold text-gray-600">
                  Assigned Restaurant
                </th>
                <th className="p-4 font-semibold text-gray-600">Status</th>
                <th className="p-4 font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {
                managers.length > 0
                  ? managers.map((m) => {
                      const restaurant = restaurants.find(
                        (r) => r._id === m.restaurantId
                      );
                      return (
                        <tr
                          key={m._id}
                          className="border-b even:bg-gray-50 hover:bg-green-50 transition-colors duration-150"
                        >
                          <td className="p-4 font-semibold text-gray-800">
                            {m.name}
                          </td>
                          <td className="p-4 text-gray-600">{m.email}</td>
                          <td className="p-4 text-gray-600">
                            {restaurant?.name || "N/A"}
                          </td>
                          <td className="p-4">
                            <span
                              className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                m.isActive
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {m.isActive ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="flex gap-3">
                              <button
                                onClick={() => onEdit(m)}
                                className="text-gray-500 hover:text-blue-600 cursor-pointer"
                                title="Edit Manager"
                              >
                                <FaEdit size={18} />
                              </button>
                              <button
                                onClick={() => onToggleStatus(m)}
                                className={`hover:text-white p-1 rounded-full cursor-pointer ${
                                  m.isActive
                                    ? "hover:bg-red-500"
                                    : "hover:bg-green-500"
                                }`}
                                title={m.isActive ? "Deactivate" : "Activate"}
                              >
                                {m.isActive ? (
                                  <FaToggleOff
                                    size={20}
                                    className="text-red-500"
                                  />
                                ) : (
                                  <FaToggleOn
                                    size={20}
                                    className="text-green-500"
                                  />
                                )}
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
      {restaurants.length === 0 && !searchTerm && (
        <div className="text-center py-8 border-t mt-4">
          <p className="text-gray-500">
            Please create a restaurant first before adding a manager.
          </p>
        </div>
      )}
    </div>
  );
};

export default ManagerTab;
