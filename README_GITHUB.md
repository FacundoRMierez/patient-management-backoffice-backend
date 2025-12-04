# 🏥 Patient Management System - Backend API

Sistema de gestión de pacientes con autenticación multi-rol, permisos granulares y documentación Swagger.

[![Node.js](https://img.shields.io/badge/Node.js-18.x-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/Express-4.21-lightgrey.svg)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-7.1-2D3748.svg)](https://www.prisma.io/)

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Stack Tecnológico](#-stack-tecnológico)
- [Inicio Rápido](#-inicio-rápido)
- [Documentación API](#-documentación-api)
- [Sistema de Roles](#-sistema-de-roles)
- [Variables de Entorno](#-variables-de-entorno)
- [Scripts Disponibles](#-scripts-disponibles)
- [Estructura del Proyecto](#-estructura-del-proyecto)

## ✨ Características

- 🔐 **Autenticación JWT** - Sistema seguro de tokens
- 👥 **Multi-Rol** - Usuarios pueden tener múltiples roles simultáneamente
- 🔑 **Permisos Granulares** - Control de acceso basado en permisos específicos
- 📚 **Documentación Swagger** - API completamente documentada e interactiva
- 🗄️ **PostgreSQL con Prisma** - ORM type-safe con migraciones
- ☁️ **Neon.tech** - Base de datos serverless en la nube
- ✅ **Validación con Zod** - Schemas de validación robustos
- 🔒 **Bcrypt** - Hashing seguro de contraseñas
- 🚀 **Hot Reload** - Desarrollo con ts-node-dev

## 🛠️ Stack Tecnológico

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| Node.js | 18.x | Runtime JavaScript |
| TypeScript | 5.9.3 | Tipado estático |
| Express | 4.21.2 | Framework web |
| Prisma | 7.1.0 | ORM y migraciones |
| PostgreSQL | 16 | Base de datos |
| JWT | 9.0.7 | Autenticación |
| Bcrypt | 5.1.1 | Hashing passwords |
| Zod | 3.23.8 | Validación |
| Swagger | 3.0 | Documentación API |

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js 18 o superior
- Cuenta en [Neon.tech](https://neon.tech) (base de datos gratuita)

### Instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/FacundoRMierez/patient-management-backoffice-backend.git
cd patient-management-backoffice-backend
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
# Crear archivo .env
cp .env.example .env

# Editar .env con tus credenciales de Neon.tech
```

4. **Ejecutar migraciones**
```bash
npm run prisma:migrate
```

5. **Seed de roles y permisos**
```bash
npm run prisma:seed
```

6. **Iniciar servidor**
```bash
npm run dev
```

El servidor estará corriendo en: **http://localhost:3000**

## 📚 Documentación API

### Swagger UI (Interactivo)

Accede a la documentación interactiva de Swagger:

```
http://localhost:3000/api-docs
```

### Endpoints Principales

| Método | Endpoint | Descripción | Auth | Roles |
|--------|----------|-------------|------|-------|
| POST | `/api/users/register` | Registrar nuevo usuario | No | - |
| POST | `/api/users/login` | Iniciar sesión | No | - |
| GET | `/api/users/me` | Perfil del usuario actual | Sí | Any |
| GET | `/api/users` | Listar todos los usuarios | Sí | SUPER_ADMIN |
| GET | `/api/users/:id` | Obtener usuario por ID | Sí | Any |
| PUT | `/api/users/:id` | Actualizar usuario | Sí | Own/Admin |
| DELETE | `/api/users/:id` | Eliminar usuario | Sí | SUPER_ADMIN |
| GET | `/api/users/pending-approval` | Usuarios pendientes | Sí | SUPER_ADMIN |
| PATCH | `/api/users/:id/approve` | Aprobar usuario | Sí | SUPER_ADMIN |
| POST | `/api/users/change-password` | Cambiar contraseña | Sí | Own |

### Ejemplo de Uso

**Registrar usuario:**
```bash
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!",
    "firstName": "John",
    "lastName": "Doe",
    "professionalType": "PSYCHOLOGIST",
    "roles": ["PROFESSIONAL"]
  }'
```

**Login:**
```bash
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!"
  }'
```

**Usar endpoint protegido:**
```bash
curl -X GET http://localhost:3000/api/users/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 👥 Sistema de Roles

### Roles Disponibles

#### 🔴 SUPER_ADMIN
- Control total del sistema
- Gestión de usuarios
- Aprobación de registros
- Asignación de roles

**Permisos (17):**
- `user:create`, `user:read`, `user:update`, `user:delete`
- `user:approve`, `role:assign`, `role:remove`
- `patient:*`, `appointment:*`, `report:read`

#### 🔵 PROFESSIONAL
- Gestión de pacientes
- Creación de citas
- Acceso limitado

**Permisos (9):**
- `user:read` (propio)
- `patient:create`, `patient:read`, `patient:update`
- `appointment:create`, `appointment:read`, `appointment:update`

#### 🟢 PATIENT
- Ver información propia
- Reservar citas

**Permisos (3):**
- `user:read` (propio)
- `appointment:read`, `appointment:create`

### Multi-Rol

Los usuarios pueden tener **múltiples roles** simultáneamente:

```json
{
  "email": "admin@example.com",
  "roles": ["SUPER_ADMIN", "PROFESSIONAL"]
}
```

## 🔐 Variables de Entorno

Crear archivo `.env` con:

```env
# Server
PORT=3000
NODE_ENV=development

# Database (Neon.tech)
DATABASE_URL="postgresql://username:password@host/database?sslmode=require"

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:3000,http://localhost:5173
```

## 📜 Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Inicia servidor con hot reload

# Base de datos
npm run prisma:generate  # Genera Prisma Client
npm run prisma:migrate   # Ejecuta migraciones
npm run prisma:seed      # Seed de roles y permisos
npm run prisma:studio    # Abre Prisma Studio (GUI)

# Build
npm run build            # Compila TypeScript
npm start                # Inicia servidor de producción
```

## 📁 Estructura del Proyecto

```
patient-management-backoffice-backend/
├── prisma/
│   ├── schema.prisma          # Modelos de base de datos
│   └── seed.ts                # Seed de roles y permisos
├── src/
│   ├── config/
│   │   ├── index.ts           # Configuración general
│   │   └── swagger.ts         # Configuración Swagger
│   ├── controllers/
│   │   └── user.controller.ts # Lógica de controladores
│   ├── database/
│   │   └── prisma.ts          # Cliente Prisma
│   ├── middlewares/
│   │   ├── auth.middleware.ts      # Autenticación JWT
│   │   ├── authorize.middleware.ts # Autorización por roles
│   │   ├── error.middleware.ts     # Manejo de errores
│   │   └── validation.middleware.ts# Validación Zod
│   ├── routes/
│   │   ├── index.ts           # Router principal
│   │   └── user.routes.ts     # Rutas de usuarios
│   ├── services/
│   │   └── user.service.ts    # Lógica de negocio
│   ├── utils/
│   │   └── permissions.helper.ts # Helpers de permisos
│   ├── validators/
│   │   └── user.validator.ts  # Schemas de validación
│   └── index.ts               # Punto de entrada
├── docs/
│   ├── MULTI_ROLE_SYSTEM.md   # Guía del sistema multi-rol
│   └── MIGRATION_SUMMARY.md   # Resumen de cambios
├── test-multi-role-api.http   # Tests HTTP
├── .env.example               # Ejemplo de variables
├── package.json               # Dependencias
├── tsconfig.json              # Config TypeScript
└── README.md                  # Este archivo
```

## 🧪 Testing

Usa el archivo `test-multi-role-api.http` con la extensión **REST Client** de VS Code:

1. Instala extensión REST Client
2. Abre `test-multi-role-api.http`
3. Click en "Send Request" sobre cada endpoint

O usa **Postman**, **Insomnia**, o **curl**.

## 🔧 Desarrollo

### Agregar un nuevo endpoint

1. **Crear ruta en `user.routes.ts`:**
```typescript
/**
 * @swagger
 * /api/users/custom:
 *   get:
 *     tags:
 *       - Users
 *     summary: Custom endpoint
 *     ...
 */
router.get('/custom', authenticate, controller.customMethod);
```

2. **Agregar método en `user.controller.ts`:**
```typescript
async customMethod(req: AuthRequest, res: Response) {
  const result = await this.userService.customLogic();
  res.json(result);
}
```

3. **Implementar lógica en `user.service.ts`:**
```typescript
async customLogic() {
  // Tu lógica aquí
  return data;
}
```

### Verificar permisos

```typescript
import { hasPermission, hasRole } from '../utils/permissions.helper';

if (await hasPermission(userId, 'user:delete')) {
  // Usuario tiene permiso
}

if (await hasRole(userId, 'SUPER_ADMIN')) {
  // Usuario es super admin
}
```

## 📖 Documentación Adicional

- [📘 Sistema Multi-Rol Completo](./docs/MULTI_ROLE_SYSTEM.md)
- [📋 Resumen de Migración](./docs/MIGRATION_SUMMARY.md)
- [🚀 Guía de Inicio Rápido](./QUICKSTART.md)
- [👥 Guía de Roles](./ROLES_GUIDE.md)

## 🤝 Contribuir

1. Fork el proyecto
2. Crea tu rama (`git checkout -b feature/amazing-feature`)
3. Commit tus cambios (`git commit -m 'Add amazing feature'`)
4. Push a la rama (`git push origin feature/amazing-feature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT.

## 👨‍💻 Autor

**Facundo R. Mierez**

- GitHub: [@FacundoRMierez](https://github.com/FacundoRMierez)

## 🙏 Agradecimientos

- [Neon.tech](https://neon.tech) - Base de datos serverless PostgreSQL
- [Prisma](https://prisma.io) - ORM moderno
- [Express](https://expressjs.com) - Framework web minimalista

---

⭐️ Si te gusta este proyecto, dale una estrella en GitHub!
