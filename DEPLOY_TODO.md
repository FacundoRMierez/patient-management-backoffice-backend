# ✅ TODO: Deployment en Vercel

## 🎯 Próximos Pasos para Deploy

### 1️⃣ Variables de Entorno en Vercel

Cuando importes el proyecto en Vercel, configura estas variables:

```
DATABASE_URL = (Copiar de Neon.tech - pooled connection)
JWT_SECRET = (Generar secreto fuerte de 32+ caracteres)
JWT_EXPIRES_IN = 7d
NODE_ENV = production
PORT = 3000
CORS_ORIGIN = (URL de tu frontend cuando lo tengas)
```

### 2️⃣ Generar JWT Secret Seguro

Ejecuta en PowerShell:
```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 40 | % {[char]$_})
```

O usa este ejemplo (CAMBIAR en producción):
```
aB3dE7fG9hJ2kL5mN8pQ1rS4tU6vW0xY9zA
```

### 3️⃣ Neon.tech Database URL

Tu connection string debe verse así:
```
postgresql://username:password@ep-xxx-xxx.us-east-1.aws.neon.tech/patient_management?sslmode=require
```

**Importante:** Usa la "Pooled connection" de Neon.tech

### 4️⃣ Después del Deploy

Una vez que Vercel termine de deployar:

```bash
# 1. Instalar Vercel CLI (si no lo tienes)
npm install -g vercel

# 2. Login
vercel login

# 3. Link al proyecto
vercel link

# 4. Ejecutar migraciones
vercel env pull .env.production
npx prisma migrate deploy

# 5. Seed (primera vez solamente)
# Editar prisma/seed.ts para usar process.env.DATABASE_URL
# Luego ejecutar localmente apuntando a producción
```

### 5️⃣ Verificar Deploy

Visita estas URLs (reemplaza con tu dominio):

- **API:** `https://your-app.vercel.app/`
- **Health:** `https://your-app.vercel.app/api/health`
- **Swagger:** `https://your-app.vercel.app/api-docs`

### 6️⃣ Primer Usuario Super Admin

Después de seed, registra un super admin:

```bash
curl -X POST https://your-app.vercel.app/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@yourcompany.com",
    "password": "SecureAdminPass123!",
    "firstName": "Admin",
    "lastName": "System",
    "roles": ["SUPER_ADMIN"]
  }'
```

Luego aprueba manualmente en la base de datos:
```sql
UPDATE users SET is_approved = true WHERE email = 'admin@yourcompany.com';
```

O crea el admin directamente en el seed.

---

## 📝 Checklist

- [ ] Repository pusheado a GitHub ✅ (ya está)
- [ ] Cuenta en Vercel creada
- [ ] Base de datos en Neon.tech creada
- [ ] DATABASE_URL copiado
- [ ] JWT_SECRET generado
- [ ] Proyecto importado en Vercel
- [ ] Variables de entorno configuradas
- [ ] Deploy exitoso
- [ ] Migraciones ejecutadas
- [ ] Seed ejecutado
- [ ] Primer admin creado
- [ ] Endpoints funcionando
- [ ] Swagger docs accesible

---

## 🔗 Links Útiles

- **GitHub Repo:** https://github.com/FacundoRMierez/patient-management-backoffice-backend
- **Neon.tech:** https://neon.tech
- **Vercel:** https://vercel.com
- **Guía completa:** Ver `VERCEL_DEPLOY.md`

---

## ⚠️ Importante

1. **NUNCA** commitees el archivo `.env` (ya está en .gitignore)
2. Cambia `JWT_SECRET` en producción
3. Usa CORS restrictivo en producción
4. El primer usuario debe ser aprobado manualmente
5. Guarda bien tus credenciales de DATABASE_URL

---

## 🆘 Si algo falla

1. Revisa logs en Vercel Dashboard
2. Verifica que todas las variables de entorno están configuradas
3. Asegura que `DATABASE_URL` tiene `?sslmode=require`
4. Verifica que las migraciones corrieron
5. Consulta `VERCEL_DEPLOY.md` para troubleshooting

---

**Estado actual:** ✅ Código listo para deploy
**Siguiente paso:** Importar en Vercel y configurar variables
