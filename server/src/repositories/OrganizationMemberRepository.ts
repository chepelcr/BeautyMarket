import { eq, and } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import {
  organizationMembers,
  type OrganizationMember,
  type InsertOrganizationMember,
  users,
  roles
} from "../entities";

export interface OrganizationMemberWithDetails extends OrganizationMember {
  user: {
    id: string;
    username: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
  };
  role: {
    id: string;
    name: string;
    displayName: string;
  };
}

export interface IOrganizationMemberRepository {
  findById(id: string): Promise<OrganizationMember | null>;
  findByOrganizationId(organizationId: string): Promise<OrganizationMemberWithDetails[]>;
  findByUserId(userId: string): Promise<OrganizationMember[]>;
  findByUserAndOrganization(userId: string, organizationId: string): Promise<OrganizationMember | null>;
  findUserDefaultOrganization(userId: string): Promise<OrganizationMember | null>;
  create(data: InsertOrganizationMember): Promise<OrganizationMember>;
  updateRole(id: string, roleId: string): Promise<OrganizationMember | null>;
  setDefault(userId: string, organizationId: string): Promise<OrganizationMember | null>;
  delete(id: string): Promise<boolean>;
  deleteByUserAndOrganization(userId: string, organizationId: string): Promise<boolean>;
  countByOrganization(organizationId: string): Promise<number>;
}

export class OrganizationMemberRepository implements IOrganizationMemberRepository {
  constructor(private db: PostgresJsDatabase) {}

  async findById(id: string): Promise<OrganizationMember | null> {
    const result = await this.db
      .select()
      .from(organizationMembers)
      .where(eq(organizationMembers.id, id))
      .limit(1);
    return result[0] || null;
  }

  async findByOrganizationId(organizationId: string): Promise<OrganizationMemberWithDetails[]> {
    const result = await this.db
      .select({
        id: organizationMembers.id,
        organizationId: organizationMembers.organizationId,
        userId: organizationMembers.userId,
        roleId: organizationMembers.roleId,
        isDefault: organizationMembers.isDefault,
        invitedBy: organizationMembers.invitedBy,
        joinedAt: organizationMembers.joinedAt,
        user: {
          id: users.id,
          username: users.username,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
        },
        role: {
          id: roles.id,
          name: roles.name,
          displayName: roles.displayName,
        },
      })
      .from(organizationMembers)
      .innerJoin(users, eq(organizationMembers.userId, users.id))
      .innerJoin(roles, eq(organizationMembers.roleId, roles.id))
      .where(eq(organizationMembers.organizationId, organizationId))
      .orderBy(organizationMembers.joinedAt);

    return result;
  }

  async findByUserId(userId: string): Promise<OrganizationMember[]> {
    return this.db
      .select()
      .from(organizationMembers)
      .where(eq(organizationMembers.userId, userId));
  }

  async findByUserAndOrganization(userId: string, organizationId: string): Promise<OrganizationMember | null> {
    const result = await this.db
      .select()
      .from(organizationMembers)
      .where(
        and(
          eq(organizationMembers.userId, userId),
          eq(organizationMembers.organizationId, organizationId)
        )
      )
      .limit(1);
    return result[0] || null;
  }

  async findUserDefaultOrganization(userId: string): Promise<OrganizationMember | null> {
    const result = await this.db
      .select()
      .from(organizationMembers)
      .where(
        and(
          eq(organizationMembers.userId, userId),
          eq(organizationMembers.isDefault, true)
        )
      )
      .limit(1);
    return result[0] || null;
  }

  async create(data: InsertOrganizationMember): Promise<OrganizationMember> {
    const result = await this.db
      .insert(organizationMembers)
      .values(data)
      .returning();
    return result[0];
  }

  async updateRole(id: string, roleId: string): Promise<OrganizationMember | null> {
    const result = await this.db
      .update(organizationMembers)
      .set({ roleId })
      .where(eq(organizationMembers.id, id))
      .returning();
    return result[0] || null;
  }

  async setDefault(userId: string, organizationId: string): Promise<OrganizationMember | null> {
    // First, unset all defaults for this user
    await this.db
      .update(organizationMembers)
      .set({ isDefault: false })
      .where(eq(organizationMembers.userId, userId));

    // Then set the new default
    const result = await this.db
      .update(organizationMembers)
      .set({ isDefault: true })
      .where(
        and(
          eq(organizationMembers.userId, userId),
          eq(organizationMembers.organizationId, organizationId)
        )
      )
      .returning();
    return result[0] || null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.db
      .delete(organizationMembers)
      .where(eq(organizationMembers.id, id))
      .returning();
    return result.length > 0;
  }

  async deleteByUserAndOrganization(userId: string, organizationId: string): Promise<boolean> {
    const result = await this.db
      .delete(organizationMembers)
      .where(
        and(
          eq(organizationMembers.userId, userId),
          eq(organizationMembers.organizationId, organizationId)
        )
      )
      .returning();
    return result.length > 0;
  }

  async countByOrganization(organizationId: string): Promise<number> {
    const result = await this.db
      .select({ id: organizationMembers.id })
      .from(organizationMembers)
      .where(eq(organizationMembers.organizationId, organizationId));
    return result.length;
  }
}
