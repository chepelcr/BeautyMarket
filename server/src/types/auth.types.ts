import { Request } from 'express';
import type { Organization, Role } from '../entities';

export interface AuthRequest extends Request {
  userId?: string;
  userEmail?: string;
  // Organization context
  organization?: Organization;
  organizationId?: string;
  userRole?: Role;
  // Computed permissions
  isOwner?: boolean;
  isAdmin?: boolean;
}

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  role: string;
}

export interface TokenPayload {
  sub: string;
  email: string;
  'cognito:username'?: string;
  given_name?: string;
  family_name?: string;
  email_verified?: boolean;
  iat?: number;
  exp?: number;
}

export interface AuthResponse {
  user: AuthUser;
  message?: string;
}

export interface ProfileUpdateRequest {
  firstName?: string;
  lastName?: string;
  username?: string;
}
