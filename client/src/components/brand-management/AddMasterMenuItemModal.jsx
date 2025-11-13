import React from "react";
import { IoMdClose } from "react-icons/io";

const AddMasterMenuItemModal = ({
  isOpen,
  onClose,
  newItem,
  menuCategories,
  handleImageFileChange,
  handleItemChange,
  handleCreateItem,
  isSubmitting,
}) => {
  if (!isOpen) return null;

  const selectedCategory = menuCategories.find(
    (c) => c._id === newItem.categoryId
  );
  const subcategories = selectedCategory ? selectedCategory.subcategories : [];

  return (
    <div
      className={`fixed inset-0 bg-gray-900/10 backdrop-blur-sm flex justify-center items-center z-50 p-4`}
      onClick={onClose}
    >
      <div
        className={`bg-white p-8 rounded-lg shadow-xl w-full max-w-md transform transition-all duration-300 ${
          isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Add Master Menu Item</h2>
          <button onClick={onClose} className="cursor-pointer p-1">
            <IoMdClose size={24} />
          </button>
        </div>
        <form onSubmit={handleCreateItem} className="space-y-4">
          <input
            type="text"
            name="name"
            value={newItem.name}
            onChange={handleItemChange}
            placeholder="Item Name (e.g., 'Margherita Pizza')"
            required
            className="w-full p-3 border rounded-md"
          />
          <textarea
            name="description"
            value={newItem.description}
            onChange={handleItemChange}
            placeholder="Description"
            required
            rows="3"
            className="w-full p-3 border rounded-md"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select
              name="categoryId"
              value={newItem.categoryId}
              onChange={handleItemChange}
              required
              className="w-full p-3 border rounded-md bg-white"
            >
              <option value="">Select Category...</option>
              {menuCategories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
            <select
              name="subcategoryId"
              value={newItem.subcategoryId}
              onChange={handleItemChange}
              disabled={!newItem.categoryId || subcategories.length === 0}
              className="w-full p-3 border rounded-md bg-white disabled:bg-gray-100"
            >
              <option value="">Select Subcategory (Optional)...</option>
              {subcategories.map((sc) => (
                <option key={sc._id} value={sc._id}>
                  {sc.name}
                </option>
              ))}
            </select>
          </div>
          <input
            type="number"
            name="basePrice"
            value={newItem.basePrice}
            onChange={handleItemChange}
            placeholder="Base Price"
            required
            className="w-full p-3 border rounded-md"
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Item Image
            </label>
            <div className="flex items-center gap-4">
              {newItem.image && (
                <img
                  src={URL.createObjectURL(newItem.image)}
                  alt="Preview"
                  className="w-20 h-20 object-cover rounded-md"
                />
              )}
              <input
                type="file"
                name="image"
                onChange={handleImageFileChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-green-500 text-white py-3 px-4 rounded-md hover:bg-green-600 disabled:bg-gray-400 transition-colors"
          >
            {isSubmitting ? "Adding..." : "Add Item"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddMasterMenuItemModal;
