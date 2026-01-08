import { CognitoDao, type CognitoUser, type CognitoUserAttributes } from '../aws-daos';

export class CognitoService {
  private dao: CognitoDao;

  constructor() {
    this.dao = new CognitoDao();
  }

  /**
   * Get user from Cognito by username (email)
   */
  async getUser(username: string): Promise<CognitoUser | null> {
    return this.dao.getUser(username);
  }

  /**
   * Get user by Cognito ID (sub)
   */
  async getUserById(userId: string): Promise<CognitoUser | null> {
    return this.dao.getUserById(userId);
  }

  /**
   * Create a new user in Cognito (admin operation)
   */
  async createUser(
    email: string,
    temporaryPassword: string,
    attributes: CognitoUserAttributes
  ): Promise<CognitoUser> {
    return this.dao.createUser(email, temporaryPassword, attributes);
  }

  /**
   * Update user attributes in Cognito
   */
  async updateUserAttributes(
    username: string,
    attributes: CognitoUserAttributes
  ): Promise<void> {
    return this.dao.updateUserAttributes(username, attributes);
  }

  /**
   * Set permanent password for a user (admin operation)
   */
  async setUserPassword(username: string, password: string): Promise<void> {
    return this.dao.setUserPassword(username, password);
  }

  /**
   * Extract user info from JWT token (without verification - API Gateway handles verification)
   */
  extractUserFromToken(token: string): { userId: string; email: string } | null {
    return this.dao.extractUserFromToken(token);
  }

  /**
   * Validate basic JWT format
   */
  validateTokenFormat(token: string): boolean {
    return this.dao.validateTokenFormat(token);
  }
}
