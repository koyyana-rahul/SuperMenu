const backendDomain = "http://localhost:8080"; // Your server port from .env
export const baseURL = backendDomain;

const SummaryApi = {
  baseURL: `${baseURL}`,

  // =================================================================
  // 1. CORE & AUTHENTICATION FLOW
  // =================================================================
  registerBrand: {
    url: "/api/auth/register-brand",
    method: "post",
  },
  login: {
    url: "/api/auth/login",
    method: "post",
  },
  loginStaff: {
    url: "/api/auth/login-staff",
    method: "post",
  },
  refreshToken: {
    url: "/api/auth/refresh-token",
    method: "post",
  },
  getProfile: {
    url: "/api/auth/profile",
    method: "get",
  },
  updateProfile: {
    url: "/api/auth/profile",
    method: "put",
  },
  logout: {
    url: "/api/auth/logout",
    method: "get",
  },
  forgotPassword: {
    url: "/api/auth/forgot-password",
    method: "post",
  },
  verifyOtp: {
    url: "/api/auth/verify-otp",
    method: "post",
  },
  resetPassword: {
    url: "/api/auth/reset-password",
    method: "post",
  },

  // =================================================================
  // 2. CUSTOMER / PUBLIC FLOW
  // =================================================================
  getPublicMenu: {
    url: "/api/public/menu", // e.g., /api/public/menu/:restaurantId
    method: "get",
  },
  placeOrder: {
    url: "/api/orders",
    method: "post",
  },
  getOrderStatus: {
    url: "/api/public/order-status",
    method: "post",
  },
  initiatePayment: {
    url: "/api/payments/initiate",
    method: "post",
  },
  verifyPayment: {
    url: "/api/payments/verify",
    method: "post",
  },

  // =================================================================
  // 3. BRAND ADMIN DASHBOARD FLOW
  // =================================================================

  // 3.1. Restaurant Management
  createRestaurant: {
    url: "/api/restaurants",
    method: "post",
  },
  getRestaurants: {
    url: "/api/restaurants",
    method: "get",
  },
  updateRestaurant: {
    url: "/api/restaurants", // e.g., /api/restaurants/:id
    method: "put",
  },
  archiveRestaurant: {
    url: "/api/restaurants", // e.g., /api/restaurants/:id
    method: "delete",
  },
  getUnassignedRestaurants: {
    url: "/api/restaurants/unassigned",
    method: "get",
  },
  // 3.2. Manager Account Management
  createManager: {
    url: "/api/auth/create-manager",
    method: "post",
  },
  getManagers: {
    url: "/api/auth/managers",
    method: "get",
  },
  // 3.3. Master Menu Management
  createMasterMenuItem: {
    url: "/api/master-menu",
    method: "post",
  },
  getMasterMenu: {
    url: "/api/master-menu",
    method: "get",
  },
  updateMasterMenuItem: {
    url: "/api/master-menu", // e.g., /api/master-menu/:id
    method: "put",
  },
  createMenuCategory: {
    url: "/api/menu-categories",
    method: "post",
  },
  getMenuCategories: {
    url: "/api/menu-categories",
    method: "get",
  },
  createMenuSubcategory: {
    url: "/api/menu-subcategories",
    method: "post",
  },
  uploadImage: {
    url: "/api/upload",
    method: "post",
  },
  // 3.4. Reporting & Overview
  getAllStaff: {
    url: "/api/auth/all-staff",
    method: "get",
  },
  getBrandDashboardReport: {
    url: "/api/reports/brand-dashboard",
    method: "get",
  },
  getBrandSalesSummary: {
    url: "/api/reports/brand-sales-summary",
    method: "get",
  },

  // =================================================================
  // 4. MANAGER DASHBOARD FLOW
  // =================================================================

  // 4.1. Staff Management (Chefs & Waiters)
  createStaff: {
    url: "/api/auth/create-staff",
    method: "post",
  },
  getStaff: {
    url: "/api/auth/staff",
    method: "get",
  },
  updateStaff: {
    url: "/api/auth/staff", // e.g., /api/auth/staff/:staffId
    method: "put",
  },
  updateStaffStatus: {
    url: "/api/auth/staff", // e.g., /api/auth/staff/:staffId/status
    method: "patch",
  },
  // 4.2. Restaurant Setup (Tables & Kitchens)
  createTable: {
    url: "/api/tables",
    method: "post",
  },
  updateTable: {
    url: "/api/tables", // e.g., /api/tables/:id
    method: "put",
  },
  archiveTable: {
    url: "/api/tables", // e.g., /api/tables/:id
    method: "delete",
  },
  generateTableQR: {
    url: "/api/tables", // e.g., /api/tables/:id/generate-qr
    method: "post",
  },
  createKitchenStation: {
    url: "/api/kitchen-stations",
    method: "post",
  },
  getKitchenStations: {
    url: "/api/kitchen-stations",
    method: "get",
  },
  // 4.3. Branch Menu Management
  createMenuCategory: {
    url: "/api/menu-categories",
    method: "post",
  },
  getMenuCategories: {
    url: "/api/menu-categories",
    method: "get",
  },
  getBranchMenuMasterList: {
    url: "/api/branch-menu/master-list",
    method: "get",
  },
  addBranchMenuItem: {
    url: "/api/branch-menu",
    method: "post",
  },
  getBranchMenu: {
    url: "/api/branch-menu",
    method: "get",
  },
  updateBranchMenuItem: {
    url: "/api/branch-menu", // e.g., /api/branch-menu/:itemId
    method: "put",
  },
  // 4.4. Live Order Management
  getOpenOrders: {
    url: "/api/orders/open",
    method: "get",
  },
  getSuspiciousOrders: {
    url: "/api/orders/suspicious",
    method: "get",
  },
  approveSuspiciousOrder: {
    url: "/api/orders/:orderId/approve",
    method: "patch",
  },
  rejectSuspiciousOrder: {
    url: "/api/orders/:orderId/reject",
    method: "patch",
  },
  cancelOrderItem: {
    url: "/api/orders/items/:itemId/cancel",
    method: "patch",
  },

  // =================================================================
  // 5. WAITER DASHBOARD FLOW
  // =================================================================
  getTables: {
    url: "/api/tables",
    method: "get",
  },
  openTable: {
    url: "/api/tables", // e.g., /api/tables/:id/open
    method: "post",
  },
  getReadyToServeOrders: {
    url: "/api/orders/waiter/ready",
    method: "get",
  },
  markItemAsServed: {
    url: "/api/orders/items", // e.g., /api/orders/items/:itemId/served
    method: "patch",
  },
  closeOrder: {
    url: "/api/orders", // e.g., /api/orders/:orderId/close
    method: "post",
  },

  // =================================================================
  // 6. CHEF DASHBOARD FLOW
  // =================================================================
  getPendingKitchenOrders: {
    url: "/api/orders/kitchen/pending",
    method: "get",
  },
  claimOrderItem: {
    url: "/api/orders/items", // e.g., /api/orders/items/:itemId/claim
    method: "patch",
  },
  markItemAsReady: {
    url: "/api/orders/items", // e.g., /api/orders/items/:itemId/ready
    method: "patch",
  },
};
export default SummaryApi;
