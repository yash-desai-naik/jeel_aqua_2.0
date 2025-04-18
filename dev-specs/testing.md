Great! Having Swagger documentation makes API testing much easier. Let me provide you with a more streamlined approach using the Swagger UI.

# Testing Jeel Aqua Water Supply Dashboard APIs with Swagger

## 1. Access Swagger Documentation

1. Open your browser and navigate to:
   ```
   http://localhost:3001/api-docs
   ```

2. This will display the interactive Swagger UI with all available endpoints organized by tags.

## 2. Testing Flow with Swagger

### Step 1: Authentication

1. In Swagger UI, find the **Authentication** section
2. Expand the `POST /api/auth/login` endpoint
3. Click "Try it out"
4. Enter the following JSON in the request body:
   ```json
   {
     "phone": "0000000000",
     "password": "admin123"
   }
   ```
5. Click "Execute"
6. Copy the JWT token from the response

### Step 2: Authorize Swagger

1. At the top of the Swagger UI, click the "Authorize" button
2. In the authorization popup, enter:
   ```
   Bearer YOUR_JWT_TOKEN
   ```
   (Replace YOUR_JWT_TOKEN with the token you copied)
3. Click "Authorize" and then "Close"

Now all your API requests will automatically include the authorization header.


Here are the exact role IDs and their corresponding roles:
id: 1 - "admin"
id: 2 - "user"
id: 3 - "delivery boy"


### Step 3: Test Core Entity Management

#### User Management
1. Expand the **Users** section
2. Test the following endpoints in order:
   - `GET /api/users/me` - Get your profile ----------- FIXED (Token ID Mismatch) DONE
   - `GET /api/users` - List all users ------------DONE (this endpoint also have role wise filter)
   - `POST /api/users` - Create a new user ------------DONE
   - `GET /api/users/{id}` - Get a specific user ------------ FIXED(Swagger issue)DONE
   - `PUT /api/users/{id}` - Update a user ------------ FIXED(Swagger issue)DONE
   - `DELETE /api/users/{id}` - Delete a user ------------FIXED(Swagger issue)DONE

#### Role Management
1. Expand the **Roles** section
2. Test the following endpoints:
   - `GET /api/roles` - List all roles  ----------------- DONE
   - `POST /api/roles` - Create a new role ----------------DONE
   - `GET /api/roles/{id}` - Get a specific role ------------------ DONE
   - `PUT /api/roles/{id}` - Update a role ------------- DONE
   - `DELETE /api/roles/{id}` - Delete a role --------------- DONE

#### Zone Management
1. Expand the **Zones** section
2. Test the following endpoints:
   - `GET /api/zones` - List all zones  ------------------- DONE
   - `POST /api/zones` - Create a new zone ------------------- DONE
   - `GET /api/zones/{id}` - Get a specific zone ------------------- DONE
   - `PUT /api/zones/{id}` - Update a zone ---------------- DONE
   - `DELETE /api/zones/{id}` - Delete a zone ----------------- DONE

#### Society Management
1. Expand the **Societies** section
2. Test the following endpoints:
   - `GET /api/societies` - List all societies --------------- FIXED (filter by zoneId had issue) DONE (this endpoint has zone wise filter too)
   - `POST /api/societies` - Create a new society ----------------- FIXED--------- DONE
            Issue: The deleted_at column rejected NULL and zero-timestamps, requiring a valid epoch timestamp ('1970-01-01 00:00:01') for successful insertion.
   - `GET /api/societies/{id}` - Get a specific society -------------- DONE
   - `PUT /api/societies/{id}` - Update a society ------------ DONE
   - `DELETE /api/societies/{id}` - Delete a society ------------------ DONE

#### Service Management
1. Expand the **Services** section
2. Test the following endpoints:
   - `GET /api/services` - List all services ------------------------- DONE
   - `POST /api/services` - Create a new service ------------------------ FIXED (Swagger issue) DONE
   - `GET /api/services/{id}` - Get a specific service -------------------------- FIXED (Swagger issue) DONE
   - `PUT /api/services/{id}` - Update a service ------------------------- DONE
   - `DELETE /api/services/{id}` - Delete a service -------------------------- DONE

#### Measure Management
1. Expand the **Measures** section
2. Test the following endpoints:
   - `GET /api/measures` - List all measures  -------------------------- DONE
   - `POST /api/measures` - Create a new measure -------------------------- DONE
   - `GET /api/measures/{id}` - Get a specific measure -------------------------- DONE
   - `PUT /api/measures/{id}` - Update a measure -------------------------- DONE
   - `DELETE /api/measures/{id}` - Delete a measure -------------------------- DONE

### Step 4: Test Business Logic

#### Order Management
1. Expand the **Orders** section
2. Test the following endpoints:
   - `GET /api/orders` - List all orders
   - `POST /api/orders` - Create a new order
   - `GET /api/orders/{id}` - Get a specific order
   - `PUT /api/orders/{id}` - Update an order
   - `DELETE /api/orders/{id}` - Delete an order
   - `GET /api/orders/user/{userId}` - Get orders for a specific user

#### Delivery Management
1. Expand the **Deliveries** section
2. Test the following endpoints:
   - `GET /api/deliveries` - List all deliveries
   - `POST /api/deliveries` - Create a new delivery
   - `GET /api/deliveries/{id}` - Get a specific delivery
   - `PUT /api/deliveries/{id}` - Update a delivery
   - `DELETE /api/deliveries/{id}` - Delete a delivery
   - `GET /api/deliveries/order/{orderId}` - Get deliveries for a specific order

#### Payment Management
1. Expand the **Payments** section
2. Test the following endpoints:
   - `GET /api/payments` - List all payments
   - `POST /api/payments` - Create a new payment
   - `GET /api/payments/{id}` - Get a specific payment
   - `GET /api/payments/user/{userId}` - Get payments for a specific user

#### Expense Management
1. Expand the **Expenses** section
2. Test the following endpoints:
   - `GET /api/expenses` - List all expenses
   - `POST /api/expenses` - Create a new expense
   - `GET /api/expenses/{id}` - Get a specific expense
   - `PUT /api/expenses/{id}` - Update an expense
   - `DELETE /api/expenses/{id}` - Delete an expense

#### Order Status Management
1. Expand the **Order Statuses** section
2. Test the following endpoint:
   - `GET /api/order-statuses` - List all order statuses

### Step 5: Test Reporting

1. Expand the **Reports** section
2. Test the following endpoints:
   - `GET /api/reports/summary` - Get dashboard summary
   - `GET /api/reports/sales` - Get sales report (with date parameters)
   - `GET /api/reports/expenses` - Get expenses report (with date parameters)
   - `GET /api/reports/invoice/{userId}` - Get invoice data for a user

### Step 6: Test Mock Endpoints

1. Expand the **Mocks** section
2. Test the following endpoint:
   - `GET /api/mocks` - Get mock data

## 3. Testing Tips for Swagger

1. **Request Bodies**:
   - Swagger provides example request bodies for each endpoint
   - Modify these examples as needed for your test cases
   - For required fields, make sure to provide valid values

2. **Path Parameters**:
   - For endpoints with path parameters (e.g., `{id}`), use actual IDs from your database
   - You can get these IDs by first listing all entities and then using an ID from the response

3. **Query Parameters**:
   - For endpoints with query parameters (e.g., date ranges), use valid date formats
   - Example: `2024-07-01` for startDate and `2024-07-31` for endDate

4. **Response Codes**:
   - Check the response codes to ensure they match the expected behavior
   - 200/201 for successful operations
   - 400 for validation errors
   - 401 for unauthorized access
   - 403 for forbidden access
   - 404 for not found
   - 500 for server errors

5. **Response Bodies**:
   - Verify that the response bodies contain the expected data
   - Check for proper formatting and data types

6. **Error Handling**:
   - Test with invalid data to ensure proper error handling
   - Verify that appropriate error messages are returned

## 4. Complete Workflow Testing

To test a complete business workflow, follow these steps:

1. **Create a User**:
   - Use the `POST /api/users` endpoint to create a new user
   - Save the user ID from the response

2. **Create an Order**:
   - Use the `POST /api/orders` endpoint to create an order for the user
   - Save the order ID from the response

3. **Create a Delivery**:
   - Use the `POST /api/deliveries` endpoint to create a delivery for the order
   - Save the delivery ID from the response

4. **Update Delivery Status**:
   - Use the `PUT /api/deliveries/{id}` endpoint to update the delivery status

5. **Record a Payment**:
   - Use the `POST /api/payments` endpoint to record a payment for the user

6. **Generate an Invoice**:
   - Use the `GET /api/reports/invoice/{userId}` endpoint to generate an invoice for the user

7. **View Reports**:
   - Use the reporting endpoints to view sales and expense reports

This approach using Swagger UI will help you systematically test all the APIs in the Jeel Aqua Water Supply Dashboard. The interactive nature of Swagger makes it easy to understand the API structure and test different scenarios.
