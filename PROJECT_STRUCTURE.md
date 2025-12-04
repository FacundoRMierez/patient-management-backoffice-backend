```
📦 patient-management-backoffice-back
│
├── 📁 src/                          # Código fuente
│   ├── 📁 config/                   # Configuración
│   │   └── index.ts                 # Variables de entorno y config
│   │
│   ├── 📁 controllers/              # Controladores (HTTP handlers)
│   │   └── user.controller.ts       # CRUD de usuarios
│   │
│   ├── 📁 database/                 # Base de datos
│   │   └── prisma.ts                # Cliente de Prisma
│   │
│   ├── 📁 middlewares/              # Middlewares
│   │   ├── auth.middleware.ts       # Autenticación JWT
│   │   ├── error.middleware.ts      # Manejo de errores global
│   │   └── validation.middleware.ts # Validación con Zod
│   │
│   ├── 📁 routes/                   # Definición de rutas
│   │   ├── index.ts                 # Router principal
│   │   └── user.routes.ts           # Rutas de usuarios
│   │
│   ├── 📁 services/                 # Lógica de negocio
│   │   └── user.service.ts          # Servicio de usuarios
│   │
│   ├── 📁 validators/               # Esquemas de validación
│   │   └── user.validator.ts        # Validación de usuarios (Zod)
│   │
│   └── index.ts                     # Punto de entrada (servidor)
│
├── 📁 prisma/                       # Prisma ORM
│   └── schema.prisma                # Definición de modelos de BD
│
├── 📁 node_modules/                 # Dependencias (auto-generado)
│
├── 📄 .env                          # Variables de entorno (NO SUBIR A GIT)
├── 📄 .env.example                  # Ejemplo de variables de entorno
├── 📄 .gitignore                    # Archivos ignorados por Git
├── 📄 package.json                  # Dependencias y scripts
├── 📄 tsconfig.json                 # Configuración de TypeScript
├── 📄 README.md                     # Documentación principal
├── 📄 API_TESTING.md                # Guía de testing de API
└── 📄 LEARNING_GUIDE.md             # Guía de aprendizaje

```

## 🔄 Flujo de una Request

```
1. Cliente                →  POST /api/users/register
                             { email, password, ... }

2. Express Middleware    →  CORS, Body Parser

3. Route Handler         →  /api/users/register
                             user.routes.ts

4. Validation            →  validate(registerSchema)
                             ✓ Email válido?
                             ✓ Password > 8 chars?

5. Controller            →  userController.register()
                             Orquesta la operación

6. Service               →  userService.register()
                             ✓ Usuario existe?
                             ✓ Hash password
                             ✓ Create en BD
                             ✓ Generate JWT

7. Database              →  Prisma → PostgreSQL
                             INSERT INTO users...

8. Response              →  { message, data: { user, token } }
                             ← 201 Created

9. Error Handler         →  Si algo falla, captura y retorna error
                             ← 400/401/500 con mensaje

```

## 🗄️ Database Schema (Prisma)

```
┌─────────────────────────────────────┐
│             users                   │
├─────────────────────────────────────┤
│ id                  UUID (PK)       │
│ email               String (UNIQUE) │
│ password            String (HASHED) │
│ firstName           String          │
│ lastName            String          │
│ organizationName    String?         │
│ address             String?         │
│ phoneNumber         String?         │
│ role                String          │
│ isDeleted           Boolean         │
│ isApproved          Boolean         │
│ isActive            Boolean         │
│ emailVerified       Boolean         │
│ createdAt           DateTime        │
│ updatedAt           DateTime        │
│ lastLoginAt         DateTime?       │
└─────────────────────────────────────┘
```

## 🔐 Authentication Flow

```
┌──────────┐                   ┌──────────┐
│  Client  │                   │  Server  │
└─────┬────┘                   └─────┬────┘
      │                              │
      │  1. POST /register           │
      │  { email, password }         │
      │─────────────────────────────>│
      │                              │
      │                         2. Hash Password
      │                         3. Save to DB
      │                         4. Generate JWT
      │                              │
      │  5. { user, token }          │
      │<─────────────────────────────│
      │                              │
      │  6. Save token locally       │
      │  (localStorage/sessionStorage)
      │                              │
      │  7. GET /users/me            │
      │  Header: Authorization:      │
      │  Bearer <token>              │
      │─────────────────────────────>│
      │                              │
      │                         8. Verify JWT
      │                         9. Extract userId
      │                         10. Query DB
      │                              │
      │  11. { user data }           │
      │<─────────────────────────────│
      │                              │
```

## 📊 Technology Stack

```
┌─────────────────────────────────────────┐
│          Frontend (No incluido)         │
│     React/Vue/Angular + Axios/Fetch     │
└─────────────────┬───────────────────────┘
                  │ HTTP/HTTPS
                  │ JSON
┌─────────────────▼───────────────────────┐
│            Express.js Server            │
│  ┌────────────────────────────────────┐ │
│  │   Middlewares (CORS, Auth, etc)    │ │
│  └────────────────────────────────────┘ │
│  ┌────────────────────────────────────┐ │
│  │   Controllers (HTTP Handlers)      │ │
│  └────────────────────────────────────┘ │
│  ┌────────────────────────────────────┐ │
│  │   Services (Business Logic)        │ │
│  └────────────────────────────────────┘ │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│            Prisma ORM                   │
│     (Type-safe Database Client)         │
└─────────────────┬───────────────────────┘
                  │ SQL
┌─────────────────▼───────────────────────┐
│           PostgreSQL                    │
│      (Relational Database)              │
└─────────────────────────────────────────┘
```

## 🎯 Key Features Implemented

✅ User Registration & Login
✅ JWT Authentication
✅ Password Hashing (bcrypt)
✅ Input Validation (Zod)
✅ CRUD Operations
✅ Soft Delete
✅ User Approval System
✅ TypeScript Type Safety
✅ Error Handling
✅ Environment Configuration
✅ Database Migrations (Prisma)
