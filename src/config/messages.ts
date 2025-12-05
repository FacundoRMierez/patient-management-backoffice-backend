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
  return {
    message: getMessageBoth(messageKey),
    ...(data && { data }),
  };
}
