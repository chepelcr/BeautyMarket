import {
  CognitoIdentityProviderClient,
  AdminGetUserCommand,
  AdminCreateUserCommand,
  AdminUpdateUserAttributesCommand,
  AdminSetUserPasswordCommand,
  AdminInitiateAuthCommand,
  AdminRespondToAuthChallengeCommand,
  MessageActionType,
} from "@aws-sdk/client-cognito-identity-provider";

interface CognitoUserAttributes {
  email?: string;
  given_name?: string;
  family_name?: string;
  preferred_username?: string;
  [key: string]: string | undefined;
}

interface CognitoUser {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  emailVerified: boolean;
}

export class CognitoService {
  private client: CognitoIdentityProviderClient;
  private userPoolId: string;

  constructor() {
    this.client = new CognitoIdentityProviderClient({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
      },
    });
    this.userPoolId = process.env.AWS_COGNITO_USER_POOL_ID || '';
  }

  /**
   * Get user from Cognito by username (email)
   */
  async getUser(username: string): Promise<CognitoUser | null> {
    try {
      const command = new AdminGetUserCommand({
        UserPoolId: this.userPoolId,
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
      // In Cognito, we need to use the username (email) to get user
      // This method assumes userId is actually the username/email
      return await this.getUser(userId);
    } catch (error) {
      console.error('Error getting Cognito user by ID:', error);
      return null;
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

    const command = new AdminCreateUserCommand({
      UserPoolId: this.userPoolId,
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

    if (userAttributes.length === 0) {
      return;
    }

    const command = new AdminUpdateUserAttributesCommand({
      UserPoolId: this.userPoolId,
      Username: username,
      UserAttributes: userAttributes,
    });

    await this.client.send(command);
  }

  /**
   * Set permanent password for a user (admin operation)
   */
  async setUserPassword(username: string, password: string): Promise<void> {
    const command = new AdminSetUserPasswordCommand({
      UserPoolId: this.userPoolId,
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
