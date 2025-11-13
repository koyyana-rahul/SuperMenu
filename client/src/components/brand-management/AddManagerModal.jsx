import React from "react";
import { IoMdClose } from "react-icons/io";

const AddManagerModal = ({
  isOpen,
  onClose,
  newManager,
  handleManagerChange,
  handleCreateManager,
  isSubmitting,
  unassignedRestaurants,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 bg-gray-900/10 backdrop-blur-sm flex justify-center items-center z-50 p-4 transition-opacity duration-300 ${
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      onClick={onClose}
    >
      <div
        className={`bg-white p-8 rounded-lg shadow-xl w-full max-w-md transform transition-all duration-300 ${
          isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Add New Manager</h2>
          <button onClick={onClose} className="cursor-pointer">
            <IoMdClose size={24} />
          </button>
        </div>
        <form onSubmit={handleCreateManager} className="space-y-4">
          <input
            type="text"
            name="name"
            value={newManager.name}
            onChange={handleManagerChange}
            placeholder="Manager Name"
            required
            className="w-full p-3 border rounded-md"
          />
          <input
            type="email"
            name="email"
            value={newManager.email}
            onChange={handleManagerChange}
            placeholder="Manager Email"
            required
            className="w-full p-3 border rounded-md"
          />
          <input
            type="password"
            name="password"
            value={newManager.password}
            onChange={handleManagerChange}
            placeholder="Temporary Password"
            required
            className="w-full p-3 border rounded-md"
          />
          <input
            type="tel"
            name="mobile"
            value={newManager.mobile}
            onChange={handleManagerChange}
            placeholder="Manager Mobile Number"
            required
            className="w-full p-3 border rounded-md"
          />
          <select
            name="restaurantId"
            value={newManager.restaurantId}
            onChange={handleManagerChange}
            required
            className="w-full p-3 border rounded-md bg-white"
          >
            <option value="">Assign to Restaurant...</option>
            {unassignedRestaurants.map((r) => (
              <option key={r._id} value={r._id}>
                {r.name}
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-green-500 text-white py-3 px-4 rounded-md hover:bg-green-600 flex items-center justify-center gap-2 disabled:bg-gray-400 transition-colors duration-200"
          >
            {isSubmitting ? "Creating..." : "Create Manager"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddManagerModal;
