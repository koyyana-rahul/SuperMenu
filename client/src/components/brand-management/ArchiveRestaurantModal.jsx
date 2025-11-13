import React from "react";

const ArchiveRestaurantModal = ({
  archivingRestaurant,
  onClose,
  handleArchiveRestaurant,
  isSubmitting,
}) => {
  if (!archivingRestaurant) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4 transition-opacity duration-300"
      onClick={onClose}
    >
      <div
        className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md transform transition-all duration-300 scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold mb-4">Confirm Archive</h2>
        <p className="text-gray-600 mb-6">
          Are you sure you want to archive the restaurant "
          <strong>{archivingRestaurant.name}</strong>"? This action cannot be
          undone.
        </p>
        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="py-2 px-4 bg-gray-200 rounded-md hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleArchiveRestaurant}
            disabled={isSubmitting}
            className="py-2 px-4 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:bg-gray-400"
          >
            {isSubmitting ? "Archiving..." : "Archive"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ArchiveRestaurantModal;
