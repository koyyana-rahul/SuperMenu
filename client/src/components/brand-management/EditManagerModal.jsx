import React from "react";
import { IoMdClose } from "react-icons/io";

const EditManagerModal = ({
  editingManager,
  setEditingManager,
  handleUpdateManager,
  isSubmitting,
  onClose,
  restaurants,
  managers,
}) => {
  if (!editingManager) return null;

  // Get a list of restaurants that are either unassigned OR assigned to the current manager
  const assignedRestaurantIds = new Set(
    managers
      .filter((m) => m.restaurantId && m._id !== editingManager._id)
      .map((m) => m.restaurantId)
      .filter(Boolean)
  );
  const availableRestaurants = restaurants.filter(
    (r) => !assignedRestaurantIds.has(r._id)
  );

  return (
    <div
      className={`fixed inset-0 bg-gray-900/10 backdrop-blur-sm flex justify-center items-center z-50 p-4 transition-opacity duration-300 ${
        editingManager ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      onClick={onClose}
    >
      <div
        className={`bg-white p-8 rounded-lg shadow-xl w-full max-w-md transform transition-all duration-300 ${
          editingManager ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Edit Manager</h2>
          <button onClick={onClose} className="cursor-pointer">
            <IoMdClose size={24} />
          </button>
        </div>
        <form onSubmit={handleUpdateManager} className="space-y-4">
          <input
            type="text"
            name="name"
            value={editingManager.name}
            onChange={(e) =>
              setEditingManager({ ...editingManager, name: e.target.value })
            }
            placeholder="Manager Name"
            required
            className="w-full p-3 border rounded-md"
          />
          <input
            type="tel"
            name="mobile"
            value={editingManager.mobile || ""}
            onChange={(e) =>
              setEditingManager({ ...editingManager, mobile: e.target.value })
            }
            placeholder="Manager Mobile Number"
            className="w-full p-3 border rounded-md"
          />
          <select
            name="restaurantId"
            value={editingManager.restaurantId}
            onChange={(e) =>
              setEditingManager({
                ...editingManager,
                restaurantId: e.target.value,
              })
            }
            required
            className="w-full p-3 border rounded-md bg-white"
          >
            <option value="">Assign to Restaurant...</option>
            {availableRestaurants.map((r) => (
              <option key={r._id} value={r._id}>
                {r.name}
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-green-500 text-white py-3 px-4 rounded-md hover:bg-green-600 disabled:bg-gray-400"
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditManagerModal;
