# Jeel Aqua - Frontend Development Plan

**Project:** Jeel Aqua Water Supply App - Frontend
**Version:** 1.0
**Date:** 2025-04-21
**Based on:** PRD (`prd.md`), DB Schema (`jeelaqua_water_db.sql`), Backend API (`api-docs.json`), Project Status (`project_status.md`)

---

## 1. Technology Stack

*   **Framework:** SvelteKit
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS
*   **UI Components:** Shadcn/UI (Svelte Port - e.g., `shadcn-svelte`)
*   **State Management:** Svelte Stores (Start with native stores, consider Zustand if complexity increases significantly)
*   **API Client:** Fetch API (built-in) or Axios
*   **Forms:** Consider `sveltekit-superforms` with Zod for validation if forms become complex. Start with basic HTML forms and Svelte reactivity.
*   **Data Fetching:** SvelteKit `load` functions for server-side/universal data loading.

---

## 2. Core Features & Modules

Based on the PRD and existing backend API:

*   **Authentication:**
    *   Login Page (`/login`)
    *   API integration (`POST /auth/login`)
    *   JWT Token storage (Secure HttpOnly cookie preferred via SvelteKit hooks/endpoints, fallback to localStorage if needed)
    *   Route Protection (Hooks to check auth status)
    *   Logout functionality
    *   User Profile Display (`/profile` - potentially using `/users/me`)
*   **Layout:**
    *   Main application layout with persistent Sidebar navigation and Header.
    *   Display logged-in user info.
    *   Role-based visibility of navigation items.
*   **Dashboard (`/`)**
    *   Display key metrics (requires `GET /reports/summary` from backend)
    *   Widgets for quick overview (e.g., recent orders, pending deliveries)
*   **Zones Management (`/zones`)**
    *   List Zones (`GET /zones`)
    *   Create Zone (`POST /zones`)
    *   View/Edit Zone (`GET /zones/{id}`, `PATCH /zones/{id}`)
    *   Delete Zone (`DELETE /zones/{id}`) (Admin Only)
*   **Societies Management (`/societies`)**
    *   List Societies (`GET /societies`, with optional `zoneId` filter)
    *   Create Society (`POST /societies`)
    *   View/Edit Society (`GET /societies/{id}`, `PATCH /societies/{id}`)
    *   Delete Society (`DELETE /societies/{id}`) (Admin Only)
*   **Services Management (`/services`)**
    *   List Services (`GET /services`)
    *   Create Service (`POST /services`)
    *   View/Edit Service (`GET /services/{id}`, `PATCH /services/{id}`)
    *   Delete Service (`DELETE /services/{id}`) (Admin Only)
*   **Measures Management (`/measures`)**
    *   List Measures (`GET /measures`)
    *   Create Measure (`POST /measures`)
    *   View/Edit Measure (`GET /measures/{id}`, `PATCH /measures/{id}`)
    *   Delete Measure (`DELETE /measures/{id}`) (Admin Only)
*   **Users Management (`/users`)**
    *   List Users (`GET /users`, with optional `roleId` filter)
    *   Create User (`POST /users`)
    *   View/Edit User (`GET /users/{id}`, `PATCH /users/{id}`)
    *   Delete User (`DELETE /users/{id}`) (Admin Only)
*   **Orders Management (`/orders`)**
    *   List Orders (`GET /orders`, with filters: `userId`, `startDate`, `endDate`)
    *   View Order Details (`GET /orders/{id}`)
    *   Create Order (`POST /orders`) - Requires selecting Customer, Service.
    *   Update Order (`PATCH /orders/{id}`) - Potentially limited fields.
    *   Delete Order (`DELETE /orders/{id}`) - If required/allowed.
*   **Deliveries Management (`/deliveries`)**
    *   List Deliveries (`GET /deliveries`, with filters)
    *   View Delivery Details (`GET /deliveries/{id}`)
    *   Create Delivery (`POST /deliveries`) - Linked to an Order.
    *   Update Delivery (`PATCH /deliveries/{id}`) - e.g., update status, return qty.
*   **Payments Management (`/payments`)**
    *   List Payment History (`GET /payments`, needs backend endpoint refinement/implementation)
    *   Record Payment (`POST /payments`, needs backend endpoint refinement/implementation) - Requires selecting Customer.
*   **Expenses Management (`/expenses`)**
    *   List Expenses (`GET /expenses`, needs backend endpoint refinement/implementation)
    *   Record Expense (`POST /expenses`, needs backend endpoint refinement/implementation)
*   **Reporting (`/reports`)**
    *   Sales Report UI (using `GET /reports/sales`)
    *   Expense Report UI (using `GET /reports/expenses`)
*   **Invoicing (`/invoices` or integrated into Customer view)**
    *   UI to display invoice data for a customer (using `GET /reports/invoice/:userId`)

---

## 3. State Management Strategy

*   **Global State (Svelte Stores):**
    *   Authentication status (token, user object, roles).
    *   Potentially shared lists fetched once (e.g., Roles, Measures) if relatively static.
*   **Local/Page State:**
    *   Form data.
    *   Data fetched specifically for a page (e.g., list of zones, specific order details) managed via `load` functions and page props/variables.

---

## 4. API Integration Strategy

*   Create a utility module (`src/lib/api.ts` or similar) for handling API calls.
*   Functions should automatically include the Authorization header (Bearer token) if the user is logged in.
*   Implement centralized error handling for API responses (e.g., 401 redirects to login, displaying user-friendly error messages).
*   Use SvelteKit's `fetch` in `load` functions and server hooks where possible. Use browser `fetch` or Axios for client-side actions (e.g., form submissions).

---

## 5. Development Order & Milestones

*   **Phase 1: Setup & Authentication**
    *   [ ] Initialize SvelteKit project (`/frontend`).
    *   [ ] Integrate TypeScript.
    *   [ ] Setup Tailwind CSS.
    *   [ ] Setup Shadcn/UI Svelte.
    *   [ ] Create basic Layout (Sidebar, Header).
    *   [ ] Implement Login page UI.
    *   [ ] Implement Login API call (`POST /auth/login`).
    *   [ ] Implement secure token storage (HttpOnly cookie preferred).
    *   [ ] Implement route protection hooks.
    *   [ ] Implement Logout.
    *   [ ] Basic Profile display (`/users/me`).
    *   **Goal:** User can log in, navigate protected routes, see basic layout, and log out.
*   **Phase 2: Core Data Management (Admin Views)**
    *   [ ] Zones CRUD UI & API integration.
    *   [ ] Societies CRUD UI & API integration (including zone filtering).
    *   [ ] Measures CRUD UI & API integration.
    *   [ ] Services CRUD UI & API integration.
    *   [ ] Users CRUD UI & API integration (including role filtering).
    *   **Goal:** Admin user can manage all core static/reference data.
*   **Phase 3: Order & Delivery Workflow**
    *   [ ] Orders List UI (with filtering).
    *   [ ] Order View UI.
    *   [ ] Order Create UI (User selection, Service selection).
    *   [ ] Deliveries List UI (with filtering).
    *   [ ] Delivery View UI.
    *   [ ] Delivery Create/Update UI (Link to Order, User selection for delivery boy).
    *   **Goal:** Users (with appropriate roles) can create and track orders and deliveries.
*   **Phase 4: Financials**
    *   [ ] Payments List UI.
    *   [ ] Payment Create UI (User selection).
    *   [ ] Expenses List UI.
    *   [ ] Expense Create UI.
    *   **Goal:** Users (with appropriate roles) can record payments and expenses.
*   **Phase 5: Dashboard & Reporting**
    *   [ ] Integrate Dashboard summary API (`GET /reports/summary`).
    *   [ ] Implement Sales Report UI.
    *   [ ] Implement Expense Report UI.
    *   [ ] Implement Invoice display UI (per customer).
    *   **Goal:** Key reports and dashboard overview are functional.
*   **Phase 6: Refinement & RBAC**
    *   [ ] Implement UI variations based on user roles (hide/show navigation, disable buttons).
    *   [ ] Improve UI/UX based on feedback.
    *   [ ] Add loading states and enhance error handling.
    *   [ ] Testing and bug fixing.
    *   **Goal:** Application is robust, user-friendly, and respects role permissions.

---

## 6. Status Tracking

*   This document will be updated as features are completed.
*   `project_status.md` will be updated concurrently to reflect frontend progress.
*   Communicate after each significant feature/module completion for review/testing before proceeding.

--- 