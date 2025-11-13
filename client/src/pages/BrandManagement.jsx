import React, { useState, useEffect, useMemo } from "react";
import Axios from "../utils/Axios"; // Assuming Axios is correctly configured
import SummaryApi from "../common/summaryApi";
import toast from "react-hot-toast";
import AxiosToastError from "../utils/AxiosToastError";
import { FaStore, FaUserTie, FaBookOpen } from "react-icons/fa";
import RestaurantTab from "../components/brand-management/RestaurantTab";
import ManagerTab from "../components/brand-management/ManagerTab";
import AddRestaurantModal from "../components/brand-management/AddRestaurantModal";
import Pagination from "../components/brand-management/Pagination";
import AddManagerModal from "../components/brand-management/AddManagerModal";
import useMobile from "../hooks/useMobile.jsx";
import RestaurantSkeleton from "../components/brand-management/RestaurantSkeleton.jsx";
import ErrorState from "../components/brand-management/ErrorState.jsx";
import EditManagerModal from "../components/brand-management/EditManagerModal";
import ToggleStatusModal from "../components/brand-management/ToggleStatusModal";
import ArchiveRestaurantModal from "../components/brand-management/ArchiveRestaurantModal";
import EditRestaurantModal from "../components/brand-management/EditRestaurantModal";
import MasterMenuTab from "../components/brand-management/MasterMenuTab";
import AddMasterMenuItemModal from "../components/brand-management/AddMasterMenuItemModal";
import EditMasterMenuItemModal from "../components/brand-management/EditMasterMenuItemModal";
import AddCategoryModal from "../components/brand-management/AddCategoryModal";
import AddSubcategoryModal from "../components/brand-management/AddSubcategoryModal";

const BrandManagement = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [managers, setManagers] = useState([]);
  const [performanceData, setPerformanceData] = useState([]);
  const [masterMenu, setMasterMenu] = useState([]);
  const [menuCategories, setMenuCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isMobile = useMobile();

  // State for Restaurants tab
  const [restaurantSearchTerm, setRestaurantSearchTerm] = useState("");
  const [restaurantSortConfig, setRestaurantSortConfig] = useState({
    key: "name",
    direction: "ascending",
  });
  const [restaurantCurrentPage, setRestaurantCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // State for Managers tab
  const [managerSearchTerm, setManagerSearchTerm] = useState("");
  const [managerSortConfig, setManagerSortConfig] = useState({
    key: "name",
    direction: "ascending",
  });
  const [managerCurrentPage, setManagerCurrentPage] = useState(1);
  const [editingManager, setEditingManager] = useState(null);
  const [togglingUser, setTogglingUser] = useState(null); // For managers

  // State for archiving a restaurant
  const [archivingRestaurant, setArchivingRestaurant] = useState(null);

  // State for editing a restaurant
  const [editingRestaurant, setEditingRestaurant] = useState(null);
  const [activeTab, setActiveTab] = useState("restaurants");

  // Modal states
  const [isRestaurantModalOpen, setIsRestaurantModalOpen] = useState(false);
  const [isManagerModalOpen, setIsManagerModalOpen] = useState(false);
  const [isMasterMenuModalOpen, setIsMasterMenuModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isSubcategoryModalOpen, setIsSubcategoryModalOpen] = useState(false);
  // To know which category we're adding a subcategory to
  const [addingSubcategoryTo, setAddingSubcategoryTo] = useState(null);

  // Editing state for Master Menu
  const [editingMasterMenuItem, setEditingMasterMenuItem] = useState(null);

  // Form submission loading state
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [newRestaurant, setNewRestaurant] = useState({
    name: "",
    address: "",
    phone: "",
  });
  const [newManager, setNewManager] = useState({
    name: "",
    email: "",
    password: "",
    mobile: "",
    restaurantId: "",
  });
  const [newMasterMenuItem, setNewMasterMenuItem] = useState({
    name: "",
    description: "",
    categoryId: "",
    subcategoryId: "",
    basePrice: "",
    image: null, // Changed to null to hold the file object
    dietaryInfo: [],
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const startDate = new Date(new Date().setDate(new Date().getDate() - 30))
        .toISOString()
        .split("T")[0];
      const endDate = new Date().toISOString().split("T")[0];

      const [restaurantsRes, managersRes, performanceRes, masterMenuRes, menuCategoriesRes] =
        await Promise.all([
          Axios.get(SummaryApi.getRestaurants.url),
          Axios.get(SummaryApi.getManagers.url),
          Axios.get(SummaryApi.getBrandSalesSummary.url, {
            params: { startDate, endDate },
          }),
          Axios.get(SummaryApi.getMasterMenu.url),
          Axios.get(SummaryApi.getMenuCategories.url),
        ]);

      setRestaurants(restaurantsRes.data.data || []);
      setMasterMenu(masterMenuRes.data.data || []);
      setManagers(managersRes.data.data || []);
      setPerformanceData(performanceRes.data.data.salesByRestaurant || []);
      setMenuCategories(menuCategoriesRes.data.data || []);
    } catch (err) {
      setError("Failed to load brand data. Please try again.");
      AxiosToastError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Effect to handle closing modals with the Escape key
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsRestaurantModalOpen(false);
        setIsManagerModalOpen(false);
        setIsCategoryModalOpen(false);
        setIsMasterMenuModalOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleRestaurantChange = (e) => {
    const { name, value } = e.target;
    setNewRestaurant((prev) => ({ ...prev, [name]: value }));
  };

  const handleManagerChange = (e) => {
    const { name, value } = e.target;
    setNewManager((prev) => ({ ...prev, [name]: value }));
  };

  const handleMasterMenuItemChange = (e) => {
    const { name, value } = e.target;
    setNewMasterMenuItem((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageFileChange = (e, itemType) => {
    const file = e.target.files[0];
    if (file) {
      if (itemType === "new") {
        setNewMasterMenuItem((prev) => ({ ...prev, image: file }));
      } else if (itemType === "edit") {
        setEditingMasterMenuItem((prev) => ({ ...prev, image: file }));
      }
    }
  };

  const handleCreateRestaurant = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await Axios.post(
        SummaryApi.createRestaurant.url,
        newRestaurant
      );
      if (response.data.success) {
        toast.success("Restaurant created successfully!");
        setNewRestaurant({ name: "", address: "", phone: "" });
        setIsRestaurantModalOpen(false);
        fetchData(); // Refresh data
      }
    } catch (err) {
      AxiosToastError(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateManager = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!newManager.restaurantId) {
      toast.error("Please assign the manager to a restaurant.");
      setIsSubmitting(false);
      return;
    }
    try {
      const response = await Axios.post(
        SummaryApi.createManager.url,
        newManager
      );
      if (response.status === 201) {
        toast.success("Manager created successfully!");
        setNewManager({
          name: "",
          email: "",
          password: "",
          mobile: "",
          restaurantId: "",
        });
        setIsManagerModalOpen(false);
        fetchData(); // Refresh data
      }
    } catch (err) {
      AxiosToastError(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateMasterMenuItem = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("name", newMasterMenuItem.name);
    formData.append("description", newMasterMenuItem.description);
    formData.append("categoryId", newMasterMenuItem.categoryId);
    if (newMasterMenuItem.subcategoryId) formData.append("subcategoryId", newMasterMenuItem.subcategoryId);
    formData.append("basePrice", newMasterMenuItem.basePrice);
    if (newMasterMenuItem.image) {
      formData.append("image", newMasterMenuItem.image);
    }

    try {
      const response = await Axios.post(
        SummaryApi.createMasterMenuItem.url,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      if (response.data.success) {
        toast.success("Master menu item created successfully!");
        setNewMasterMenuItem({
          name: "",
          description: "",
          categoryId: "",
          subcategoryId: "",
          basePrice: "",
          image: null,
        });
        setIsMasterMenuModalOpen(false);
        fetchData(); // Refresh data
      }
    } catch (err) {
      AxiosToastError(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateCategory = async ({ name }) => {
    setIsSubmitting(true);
    try {
      const response = await Axios.post(SummaryApi.createMenuCategory.url, { name });
      if (response.data.success) {
        toast.success("Category created successfully!");
        setIsCategoryModalOpen(false);
        fetchData();
      }
    } catch (err) {
      AxiosToastError(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateSubcategory = async ({ name }) => {
    if (!addingSubcategoryTo) return;
    setIsSubmitting(true);
    try {
      const response = await Axios.post(SummaryApi.createMenuSubcategory.url, {
        name,
        categoryId: addingSubcategoryTo,
      });
      if (response.data.success) {
        toast.success("Subcategory created successfully!");
        setIsSubcategoryModalOpen(false);
        setAddingSubcategoryTo(null);
        fetchData();
      }
    } catch (err) {
      AxiosToastError(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openAddItemModal = (categoryId, subcategoryId) => {
    setNewMasterMenuItem(prev => ({ ...prev, categoryId: categoryId || "", subcategoryId: subcategoryId || "" }));
    setIsMasterMenuModalOpen(true);
  };

  const handleUpdateManager = async (e) => {
    e.preventDefault();
    if (!editingManager) return;
    setIsSubmitting(true);
    try {
      const response = await Axios.put(
        `/api/auth/managers/${editingManager._id}`,
        {
          name: editingManager.name,
          mobile: editingManager.mobile,
          restaurantId: editingManager.restaurantId,
        }
      );
      if (response.status === 200) {
        toast.success("Manager updated successfully!");
        setEditingManager(null);
        fetchData();
      }
    } catch (err) {
      AxiosToastError(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateRestaurant = async (e) => {
    e.preventDefault();
    if (!editingRestaurant) return;
    setIsSubmitting(true);
    try {
      const response = await Axios.put(
        `/api/restaurants/${editingRestaurant._id}`,
        editingRestaurant
      );
      if (response.status === 200) {
        toast.success("Restaurant updated successfully!");
        setEditingRestaurant(null);
        fetchData(); // Refresh data
      }
    } catch (err) {
      AxiosToastError(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateMasterMenuItem = async (e) => {
    e.preventDefault();
    if (!editingMasterMenuItem) return;
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("name", editingMasterMenuItem.name);
    formData.append("description", editingMasterMenuItem.description);
    formData.append("categoryId", editingMasterMenuItem.categoryId);
    if (editingMasterMenuItem.subcategoryId) formData.append("subcategoryId", editingMasterMenuItem.subcategoryId);
    formData.append("basePrice", editingMasterMenuItem.basePrice);
    // Only append image if it's a new file object, not an existing URL string
    if (
      editingMasterMenuItem.image &&
      typeof editingMasterMenuItem.image !== "string"
    ) {
      formData.append("image", editingMasterMenuItem.image);
    }

    try {
      const response = await Axios.put(
        `/api/master-menu/${editingMasterMenuItem._id}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (response.status === 200) {
        toast.success("Master menu item updated successfully!");
        setEditingMasterMenuItem(null);
        fetchData(); // Refresh data
      }
    } catch (err) {
      AxiosToastError(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleArchiveRestaurant = async () => {
    if (!archivingRestaurant) return;
    setIsSubmitting(true);
    try {
      const response = await Axios.delete(
        `/api/restaurants/${archivingRestaurant._id}`
      );
      if (response.status === 200) {
        toast.success("Restaurant archived successfully!");
        setArchivingRestaurant(null);
        fetchData(); // Refresh data
      }
    } catch (err) {
      AxiosToastError(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleManagerStatus = async () => {
    if (!togglingUser) return;
    setIsSubmitting(true);
    try {
      const response = await Axios.patch(
        `/api/auth/managers/${togglingUser._id}/status`,
        { isActive: !togglingUser.isActive }
      );
      if (response.status === 200) {
        toast.success(response.data.message);
        setTogglingUser(null);
        fetchData();
      }
    } catch (err) {
      AxiosToastError(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Memoized logic for filtering, searching, and sorting
  const processedRestaurants = useMemo(() => {
    // Return empty array on error to avoid processing invalid data
    if (error) return [];
    let filtered = restaurants ? [...restaurants] : [];

    // Search functionality
    if (restaurantSearchTerm) {
      const lowercasedSearchTerm = restaurantSearchTerm.toLowerCase();
      filtered = filtered.filter((r) => {
        const manager = managers.find((m) => m.restaurantId === r._id);
        return (
          r.name.toLowerCase().includes(lowercasedSearchTerm) ||
          r.address.toLowerCase().includes(lowercasedSearchTerm) ||
          (manager && manager.name.toLowerCase().includes(lowercasedSearchTerm))
        );
      });
    }

    // Sorting functionality
    if (restaurantSortConfig.key) {
      filtered.sort((a, b) => {
        let aValue, bValue;

        if (
          restaurantSortConfig.key === "totalSales" ||
          restaurantSortConfig.key === "totalOrders"
        ) {
          const aPerf = performanceData.find((p) => p._id === a._id) || {
            totalSales: 0,
            totalOrders: 0,
          };
          const bPerf = performanceData.find((p) => p._id === b._id) || {
            totalSales: 0,
            totalOrders: 0,
          };
          aValue = aPerf[restaurantSortConfig.key];
          bValue = bPerf[restaurantSortConfig.key];
        } else {
          aValue = a.name;
          bValue = b.name;
        }

        if (aValue < bValue) {
          return restaurantSortConfig.direction === "ascending" ? -1 : 1;
        }
        if (aValue > bValue) {
          return restaurantSortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  }, [
    restaurants, // depends on restaurants
    managers,
    performanceData,
    restaurantSearchTerm,
    restaurantSortConfig,
  ]);

  const paginatedRestaurants = useMemo(() => {
    const startIndex = (restaurantCurrentPage - 1) * ITEMS_PER_PAGE;
    return processedRestaurants.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [processedRestaurants, restaurantCurrentPage]);

  const requestRestaurantSort = (key) => {
    let direction = "ascending";
    if (
      restaurantSortConfig.key === key &&
      restaurantSortConfig.direction === "ascending"
    ) {
      direction = "descending";
    }
    setRestaurantSortConfig({ key, direction });
    setRestaurantCurrentPage(1); // Reset to first page on sort
  };

  const processedManagers = useMemo(() => {
    let filtered = [...managers];

    if (managerSearchTerm) {
      const lowercased = managerSearchTerm.toLowerCase();
      filtered = filtered.filter(
        (m) =>
          m.name.toLowerCase().includes(lowercased) ||
          m.email.toLowerCase().includes(lowercased)
      );
    }

    if (managerSortConfig.key) {
      filtered.sort((a, b) => {
        const aValue = a[managerSortConfig.key];
        const bValue = b[managerSortConfig.key];
        if (aValue < bValue)
          return managerSortConfig.direction === "ascending" ? -1 : 1;
        if (aValue > bValue)
          return managerSortConfig.direction === "ascending" ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [managers, managerSearchTerm, managerSortConfig]);

  const paginatedManagers = useMemo(() => {
    const startIndex = (managerCurrentPage - 1) * ITEMS_PER_PAGE;
    return processedManagers.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [processedManagers, managerCurrentPage]);

  if (loading) {
    return (
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6 h-10 bg-gray-200 rounded w-1/3 animate-pulse"></h1>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <RestaurantSkeleton isMobile={isMobile} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Brand Management
        </h1>
        <ErrorState
          title="Could Not Load Data"
          message={error}
          onRetry={fetchData}
        />
      </div>
    );
  }

  const assignedRestaurantIds = new Set(managers.map((m) => m.restaurantId));
  const unassignedRestaurants = restaurants.filter(
    (r) => !assignedRestaurantIds.has(r._id)
  );

  const hasRestaurants = restaurants.length > 0;
  const canAddManager = hasRestaurants && unassignedRestaurants.length > 0;
  const canAddMasterMenuItem = hasRestaurants;

  return (
    <>
      <div className="container mx-auto p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen max-w-7xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Brand Management
        </h1>

        {/* Tabs */}
        <div className="border-b border-gray-300 mb-6">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab("restaurants")}
              className={`${
                activeTab === "restaurants"
                  ? "border-green-500 text-green-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-semibold text-sm flex items-center gap-2 transition-colors duration-200 cursor-pointer`}
            >
              <FaStore /> Restaurants
            </button>
            <button
              onClick={() => setActiveTab("managers")}
              className={`${
                activeTab === "managers"
                  ? "border-green-500 text-green-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-semibold text-sm flex items-center gap-2 transition-colors duration-200 cursor-pointer`}
            >
              <FaUserTie /> Managers
            </button>
            <button
              onClick={() => setActiveTab("master-menu")}
              className={`${
                activeTab === "master-menu"
                  ? "border-green-500 text-green-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-semibold text-sm flex items-center gap-2 transition-colors duration-200 cursor-pointer`}
            >
              <FaBookOpen /> Master Menu
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === "restaurants" && (
            <RestaurantTab
              restaurants={paginatedRestaurants}
              managers={managers}
              performanceData={performanceData} // This prop seems unused in RestaurantTab, consider removing
              onAdd={() => setIsRestaurantModalOpen(true)}
              onEdit={setEditingRestaurant}
              onArchive={setArchivingRestaurant}
              searchTerm={restaurantSearchTerm}
              setSearchTerm={setRestaurantSearchTerm}
              sortConfig={restaurantSortConfig}
              requestSort={requestRestaurantSort}
              isMobile={isMobile}
            />
          )}

          {activeTab === "restaurants" &&
            processedRestaurants.length > ITEMS_PER_PAGE && (
              <Pagination
                currentPage={restaurantCurrentPage}
                totalPages={Math.ceil(
                  processedRestaurants.length / ITEMS_PER_PAGE
                )}
                onPageChange={(page) => setRestaurantCurrentPage(page)}
                itemsPerPage={ITEMS_PER_PAGE}
                totalItems={processedRestaurants.length}
                itemType="restaurants"
              />
            )}

          {activeTab === "managers" && (
            <ManagerTab
              managers={paginatedManagers}
              restaurants={restaurants}
              unassignedRestaurants={unassignedRestaurants}
              onAdd={canAddManager ? () => setIsManagerModalOpen(true) : null}
              canAddManager={canAddManager}
              onEdit={setEditingManager}
              onToggleStatus={setTogglingUser}
              searchTerm={managerSearchTerm}
              setSearchTerm={setManagerSearchTerm}
              sortConfig={managerSortConfig}
              setSortConfig={setManagerSortConfig}
              setCurrentPage={setManagerCurrentPage}
              isMobile={isMobile}
            />
          )}

          {activeTab === "managers" &&
            processedManagers.length > ITEMS_PER_PAGE && (
              <Pagination
                currentPage={managerCurrentPage}
                totalPages={Math.ceil(
                  processedManagers.length / ITEMS_PER_PAGE
                )}
                onPageChange={(page) => setManagerCurrentPage(page)}
                itemsPerPage={ITEMS_PER_PAGE}
                totalItems={processedManagers.length}
                itemType="managers"
              />
            )}

          {activeTab === "master-menu" && (
            <MasterMenuTab
              masterMenu={masterMenu}
              menuCategories={menuCategories}
              onAdd={canAddMasterMenuItem ? openAddItemModal : null}
              onAddCategory={() => setIsCategoryModalOpen(true)}
              onAddSubcategory={(catId) => { setAddingSubcategoryTo(catId); setIsSubcategoryModalOpen(true); }}
              canAddMasterMenuItem={canAddMasterMenuItem}
              onEdit={setEditingMasterMenuItem}
              isMobile={isMobile}
            />
          )}
        </div>
      </div>

      <AddRestaurantModal
        isOpen={isRestaurantModalOpen}
        onClose={() => setIsRestaurantModalOpen(false)}
        newRestaurant={newRestaurant}
        handleRestaurantChange={handleRestaurantChange}
        handleCreateRestaurant={handleCreateRestaurant}
        isSubmitting={isSubmitting}
      />

      <AddManagerModal
        isOpen={isManagerModalOpen}
        onClose={() => setIsManagerModalOpen(false)}
        newManager={newManager}
        handleManagerChange={handleManagerChange}
        handleCreateManager={handleCreateManager}
        isSubmitting={isSubmitting}
        unassignedRestaurants={unassignedRestaurants}
      />

      <AddMasterMenuItemModal
        isOpen={isMasterMenuModalOpen}
        onClose={() => setIsMasterMenuModalOpen(false)}
        newItem={newMasterMenuItem}
        handleItemChange={handleMasterMenuItemChange}
        handleImageFileChange={(e) => handleImageFileChange(e, "new")}
        menuCategories={menuCategories}
        handleCreateItem={handleCreateMasterMenuItem}
        isSubmitting={isSubmitting}
      />

      <EditMasterMenuItemModal
        editingItem={editingMasterMenuItem}
        setEditingItem={setEditingMasterMenuItem}
        handleUpdateItem={handleUpdateMasterMenuItem}
        handleImageFileChange={(e) => handleImageFileChange(e, "edit")}
        menuCategories={menuCategories}
        isSubmitting={isSubmitting}
      />

      <AddCategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        handleCreate={handleCreateCategory}
        isSubmitting={isSubmitting}
      />

      <AddSubcategoryModal
        isOpen={isSubcategoryModalOpen}
        onClose={() => { setIsSubcategoryModalOpen(false); setAddingSubcategoryTo(null); }}
        handleCreate={handleCreateSubcategory}
        isSubmitting={isSubmitting}
      />

      <EditRestaurantModal
        editingRestaurant={editingRestaurant}
        setEditingRestaurant={setEditingRestaurant}
        handleUpdateRestaurant={handleUpdateRestaurant}
        isSubmitting={isSubmitting}
        onClose={() => setEditingRestaurant(null)}
      />

      <EditManagerModal
        editingManager={editingManager}
        setEditingManager={setEditingManager}
        handleUpdateManager={handleUpdateManager}
        isSubmitting={isSubmitting}
        onClose={() => setEditingManager(null)}
        restaurants={restaurants}
        managers={managers}
      />

      <ToggleStatusModal
        user={togglingUser}
        onClose={() => setTogglingUser(null)}
        handleToggleStatus={handleToggleManagerStatus}
        isSubmitting={isSubmitting}
        userType="manager"
      />

      <ArchiveRestaurantModal
        archivingRestaurant={archivingRestaurant}
        onClose={() => setArchivingRestaurant(null)}
        handleArchiveRestaurant={handleArchiveRestaurant}
        isSubmitting={isSubmitting}
      />
    </>
  );
};

export default BrandManagement;
