# Jeel Aqua Water Supply Dashboard

Below is a sample Product Requirements Document (PRD) outline tailored to "Jeel Aqua" and its water supply operations in Bharuch. You can expand or modify this document to suit your needs.

---

# Product Requirements Document (PRD)

**Project:** Jeel Aqua Water Supply App

**Location:** Bharuch, Gujarat, India

**Version:** 1.0

**Date:** [Insert Date]

---

## 1. Overview

### 1.1. Purpose

This document outlines the requirements for a dashboard/admin panel system for Jeel Aqua, a local water supplier. The system is intended to streamline operations, automate invoice generation, manage customers and deliveries, track sales reports, and handle accounting.

### 1.2. Scope

The application will be used by the owner, administrators, employees (data entry), and delivery personnel. It will manage two water types (Mineral and Alkaline) and support various sales channels, including door-to-door delivery, water ATM pickups, and a local tap at the headquarter.

### 1.3. Business Goals

- **Streamline Operations:** Automate invoice creation, customer management, and delivery tracking.
- **Sales Reporting:** Generate daily, weekly, monthly, and annual sales reports.
- **Customer Management:** Organize customers based on defined zones and areas.
- **Account Management:** Track payments, credits, debits, and discounts.
- **Role Management:** Assign and manage user roles (admin/owner, employees, delivery boys).

---

## 2. Product Description

### 2.1. Product Overview

Jeel Aqua provides two types of water:

- **Alkaline Water:** 10 Liter bottle, priced at Rs 80 per unit.
- **Mineral Water:** 20 Liter bottle, priced at Rs 35 per unit.

**Sales Channels:**

- **Door-to-Door Delivery:** Based on customer subscriptions.
- **Water ATM Pickups:** Self-service pickup by customers.
- **Local Tap:** Walk-in customers pay via cash or UPI at the headquarter.

### 2.2. Target Users

- **Owner/Admin:** Oversees the entire operations.
- **Employees/Data Entry:** Manages invoicing, reports, and customer details.
- **Delivery Personnel:** Responsible for delivering water to various zones.
- **Local Customers:** May interact indirectly via pickup or local tap, reflected in the invoicing and accounting system.

---

## 3. Functional Requirements

### 3.1. Dashboard & Reporting

- **Dashboard:** Provide an overview of key metrics (total sales, pending deliveries, customer statistics).
- **Sales Reports:** Generate daily, weekly, monthly, and annual reports.
- **Invoice Reports:** View customer-specific invoices and overall billing summaries.

### 3.2. Invoicing System

- **Invoice Generation:** Automatic creation of invoices based on sales channels.
- **Customer-wise Invoicing:** Ability to view and filter invoices per customer.
- **Customizable Templates:** Option to modify invoice templates as needed.

### 3.3. Product Management

- **Water Types Management:**
    - Create and update water products.
    - Set variable pricing (e.g., Alkaline Water - 10 Liter at Rs 80; Mineral Water - 20 Liter at Rs 35).
- **Inventory Tracking:** (Optional) Track available stock levels if needed.

### 3.4. Customer Management

- **Customer Profiles:** Store and update customer details, including subscription preferences.
- **Zone-Based Classification:**
    - Define zones (e.g., Zone 1, Zone 2, etc.).
    - Group customers based on their zone/sub-area.
- **Payment History:** Maintain records of payments, credits, debits, and discounts per customer.

### 3.5. Delivery Management

- **Delivery Scheduling:** Assign delivery boys to scheduled routes and zones.
- **Route Management:** Define zones and sub-areas (colonies, societies, residentials, bunglows).
- **Tracking & Updates:** Track delivery status (pending, in-progress, completed).

### 3.6. Role and Access Management

- **User Roles:**
    - **Admin/Owner:** Full system access, including dashboard, invoicing, and reports.
    - **Employees/Data Entry:** Limited access to invoicing, customer management, and reporting.
    - **Delivery Boys:** Access to delivery schedules and basic delivery status updates.
- **Permissions:** Define and enforce role-based permissions for each module.

### 3.7. Accounting Module

- **Transaction Management:** Record and manage payments received (cash, UPI).
- **Credit/Debit Tracking:** Monitor customer credit and debit balances.
- **Discounts:** Apply and manage discounts on invoices.
- **Financial Reports:** Generate financial summaries and account statements.

---

## 4. Non-Functional Requirements

### 4.1. Performance

- **Response Time:** Dashboard and reporting modules should load within 2-3 seconds.
- **Scalability:** System should support an expanding customer base and increased transaction volume.

### 4.2. Usability

- **User Interface:** Intuitive and mobile-responsive design.
- **Ease of Use:** Minimal training required for data entry and administrative staff.

### 4.3. Security

- **Data Protection:** Secure handling of sensitive customer and financial data.
- **Access Control:** Role-based access control to prevent unauthorized data access.

### 4.4. Reliability & Maintenance

- **Uptime:** Aim for 99.5% system uptime.
- **Support:** Provide documentation and technical support for troubleshooting and maintenance.

---

## 5. System Architecture & Technical Considerations

### 5.1. Architecture

- **Frontend:** Web-based dashboard accessible via modern web browsers.
- **Backend:** Secure server-side application for processing invoices, managing data, and generating reports.
- **Database:** Robust relational database to manage customers, products, transactions, and roles.

### 5.2. Integration Points

- **Payment Gateways:** UPI and cash payment records (manual reconciliation for cash).
- **Third-Party APIs:** (Optional) Integration with logistics or mapping services for delivery optimization.

### 5.3. Deployment & Environment

- **Cloud Hosting:** Consider cloud platforms for scalability and availability.
- **Development Environments:** Separate development, testing, and production environments to ensure stability.

---

## 6. User Scenarios

### 6.1. Admin/Owner Scenario

- **Login:** Admin logs into the dashboard.
- **Invoice Generation:** Reviews and generates customer-specific invoices.
- **Report Viewing:** Analyzes sales trends via daily and monthly reports.
- **Zone Management:** Defines new zones and assigns areas accordingly.

### 6.2. Employee/Data Entry Scenario

- **Invoice Entry:** Creates and updates invoices for both delivered and picked-up water.
- **Customer Management:** Adds new customer details and updates existing profiles.
- **Report Generation:** Exports sales reports for managerial review.

### 6.3. Delivery Boy Scenario

- **Route Access:** Views assigned delivery routes and schedules.
- **Status Updates:** Updates the delivery status for each customer visit.

---

## 7. Milestones & Timeline

| Milestone | Expected Completion |
| --- | --- |
| Requirement Finalization | [Insert Date] |
| Design & Prototyping | [Insert Date] |
| Development Phase I (Core Modules) | [Insert Date] |
| User Testing & Feedback | [Insert Date] |
| Deployment & Training | [Insert Date] |

---

## 8. Open Issues & Considerations

- **Integration with Existing Systems:** Verify if there is any legacy system integration required.
- **Offline Capabilities:** Determine if the system should have offline support for remote areas.
- **Mobile App Support:** Consider future mobile app versions for enhanced accessibility.

---

### additional requirements:

Here are the suggested additions and modifications to integrate the notes into the PRD:

**1. Updates to Section 2 (Product Description)**

* **2.1 Product Overview / Sales Channels:**
    * Specify that the Water ATM channel involves customers potentially recharging an ATM account/card [cite: 10] and might involve coin handling[cite: 5, 6].
* **2.2 Target Users:**
    * Consider adding "Owner" explicitly if their role differs significantly from "Admin" as implied in some notes[cite: 2].

**2. Updates to Section 3 (Functional Requirements)**

* **3.1 Dashboard & Reporting:**
    * The notes reinforce the need for Sales Reports [cite: 1] and Invoice Reports[cite: 7]. Add "Expense Reports" based on the expense tracking noted[cite: 4].
* **3.2 Invoicing System:**
    * **Invoice Generation:** Specify that invoices should clearly show:
        * Billing Month[cite: 7].
        * Due amount for the current month[cite: 7].
        * Total JAR Deliveries (date-wise if possible)[cite: 7].
        * Total overall Due Amount[cite: 1, 7].
        * Recorded Payments[cite: 7].
        * Returned items/jars[cite: 7, 9].
    * Add requirement: Ability to send invoices via WhatsApp and Email[cite: 7].
    * Add requirement: Search/filter invoices by customer using Mob no or Name[cite: 7].
* **3.3 Product Management:**
    * Add requirement: Define products with Name, Quantity (e.g., 10L, 20L), and Price[cite: 2]. (This aligns with existing text but adds detail from the sketch).
* **3.4 Customer Management:**
    * **Customer Profiles:** Expand details to include:
        * First Name, Last Name[cite: 11].
        * Mobile No, WhatsApp No[cite: 11].
        * Address Line 1, Address Line 2, City[cite: 11].
        * Associated Zone[cite: 11].
        * JAR Deposit details (Amount, Date, Type)[cite: 11].
        * ATM Deposit details (Amount, Date, Type)[cite: 11].
        * JAR Deposit Refund details (Date, Type)[cite: 11].
        * ATM Deposit Refund details (Date, Type)[cite: 11].
    * Add requirement: Search customers by A/c No, Mobile No, or Name[cite: 1, 7, 8, 10, 11].
* **3.5 Delivery Management:**
    * **Route Management:** Add "Remarks" field for Zones[cite: 2].
    * Add requirement: "Delivery Entry" screen allowing:
        * Search for customer[cite: 8].
        * View customer details[cite: 8].
        * Record delivered product and quantity[cite: 9].
        * Record returned quantity (e.g., empty jars)[cite: 9].
    * Add requirement: Differentiate between "Delivery" and "Pickup" transactions, potentially recording Product and Quantity for both[cite: 9].
    * Add requirement: Assign Delivery Boys to zones/routes[cite: 2].
* **3.6 Role and Access Management:**
    * The notes mention "Admin" role [cite: 2] and imply distinct views for different functions (Payment, Delivery Entry, Customer, etc.), reinforcing the need for role-based access.
* **3.7 Accounting Module:**
    * **Transaction Management:** Explicitly add:
        * Recording payments with Type (CASH, GPay, HDFC/Bank), Date, Reference (Received By/Ref No)[cite: 1].
        * Tracking ATM recharges (Amount, Date, Payment Type) linked to a customer[cite: 10].
        * Tracking JAR and ATM deposits and refunds[cite: 11].
    * Add new sub-section: **Expense Management** [cite: 4]
        * Record expenses with Type, Date, Amount, Source (From), Remarks, Note.
        * Optional: Field for "Approved by".
        * Distinguish between Cash/Bank sources[cite: 3].
    * Consider adding features related to ATM coin machine reconciliation if applicable[cite: 5, 6].

**3. Updates to Section 6 (User Scenarios)**

* Refine scenarios based on the specific screens sketched:
    * **Employee/Data Entry:** Add scenarios for recording payments[cite: 1], entering delivery details[cite: 8, 9], managing customer deposits/refunds[cite: 11], and recording expenses[cite: 4].
    * **Delivery Boy:** Clarify how they update status – possibly via the "Delivery Entry" screen or a simplified interface focusing on delivery/return quantities[cite: 9].

**4. Updates to Section 9 (Appendices)**

* **9.2 Wireframes & Mockups:** Add: "Handwritten sketches provided in `WhatsApp Image 2025-04-02 at 15.10.55.pdf` [cite: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] to be used as initial reference."

You can now copy these suggested points and integrate them into the relevant sections of your actual PRD document. Remember to clarify any ambiguities from the handwriting (like the exact payment types or the ATM coin function) with the owner.

---

### Database Design:
**Important Database Note:**  
This PRD is built around the existing MySQL database structure provided in the file `jeelaqua_water_db (1).sql`, which is actively used in the live system. **Strictly adhere to this structure without performing any destructive changes or modifications.** Any modifications should only involve additive features, logic, or implementations that comply with the PRD requirements, ensuring that the integrity of the live database is maintained.

---
### API Design:
MAKE REST APIs for all the features/modules/screens/requirements as per the PRD. so that we can use it in the frontend or in future for mobile app. Use ExpressJS.

---
### Frontend Design:
MAKE User friendly frontend design for this app as the owner is not a tech savvy person. so make it as simple as possible. Use NextJS.

