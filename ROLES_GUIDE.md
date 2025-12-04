# Sistema de Roles y Tipos de Profesionales

## 📋 Roles del Sistema

### 1. **SUPER_ADMIN**
- Gestiona toda la plataforma
- Aprueba nuevos usuarios
- Puede ver todos los usuarios
- Puede modificar y eliminar usuarios

### 2. **PROFESSIONAL**
- Profesionales de la salud (psicólogos, médicos, etc.)
- Necesitan aprobación del SUPER_ADMIN para acceder
- Podrán gestionar pacientes (próximo módulo)

### 3. **PATIENT** _(Futuro)_
- Pacientes del sistema
- Necesitan aprobación del profesional asignado

---

## 🏥 Tipos de Profesionales

- `PSYCHOLOGIST` - Psicólogo
- `DOCTOR` - Médico
- `PSYCHIATRIST` - Psiquiatra
- `PSYCHOPEDAGOGUE` - Psicopedagogo
- `DENTIST` - Odontólogo
- `NUTRITIONIST` - Nutricionista
- `SPEECH_THERAPIST` - Fonoaudiólogo
- `OCCUPATIONAL_THERAPIST` - Terapista Ocupacional
- `OTHER` - Otro

---

## 🚀 Ejemplos de Uso

### 1. Registrar un Super Admin

```powershell
$body = @{
    email = "admin@hospital.com"
    password = "Admin1234"
    firstName = "Super"
    lastName = "Admin"
    role = "SUPER_ADMIN"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/users/register" -Method Post -Body $body -ContentType "application/json"
```

**Nota:** El primer Super Admin debe registrarse manualmente o cambiar su rol en la base de datos.

---

### 2. Registrar un Profesional (Psicólogo)

```powershell
$body = @{
    email = "psicologo@clinica.com"
    password = "Psico1234"
    firstName = "María"
    lastName = "González"
    role = "PROFESSIONAL"
    professionalType = "PSYCHOLOGIST"
    licenseNumber = "MP 12345"
    specialization = "Psicología Clínica"
    organizationName = "Clínica Santa María"
    phoneNumber = "+54 11 4567-8900"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/users/register" -Method Post -Body $body -ContentType "application/json"
```

---

### 3. Registrar un Médico

```powershell
$body = @{
    email = "doctor@hospital.com"
    password = "Doctor1234"
    firstName = "Carlos"
    lastName = "Pérez"
    role = "PROFESSIONAL"
    professionalType = "DOCTOR"
    licenseNumber = "MN 67890"
    specialization = "Cardiología"
    organizationName = "Hospital Central"
    address = "Av. Corrientes 1234, CABA"
    phoneNumber = "+54 11 1234-5678"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/users/register" -Method Post -Body $body -ContentType "application/json"
```

---

### 4. Login como Super Admin

```powershell
$body = @{
    email = "admin@hospital.com"
    password = "Admin1234"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:3000/api/users/login" -Method Post -Body $body -ContentType "application/json"
$adminToken = $response.data.token
Write-Host "Token guardado: $adminToken"
```

---

### 5. Ver Usuarios Pendientes de Aprobación (Super Admin)

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/users/pending-approval" -Method Get -Headers @{"Authorization"="Bearer $adminToken"}
```

**Respuesta:**
```json
{
  "message": "Pending approval users retrieved successfully",
  "data": [
    {
      "id": "uuid-1",
      "email": "psicologo@clinica.com",
      "firstName": "María",
      "lastName": "González",
      "role": "PROFESSIONAL",
      "professionalType": "PSYCHOLOGIST",
      "licenseNumber": "MP 12345",
      "specialization": "Psicología Clínica",
      "createdAt": "2024-12-04T..."
    }
  ],
  "count": 1
}
```

---

### 6. Aprobar un Usuario (Super Admin)

```powershell
$userId = "uuid-del-usuario-a-aprobar"
Invoke-RestMethod -Uri "http://localhost:3000/api/users/$userId/approve" -Method Patch -Headers @{"Authorization"="Bearer $adminToken"}
```

---

### 7. Ver Todos los Usuarios (Super Admin)

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/users" -Method Get -Headers @{"Authorization"="Bearer $adminToken"}
```

---

### 8. Login como Profesional (después de ser aprobado)

```powershell
$body = @{
    email = "psicologo@clinica.com"
    password = "Psico1234"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:3000/api/users/login" -Method Post -Body $body -ContentType "application/json"
$professionalToken = $response.data.token
```

---

## 🔒 Validaciones de Seguridad

### Login - Usuario No Aprobado
```powershell
# Intentar login sin estar aprobado
$body = @{email="psicologo@clinica.com"; password="Psico1234"} | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:3000/api/users/login" -Method Post -Body $body -ContentType "application/json"
```

**Error esperado:**
```json
{
  "error": "Account is pending approval. Please contact an administrator."
}
```

---

### Acceso No Autorizado
```powershell
# Profesional intenta ver todos los usuarios (solo Super Admin puede)
Invoke-RestMethod -Uri "http://localhost:3000/api/users" -Method Get -Headers @{"Authorization"="Bearer $professionalToken"}
```

**Error esperado:**
```json
{
  "error": "Access denied. Insufficient permissions.",
  "required": ["SUPER_ADMIN"],
  "current": "PROFESSIONAL"
}
```

---

## 📊 Flujo Completo

### Para Super Admin:
1. ✅ Registrarse (primera vez, puede auto-aprobarse en BD)
2. ✅ Login
3. ✅ Ver usuarios pendientes `/api/users/pending-approval`
4. ✅ Aprobar usuarios `PATCH /api/users/:id/approve`
5. ✅ Gestionar todos los usuarios

### Para Profesional:
1. ✅ Registrarse con tipo de profesional
2. ⏳ Esperar aprobación del Super Admin
3. ✅ Login (después de aprobación)
4. ✅ Acceder a funciones de profesional
5. 🔜 Gestionar pacientes (próximo módulo)

---

## 🎯 Endpoints Protegidos por Rol

### Super Admin Only:
- `GET /api/users` - Listar todos los usuarios
- `GET /api/users/pending-approval` - Usuarios pendientes
- `PATCH /api/users/:id/approve` - Aprobar usuario

### Authenticated (cualquier usuario logueado):
- `GET /api/users/me` - Mi perfil
- `PUT /api/users/:id` - Actualizar perfil
- `POST /api/users/change-password` - Cambiar contraseña
- `GET /api/users/:id` - Ver usuario por ID

### Public:
- `POST /api/users/register` - Registrarse
- `POST /api/users/login` - Login

---

## 💡 Tips

1. **Primer Super Admin**: Después del registro, actualiza manualmente en la BD:
   ```sql
   UPDATE users SET role = 'SUPER_ADMIN', "isApproved" = true WHERE email = 'admin@hospital.com';
   ```

2. **Validación de Profesional**: Si el role es `PROFESSIONAL`, el campo `professionalType` es obligatorio.

3. **Matrícula**: Guarda el número de matrícula en `licenseNumber` para validación futura.

4. **Especialización**: Campo libre para detalles adicionales del profesional.

---

## 🔄 Próximos Pasos

- [ ] Módulo de Pacientes
- [ ] Sistema de asignación Profesional-Paciente
- [ ] Aprobación de pacientes por parte del profesional
- [ ] Historias clínicas
- [ ] Sistema de citas/turnos
