// src/utils/tenant-scope.ts
import { Model, ModelStatic, Op } from "sequelize";
import { tenantContext } from "../context/tenant-context";

/**
 * Attaches channel_id scoping hooks to a tenanted model:
 *  - beforeFind:        AND-filters every read by the current channel_id
 *  - beforeCreate:      forces channel_id on the new instance (ignores any
 *                        client-supplied channel_id on the payload)
 *  - beforeBulkCreate:  same, for Model.bulkCreate([...])
 *  - beforeBulkUpdate:  AND-filters Model.update({...}, { where }) by channel_id
 *  - beforeBulkDestroy: AND-filters Model.destroy({ where }) by channel_id
 *
 * Fails closed: if there's no channel_id in the async context and the call
 * didn't explicitly pass { bypassTenantScope: true }, it throws rather than
 * silently running unscoped. Instance-level user.update()/user.destroy()
 * calls are NOT separately hooked here — those operate on an instance that
 * was only reachable via an already-scoped find, so they inherit safety
 * from beforeFind.
 */
export function applyTenantScopeHooks(model: ModelStatic<Model>) {
  const missingContextError = (op: string) =>
    new Error(
      `[tenant-scope] No channel context for ${model.name}.${op}. ` +
        `Pass { bypassTenantScope: true } explicitly if this call is meant to run outside a tenant (admin routes, seeders, cron).`,
    );

  model.addHook("beforeFind", (options: any) => {
    if (options.bypassTenantScope) return;

    const channelId = tenantContext.getChannelId();
    if (!channelId) throw missingContextError("find");

    options.where = options.where
      ? { [Op.and]: [options.where, { channel_id: channelId }] }
      : { channel_id: channelId };
  });

  model.addHook("beforeCreate", (instance: any, options: any) => {
    if (options.bypassTenantScope) return;

    const channelId = tenantContext.getChannelId();
    if (!channelId) throw missingContextError("create");

    instance.channel_id = channelId;
  });

  model.addHook("beforeBulkCreate", (instances: any[], options: any) => {
    if (options.bypassTenantScope) return;

    const channelId = tenantContext.getChannelId();
    if (!channelId) throw missingContextError("bulkCreate");

    instances.forEach((instance) => {
      instance.channel_id = channelId;
    });
  });

  model.addHook("beforeBulkUpdate", (options: any) => {
    if (options.bypassTenantScope) return;

    const channelId = tenantContext.getChannelId();
    if (!channelId) throw missingContextError("update");

    options.where = options.where
      ? { [Op.and]: [options.where, { channel_id: channelId }] }
      : { channel_id: channelId };
  });

  model.addHook("beforeBulkDestroy", (options: any) => {
    if (options.bypassTenantScope) return;

    const channelId = tenantContext.getChannelId();
    if (!channelId) throw missingContextError("destroy");

    options.where = options.where
      ? { [Op.and]: [options.where, { channel_id: channelId }] }
      : { channel_id: channelId };
  });
}
