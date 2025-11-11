# SuperMenu API

This repository contains the complete backend server for the SuperMenu Restaurant Operating System. It's a robust, production-ready API built with Node.js, Express, and MongoDB, designed to handle everything from user management and menu creation to live order tracking and payment processing.

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm
- MongoDB (A local instance or a cloud service like MongoDB Atlas)

### Installation

1.  Clone the repository:
    ```sh
    git clone https://github.com/koyyana-rahul/SuperMenu.git
    ```
2.  Navigate to the server directory:
    ```sh
    cd SuperMenu/server
    ```
3.  Install the dependencies:
    ```sh
    npm install
    ```

### Environment Variables

Create a `.env` file in the `server` directory and add the following variables:

```
FRONTEND_URL=http://localhost:5173
PORT=8080
MONGODB_URI=<Your MongoDB Connection String>

SECRET_KEY_ACCESS_TOKEN=<Your JWT Secret for Access Tokens>
SECRET_KEY_REFRESH_TOKEN=<Your JWT Secret for Refresh Tokens>

CLOUDINARY_CLOUD_NAME=<Your Cloudinary Cloud Name>
CLOUDINARY_API_KEY=<Your Cloudinary API Key>
CLOUDINARY_API_SECRET_KEY=<Your Cloudinary API Secret>

SMTP_HOST=<Your SMTP Host (e.g., smtp.mailtrap.io)>
SMTP_PORT=<Your SMTP Port>
SMTP_USER=<Your SMTP User>
SMTP_PASS=<Your SMTP Password>
SMTP_FROM="SuperMenu Support <support@supermenu.com>"
```

### Running the Application

- **Development Mode:** This will run the server with `nodemon`, which automatically restarts on file changes.
  ```sh
  npm run dev
  ```
- **Production Mode:**
  ```sh
  npm start
  ```

---

## API Endpoint Documentation

<details>
<summary><h3>Public Routes (No Authentication Required)</h3></summary>

| Method | Endpoint                         | Description                                                                     |
| :----- | :------------------------------- | :------------------------------------------------------------------------------ |
| `POST` | `/api/auth/register-brand`       | A new brand owner signs up.                                                     |
| `POST` | `/api/auth/login`                | A Brand Admin or Manager logs in with email/password.                           |
| `POST` | `/api/auth/login-staff`          | A Chef or Waiter logs in with a PIN and Restaurant ID.                          |
| `POST` | `/api/auth/forgot-password`      | Starts the password reset process for a user.                                   |
| `POST` | `/api/auth/verify-otp`           | Verifies the OTP sent for password reset.                                       |
| `POST` | `/api/auth/reset-password`       | Sets a new password after successful OTP verification.                          |
| `GET`  | `/api/public/menu/:restaurantId` | Gets the full, nested public menu for a specific restaurant.                    |
| `POST` | `/api/public/order-status`       | Gets the current status of an open order for a table (requires Table ID & PIN). |
| `POST` | `/api/orders`                    | A customer places a new order for a table (requires Table ID & PIN).            |
| `POST` | `/api/payments/initiate`         | Creates a Razorpay order to initiate online payment.                            |
| `POST` | `/api/payments/verify`           | Verifies a completed Razorpay payment.                                          |

</details>

<details>
<summary><h3>Authenticated Routes (All Logged-in Users)</h3></summary>

| Method | Endpoint            | Description                                                               |
| :----- | :------------------ | :------------------------------------------------------------------------ |
| `GET`  | `/api/auth/logout`  | Logs out the current user and clears their session.                       |
| `GET`  | `/api/auth/profile` | Gets the profile of the currently logged-in user.                         |
| `PUT`  | `/api/auth/profile` | Updates the profile of the currently logged-in user (e.g., name, avatar). |

</details>

<details>
<summary><h3>Brand Admin Routes</h3></summary>

| Method   | Endpoint                                  | Description                                                |
| :------- | :---------------------------------------- | :--------------------------------------------------------- |
| `POST`   | `/api/restaurants`                        | Creates a new restaurant branch for the brand.             |
| `GET`    | `/api/restaurants`                        | Gets a list of all restaurants in the brand.               |
| `PUT`    | `/api/restaurants/:id`                    | Updates the details of a specific restaurant.              |
| `DELETE` | `/api/restaurants/:id`                    | Archives (soft deletes) a specific restaurant.             |
| `POST`   | `/api/auth/create-manager`                | Creates a new Manager and assigns them to a restaurant.    |
| `GET`    | `/api/auth/managers`                      | Gets a list of all managers in the brand.                  |
| `GET`    | `/api/auth/all-staff`                     | Gets a list of all staff members across all branches.      |
| `POST`   | `/api/master-menu`                        | Creates a new item in the brand's master menu.             |
| `GET`    | `/api/master-menu`                        | Gets all items from the brand's master menu.               |
| `PUT`    | `/api/master-menu/:id`                    | Updates an existing master menu item.                      |
| `GET`    | `/api/reports/brand-dashboard`            | Gets a high-level dashboard of stats for the entire brand. |
| `GET`    | `/api/reports/brand-sales-summary`        | Gets a consolidated sales report across all restaurants.   |
| `GET`    | `/api/reports/branch-sales/:restaurantId` | Gets a detailed sales report for a specific branch.        |

</details>

<details>
<summary><h3>Manager Routes</h3></summary>

| Method   | Endpoint                                  | Description                                                         |
| :------- | :---------------------------------------- | :------------------------------------------------------------------ |
| `POST`   | `/api/auth/create-staff`                  | Creates a new Chef or Waiter for the manager's restaurant.          |
| `GET`    | `/api/auth/staff`                         | Gets a list of all staff in the manager's restaurant.               |
| `PUT`    | `/api/auth/staff/:staffId`                | Updates a staff member's details.                                   |
| `PATCH`  | `/api/auth/staff/:staffId/status`         | Activates or deactivates a staff member.                            |
| `PATCH`  | `/api/auth/staff/:staffId/assign-station` | Assigns a Chef to a specific kitchen station.                       |
| `PATCH`  | `/api/restaurants/settings`               | Updates settings for the manager's restaurant (e.g., payment keys). |
| `POST`   | `/api/kitchen-stations`                   | Creates a new kitchen station (e.g., "Tandoor", "Bar").             |
| `GET`    | `/api/kitchen-stations`                   | Gets all kitchen stations for the restaurant.                       |
| `PUT`    | `/api/kitchen-stations/:id`               | Updates a kitchen station's details.                                |
| `DELETE` | `/api/kitchen-stations/:id`               | Archives (soft deletes) a kitchen station.                          |
| `POST`   | `/api/menu-categories`                    | Creates a new menu category (e.g., "Appetizers").                   |
| `GET`    | `/api/menu-categories`                    | Gets all menu categories for the restaurant.                        |
| `PUT`    | `/api/menu-categories/:id`                | Updates a menu category's details.                                  |
| `DELETE` | `/api/menu-categories/:id`                | Archives a menu category.                                           |
| `POST`   | `/api/menu-subcategories`                 | Creates a new subcategory within a parent category.                 |
| `GET`    | `/api/menu-subcategories`                 | Gets all subcategories (can be filtered by parent category).        |
| `PUT`    | `/api/menu-subcategories/:id`             | Updates a menu subcategory's details.                               |
| `DELETE` | `/api/menu-subcategories/:id`             | Archives a menu subcategory.                                        |
| `GET`    | `/api/branch-menu/master-list`            | Gets the list of master menu items available to add.                |
| `POST`   | `/api/branch-menu`                        | Adds an item from the master list to the branch's menu.             |
| `GET`    | `/api/branch-menu`                        | Gets all menu items for the branch.                                 |
| `GET`    | `/api/branch-menu/:itemId`                | Gets a single branch menu item by its ID.                           |
| `PUT`    | `/api/branch-menu/:itemId`                | Updates a branch menu item's price, availability, etc.              |
| `DELETE` | `/api/branch-menu/:itemId`                | Archives a branch menu item.                                        |
| `PATCH`  | `/api/branch-menu/:itemId/modifiers`      | Adds or updates the modifiers for a branch menu item.               |
| `GET`    | `/api/orders/open`                        | Gets a list of all currently open orders in the restaurant.         |
| `GET`    | `/api/orders/suspicious`                  | Gets a list of all orders pending manager approval.                 |
| `PATCH`  | `/api/orders/:orderId/approve`            | Approves a suspicious order and sends it to the kitchen.            |
| `PATCH`  | `/api/orders/:orderId/reject`             | Rejects and cancels a suspicious order.                             |
| `PATCH`  | `/api/orders/items/:itemId/cancel`        | Cancels a specific item from an open order.                         |
| `GET`    | `/api/reports/manager-dashboard`          | Gets a high-level dashboard of stats for the manager's restaurant.  |
| `GET`    | `/api/reports/sales-summary`              | Gets a sales report for the manager's restaurant.                   |
| `POST`   | `/api/tables`                             | Creates a new table for the restaurant layout.                      |
| `PUT`    | `/api/tables/:id`                         | Updates a table's details.                                          |
| `DELETE` | `/api/tables/:id`                         | Archives a table.                                                   |
| `POST`   | `/api/tables/:id/generate-qr`             | Generates a QR code for a table.                                    |

</details>

<details>
<summary><h3>Waiter Routes</h3></summary>

| Method  | Endpoint                           | Description                                                          |
| :------ | :--------------------------------- | :------------------------------------------------------------------- |
| `GET`   | `/api/tables`                      | Gets a list of all tables in the restaurant to see their status.     |
| `POST`  | `/api/tables/:id/open`             | Opens a table for a customer and generates a PIN.                    |
| `GET`   | `/api/orders/waiter/ready`         | Gets a list of all items that are ready for pickup from the kitchen. |
| `PATCH` | `/api/orders/items/:itemId/served` | Marks an item as served after delivering it to the customer.         |
| `POST`  | `/api/orders/:orderId/close`       | Closes an order, records the payment, and frees the table.           |

</details>

<details>
<summary><h3>Chef Routes</h3></summary>

| Method  | Endpoint                          | Description                                                  |
| :------ | :-------------------------------- | :----------------------------------------------------------- |
| `GET`   | `/api/orders/kitchen/pending`     | Gets all pending order items assigned to the chef's station. |
| `PATCH` | `/api/orders/items/:itemId/claim` | Claims a pending item, changing its status to "PREPARING".   |
| `PATCH` | `/api/orders/items/:itemId/ready` | Marks a preparing item as "READY" for pickup.                |

</details>
