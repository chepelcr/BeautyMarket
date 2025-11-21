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
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  gender?: string;
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
    // Try to get user from database
    let user = await this.userRepository.getUser(userId);

    // If not found, try to sync from Cognito
    if (!user) {
      const cognitoUser = await this.cognitoService.getUserById(userId);

      if (!cognitoUser) {
        return null;
      }

      // Create user in database from Cognito data
      user = await this.userRepository.createUser({
        id: cognitoUser.id,
        username: cognitoUser.username,
        email: cognitoUser.email,
        firstName: cognitoUser.firstName || null,
        lastName: cognitoUser.lastName || null,
        role: 'customer',
        isActive: true,
      });
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
    const { userId, email, username, firstName, lastName, gender } = request;

    // Check if user already exists in database
    let user = await this.userRepository.getUser(userId);

    if (user) {
      // User already exists, just return success
      return {
        message: 'User already verified',
        user: this.mapUserToProfile(user),
      };
    }

    // Create user in database
    user = await this.userRepository.createUser({
      id: userId,
      username,
      email,
      firstName: firstName || null,
      lastName: lastName || null,
      gender: gender || null,
      role: 'customer',
      isActive: true,
    });

    console.log(`✓ User ${email} verified and synced to database`);

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
