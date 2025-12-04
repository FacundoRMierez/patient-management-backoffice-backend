# Learning Path - Node.js Backend Development

## Conceptos Implementados en este Proyecto

### 1. **TypeScript**
- ✅ Tipado estático para prevenir errores
- ✅ Interfaces y tipos personalizados
- ✅ Configuración con `tsconfig.json`

**Qué aprendiste:**
- Cómo definir tipos para requests, responses y objetos de negocio
- Uso de tipos opcionales (`?`) y nullable
- Compilación de TypeScript a JavaScript

---

### 2. **Express.js - Framework Web**
- ✅ Creación de servidor HTTP
- ✅ Middlewares (funciones que procesan requests)
- ✅ Routing (definición de rutas)
- ✅ Manejo de errores centralizado

**Qué aprendiste:**
- `app.use()` para middlewares
- `router.get/post/put/delete()` para definir endpoints
- `req` (request), `res` (response), `next` (siguiente middleware)

---

### 3. **Arquitectura en Capas**

```
Controller → Service → Database
    ↓          ↓          ↓
  HTTP    Lógica de   Prisma ORM
Request   Negocio    (PostgreSQL)
```

**Controller** (`user.controller.ts`):
- Recibe HTTP requests
- Valida entrada
- Llama al Service
- Retorna HTTP response

**Service** (`user.service.ts`):
- Contiene lógica de negocio
- Interactúa con la base de datos
- Reutilizable (puede ser usado por múltiples controllers)

**Qué aprendiste:**
- Separación de responsabilidades
- Código más mantenible y testeable
- Patrón de diseño: **Service Layer Pattern**

---

### 4. **Prisma ORM**
- ✅ Definición de modelos con `schema.prisma`
- ✅ Migraciones automáticas
- ✅ Type-safety (autocompletado)
- ✅ Query builder intuitivo

**Qué aprendiste:**
```typescript
// Crear
await prisma.user.create({ data: {...} })

// Leer
await prisma.user.findUnique({ where: { id } })
await prisma.user.findMany()

// Actualizar
await prisma.user.update({ where: { id }, data: {...} })

// Eliminar
await prisma.user.delete({ where: { id } })
```

---

### 5. **Autenticación JWT**
- ✅ Registro de usuarios
- ✅ Login con email/password
- ✅ Generación de JWT tokens
- ✅ Middleware de autenticación
- ✅ Encriptación de contraseñas con bcrypt

**Flujo de autenticación:**
```
1. Usuario se registra → Password hasheado → Guardado en BD
2. Usuario hace login → Valida password → Genera JWT
3. Cliente guarda el token
4. Peticiones futuras → Envía token en header → Server valida token
```

**Qué aprendiste:**
- Diferencia entre hash (bcrypt) y encriptación
- Cómo funciona JWT (header + payload + signature)
- Autenticación stateless (sin sesiones en servidor)

---

### 6. **Validación con Zod**
- ✅ Schemas de validación
- ✅ Type inference (tipos automáticos)
- ✅ Mensajes de error personalizados

**Qué aprendiste:**
```typescript
const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

type Input = z.infer<typeof schema>; // Tipo automático!
```

---

### 7. **Middlewares**

**Authentication Middleware:**
```typescript
// Verifica que el usuario esté autenticado
authenticate → Valida JWT → Agrega user a req → next()
```

**Validation Middleware:**
```typescript
// Valida el body del request
validate(schema) → Parsea con Zod → Si falla, retorna 400
```

**Error Handler Middleware:**
```typescript
// Captura todos los errores
errorHandler → Procesa error → Retorna respuesta JSON
```

**Qué aprendiste:**
- Middlewares como "tubería" de procesamiento
- Orden de middlewares importa
- `next()` para pasar al siguiente middleware

---

### 8. **Patrones de Diseño Aplicados**

#### **Repository Pattern** (a través de Prisma)
- Abstracción de acceso a datos
- Facilita cambiar de base de datos

#### **Service Layer Pattern**
- Lógica de negocio separada de HTTP
- Reutilizable en diferentes contextos

#### **Singleton Pattern** (Prisma Client)
- Una sola instancia de conexión a BD
- Evita múltiples conexiones

#### **Factory Pattern** (JWT token generation)
- Centraliza la creación de tokens

**Qué aprendiste:**
- Patrones de diseño en la práctica
- Por qué son importantes
- Cómo mejoran el código

---

### 9. **Variables de Entorno**
- ✅ `.env` para configuración
- ✅ Separación de config por ambiente (dev, prod)
- ✅ Secretos y credenciales seguros

**Qué aprendiste:**
- Nunca hardcodear credenciales
- `.env` no se sube a git
- `dotenv` para cargar variables

---

### 10. **Gestión de Errores**
```typescript
try {
  // Operación riesgosa
} catch (error) {
  next(error); // Pasa al error handler
}
```

**Qué aprendiste:**
- Try-catch para manejo de errores
- Error handlers centralizados
- Respuestas de error consistentes

---

## Próximos Conceptos a Aprender

### Nivel Intermedio:
1. **Testing** - Jest, Supertest
2. **Logging** - Winston, Morgan
3. **Documentation** - Swagger/OpenAPI
4. **Rate Limiting** - Express Rate Limit
5. **CORS** - Configuración avanzada

### Nivel Avanzado:
1. **Caching** - Redis
2. **Message Queues** - Bull, RabbitMQ
3. **Microservices** - Arquitectura distribuida
4. **WebSockets** - Socket.io para tiempo real
5. **GraphQL** - Alternativa a REST

---

## Recursos Recomendados

### Documentación Oficial:
- [Node.js Docs](https://nodejs.org/docs/)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [Prisma Docs](https://www.prisma.io/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

### Tutoriales:
- [The Odin Project - Node.js](https://www.theodinproject.com/paths/full-stack-javascript/courses/nodejs)
- [freeCodeCamp - APIs and Microservices](https://www.freecodecamp.org/learn/back-end-development-and-apis/)

### YouTube Channels:
- Traversy Media
- The Net Ninja
- Fireship

---

## Ejercicios Sugeridos

1. **Agrega un campo "bio" al usuario**
   - Modifica el schema de Prisma
   - Actualiza validaciones
   - Crea migración

2. **Implementa paginación en GET /users**
   ```typescript
   GET /api/users?page=1&limit=10
   ```

3. **Crea un endpoint de búsqueda**
   ```typescript
   GET /api/users/search?q=john
   ```

4. **Agrega roles de usuario**
   - Crea middleware `authorize(['admin'])`
   - Restringe ciertas rutas a admins

5. **Implementa email verification**
   - Genera token de verificación
   - Endpoint para verificar email

---

¡Sigue experimentando y construyendo! 🚀
