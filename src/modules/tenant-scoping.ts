// src/modules/tenant-scoping.ts
import User from "./users/user.model";
import Guest from "./guest/guest.model";
import GuestNote from "./guest_note/guest_note.model";
import Studio from "./studio/studio.model";
import Interview from "./interview/interview.model";
import Media from "./media/media.model";
import Tags from "./tags/tags.model";
import Log from "./log/log.model";
import GuestReapprovalRequest from "./guest_reapproval_request/guest_reapproval_request.model";

import { applyTenantScopeHooks } from "../utils/tenant-scope";

export const setupTenantScoping = () => {
  [
    User,
    Guest,
    GuestNote,
    Studio,
    Interview,
    Media,
    Tags,
    Log,
    GuestReapprovalRequest,
  ].forEach(applyTenantScopeHooks);
};
