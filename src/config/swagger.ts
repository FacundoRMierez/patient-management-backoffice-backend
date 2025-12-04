import swaggerJSDoc from 'swagger-jsdoc';
import { config } from './index';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Patient Management System API',
    version: '1.0.0',
    description: 'RESTful API for Patient Management Backoffice with Multi-Role Authentication System',
    contact: {
      name: 'API Support',
      email: 'support@patientmanagement.com',
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT',
    },
  },
  servers: [
    {
      url: `http://localhost:${config.port}`,
      description: 'Development server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter JWT token obtained from login endpoint',
      },
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            description: 'User unique identifier',
          },
          email: {
            type: 'string',
            format: 'email',
            description: 'User email address',
          },
          firstName: {
            type: 'string',
            description: 'User first name',
          },
          lastName: {
            type: 'string',
            description: 'User last name',
          },
          organizationName: {
            type: 'string',
            nullable: true,
            description: 'Organization name',
          },
          address: {
            type: 'string',
            nullable: true,
            description: 'Physical address',
          },
          phoneNumber: {
            type: 'string',
            nullable: true,
            description: 'Contact phone number',
          },
          professionalType: {
            type: 'string',
            enum: ['PSYCHOLOGIST', 'DOCTOR', 'PSYCHIATRIST', 'PSYCHOPEDAGOGUE', 'DENTIST', 'NUTRITIONIST', 'SPEECH_THERAPIST', 'OCCUPATIONAL_THERAPIST', 'OTHER'],
            nullable: true,
            description: 'Type of professional',
          },
          licenseNumber: {
            type: 'string',
            nullable: true,
            description: 'Professional license number',
          },
          specialization: {
            type: 'string',
            nullable: true,
            description: 'Professional specialization',
          },
          roles: {
            type: 'array',
            items: {
              type: 'string',
              enum: ['SUPER_ADMIN', 'PROFESSIONAL', 'PATIENT'],
            },
            description: 'User roles (multiple roles supported)',
          },
          isApproved: {
            type: 'boolean',
            description: 'Whether user is approved by admin',
          },
          isActive: {
            type: 'boolean',
            description: 'Whether user account is active',
          },
          isDeleted: {
            type: 'boolean',
            description: 'Whether user is soft-deleted',
          },
          emailVerified: {
            type: 'boolean',
            description: 'Whether email is verified',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Account creation date',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            description: 'Last update date',
          },
          lastLoginAt: {
            type: 'string',
            format: 'date-time',
            nullable: true,
            description: 'Last login date',
          },
        },
      },
      RegisterInput: {
        type: 'object',
        required: ['email', 'password', 'firstName', 'lastName'],
        properties: {
          email: {
            type: 'string',
            format: 'email',
            example: 'john.doe@example.com',
          },
          password: {
            type: 'string',
            minLength: 8,
            example: 'SecurePass123!',
          },
          firstName: {
            type: 'string',
            example: 'John',
          },
          lastName: {
            type: 'string',
            example: 'Doe',
          },
          organizationName: {
            type: 'string',
            example: 'Health Clinic',
          },
          address: {
            type: 'string',
            example: '123 Main St, Miami, FL',
          },
          phoneNumber: {
            type: 'string',
            example: '+1-555-0101',
          },
          professionalType: {
            type: 'string',
            enum: ['PSYCHOLOGIST', 'DOCTOR', 'PSYCHIATRIST', 'PSYCHOPEDAGOGUE', 'DENTIST', 'NUTRITIONIST', 'SPEECH_THERAPIST', 'OCCUPATIONAL_THERAPIST', 'OTHER'],
            example: 'PSYCHOLOGIST',
          },
          licenseNumber: {
            type: 'string',
            example: 'PSY-12345',
          },
          specialization: {
            type: 'string',
            example: 'Clinical Psychology',
          },
          roles: {
            type: 'array',
            items: {
              type: 'string',
              enum: ['SUPER_ADMIN', 'PROFESSIONAL', 'PATIENT'],
            },
            example: ['PROFESSIONAL'],
            description: 'Optional. Defaults to ["PROFESSIONAL"]',
          },
        },
      },
      LoginInput: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: {
            type: 'string',
            format: 'email',
            example: 'john.doe@example.com',
          },
          password: {
            type: 'string',
            example: 'SecurePass123!',
          },
        },
      },
      AuthResponse: {
        type: 'object',
        properties: {
          user: {
            $ref: '#/components/schemas/User',
          },
          token: {
            type: 'string',
            description: 'JWT authentication token',
          },
        },
      },
      Error: {
        type: 'object',
        properties: {
          error: {
            type: 'string',
            description: 'Error message',
          },
        },
      },
    },
  },
  tags: [
    {
      name: 'Authentication',
      description: 'User registration and login endpoints',
    },
    {
      name: 'Users',
      description: 'User management endpoints (requires authentication)',
    },
  ],
};

const options = {
  swaggerDefinition,
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'],
};

export const swaggerSpec = swaggerJSDoc(options);
