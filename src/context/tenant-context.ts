// src/context/tenant-context.ts
import { AsyncLocalStorage } from "async_hooks";

interface TenantStore {
  channelId: string;
}

const storage = new AsyncLocalStorage<TenantStore>();

export const tenantContext = {
  /**
   * Runs `callback` with `channelId` bound to the async context. Any
   * Sequelize call made inside (including ones several awaits deep) will
   * see this channelId via getChannelId(). Supports async callbacks —
   * the returned promise resolves once the wrapped work finishes.
   */
  run<T>(channelId: string, callback: () => T): T {
    return storage.run({ channelId }, callback);
  },

  getChannelId(): string | undefined {
    return storage.getStore()?.channelId;
  },
};
