# API Testing - Thunder Client Collection

## Setup
- Base URL: `http://localhost:3000`
- Replace `{{token}}` with your JWT token after login

---

## 1. Health Check
```http
GET http://localhost:3000/api/health
```

---

## 2. Register User
```http
POST http://localhost:3000/api/users/register
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "Test1234",
  "firstName": "John",
  "lastName": "Doe",
  "organizationName": "Test Hospital",
  "address": "123 Main St",
  "phoneNumber": "+1234567890"
}
```

---

## 3. Login
```http
POST http://localhost:3000/api/users/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "Test1234"
}
```

**Save the token from response!**

---

## 4. Get Current User Profile
```http
GET http://localhost:3000/api/users/me
Authorization: Bearer {{token}}
```

---

## 5. Get All Users
```http
GET http://localhost:3000/api/users
Authorization: Bearer {{token}}
```

---

## 6. Get User by ID
```http
GET http://localhost:3000/api/users/{userId}
Authorization: Bearer {{token}}
```

---

## 7. Update User
```http
PUT http://localhost:3000/api/users/{userId}
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "firstName": "Jane",
  "phoneNumber": "+9876543210"
}
```

---

## 8. Change Password
```http
POST http://localhost:3000/api/users/change-password
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "currentPassword": "Test1234",
  "newPassword": "NewPassword123"
}
```

---

## 9. Approve User
```http
PATCH http://localhost:3000/api/users/{userId}/approve
Authorization: Bearer {{token}}
```

---

## 10. Delete User (Soft Delete)
```http
DELETE http://localhost:3000/api/users/{userId}
Authorization: Bearer {{token}}
```

---

## Expected Response Formats

### Success Response
```json
{
  "message": "Operation successful",
  "data": { /* response data */ }
}
```

### Error Response
```json
{
  "error": "Error message",
  "details": [ /* validation errors if applicable */ ]
}
```

---

## Testing Flow

1. **Register** a new user → Save the token
2. **Login** with credentials → Verify token
3. **Get profile** using token → Confirm user data
4. **Update profile** → Verify changes
5. **Get all users** → See the list
6. **Change password** → Test authentication
7. **Approve user** → Update status
8. **Delete user** → Test soft delete
