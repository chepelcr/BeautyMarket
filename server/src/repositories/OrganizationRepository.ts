import { eq, and, or, ilike } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { organizations, type Organization, type InsertOrganization } from "../entities";

export interface IOrganizationRepository {
  findById(id: string): Promise<Organization | null>;
  findBySlug(slug: string): Promise<Organization | null>;
  findBySubdomain(subdomain: string): Promise<Organization | null>;
  findByCustomDomain(customDomain: string): Promise<Organization | null>;
  findAll(): Promise<Organization[]>;
  create(data: InsertOrganization): Promise<Organization>;
  update(id: string, data: Partial<InsertOrganization>): Promise<Organization | null>;
  delete(id: string): Promise<boolean>;
  checkSubdomainAvailable(subdomain: string, excludeId?: string): Promise<boolean>;
  checkSlugAvailable(slug: string, excludeId?: string): Promise<boolean>;
  search(query: string): Promise<Organization[]>;
}

export class OrganizationRepository implements IOrganizationRepository {
  constructor(private db: PostgresJsDatabase) {}

  async findById(id: string): Promise<Organization | null> {
    const result = await this.db
      .select()
      .from(organizations)
      .where(eq(organizations.id, id))
      .limit(1);
    return result[0] || null;
  }

  async findBySlug(slug: string): Promise<Organization | null> {
    const result = await this.db
      .select()
      .from(organizations)
      .where(eq(organizations.slug, slug))
      .limit(1);
    return result[0] || null;
  }

  async findBySubdomain(subdomain: string): Promise<Organization | null> {
    const result = await this.db
      .select()
      .from(organizations)
      .where(eq(organizations.subdomain, subdomain))
      .limit(1);
    return result[0] || null;
  }

  async findByCustomDomain(customDomain: string): Promise<Organization | null> {
    const result = await this.db
      .select()
      .from(organizations)
      .where(eq(organizations.customDomain, customDomain))
      .limit(1);
    return result[0] || null;
  }

  async findAll(): Promise<Organization[]> {
    return this.db
      .select()
      .from(organizations)
      .orderBy(organizations.name);
  }

  async create(data: InsertOrganization): Promise<Organization> {
    const result = await this.db
      .insert(organizations)
      .values(data)
      .returning();
    return result[0];
  }

  async update(id: string, data: Partial<InsertOrganization>): Promise<Organization | null> {
    const result = await this.db
      .update(organizations)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(organizations.id, id))
      .returning();
    return result[0] || null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.db
      .delete(organizations)
      .where(eq(organizations.id, id))
      .returning();
    return result.length > 0;
  }

  async checkSubdomainAvailable(subdomain: string, excludeId?: string): Promise<boolean> {
    const conditions = [eq(organizations.subdomain, subdomain)];

    const result = await this.db
      .select({ id: organizations.id })
      .from(organizations)
      .where(and(...conditions))
      .limit(1);

    if (result.length === 0) return true;
    if (excludeId && result[0].id === excludeId) return true;
    return false;
  }

  async checkSlugAvailable(slug: string, excludeId?: string): Promise<boolean> {
    const result = await this.db
      .select({ id: organizations.id })
      .from(organizations)
      .where(eq(organizations.slug, slug))
      .limit(1);

    if (result.length === 0) return true;
    if (excludeId && result[0].id === excludeId) return true;
    return false;
  }

  async search(query: string): Promise<Organization[]> {
    return this.db
      .select()
      .from(organizations)
      .where(
        or(
          ilike(organizations.name, `%${query}%`),
          ilike(organizations.slug, `%${query}%`),
          ilike(organizations.subdomain, `%${query}%`)
        )
      )
      .orderBy(organizations.name);
  }

  async updateAWSResources(
    id: string,
    resources: {
      s3BucketName?: string;
      cloudfrontDistributionId?: string;
      cloudfrontDomain?: string;
    }
  ): Promise<Organization | null> {
    const result = await this.db
      .update(organizations)
      .set({ ...resources, updatedAt: new Date() })
      .where(eq(organizations.id, id))
      .returning();
    return result[0] || null;
  }

  async verifyDomain(id: string): Promise<Organization | null> {
    const result = await this.db
      .update(organizations)
      .set({ domainVerified: true, updatedAt: new Date() })
      .where(eq(organizations.id, id))
      .returning();
    return result[0] || null;
  }
}
