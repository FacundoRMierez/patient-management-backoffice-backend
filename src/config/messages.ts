// ============================================
// INTERNATIONALIZATION (i18n) MESSAGES
// ============================================

export type Language = 'es' | 'en';

export interface MessageKey {
  es: string;
  en: string;
}

export const messages = {
  // Authentication Messages
  auth: {
    accountPendingApproval: {
      es: 'Cuenta pendiente de aprobación. Por favor contacte a un administrador.',
      en: 'Account is pending approval. Please contact an administrator.',
    },
    accountInactive: {
      es: 'Cuenta inactiva. Por favor contacte a un administrador.',
      en: 'Account is inactive. Please contact an administrator.',
    },
    invalidCredentials: {
      es: 'Credenciales inválidas.',
      en: 'Invalid credentials.',
    },
    emailAlreadyExists: {
      es: 'Ya existe un usuario con este correo electrónico.',
      en: 'User with this email already exists.',
    },
    userNotFound: {
      es: 'Usuario no encontrado.',
      en: 'User not found.',
    },
    tokenInvalid: {
      es: 'Token inválido o expirado.',
      en: 'Invalid or expired token.',
    },
    unauthorized: {
      es: 'No autorizado. Token no proporcionado.',
      en: 'Unauthorized. No token provided.',
    },
    forbidden: {
      es: 'Acceso denegado. No tiene permisos suficientes.',
      en: 'Access denied. Insufficient permissions.',
    },
  },

  // User Management Messages
  user: {
    registered: {
      es: 'Usuario registrado exitosamente.',
      en: 'User registered successfully.',
    },
    loginSuccessful: {
      es: 'Inicio de sesión exitoso.',
      en: 'Login successful.',
    },
    retrieved: {
      es: 'Usuario obtenido exitosamente.',
      en: 'User retrieved successfully.',
    },
    allRetrieved: {
      es: 'Usuarios obtenidos exitosamente.',
      en: 'Users retrieved successfully.',
    },
    pendingRetrieved: {
      es: 'Usuarios pendientes obtenidos exitosamente.',
      en: 'Pending approval users retrieved successfully.',
    },
    profileRetrieved: {
      es: 'Perfil obtenido exitosamente.',
      en: 'Profile retrieved successfully.',
    },
    created: {
      es: 'Usuario creado exitosamente.',
      en: 'User created successfully.',
    },
    updated: {
      es: 'Usuario actualizado exitosamente.',
      en: 'User updated successfully.',
    },
    deleted: {
      es: 'Usuario eliminado exitosamente.',
      en: 'User deleted successfully.',
    },
    approved: {
      es: 'Usuario aprobado exitosamente.',
      en: 'User approved successfully.',
    },
    alreadyApproved: {
      es: 'El usuario ya está aprobado.',
      en: 'User is already approved.',
    },
    passwordChanged: {
      es: 'Contraseña cambiada exitosamente.',
      en: 'Password changed successfully.',
    },
    currentPasswordIncorrect: {
      es: 'La contraseña actual es incorrecta.',
      en: 'Current password is incorrect.',
    },
  },

  // Validation Messages
  validation: {
    invalidEmail: {
      es: 'Correo electrónico inválido.',
      en: 'Invalid email address.',
    },
    passwordTooShort: {
      es: 'La contraseña debe tener al menos 6 caracteres.',
      en: 'Password must be at least 6 characters long.',
    },
    requiredField: {
      es: 'Este campo es requerido.',
      en: 'This field is required.',
    },
    invalidRole: {
      es: 'Rol inválido.',
      en: 'Invalid role.',
    },
  },

  // General Messages
  general: {
    success: {
      es: 'Operación exitosa.',
      en: 'Operation successful.',
    },
    error: {
      es: 'Ocurrió un error. Por favor intente nuevamente.',
      en: 'An error occurred. Please try again.',
    },
    notFound: {
      es: 'Recurso no encontrado.',
      en: 'Resource not found.',
    },
    serverError: {
      es: 'Error del servidor. Por favor intente más tarde.',
      en: 'Server error. Please try again later.',
    },
  },

  // Patient Messages
  patient: {
    created: {
      es: 'Paciente creado exitosamente.',
      en: 'Patient created successfully.',
    },
    updated: {
      es: 'Paciente actualizado exitosamente.',
      en: 'Patient updated successfully.',
    },
    deleted: {
      es: 'Paciente eliminado exitosamente.',
      en: 'Patient deleted successfully.',
    },
    retrieved: {
      es: 'Paciente obtenido exitosamente.',
      en: 'Patient retrieved successfully.',
    },
    allRetrieved: {
      es: 'Pacientes obtenidos exitosamente.',
      en: 'Patients retrieved successfully.',
    },
    approved: {
      es: 'Paciente aprobado exitosamente.',
      en: 'Patient approved successfully.',
    },
    alreadyApproved: {
      es: 'El paciente ya está aprobado.',
      en: 'Patient is already approved.',
    },
    alreadyExists: {
      es: 'Ya existe un paciente con este DNI.',
      en: 'A patient with this DNI already exists.',
    },
    notFound: {
      es: 'Paciente no encontrado.',
      en: 'Patient not found.',
    },
    statusToggled: {
      es: 'Estado del paciente actualizado.',
      en: 'Patient status updated.',
    },
    statsRetrieved: {
      es: 'Estadísticas obtenidas exitosamente.',
      en: 'Statistics retrieved successfully.',
    },
  },
} as const;

/**
 * Get message in specified language
 * @param messageKey - Nested path to the message (e.g., 'auth.accountPendingApproval')
 * @param lang - Language code ('es' or 'en')
 * @returns Translated message
 */
export function getMessage(messageKey: string, lang: Language = 'es'): string {
  const keys = messageKey.split('.');
  let current: any = messages;

  for (const key of keys) {
    if (current[key]) {
      current = current[key];
    } else {
      return messageKey; // Return key if not found
    }
  }

  return current[lang] || current['es'] || messageKey;
}

/**
 * Get message object with both languages
 * @param messageKey - Nested path to the message
 * @returns Object with 'es' and 'en' properties
 */
export function getMessageBoth(messageKey: string): MessageKey {
  const keys = messageKey.split('.');
  let current: any = messages;

  for (const key of keys) {
    if (current[key]) {
      current = current[key];
    } else {
      return { es: messageKey, en: messageKey };
    }
  }

  return current;
}

/**
 * Create error response with both languages
 * @param messageKey - Nested path to the message
 * @returns Error object with message in both languages
 */
export function createErrorResponse(messageKey: string) {
  return {
    success: false,
    error: getMessageBoth(messageKey),
  };
}

/**
 * Create success response with both languages
 * @param messageKey - Nested path to the message
 * @param data - Optional additional data
 * @returns Success object with message in both languages
 */
export function createSuccessResponse(messageKey: string, data?: any) {
  const response: any = {
    success: true,
    message: getMessageBoth(messageKey),
  };
  
  if (data !== undefined) {
    response.data = data;
  }
  
  return response;
}

/**
 * Create paginated success response
 * @param messageKey - Nested path to the message
 * @param data - Array of data items
 * @param meta - Pagination metadata (count, page, etc.)
 * @returns Success object with pagination info
 */
export function createPaginatedResponse(messageKey: string, data: any[], meta?: any) {
  const response: any = {
    success: true,
    message: getMessageBoth(messageKey),
    data,
  };
  
  if (meta) {
    response.meta = meta;
  } else {
    response.meta = {
      count: data.length,
    };
  }
  
  return response;
}
