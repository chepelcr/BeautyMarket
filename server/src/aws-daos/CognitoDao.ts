import {
  CognitoIdentityProviderClient,
  AdminGetUserCommand,
  AdminCreateUserCommand,
  AdminUpdateUserAttributesCommand,
  AdminSetUserPasswordCommand,
  AdminInitiateAuthCommand,
  AdminRespondToAuthChallengeCommand,
  ListUsersCommand,
  MessageActionType,
} from "@aws-sdk/client-cognito-identity-provider";
import { appConfig } from '../config/appConfig';

export interface CognitoUserAttributes {
  email?: string;
  given_name?: string;
  family_name?: string;
  preferred_username?: string;
  gender?: string;
  locale?: string; // Language preference: en, es
  [key: string]: string | undefined;
}

export interface CognitoUser {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  gender?: string;
  language?: string; // User's preferred language
  emailVerified: boolean;
}

export class CognitoDao {
  private client: CognitoIdentityProviderClient;

  constructor() {
    this.client = new CognitoIdentityProviderClient({
      region: process.env.AWS_REGION || 'us-east-1',
      // In Lambda, use IAM role credentials automatically
      // Locally, use explicit credentials from environment
      ...(process.env.AWS_LAMBDA_FUNCTION_NAME
        ? {}
        : {
            credentials: {
              accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
              secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
            },
          }),
    });
  }

  /**
   * Get user from Cognito by username (email)
   */
  async getUser(username: string): Promise<CognitoUser | null> {
    try {
      const userPoolId = await appConfig.getKey('cognito.user-pool-id') ?? '';
      const command = new AdminGetUserCommand({
        UserPoolId: userPoolId,
        Username: username,
      });

      const response = await this.client.send(command);

      if (!response.UserAttributes) {
        return null;
      }

      const attributes = this.parseUserAttributes(response.UserAttributes);

      return {
        id: attributes.sub || '',
        email: attributes.email || '',
        username: attributes.preferred_username || username,
        firstName: attributes.given_name,
        lastName: attributes.family_name,
        gender: attributes.gender,
        language: attributes.locale || 'es', // Default to Spanish if not set
        emailVerified: attributes.email_verified === 'true',
      };
    } catch (error: any) {
      if (error.name === 'UserNotFoundException') {
        return null;
      }
      console.error('Error getting Cognito user:', error);
      throw error;
    }
  }

  /**
   * Get user by Cognito ID (sub)
   */
  async getUserById(userId: string): Promise<CognitoUser | null> {
    try {
      console.log(`🔍 [CognitoService] Getting user by ID: ${userId}`);

      // Query Cognito by sub attribute using ListUsers
      const userPoolId = await appConfig.getKey('cognito.user-pool-id') ?? '';
      console.log(`🔍 [CognitoService] User Pool ID: ${userPoolId}`);
      const command = new ListUsersCommand({
        UserPoolId: userPoolId,
        Filter: `sub = "${userId}"`,
        Limit: 1,
      });

      console.log(`🔍 [CognitoService] Sending ListUsers command with filter: sub = "${userId}"`);
      const response = await this.client.send(command);

      console.log(`🔍 [CognitoService] Response:`, {
        usersCount: response.Users?.length || 0,
        users: response.Users?.map(u => ({
          username: u.Username,
          status: u.UserStatus,
          enabled: u.Enabled,
        })),
      });

      if (!response.Users || response.Users.length === 0) {
        console.log(`❌ [CognitoService] No users found with sub = "${userId}"`);
        return null;
      }

      const user = response.Users[0];
      if (!user.Attributes || !user.Username) {
        return null;
      }

      const attributes = this.parseUserAttributes(user.Attributes);

      return {
        id: attributes.sub || '',
        email: attributes.email || '',
        username: attributes.preferred_username || user.Username,
        firstName: attributes.given_name,
        lastName: attributes.family_name,
        gender: attributes.gender,
        language: attributes.locale || 'es', // Default to Spanish if not set
        emailVerified: attributes.email_verified === 'true',
      };
    } catch (error: any) {
      console.error('❌ Error getting Cognito user by ID:', userId);
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        code: error.$metadata?.httpStatusCode,
      });
      // Don't silently return null - throw the error so we can see what's wrong
      throw error;
    }
  }

  /**
   * Create a new user in Cognito (admin operation)
   */
  async createUser(
    email: string,
    temporaryPassword: string,
    attributes: CognitoUserAttributes
  ): Promise<CognitoUser> {
    const userPoolId = await appConfig.getKey('cognito.user-pool-id') ?? '';
    const userAttributes = [
      { Name: 'email', Value: email },
      { Name: 'email_verified', Value: 'true' },
    ];

    if (attributes.given_name) {
      userAttributes.push({ Name: 'given_name', Value: attributes.given_name });
    }
    if (attributes.family_name) {
      userAttributes.push({ Name: 'family_name', Value: attributes.family_name });
    }
    if (attributes.preferred_username) {
      userAttributes.push({ Name: 'preferred_username', Value: attributes.preferred_username });
    }
    if (attributes.gender) {
      userAttributes.push({ Name: 'gender', Value: attributes.gender });
    }
    if (attributes.locale) {
      userAttributes.push({ Name: 'locale', Value: attributes.locale });
    }

    const command = new AdminCreateUserCommand({
      UserPoolId: userPoolId,
      Username: email,
      UserAttributes: userAttributes,
      TemporaryPassword: temporaryPassword,
      MessageAction: MessageActionType.SUPPRESS, // Don't send welcome email
    });

    const response = await this.client.send(command);

    if (!response.User?.Attributes) {
      throw new Error('Failed to create user in Cognito');
    }

    const attrs = this.parseUserAttributes(response.User.Attributes);

    return {
      id: attrs.sub || '',
      email: email,
      username: attributes.preferred_username || email,
      firstName: attributes.given_name,
      lastName: attributes.family_name,
      gender: attributes.gender,
      language: attributes.locale || 'es',
      emailVerified: true,
    };
  }

  /**
   * Update user attributes in Cognito
   */
  async updateUserAttributes(
    username: string,
    attributes: CognitoUserAttributes
  ): Promise<void> {
    const userPoolId = await appConfig.getKey('cognito.user-pool-id') ?? '';
    const userAttributes = [];

    if (attributes.given_name) {
      userAttributes.push({ Name: 'given_name', Value: attributes.given_name });
    }
    if (attributes.family_name) {
      userAttributes.push({ Name: 'family_name', Value: attributes.family_name });
    }
    if (attributes.preferred_username) {
      userAttributes.push({ Name: 'preferred_username', Value: attributes.preferred_username });
    }
    if (attributes.gender) {
      userAttributes.push({ Name: 'gender', Value: attributes.gender });
    }

    if (userAttributes.length === 0) {
      return;
    }

    const command = new AdminUpdateUserAttributesCommand({
      UserPoolId: userPoolId,
      Username: username,
      UserAttributes: userAttributes,
    });

    await this.client.send(command);
  }

  /**
   * Set permanent password for a user (admin operation)
   */
  async setUserPassword(username: string, password: string): Promise<void> {
    const userPoolId = await appConfig.getKey('cognito.user-pool-id') ?? '';
    const command = new AdminSetUserPasswordCommand({
      UserPoolId: userPoolId,
      Username: username,
      Password: password,
      Permanent: true,
    });

    await this.client.send(command);
  }

  /**
   * Extract user info from JWT token (without verification - API Gateway handles verification)
   */
  extractUserFromToken(token: string): { userId: string; email: string } | null {
    try {
      // JWT structure: header.payload.signature
      const parts = token.split('.');
      if (parts.length !== 3) {
        return null;
      }

      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));

      return {
        userId: payload.sub || '',
        email: payload.email || '',
      };
    } catch (error) {
      console.error('Error extracting user from token:', error);
      return null;
    }
  }

  /**
   * Validate basic JWT format
   */
  validateTokenFormat(token: string): boolean {
    if (!token) return false;
    const parts = token.split('.');
    return parts.length === 3;
  }

  /**
   * Parse Cognito user attributes array into object
   */
  private parseUserAttributes(
    attributes: Array<{ Name?: string; Value?: string }>
  ): Record<string, string> {
    const result: Record<string, string> = {};

    for (const attr of attributes) {
      if (attr.Name && attr.Value) {
        result[attr.Name] = attr.Value;
      }
    }

    return result;
  }
}
