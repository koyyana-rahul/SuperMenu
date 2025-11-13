import React from "react";
import { IoMdClose } from "react-icons/io";

const AddRestaurantModal = ({
  isOpen,
  onClose,
  newRestaurant,
  handleRestaurantChange,
  handleCreateRestaurant,
  isSubmitting,
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
          <h2 className="text-2xl font-bold">Add New Restaurant</h2>
          <button onClick={onClose} className="cursor-pointer">
            <IoMdClose size={24} />
          </button>
        </div>
        <form onSubmit={handleCreateRestaurant} className="space-y-4">
          <input
            type="text"
            name="name"
            value={newRestaurant.name}
            onChange={handleRestaurantChange}
            placeholder="Restaurant Name"
            required
            className="w-full p-3 border rounded-md"
          />
          <input
            type="text"
            name="address"
            value={newRestaurant.address}
            onChange={handleRestaurantChange}
            placeholder="Address"
            required
            className="w-full p-3 border rounded-md"
          />
          <input
            type="tel"
            name="phone"
            value={newRestaurant.phone}
            onChange={handleRestaurantChange}
            placeholder="Restaurant Contact Number"
            required
            className="w-full p-3 border rounded-md"
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-green-500 text-white py-3 px-4 rounded-md hover:bg-green-600 disabled:bg-gray-400 transition-colors"
          >
            {isSubmitting ? "Creating..." : "Create Restaurant"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddRestaurantModal;
