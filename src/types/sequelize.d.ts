import "sequelize";

declare module "sequelize" {
  interface FindOptions {
    bypassTenantScope?: boolean;
  }
  interface NonNullFindOptions {
    bypassTenantScope?: boolean;
  }
  interface CreateOptions {
    bypassTenantScope?: boolean;
  }
  interface BulkCreateOptions {
    bypassTenantScope?: boolean;
  }
  interface UpdateOptions {
    bypassTenantScope?: boolean;
  }
  interface DestroyOptions {
    bypassTenantScope?: boolean;
  }
}
