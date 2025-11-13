import React from "react";

const SkeletonRow = () => (
  <tr className="border-b animate-pulse">
    <td className="p-3">
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      <div className="h-3 bg-gray-200 rounded w-1/2 mt-2"></div>
    </td>
    <td className="p-3">
      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
    </td>
    <td className="p-3">
      <div className="h-4 bg-gray-200 rounded w-1/2 ml-auto"></div>
    </td>
    <td className="p-3">
      <div className="h-4 bg-gray-200 rounded w-1/4 ml-auto"></div>
    </td>
    <td className="p-3">
      <div className="h-6 w-12 bg-gray-200 rounded"></div>
    </td>
  </tr>
);

const SkeletonCard = () => (
  <div className="p-4 bg-gray-50 rounded-lg border animate-pulse">
    <div className="flex justify-between items-start">
      <div>
        <div className="h-5 bg-gray-200 rounded w-32"></div>
        <div className="h-3 bg-gray-200 rounded w-48 mt-2"></div>
      </div>
      <div className="h-6 w-12 bg-gray-200 rounded"></div>
    </div>
    <div className="mt-4 border-t pt-4 space-y-2">
      <div className="h-3 bg-gray-200 rounded w-full"></div>
      <div className="h-3 bg-gray-200 rounded w-full"></div>
      <div className="h-3 bg-gray-200 rounded w-full"></div>
    </div>
  </div>
);

const RestaurantSkeleton = ({ isMobile }) => {
  const skeletons = Array.from({ length: 5 });

  if (isMobile) {
    return (
      <div className="space-y-4">
        {skeletons.map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b bg-gray-50">
            <th className="p-3 font-semibold text-gray-600">Restaurant</th>
            <th className="p-3 font-semibold text-gray-600">Manager</th>
            <th className="p-3 font-semibold text-gray-600">
              Sales (Last 30d)
            </th>
            <th className="p-3 font-semibold text-gray-600">
              Orders (Last 30d)
            </th>
            <th className="p-3 font-semibold text-gray-600">Actions</th>
          </tr>
        </thead>
        <tbody>
          {skeletons.map((_, i) => (
            <SkeletonRow key={i} />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RestaurantSkeleton;
