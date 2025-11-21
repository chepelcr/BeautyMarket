import { z } from "zod";

// Module
export interface Module {
  id: string;
  name: string;
  displayName: string;
  description: string | null;
  icon: string | null;
  isActive: boolean;
  sortOrder: number | null;
}

// Submodule
export interface Submodule {
  id: string;
  moduleId: string;
  name: string;
  displayName: string;
  description: string | null;
  isActive: boolean;
  sortOrder: number | null;
}

// Action
export interface Action {
  id: string;
  name: string;
  displayName: string;
  description: string | null;
}

// Role
export interface Role {
  id: string;
  name: string;
  displayName: string;
  description: string | null;
  isSystem: boolean;
  organizationId: string | null;
  createdAt: Date;
}

export interface InsertRole {
  name: string;
  displayName: string;
  description?: string | null;
  organizationId?: string | null;
}

// Role Permission
export interface RolePermission {
  id: string;
  roleId: string;
  moduleId: string;
  submoduleId: string | null;
  actionId: string;
}

// Extended types for UI
export interface ModuleWithSubmodules extends Module {
  submodules: Submodule[];
}

export interface RoleWithPermissions extends Role {
  permissions: RolePermission[];
}

// Permission matrix for UI
export interface PermissionMatrix {
  modules: ModuleWithSubmodules[];
  actions: Action[];
  permissions: {
    [moduleId: string]: {
      [actionId: string]: boolean;
      submodules?: {
        [submoduleId: string]: {
          [actionId: string]: boolean;
        };
      };
    };
  };
}

export const insertRoleSchema = z.object({
  name: z.string().min(1, "El nombre es requerido").regex(/^[a-z0-9_]+$/, "Solo letras minúsculas, números y guiones bajos"),
  displayName: z.string().min(1, "El nombre para mostrar es requerido"),
  description: z.string().nullable().optional(),
});
