import React from "react";
import { FaExclamationTriangle, FaSync } from "react-icons/fa";

const ErrorState = ({ title, message, onRetry }) => {
  return (
    <div className="text-center py-16 px-6 bg-red-50 border-l-4 border-red-400 rounded-r-lg shadow-md">
      <FaExclamationTriangle className="mx-auto h-12 w-12 text-red-400" />
      <h3 className="mt-2 text-lg font-semibold text-red-900">{title}</h3>
      <p className="mt-1 text-sm text-red-700">{message}</p>
      {onRetry && (
        <div className="mt-6">
          <button
            onClick={onRetry}
            className="bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 flex items-center justify-center gap-2 mx-auto"
          >
            <FaSync /> Retry
          </button>
        </div>
      )}
    </div>
  );
};

export default ErrorState;
