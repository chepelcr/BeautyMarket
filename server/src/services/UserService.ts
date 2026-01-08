import { UserRepository } from '../repositories';
import { CognitoService } from './CognitoService';
import type { User } from '../entities';
import type { ProfileUpdateRequest } from '../types/auth.types';

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
  isActive: boolean;
  createdAt?: Date;
}

export interface VerifyEmailRequest {
  userId: string;
}

export interface VerifyEmailResult {
  message: string;
  user: UserProfile;
}

export class UserService {
  constructor(
    private userRepository: UserRepository,
    private cognitoService: CognitoService
  ) {}

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    console.log(`🔍 [getUserProfile] Starting for userId: ${userId}`);

    // First, check Cognito user status to validate email verification
    console.log(`🔍 [getUserProfile] Fetching from Cognito...`);
    const cognitoUser = await this.cognitoService.getUserById(userId);

    if (!cognitoUser) {
      console.log(`❌ [getUserProfile] User not found in Cognito`);
      return null;
    }

    console.log(`✓ [getUserProfile] Found in Cognito:`, {
      email: cognitoUser.email,
      username: cognitoUser.username,
      emailVerified: cognitoUser.emailVerified,
    });

    // Check if email is verified in Cognito
    if (!cognitoUser.emailVerified) {
      console.log(`⚠️ [getUserProfile] Email not verified for ${cognitoUser.email}`);
      const error = new Error('Email not verified');
      error.name = 'EMAIL_NOT_VERIFIED';
      (error as any).email = cognitoUser.email;
      throw error;
    }

    // Try to get user from database
    console.log(`🔍 [getUserProfile] Checking database...`);
    let user = await this.userRepository.getUser(userId);

    // If not found in DB but verified in Cognito, sync from Cognito
    if (!user) {
      console.log(`📝 [getUserProfile] User ${cognitoUser.email} verified in Cognito but not in database. Syncing...`);

      user = await this.userRepository.createUser({
        id: cognitoUser.id,
        username: cognitoUser.username,
        email: cognitoUser.email,
        firstName: cognitoUser.firstName || null,
        lastName: cognitoUser.lastName || null,
        gender: cognitoUser.gender || null,
        role: 'customer',
        isActive: true,
      });

      console.log(`✓ [getUserProfile] User ${cognitoUser.email} synced to database`);
    } else {
      console.log(`✓ [getUserProfile] User found in database`);
    }

    return this.mapUserToProfile(user);
  }

  async updateUserProfile(
    userId: string,
    updates: ProfileUpdateRequest
  ): Promise<UserProfile | null> {
    // Get current user
    const user = await this.userRepository.getUser(userId);
    if (!user) {
      return null;
    }

    // Update in Cognito
    await this.cognitoService.updateUserAttributes(user.email, {
      given_name: updates.firstName,
      family_name: updates.lastName,
      preferred_username: updates.username,
    });

    // Update in database
    const updatedUser = await this.userRepository.updateUser(userId, {
      firstName: updates.firstName || user.firstName,
      lastName: updates.lastName || user.lastName,
      username: updates.username || user.username,
    });

    if (!updatedUser) {
      return null;
    }

    return this.mapUserToProfile(updatedUser);
  }

  async completeEmailVerification(
    request: VerifyEmailRequest
  ): Promise<VerifyEmailResult> {
    const { userId } = request;

    // Check if user already exists in database
    let user = await this.userRepository.getUser(userId);

    if (user) {
      // User already exists, just return success
      return {
        message: 'User already verified',
        user: this.mapUserToProfile(user),
      };
    }

    // Fetch user data from Cognito using userId (sub)
    const cognitoUser = await this.cognitoService.getUserById(userId);

    if (!cognitoUser) {
      throw new Error('User not found in Cognito');
    }

    // Create user in database with data from Cognito
    user = await this.userRepository.createUser({
      id: cognitoUser.id, // Use the sub from Cognito
      username: cognitoUser.username,
      email: cognitoUser.email,
      firstName: cognitoUser.firstName || null,
      lastName: cognitoUser.lastName || null,
      gender: cognitoUser.gender || null,
      role: 'customer',
      isActive: true,
    });

    console.log(`✓ User ${cognitoUser.email} verified and synced to database`);

    return {
      message: 'Email verification completed successfully',
      user: this.mapUserToProfile(user),
    };
  }

  async getUserById(userId: string): Promise<User | undefined> {
    return this.userRepository.getUser(userId);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return this.userRepository.getUserByEmail(email);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return this.userRepository.getUserByUsername(username);
  }

  async createUser(userData: {
    id: string;
    username: string;
    email: string;
    firstName?: string | null;
    lastName?: string | null;
    role?: string;
    isActive?: boolean;
  }): Promise<User> {
    return this.userRepository.createUser({
      id: userData.id,
      username: userData.username,
      email: userData.email,
      firstName: userData.firstName || null,
      lastName: userData.lastName || null,
      role: userData.role || 'customer',
      isActive: userData.isActive ?? true,
    });
  }

  async updateUser(userId: string, userData: Partial<User>): Promise<User | undefined> {
    return this.userRepository.updateUser(userId, userData);
  }

  async deleteUser(userId: string): Promise<boolean> {
    return this.userRepository.deleteUser(userId);
  }

  private mapUserToProfile(user: User): UserProfile {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
    };
  }
}
