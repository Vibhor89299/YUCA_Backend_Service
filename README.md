# 🛍️ E-Commerce Backend Service

A robust Node.js backend service for an e-commerce platform with authentication, order management, and admin functionality.

## 📋 Table of Contents

- [Features](#-features)
- [Authentication](#-authentication)
- [API Endpoints](#-api-endpoints)
  - [Authentication Routes](#authentication-routes)
  - [Order Routes](#order-routes)
  - [Admin/Product Routes](#adminproduct-routes)
- [Getting Started](#-getting-started)
- [Usage Examples](#-usage-examples)
- [Security](#-security)
- [Notes](#-notes)

## ✨ Features

- 🔐 **JWT Authentication** - Secure user authentication and authorization
- 👤 **User Management** - User registration and login
- 🛒 **Order Management** - Create and track orders
- 📦 **Product Management** - Admin product CRUD operations
- 🔔 **Low Stock Alerts** - Inventory monitoring
- 🛡️ **Role-based Access** - Admin and user permissions
- ✅ **Input Validation** - Request data validation

## 🔐 Authentication

All protected routes require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

Admin-only routes require the user to have `isAdmin: true` in their profile.

## 🚀 API Endpoints

### Authentication Routes
> **Base URL:** `/api/auth`

#### Register User
```http
POST /register
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "isAdmin": false
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

#### Login User
```http
POST /login
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

---

### Order Routes
> **Base URL:** `/api/orders`

#### Create Order
```http
POST /
```
🔒 **Protected Route** - Requires Authentication

**Request Body:**
```json
{
  "items": [
    {
      "productId": "product_id_1",
      "quantity": 2,
      "price": 29.99
    },
    {
      "productId": "product_id_2",
      "quantity": 1,
      "price": 49.99
    }
  ],
  "totalPrice": 109.97
}
```

#### Get My Orders
```http
GET /my
```
🔒 **Protected Route** - Returns orders for the authenticated user

#### Get All Orders
```http
GET /
```
👑 **Admin Only** - Returns all orders with user and product details

#### Update Order Status
```http
PUT /:id
```
👑 **Admin Only** - Updates order status

**Request Body:**
```json
{
  "status": "shipped"
}
```

---

### Admin/Product Routes
> **Base URL:** `/api/admin`

#### Create Product
```http
POST /products
```
👑 **Admin Only**

**Request Body:**
```json
{
  "name": "Wireless Headphones",
  "description": "High-quality wireless headphones with noise cancellation",
  "price": 199.99,
  "countInStock": 50,
  "image": "https://example.com/image.jpg",
  "category": "Electronics"
}
```

#### Get All Products
```http
GET /products
```
👑 **Admin Only** - Returns all products in the system

#### Update Product
```http
PUT /products/:id
```
👑 **Admin Only**

**Request Body:**
```json
{
  "name": "Updated Product Name",
  "price": 249.99,
  "countInStock": 25
}
```

#### Low Stock Alert
```http
GET /low-stock
```
👑 **Admin Only** - Returns products with `countInStock < 5`

---

## 🛠️ Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd backend-service
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
# Create .env file
JWT_SECRET=your_jwt_secret_key
MONGODB_URI=mongodb://localhost:27017/ecommerce
PORT=5000
```

4. Start the server
```bash
npm start
```

## 💡 Usage Examples

### Complete User Flow

1. **Register a new user:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alice Smith",
    "email": "alice@example.com",
    "password": "password123"
  }'
```

2. **Login to get JWT token:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@example.com",
    "password": "password123"
  }'
```

3. **Create an order:**
```bash
curl -X POST http://localhost:5000/api/orders \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [{"productId": "123", "quantity": 2, "price": 25.99}],
    "totalPrice": 51.98
  }'
```

### Admin Operations

1. **Create a product (Admin only):**
```bash
curl -X POST http://localhost:5000/api/admin/products \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Gaming Mouse",
    "description": "RGB Gaming Mouse",
    "price": 79.99,
    "countInStock": 100,
    "category": "Gaming"
  }'
```

2. **Check low stock items:**
```bash
curl -X GET http://localhost:5000/api/admin/low-stock \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

## 🔒 Security

- **JWT Authentication:** All sensitive routes are protected with JWT tokens
- **Input Validation:** Authentication routes include comprehensive validation
- **Role-based Access:** Admin privileges required for administrative operations
- **Password Security:** Passwords should be hashed (implement bcrypt in your controllers)

## 📝 Notes

- All protected routes require a valid JWT token in the Authorization header
- Admin-only routes require `isAdmin: true` in the user profile
- Input validation is performed on authentication routes
- For image uploads, consider implementing multer or cloud storage integration
- Error handling should be implemented in all controllers
- Consider implementing rate limiting for production use

## 🚧 Future Enhancements

- [ ] Image upload functionality for products
- [ ] Email notifications for orders
- [ ] Product search and filtering
- [ ] Order tracking system
- [ ] Payment gateway integration
- [ ] API rate limiting
- [ ] Comprehensive error handling
- [ ] API documentation with Swagger