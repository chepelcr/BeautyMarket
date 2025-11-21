import { eq, and, lt } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import {
  organizationInvitations,
  type OrganizationInvitation,
  type InsertOrganizationInvitation,
  users,
  roles
} from "../entities";
import { nanoid } from "nanoid";

export interface OrganizationInvitationWithDetails extends OrganizationInvitation {
  role: {
    id: string;
    name: string;
    displayName: string;
  };
  invitedByUser: {
    id: string;
    username: string;
    email: string;
  };
}

export interface IOrganizationInvitationRepository {
  findById(id: string): Promise<OrganizationInvitation | null>;
  findByToken(token: string): Promise<OrganizationInvitation | null>;
  findByOrganizationId(organizationId: string): Promise<OrganizationInvitationWithDetails[]>;
  findPendingByEmail(email: string): Promise<OrganizationInvitation[]>;
  create(data: Omit<InsertOrganizationInvitation, 'token' | 'expiresAt'> & { invitedBy: string; organizationId: string }): Promise<OrganizationInvitation>;
  updateStatus(id: string, status: string): Promise<OrganizationInvitation | null>;
  delete(id: string): Promise<boolean>;
  expireOldInvitations(): Promise<number>;
}

export class OrganizationInvitationRepository implements IOrganizationInvitationRepository {
  constructor(private db: PostgresJsDatabase) {}

  async findById(id: string): Promise<OrganizationInvitation | null> {
    const result = await this.db
      .select()
      .from(organizationInvitations)
      .where(eq(organizationInvitations.id, id))
      .limit(1);
    return result[0] || null;
  }

  async findByToken(token: string): Promise<OrganizationInvitation | null> {
    const result = await this.db
      .select()
      .from(organizationInvitations)
      .where(eq(organizationInvitations.token, token))
      .limit(1);
    return result[0] || null;
  }

  async findByOrganizationId(organizationId: string): Promise<OrganizationInvitationWithDetails[]> {
    const result = await this.db
      .select({
        id: organizationInvitations.id,
        organizationId: organizationInvitations.organizationId,
        email: organizationInvitations.email,
        roleId: organizationInvitations.roleId,
        token: organizationInvitations.token,
        invitedBy: organizationInvitations.invitedBy,
        status: organizationInvitations.status,
        expiresAt: organizationInvitations.expiresAt,
        createdAt: organizationInvitations.createdAt,
        role: {
          id: roles.id,
          name: roles.name,
          displayName: roles.displayName,
        },
        invitedByUser: {
          id: users.id,
          username: users.username,
          email: users.email,
        },
      })
      .from(organizationInvitations)
      .innerJoin(roles, eq(organizationInvitations.roleId, roles.id))
      .innerJoin(users, eq(organizationInvitations.invitedBy, users.id))
      .where(eq(organizationInvitations.organizationId, organizationId))
      .orderBy(organizationInvitations.createdAt);

    return result;
  }

  async findPendingByEmail(email: string): Promise<OrganizationInvitation[]> {
    return this.db
      .select()
      .from(organizationInvitations)
      .where(
        and(
          eq(organizationInvitations.email, email),
          eq(organizationInvitations.status, "pending")
        )
      );
  }

  async create(
    data: Omit<InsertOrganizationInvitation, 'token' | 'expiresAt'> & { invitedBy: string; organizationId: string }
  ): Promise<OrganizationInvitation> {
    const token = nanoid(32);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiration

    const result = await this.db
      .insert(organizationInvitations)
      .values({
        ...data,
        token,
        expiresAt,
        status: "pending",
      })
      .returning();
    return result[0];
  }

  async updateStatus(id: string, status: string): Promise<OrganizationInvitation | null> {
    const result = await this.db
      .update(organizationInvitations)
      .set({ status })
      .where(eq(organizationInvitations.id, id))
      .returning();
    return result[0] || null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.db
      .delete(organizationInvitations)
      .where(eq(organizationInvitations.id, id))
      .returning();
    return result.length > 0;
  }

  async expireOldInvitations(): Promise<number> {
    const result = await this.db
      .update(organizationInvitations)
      .set({ status: "expired" })
      .where(
        and(
          eq(organizationInvitations.status, "pending"),
          lt(organizationInvitations.expiresAt, new Date())
        )
      )
      .returning();
    return result.length;
  }
}
