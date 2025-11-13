import React, { useState } from "react";
import { IoMdClose } from "react-icons/io";

const AddSubcategoryModal = ({ isOpen, onClose, handleCreate, isSubmitting }) => {
  const [name, setName] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    handleCreate({ name });
  };

  return (
    <div
      className={`fixed inset-0 bg-gray-900/10 backdrop-blur-sm flex justify-center items-center z-50 p-4`}
      onClick={onClose}
    >
      <div
        className="bg-white p-8 rounded-lg shadow-xl w-full max-w-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Add New Subcategory</h2>
          <button onClick={onClose} className="cursor-pointer p-1">
            <IoMdClose size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text" name="name" value={name} onChange={(e) => setName(e.target.value)}
            placeholder="Subcategory Name (e.g., 'Soups')" required autoFocus
            className="w-full p-3 border rounded-md"
          />
          <button type="submit" disabled={isSubmitting} className="w-full bg-green-500 text-white py-3 px-4 rounded-md hover:bg-green-600 disabled:bg-gray-400">
            {isSubmitting ? "Creating..." : "Create Subcategory"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddSubcategoryModal;