import React from "react";
import { IoMdClose } from "react-icons/io";

const EditMasterMenuItemModal = ({
  editingItem,
  setEditingItem,
  menuCategories,
  handleImageFileChange,
  handleUpdateItem,
  isSubmitting,
}) => {
  if (!editingItem) return null;

  const selectedCategory = menuCategories.find(
    (c) => c._id === editingItem.categoryId
  );
  const subcategories = selectedCategory ? selectedCategory.subcategories : [];

  const onClose = () => setEditingItem(null);

  return (
    <div
      className={`fixed inset-0 bg-gray-900/10 backdrop-blur-sm flex justify-center items-center z-50 p-4`}
      onClick={onClose}
    >
      <div
        className={`bg-white p-8 rounded-lg shadow-xl w-full max-w-md transform transition-all duration-300 ${
          editingItem ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Edit Master Menu Item</h2>
          <button onClick={onClose} className="cursor-pointer p-1">
            <IoMdClose size={24} />
          </button>
        </div>
        <form onSubmit={handleUpdateItem} className="space-y-4">
          <input
            type="text"
            name="name"
            value={editingItem.name}
            onChange={(e) =>
              setEditingItem({ ...editingItem, name: e.target.value })
            }
            placeholder="Item Name"
            required
            className="w-full p-3 border rounded-md"
          />
          <textarea
            name="description"
            value={editingItem.description}
            onChange={(e) =>
              setEditingItem({ ...editingItem, description: e.target.value })
            }
            placeholder="Description"
            required
            rows="3"
            className="w-full p-3 border rounded-md"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select
              name="categoryId"
              value={editingItem.categoryId}
              onChange={(e) =>
                setEditingItem({ ...editingItem, categoryId: e.target.value, subcategoryId: "" }) // Reset subcategory on change
              }
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
              value={editingItem.subcategoryId || ""}
              onChange={(e) =>
                setEditingItem({ ...editingItem, subcategoryId: e.target.value })
              }
              disabled={!editingItem.categoryId || subcategories.length === 0}
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
            value={editingItem.basePrice}
            onChange={(e) =>
              setEditingItem({ ...editingItem, basePrice: e.target.value })
            }
            placeholder="Base Price"
            required
            className="w-full p-3 border rounded-md"
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Item Image
            </label>
            <div className="flex items-center gap-4">
              {editingItem.image && (
                <img
                  src={
                    typeof editingItem.image === "string"
                      ? editingItem.image
                      : URL.createObjectURL(editingItem.image)
                  }
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
            {isSubmitting ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditMasterMenuItemModal;
