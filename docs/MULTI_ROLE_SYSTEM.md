# Multi-Role Permission System - Complete Guide

## Overview

The system has been upgraded from a single-role enum to a flexible multi-role permission architecture. This allows users to have multiple roles simultaneously and enables granular permission control.

## Architecture

### Database Schema

```
┌─────────┐       ┌──────────────┐       ┌──────┐
│  users  │──────▶│  user_roles  │◀──────│ roles│
└─────────┘       └──────────────┘       └──────┘
                                              │
                                              ▼
                                    ┌───────────────────┐
                                    │ role_permissions  │
                                    └───────────────────┘
                                              │
                                              ▼
                                    ┌─────────────┐
                                    │ permissions │
                                    └─────────────┐
```

### Tables

1. **users** - User accounts (no direct role field)
2. **roles** - Available roles (SUPER_ADMIN, PROFESSIONAL, PATIENT)
3. **permissions** - Granular permissions (user:create, user:read, etc.)
4. **user_roles** - Many-to-many relationship between users and roles
5. **role_permissions** - Many-to-many relationship between roles and permissions

## Roles

### SUPER_ADMIN
- Full system access
- Can manage all users
- Can approve/reject registrations
- Can assign/remove roles
- **Permissions:**
  - user:create, user:read, user:update, user:delete
  - user:approve, role:assign, role:remove
  - patient:create, patient:read, patient:update, patient:delete
  - appointment:create, appointment:read, appointment:update, appointment:delete
  - report:read

### PROFESSIONAL
- Can manage their own patients
- Can create appointments
- Limited user management
- **Permissions:**
  - user:read (own profile)
  - patient:create, patient:read, patient:update
  - appointment:create, appointment:read, appointment:update

### PATIENT
- Can view their own data
- Can book appointments
- **Permissions:**
  - user:read (own profile)
  - appointment:read (own), appointment:create

## API Changes

### Registration

**Old:**
```json
{
  "email": "user@example.com",
  "password": "pass",
  "role": "PROFESSIONAL"
}
```

**New:**
```json
{
  "email": "user@example.com",
  "password": "pass",
  "roles": ["PROFESSIONAL"]  // Array of roles
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "roles": ["PROFESSIONAL"],  // Array of role names
    ...
  },
  "token": "jwt-token-with-roles"
}
```

### Login

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "roles": ["PROFESSIONAL", "SUPER_ADMIN"],  // Multiple roles
    ...
  },
  "token": "jwt-token"
}
```

**JWT Payload:**
```json
{
  "userId": "uuid",
  "email": "user@example.com",
  "roles": ["PROFESSIONAL", "SUPER_ADMIN"],  // Roles included in token
  "iat": 1234567890,
  "exp": 1234567890
}
```

### Get User Responses

All user responses now include `roles` array:

```json
{
  "id": "uuid",
  "email": "user@example.com",
  "firstName": "John",
  "roles": ["PROFESSIONAL"],
  ...
}
```

## Code Usage

### Service Layer

```typescript
import { assignRole, removeRole, getUserRoles, hasRole, hasPermission } from '../utils/permissions.helper';

// Assign role during registration
const roles = data.roles || ['PROFESSIONAL'];
for (const roleName of roles) {
  await assignRole(user.id, roleName);
}

// Get user roles
const userRoles = await getUserRoles(userId);
// Returns: [{ id: 'role-id', name: 'PROFESSIONAL', ... }]

// Check if user has specific role
const isSuperAdmin = await hasRole(userId, 'SUPER_ADMIN');

// Check if user has permission
const canDeleteUsers = await hasPermission(userId, 'user:delete');
```

### Middleware

```typescript
import { authorize, isSuperAdmin } from '../middlewares/authorize.middleware';

// Require specific roles (user must have at least one)
router.get('/admin', authorize(['SUPER_ADMIN']), controller.adminOnly);

// Require multiple possible roles
router.get('/data', authorize(['SUPER_ADMIN', 'PROFESSIONAL']), controller.getData);

// Pre-built middleware
router.post('/approve', isSuperAdmin, controller.approveUser);
router.get('/profile', isProfessionalOrAdmin, controller.getProfile);
```

### Role Assignment (Manual)

```typescript
import { assignRole, removeRole, getRoleByName } from '../utils/permissions.helper';

// Assign role to user
await assignRole(userId, 'SUPER_ADMIN', assignedByUserId);

// Remove role from user
await removeRole(userId, 'PROFESSIONAL');

// Get role details
const role = await getRoleByName('SUPER_ADMIN');
// Returns: { id: 'role-id', name: 'SUPER_ADMIN', description: '...' }
```

### Permission Checking

```typescript
import { hasPermission, hasAnyRole, getUserPermissions } from '../utils/permissions.helper';

// Check specific permission
if (await hasPermission(userId, 'user:delete')) {
  // User can delete users
}

// Check if user has any of the roles
if (await hasAnyRole(userId, ['SUPER_ADMIN', 'PROFESSIONAL'])) {
  // User is either super admin or professional
}

// Get all user permissions
const permissions = await getUserPermissions(userId);
// Returns: ['user:read', 'user:create', 'patient:read', ...]
```

## Migration Notes

### Breaking Changes

1. ❌ **Removed:** `user.role` field (direct enum)
2. ✅ **Added:** `user.userRoles` relation (many-to-many)
3. ✅ **Added:** `roles` array in all user responses
4. ✅ **Updated:** JWT token includes roles array
5. ✅ **Updated:** Authorization middleware checks roles table

### Code Updates Required

- ✅ `user.validator.ts` - Changed `role` to `roles` array
- ✅ `user.service.ts` - Updated register/login/get methods
- ✅ `authorize.middleware.ts` - Rewritten for multi-role checking
- ✅ `permissions.helper.ts` - Created utility functions

### Database Migration

```bash
# 1. Generate migration
npm run prisma:migrate

# 2. Seed roles and permissions
npm run prisma:seed
```

## Testing

### Test File
Use `test-multi-role-api.http` for comprehensive API testing.

### Manual Testing Scenarios

1. **Register with default role:**
   - POST /api/users/register (without roles field)
   - Should assign PROFESSIONAL by default
   - Response includes `roles: ["PROFESSIONAL"]`

2. **Register with specific role:**
   - POST /api/users/register with `"roles": ["SUPER_ADMIN"]`
   - Response includes `roles: ["SUPER_ADMIN"]`

3. **Register with multiple roles:**
   - POST /api/users/register with `"roles": ["PROFESSIONAL", "SUPER_ADMIN"]`
   - Response includes both roles

4. **Login returns roles:**
   - POST /api/users/login
   - Response includes `roles` array
   - JWT token payload contains roles

5. **Authorization checks:**
   - GET /api/users/pending-approval (requires SUPER_ADMIN)
   - GET /api/users (requires SUPER_ADMIN)
   - Should return 403 for users without required role

## Future Enhancements

### Phase 2: Dynamic Permissions
- Admin UI for role management
- Assign/revoke permissions dynamically
- Custom role creation

### Phase 3: Hierarchical Roles
- Role inheritance
- Role priorities
- Composite permissions

### Phase 4: Audit Logging
- Track role assignments
- Log permission changes
- User activity monitoring

## Troubleshooting

### Common Issues

**Issue:** "Role X not found"
- **Solution:** Run `npm run prisma:seed` to populate roles

**Issue:** "User has no roles"
- **Solution:** Assign role using `assignRole(userId, 'PROFESSIONAL')`

**Issue:** "Authorization fails for valid user"
- **Solution:** Check if user.isApproved = true and user.isActive = true

**Issue:** "JWT token doesn't include roles"
- **Solution:** User might have logged in before role assignment. Login again.

## Reference

### Helper Functions

| Function | Description | Returns |
|----------|-------------|---------|
| `hasRole(userId, role)` | Check if user has specific role | boolean |
| `hasAnyRole(userId, roles[])` | Check if user has any role | boolean |
| `hasPermission(userId, perm)` | Check if user has permission | boolean |
| `getUserRoles(userId)` | Get all user roles | Role[] |
| `getUserPermissions(userId)` | Get all permissions | string[] |
| `assignRole(userId, role, by?)` | Assign role to user | UserRole |
| `removeRole(userId, role)` | Remove role from user | void |
| `getRoleByName(name)` | Get role details | Role |

### Middleware

| Middleware | Allowed Roles | Description |
|------------|---------------|-------------|
| `authorize(['SUPER_ADMIN'])` | Super Admin only | Strict admin access |
| `authorize(['PROFESSIONAL', 'SUPER_ADMIN'])` | Professional or Admin | Professional features |
| `isSuperAdmin` | Super Admin only | Predefined admin middleware |
| `isProfessionalOrAdmin` | Professional or Admin | Predefined professional middleware |

## Best Practices

1. **Default Role:** Always assign at least one role to new users
2. **Role Validation:** Validate role names exist before assignment
3. **Token Refresh:** After role changes, users should re-login
4. **Permission Checks:** Use `hasPermission()` for fine-grained control
5. **Audit Trail:** Log role assignments/removals with `assignedBy` field
6. **Testing:** Test all role combinations for authorization logic
7. **Documentation:** Keep role permissions documented and updated

## Security Considerations

- ✅ Roles are validated against database (not just JWT)
- ✅ Inactive/deleted users cannot pass authorization
- ✅ Unapproved users cannot login
- ✅ JWT includes roles for faster checks
- ✅ Database enforces unique role assignments (user-role pairs)
- ✅ Cascade deletes maintain referential integrity
- ⚠️ **Important:** Always validate user status (isActive, isDeleted, isApproved) before authorization
