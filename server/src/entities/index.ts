// Organization and Multi-tenancy
export { organizations, type Organization, type InsertOrganization, type OrganizationSettings, type ACMValidationRecord, type InfrastructureStatus } from "./Organization";
export { organizationMembers, type OrganizationMember, type InsertOrganizationMember } from "./OrganizationMember";
export { organizationInvitations, type OrganizationInvitation, type InsertOrganizationInvitation } from "./OrganizationInvitation";

// RBAC (Role-Based Access Control)
export { modules, type Module, type InsertModule } from "./Module";
export { submodules, type Submodule, type InsertSubmodule } from "./Submodule";
export { actions, type Action, type InsertAction } from "./Action";
export { roles, type Role, type InsertRole } from "./Role";
export { rolePermissions, type RolePermission, type InsertRolePermission } from "./RolePermission";

// Settings (Normalized from Organization.settings JSONB)
export { themeSettings, type ThemeSettings, type InsertThemeSettings } from "./ThemeSettings";
export { contactSettings, type ContactSettings, type InsertContactSettings } from "./ContactSettings";
export { paymentSettings, type PaymentSettings, type InsertPaymentSettings } from "./PaymentSettings";
export { shippingSettings, type ShippingSettings, type InsertShippingSettings } from "./ShippingSettings";

// Template & Page System
export { templates, type Template, type InsertTemplate } from "./Template";
export { pages, type Page, type InsertPage, type PageType } from "./Page";
export { pageSections, type PageSection, type InsertPageSection } from "./PageSection";
export { components, type Component, type InsertComponent, type ComponentConfig } from "./Component";
export { sectionContent, type SectionContent, type InsertSectionContent, type ValueType } from "./SectionContent";

// Template Content Tables
export { templateThemeSettings, type TemplateThemeSettings, type InsertTemplateThemeSettings } from "./TemplateThemeSettings";
export { templateContactSettings, type TemplateContactSettings, type InsertTemplateContactSettings } from "./TemplateContactSettings";
export { templatePaymentSettings, type TemplatePaymentSettings, type InsertTemplatePaymentSettings } from "./TemplatePaymentSettings";
export { templateShippingSettings, type TemplateShippingSettings, type InsertTemplateShippingSettings } from "./TemplateShippingSettings";
export { templatePages, type TemplatePage, type InsertTemplatePage } from "./TemplatePage";
export { templatePageSections, type TemplatePageSection, type InsertTemplatePageSection } from "./TemplatePageSection";
export { templateSectionContent, type TemplateSectionContent, type InsertTemplateSectionContent } from "./TemplateSectionContent";
export { templateCategories, type TemplateCategory, type InsertTemplateCategory } from "./TemplateCategory";
export { templateProducts, type TemplateProduct } from "./TemplateProduct";

// Core entity tables
export { products, type Product } from "./Product";
export { customers, type Customer, type InsertCustomer } from "./Customer";
export { sessions } from "./Session";
export { users, type User, type UpsertUser } from "./User";
export { categoriesTable, type Category, validCategories, type ValidCategory } from "./Category";
export { provinces, cantons, districts, type Province, type Canton, type District } from "./Location";
export { homePageContent, type HomePageContent } from "./HomePageContent";
export { deploymentHistory, type DeploymentHistory, type InsertDeploymentHistory } from "./Deployment";
export { preDeployments, type PreDeployment } from "./PreDeployment";
