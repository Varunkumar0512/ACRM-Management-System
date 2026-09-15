import { z } from 'zod';
import { FacultyDesignation } from '../config/constants.js';

export const signInSchema = z.object({
  email: z.string().email('Valid institutional email is required').toLowerCase().trim(),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

export const studentSignUpSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters').trim(),
  email: z.string().email('Valid institutional email is required').toLowerCase().trim(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  studentId: z.string().min(3, 'Student ID / Registration number is required').trim(),
  department: z.string().min(2, 'Department is required').trim(),
  program: z.string().min(2, 'Academic program is required').trim(),
  yearOfStudy: z.number().int().min(1).max(6),
  phone: z.string().optional().nullable().default(''),
  researchInterests: z.array(z.string()).optional().default([]),
});

export const facultySignUpSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters').trim(),
  email: z.string().email('Valid institutional email is required').toLowerCase().trim(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  employeeId: z.string().min(3, 'Employee / Faculty ID is required').trim(),
  designation: z.nativeEnum(FacultyDesignation),
  department: z.string().min(2, 'Department is required').trim(),
  experienceYears: z.number().int().min(0),
  areasOfExpertise: z.array(z.string()).min(1, 'At least one area of expertise is required'),
  cabinLocation: z.string().optional(),
  phone: z.string().optional(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Valid institutional email is required').toLowerCase().trim(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(10, 'Valid reset token is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'New password must be at least 8 characters long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});
