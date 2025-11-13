import React, { useState, useMemo } from "react";
import {
  FaPlus,
  FaEdit,
  FaLeaf,
  FaDrumstickBite,
  FaChevronDown,
  FaChevronRight,
} from "react-icons/fa";
import EmptyState from "./EmptyState";
import { IoMdAddCircleOutline } from "react-icons/io";

const MasterMenuTab = ({
  masterMenu,
  menuCategories,
  onAdd,
  onEdit,
  canAddMasterMenuItem,
  // We will need functions to add categories/subcategories
  onAddCategory,
  onAddSubcategory,
}) => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [vegOnly, setVegOnly] = useState(false);
  const [nonVegOnly, setNonVegOnly] = useState(false);

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setSelectedSubcategory(null); // Reset subcategory when a new category is selected
  };

  const handleSubcategorySelect = (subcategory) => {
    setSelectedSubcategory(subcategory);
  };

  const filteredItems = useMemo(() => {
    if (!selectedCategory) {
      return [];
    }

    let items = masterMenu.filter((item) => {
      if (selectedSubcategory) {
        return item.subcategoryId === selectedSubcategory._id;
      }
      return item.categoryId === selectedCategory._id && !item.subcategoryId;
    });

    if (vegOnly) {
      items = items.filter((item) => item.isVeg);
    }
    if (nonVegOnly) {
      items = items.filter((item) => !item.isVeg);
    }

    return items;
  }, [masterMenu, selectedCategory, selectedSubcategory, vegOnly, nonVegOnly]);

  return (
    <div className="flex flex-col md:flex-row gap-6 bg-white p-6 rounded-lg shadow-md">
      {/* Left Panel: Menu Structure */}
      <div className="w-full md:w-1/3 lg:w-1/4 border-r pr-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Menu Structure</h3>
          <button
            onClick={onAddCategory}
            className="text-green-600 hover:text-green-700"
            title="Add New Category"
          >
            <IoMdAddCircleOutline size={24} />
          </button>
        </div>
        <div className="space-y-2">
          {menuCategories.map((category) => (
            <div key={category._id}>
              <div
                onClick={() => handleCategorySelect(category)}
                className={`flex justify-between items-center p-2 rounded-md cursor-pointer ${
                  selectedCategory?._id === category._id && !selectedSubcategory
                    ? "bg-green-100 text-green-800"
                    : "hover:bg-gray-100"
                }`}
              >
                <span className="font-semibold">{category.name}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddSubcategory(category._id);
                  }}
                  className="text-gray-400 hover:text-green-600"
                  title="Add Subcategory"
                >
                  <FaPlus size={12} />
                </button>
              </div>
              {category.subcategories && category.subcategories.length > 0 && (
                <div className="pl-4 mt-1 space-y-1">
                  {category.subcategories.map((subcategory) => (
                    <div
                      key={subcategory._id}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCategorySelect(category);
                        handleSubcategorySelect(subcategory);
                      }}
                      className={`flex items-center p-2 rounded-md cursor-pointer ${
                        selectedSubcategory?._id === subcategory._id
                          ? "bg-green-100 text-green-800"
                          : "hover:bg-gray-100"
                      }`}
                    >
                      <span className="text-sm">{subcategory.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel: Items */}
      <div className="w-full md:w-2/3 lg:w-3/4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
          <div>
            <h3 className="text-lg font-semibold">
              {selectedSubcategory?.name ||
                selectedCategory?.name ||
                "Select a Category"}
            </h3>
            <p className="text-sm text-gray-500">
              {filteredItems.length} item(s)
            </p>
          </div>
          <div className="flex items-center gap-4">
            {/* Veg/Non-Veg Filters */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setVegOnly(!vegOnly);
                  setNonVegOnly(false);
                }}
                className={`p-2 rounded-full border-2 ${
                  vegOnly ? "bg-green-100 border-green-500" : "border-gray-300"
                }`}
                title="Show Veg Only"
              >
                <FaLeaf className="text-green-600" />
              </button>
              <button
                onClick={() => {
                  setNonVegOnly(!nonVegOnly);
                  setVegOnly(false);
                }}
                className={`p-2 rounded-full border-2 ${
                  nonVegOnly ? "bg-red-100 border-red-500" : "border-gray-300"
                }`}
                title="Show Non-Veg Only"
              >
                <FaDrumstickBite className="text-red-600" />
              </button>
            </div>
            <button
              onClick={() =>
                onAdd(selectedCategory?._id, selectedSubcategory?._id)
              }
              disabled={!selectedCategory || !canAddMasterMenuItem}
              className="w-full sm:w-auto bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
              title={
                !selectedCategory
                  ? "Please select a category first"
                  : "Add New Item"
              }
            >
              <FaPlus /> Add Item
            </button>
          </div>
        </div>

        {/* Items List */}
        <div className="space-y-3">
          {!selectedCategory && (
            <EmptyState
              title="No Category Selected"
              message="Please select a category or subcategory from the left panel to view its items."
            />
          )}
          {selectedCategory && filteredItems.length === 0 && (
            <EmptyState
              title="No Items Found"
              message="This category is empty. Click 'Add Item' to get started."
            />
          )}
          {filteredItems.map((item) => (
            <div
              key={item._id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
            >
              <div className="flex items-center gap-4">
                <img
                  src={item.image || "https://via.placeholder.com/64"}
                  alt={item.name}
                  className="w-16 h-16 object-cover rounded-md"
                />
                <div>
                  <div className="flex items-center gap-2">
                    {item.isVeg ? (
                      <FaLeaf className="text-green-500" />
                    ) : (
                      <FaDrumstickBite className="text-red-500" />
                    )}
                    <p className="font-semibold text-gray-800">{item.name}</p>
                  </div>
                  <p className="text-sm text-gray-500 max-w-md truncate">
                    {item.description}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <p className="font-medium text-gray-700">
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                  }).format(item.basePrice)}
                </p>
                <button
                  onClick={() => onEdit(item)}
                  className="text-gray-500 hover:text-blue-600"
                  title="Edit Item"
                >
                  <FaEdit size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MasterMenuTab;
