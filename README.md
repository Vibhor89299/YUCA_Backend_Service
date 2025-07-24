# 🛍️ Yuca Lifestyle - E-Commerce Backend

A robust Node.js backend service for the Yuca Lifestyle e-commerce platform with authentication, product management, order processing, and admin functionality.

## 📋 Table of Contents

- [Features](#-features)
- [Authentication](#-authentication)
- [API Endpoints](#-api-endpoints)
  - [Authentication Routes](#authentication-routes)
  - [Product Routes](#product-routes)
  - [Cart Routes](#cart-routes)
  - [Order Routes](#order-routes)
  - [Admin Routes](#admin-routes)
- [Getting Started](#-getting-started)
- [Testing](#-testing)
- [Security](#-security)
- [Deployment](#-deployment)
- [License](#-license)

## ✨ Features

- 🔐 **JWT Authentication** - Secure user authentication and authorization
- 👤 **User Management** - User registration, login, and profile management
- 🛒 **Shopping Cart** - Add, update, and remove items with inventory validation
- 📦 **Product Management** - Comprehensive product CRUD operations
- 📊 **Inventory Management** - Real-time stock tracking and updates
- 📦 **Order Processing** - Create and track orders with inventory validation
- 🔔 **Low Stock Alerts** - Monitor and get alerts for low inventory
- 🛡️ **Role-based Access** - Admin and user permissions
- ✅ **Input Validation** - Robust request data validation
- 🚀 **RESTful API** - Clean and consistent API design

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
  "password": "password123"
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
  "password": "password123"
}
```

### Product Routes
> **Base URL:** `/api/products`

#### Get All Products
```http
GET /
```

**Query Parameters:**
- `page` - Page number (default: 1)
- `keyword` - Search term
- `category` - Filter by category

#### Get Product by ID
```http
GET /:id
```

### Cart Routes
> **Base URL:** `/api/cart`

#### Add Item to Cart
```http
POST /
```

**Request Body:**
```json
{
  "productId": "60d5ec9f8f9b8b3e8c9b5b5b",
  "quantity": 1
}
```

### Order Routes
> **Base URL:** `/api/orders`

#### Create Order
```http
POST /
```

**Request Body:**
```json
{
  "orderItems": [
    {
      "product": "60d5ec9f8f9b8b3e8c9b5b5b",
      "quantity": 2,
      "price": 99.99
    }
  ],
  "shippingAddress": {
    "address": "123 Main St",
    "city": "New York",
    "postalCode": "10001",
    "country": "USA"
  },
  "paymentMethod": "PayPal",
  "itemsPrice": 199.98,
  "taxPrice": 23.99,
  "shippingPrice": 10.99,
  "totalPrice": 234.96
}
```

### Admin Routes
> **Base URL:** `/api/admin`

#### Create Product (Admin Only)
```http
POST /products
```

**Request Body:**
```json
{
  "name": "Premium Headphones",
  "description": "High-quality wireless headphones with noise cancellation",
  "price": 199.99,
  "countInStock": 15,
  "category": "Electronics",
  "image": "/images/headphones.jpg"
}
```

#### Update Product (Admin Only)
```http
PUT /products/:id
```

**Request Body:**
```json
{
  "name": "Updated Headphones",
  "price": 179.99,
  "countInStock": 10
}
```

#### Update Product Inventory (Admin Only)
```http
PUT /products/:id/inventory
```

**Request Body:**
```json
{
  "countInStock": 25
}
```

#### Get Low Stock Products (Admin Only)
```http
GET /low-stock
```

**Response:**
```json
{
  "count": 3,
  "products": [
    {
      "_id": "60d5ec9f8f9b8b3e8c9b5b5b",
      "name": "Wireless Earbuds",
      "countInStock": 2
    }
  ]
}
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/yuca-lifestyle-backend.git
   cd yuca-lifestyle-backend
   ```

2. Install dependencies
   ```bash
   npm install
   # or
   yarn install
   ```

3. Create a `.env` file in the root directory and add your environment variables:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/yuca_lifestyle
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRE=30d
   JWT_COOKIE_EXPIRE=30
   ```

4. Start the development server
   ```bash
   npm run dev
   # or
   yarn dev
   ```

## 🧪 Testing

To run the test suite, first make sure you have a test database set up and update the `.env.test` file with your test database credentials.

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate test coverage report
npm run test:coverage
```

## 🔒 Security

- All API routes are protected with JWT authentication
- Role-based access control for admin routes
- Input validation on all user inputs
- Helmet.js for setting secure HTTP headers
- CORS enabled for cross-origin requests
- Rate limiting to prevent brute force attacks
- Data sanitization to prevent NoSQL injection
- Secure password hashing with bcrypt

## 🚀 Deployment

### Production

1. Set up your production environment variables in your hosting platform
2. Build the application:
   ```bash
   npm run build
   ```
3. Start the production server:
   ```bash
   npm start
   ```

### Docker

1. Build the Docker image:
   ```bash
   docker build -t yuca-lifestyle-backend .
   ```

2. Run the container:
   ```bash
   docker run -p 5000:5000 --env-file .env yuca-lifestyle-backend
   ```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📝 Notes

- The API follows RESTful principles
- All responses are in JSON format
- Error responses include a message and error details when applicable
- Pagination is implemented for list endpoints
- API versioning is planned for future updates

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