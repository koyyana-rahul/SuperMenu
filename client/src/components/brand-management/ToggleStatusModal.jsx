import React from "react";

const ToggleStatusModal = ({
  user,
  onClose,
  handleToggleStatus,
  isSubmitting,
  userType = "user",
}) => {
  if (!user) return null;

  const action = user.isActive ? "Deactivate" : "Activate";
  const color = user.isActive ? "red" : "green";

  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4 transition-opacity duration-300 ${
        user ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      onClick={onClose}
    >
      <div
        className={`bg-white p-8 rounded-lg shadow-xl w-full max-w-md transform transition-all duration-300 ${
          user ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold mb-4">Confirm {action}</h2>
        <p className="text-gray-600 mb-6">
          Are you sure you want to {action.toLowerCase()} the {userType}{" "}
          <strong>"{user.name}"</strong>?
        </p>
        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="py-2 px-4 bg-gray-200 rounded-md hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleToggleStatus}
            disabled={isSubmitting}
            className={`py-2 px-4 bg-${color}-500 text-white rounded-md hover:bg-${color}-600 disabled:bg-gray-400`}
          >
            {isSubmitting ? "Updating..." : action}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ToggleStatusModal;
