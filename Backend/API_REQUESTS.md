# API Requests - The Saki Jewels Backend

**Base URL:** `http://localhost:5000` (adjust port as needed)

---

## Authentication Routes

### 1. Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "Password123!",
    "phone": "9876543210"
  }'
```

### 2. Login User
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "Password123!"
  }'
```

---

## Product Routes

### 1. Get All Products
```bash
curl -X GET http://localhost:5000/api/products
```

### 2. Get Product by ID
```bash
curl -X GET http://localhost:5000/api/products/507f1f77bcf86cd799439011
```

### 3. Create Product (Admin Only)
```bash
curl -X POST http://localhost:5000/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Gold Ring",
    "description": "Beautiful gold ring",
    "price": 15000,
    "image": "ring.jpg",
    "category": "rings",
    "stock": 50
  }'
```

### 4. Update Product (Admin Only)
```bash
curl -X PUT http://localhost:5000/api/products/507f1f77bcf86cd799439011 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Gold Ring Updated",
    "price": 16000,
    "stock": 45
  }'
```

### 5. Delete Product (Admin Only)
```bash
curl -X DELETE http://localhost:5000/api/products/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Address Routes (Auth Required)

### 1. Add Address
```bash
curl -X POST http://localhost:5000/api/address \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "street": "123 Main Street",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA",
    "phoneNumber": "9876543210",
    "isDefault": false
  }'
```

### 2. Get All Addresses
```bash
curl -X GET http://localhost:5000/api/address \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 3. Update Address
```bash
curl -X PUT http://localhost:5000/api/address/507f1f77bcf86cd799439011 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "street": "456 New Street",
    "city": "Los Angeles",
    "state": "CA",
    "zipCode": "90001",
    "country": "USA",
    "phoneNumber": "9876543211"
  }'
```

### 4. Set Default Address
```bash
curl -X PUT http://localhost:5000/api/address/default/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 5. Delete Address
```bash
curl -X DELETE http://localhost:5000/api/address/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Cart Routes (Auth Required)

### 1. Add to Cart
```bash
curl -X POST http://localhost:5000/api/cart/add \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "productId": "507f1f77bcf86cd799439011",
    "quantity": 2
  }'
```

### 2. Get Cart
```bash
curl -X GET http://localhost:5000/api/cart \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 3. Update Cart Item
```bash
curl -X PUT http://localhost:5000/api/cart/update \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "productId": "507f1f77bcf86cd799439011",
    "quantity": 3
  }'
```

### 4. Remove from Cart
```bash
curl -X DELETE http://localhost:5000/api/cart/remove/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Wishlist Routes (Auth Required)

### 1. Add to Wishlist
```bash
curl -X POST http://localhost:5000/api/wishlist/add \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "productId": "507f1f77bcf86cd799439011"
  }'
```

### 2. Get Wishlist
```bash
curl -X GET http://localhost:5000/api/wishlist \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 3. Remove from Wishlist
```bash
curl -X DELETE http://localhost:5000/api/wishlist/remove/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Order Routes

### 1. Place Order (Auth Required)
```bash
curl -X POST http://localhost:5000/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "addressId": "507f1f77bcf86cd799439011",
    "paymentMethod": "credit_card",
    "items": [
      {
        "productId": "507f1f77bcf86cd799439011",
        "quantity": 2,
        "price": 15000
      }
    ],
    "totalAmount": 50000
  }'
```

### 2. Get User's Orders (Auth Required)
```bash
curl -X GET http://localhost:5000/api/orders/my-orders \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 3. Get All Orders (Admin Only)
```bash
curl -X GET http://localhost:5000/api/orders \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```   

### 4. Update Order Status (Admin Only)
```bash
curl -X PUT http://localhost:5000/api/orders/507f1f77bcf86cd799439011 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "status": "shipped"
  }'
```

---

## Notes for Testing

1. **JWT Token**: Replace `YOUR_JWT_TOKEN` with an actual token obtained from the login endpoint
2. **ObjectId**: Replace all `507f1f77bcf86cd799439011` with actual MongoDB ObjectIds from your database
3. **Admin Role**: Ensure the token belongs to an admin user for admin-only routes
4. **Postman**: You can import these requests into Postman for easier testing
5. **Environment Variables**: Consider setting up environment variables for base URL and tokens

---

## Expected Response Formats

### Success Response (200)
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

### Error Response (4xx/5xx)
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error"
}
```
