import React from "react";
import { FaInbox } from "react-icons/fa";

const EmptyState = ({ title, message, action }) => {
  return (
    <div className="text-center py-16 px-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
      <div className="mx-auto w-fit bg-gray-200 text-gray-500 p-4 rounded-full">
        <FaInbox size={32} />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-gray-800">{title}</h3>
      <p className="mt-2 text-sm text-gray-500">{message}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
};

export default EmptyState;
