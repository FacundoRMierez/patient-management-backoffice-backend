# Multi-Role System - Quick Reference Card

## 🚀 Quick Start

### 1. Register User
```bash
POST http://localhost:3000/api/users/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe",
  "roles": ["PROFESSIONAL"]  # Optional, defaults to ["PROFESSIONAL"]
}
```

### 2. Login
```bash
POST http://localhost:3000/api/users/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response includes:**
- User object with `roles` array
- JWT token with roles in payload

---

## 🎭 Available Roles

| Role | Description | Auto-Approved |
|------|-------------|---------------|
| `SUPER_ADMIN` | Full system access | Yes |
| `PROFESSIONAL` | Healthcare professionals | No (needs approval) |
| `PATIENT` | Patients | Yes |

---

## 🔑 Permissions by Role

### SUPER_ADMIN (17 permissions)
```
✅ All permissions
user:*, patient:*, appointment:*, role:*, report:*
```

### PROFESSIONAL (9 permissions)
```
✅ user:read (own)
✅ patient:create, patient:read, patient:update
✅ appointment:create, appointment:read, appointment:update
```

### PATIENT (3 permissions)
```
✅ user:read (own)
✅ appointment:read (own)
✅ appointment:create
```

---

## 🛠️ Helper Functions

```typescript
import { 
  hasRole, 
  hasAnyRole, 
  hasPermission,
  getUserRoles,
  getUserPermissions,
  assignRole,
  removeRole 
} from '../utils/permissions.helper';

// Check if user has specific role
await hasRole(userId, 'SUPER_ADMIN')  // → true/false

// Check if user has any of these roles
await hasAnyRole(userId, ['SUPER_ADMIN', 'PROFESSIONAL'])  // → true/false

// Check if user has permission
await hasPermission(userId, 'user:delete')  // → true/false

// Get user's roles
await getUserRoles(userId)  // → [{ id, name, description }]

// Get user's permissions
await getUserPermissions(userId)  // → ['user:read', 'patient:create', ...]

// Assign role to user
await assignRole(userId, 'PROFESSIONAL', assignedByUserId)

// Remove role from user
await removeRole(userId, 'PATIENT')
```

---

## 🔒 Middleware Usage

```typescript
import { authorize, isSuperAdmin, isProfessionalOrAdmin } from '../middlewares/authorize.middleware';

// Require specific role
router.get('/admin', authorize(['SUPER_ADMIN']), controller.adminOnly);

// Allow multiple roles
router.get('/data', authorize(['SUPER_ADMIN', 'PROFESSIONAL']), controller.getData);

// Pre-built middleware
router.post('/approve', isSuperAdmin, controller.approveUser);
router.get('/profile', isProfessionalOrAdmin, controller.getProfile);
```

---

## 📋 API Endpoints

### Public Endpoints
```
POST   /api/users/register     - Register new user
POST   /api/users/login        - Login user
```

### Protected Endpoints (Any authenticated user)
```
GET    /api/users/me           - Get current user profile
PATCH  /api/users/:id/change-password - Change password (own)
```

### Super Admin Only
```
GET    /api/users              - Get all users
GET    /api/users/pending-approval - Get users pending approval
GET    /api/users/:id          - Get user by ID
PUT    /api/users/:id          - Update user
DELETE /api/users/:id          - Delete user (soft)
PATCH  /api/users/:id/approve  - Approve user registration
```

---

## 🧪 Testing Checklist

```bash
# 1. Create .http file or use Postman

# 2. Register test users
✅ Professional (default role)
✅ Super Admin (with roles: ["SUPER_ADMIN"])
✅ Multi-role user (with roles: ["PROFESSIONAL", "SUPER_ADMIN"])

# 3. Test login
✅ Verify response includes roles array
✅ Decode JWT to check roles in payload

# 4. Test authorization
✅ Try accessing /api/users without token → 401
✅ Try accessing /api/users with PROFESSIONAL → 403
✅ Try accessing /api/users with SUPER_ADMIN → 200
✅ Approve user as SUPER_ADMIN → 200
✅ Approve user as PROFESSIONAL → 403

# 5. Test unapproved user
✅ Register PROFESSIONAL user
✅ Try to login → Error: "pending approval"
✅ Have SUPER_ADMIN approve user
✅ Login again → Success
```

---

## ⚡ Common Patterns

### Register Professional (needs approval)
```json
{
  "email": "doctor@example.com",
  "password": "SecurePass123!",
  "firstName": "Dr. Jane",
  "lastName": "Smith",
  "professionalType": "PHYSICIAN",
  "licenseNumber": "MED-12345",
  "roles": ["PROFESSIONAL"]
}
```

### Register Super Admin (auto-approved)
```json
{
  "email": "admin@example.com",
  "password": "AdminPass123!",
  "firstName": "Admin",
  "lastName": "User",
  "roles": ["SUPER_ADMIN"]
}
```

### Register with Multiple Roles
```json
{
  "email": "hybrid@example.com",
  "password": "HybridPass123!",
  "firstName": "Hybrid",
  "lastName": "User",
  "roles": ["PROFESSIONAL", "SUPER_ADMIN"]
}
```

---

## 🔧 Troubleshooting

### Error: "Role X not found"
```bash
# Run seed script to populate roles
npm run prisma:seed
```

### Error: "Account pending approval"
```bash
# Option 1: Have super admin approve via API
PATCH /api/users/:userId/approve

# Option 2: Update directly in database
UPDATE users SET "isApproved" = true WHERE id = 'user-id';

# Option 3: Register as SUPER_ADMIN (auto-approved)
```

### Error: "Access denied"
```bash
# Check user roles
GET /api/users/me

# Verify token includes roles
# Decode JWT at jwt.io

# Check if route requires specific role
# See route definition in code
```

### User has no roles
```typescript
// Assign role manually
import { assignRole } from './utils/permissions.helper';
await assignRole(userId, 'PROFESSIONAL');
```

---

## 📊 Database Quick Queries

```sql
-- Get user with roles
SELECT u.email, r.name as role
FROM users u
JOIN user_roles ur ON u.id = ur."userId"
JOIN roles r ON ur."roleId" = r.id
WHERE u.email = 'user@example.com';

-- Get role permissions
SELECT r.name as role, p.name as permission
FROM roles r
JOIN role_permissions rp ON r.id = rp."roleId"
JOIN permissions p ON rp."permissionId" = p.id
WHERE r.name = 'SUPER_ADMIN';

-- Count users by role
SELECT r.name, COUNT(ur."userId") as user_count
FROM roles r
LEFT JOIN user_roles ur ON r.id = ur."roleId"
GROUP BY r.name;
```

---

## 📚 Related Documentation

- `docs/MULTI_ROLE_SYSTEM.md` - Complete guide
- `docs/MIGRATION_SUMMARY.md` - What changed
- `test-multi-role-api.http` - API test examples
- `ROLES_GUIDE.md` - Role descriptions

---

## 💡 Best Practices

1. ✅ Always assign at least one role to new users
2. ✅ Use `hasPermission()` for fine-grained checks
3. ✅ Log role assignments for audit trail
4. ✅ Re-login after role changes to refresh JWT
5. ✅ Validate user status before authorization
6. ✅ Use pre-built middleware when possible
7. ✅ Test all role combinations

---

## 🎯 Production Checklist

Before deploying:

- [ ] Seed roles and permissions in production DB
- [ ] Create initial super admin user
- [ ] Test authentication flow end-to-end
- [ ] Verify authorization on all protected routes
- [ ] Update API documentation for clients
- [ ] Configure JWT secret (strong, random)
- [ ] Set appropriate JWT expiration time
- [ ] Enable HTTPS in production
- [ ] Set up rate limiting
- [ ] Configure CORS properly
- [ ] Enable audit logging

---

## 🔗 Quick Links

```bash
# Server
http://localhost:3000

# API Base
http://localhost:3000/api

# Database UI (if running)
npx prisma studio

# View logs
npm run dev

# Run seed
npm run prisma:seed

# Generate Prisma Client
npm run prisma:generate
```

---

**Version:** 1.0.0  
**Last Updated:** 2024  
**Status:** ✅ Production Ready
