import React from "react";
import { IoMdClose } from "react-icons/io";

const EditRestaurantModal = ({
  editingRestaurant,
  setEditingRestaurant,
  handleUpdateRestaurant,
  isSubmitting,
  onClose,
}) => {
  if (!editingRestaurant) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4 transition-opacity duration-300"
      onClick={onClose}
    >
      <div
        className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md transform transition-all duration-300 scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Edit Restaurant</h2>
          <button onClick={onClose}>
            <IoMdClose size={24} />
          </button>
        </div>
        <form onSubmit={handleUpdateRestaurant} className="space-y-4">
          <input
            type="text"
            name="name"
            value={editingRestaurant.name}
            onChange={(e) =>
              setEditingRestaurant({
                ...editingRestaurant,
                name: e.target.value,
              })
            }
            placeholder="Restaurant Name"
            required
            className="w-full p-3 border rounded-md"
          />
          <input
            type="text"
            name="address"
            value={editingRestaurant.address}
            onChange={(e) =>
              setEditingRestaurant({
                ...editingRestaurant,
                address: e.target.value,
              })
            }
            placeholder="Address"
            required
            className="w-full p-3 border rounded-md"
          />
          <input
            type="tel"
            name="phone"
            value={editingRestaurant.phone}
            onChange={(e) =>
              setEditingRestaurant({
                ...editingRestaurant,
                phone: e.target.value,
              })
            }
            placeholder="Phone Number"
            required
            className="w-full p-3 border rounded-md"
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-green-500 text-white py-3 px-4 rounded-md hover:bg-green-600 flex items-center justify-center gap-2 disabled:bg-gray-400"
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditRestaurantModal;
