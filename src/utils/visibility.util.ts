import { Op, WhereOptions } from "sequelize";

const RESTRICTED_ROLES = ["Staff", "Host"];

/**
 * Minimal shape this utility needs from the requesting user.
 */
export interface VisibilitySubject {
  id: string;
  role_name: string | null | undefined;
  created_at: Date;
  visibility_mode?: "default" | "range" | "all" | null;
  visibility_start_date?: Date | null;
  visibility_end_date?: Date | null;
}

/**
 * Optional extra rules for OR'ing in assignment-based visibility on top
 * of the normal time-based filter. Only applies to Host — Staff has no
 * assignment concept today. Admin, and Host/Staff in "all" mode, are
 * already fully unrestricted and skip this entirely.
 *
 * - assignmentField: a field on the model being queried that holds the
 *   Host's own id directly (e.g. "host_id" on Guest/Interview).
 * - assignmentIds + assignmentIdsField: a precomputed list of ids the
 *   Host is indirectly assigned to (e.g. guest ids reached via their
 *   Interviews), matched against assignmentIdsField (defaults to "id").
 */
export interface VisibilityFilterOptions {
  assignmentField?: string;
  assignmentIds?: string[];
  assignmentIdsField?: string;
}

/**
 * Builds the `created_at` visibility filter for a given requesting user,
 * optionally OR'd with assignment-based overrides.
 *
 * - Admin                        -> null (no filter, sees everything)
 * - Staff/Host, mode "all"       -> null (no filter, sees everything)
 * - Staff/Host, mode "default"   -> created_at >= their own created_at
 * - Staff/Host, mode "range"     -> created_at >= their own created_at
 *                                   OR created_at >= start_date (if no
 *                                   end_date) OR BETWEEN start/end (if
 *                                   both given)
 * - Host, with assignmentField/assignmentIds -> the above OR'd with
 *   directly/indirectly assigned records, regardless of created_at
 *   timing. Applies in both "default" and "range" modes.
 *
 * Returns `null` when no filter should be applied at all, so callers
 * can just skip merging when they get null back.
 */
export function getVisibilityFilter(
  subject: VisibilitySubject,
  options?: VisibilityFilterOptions,
): WhereOptions | null {
  if (!subject || !RESTRICTED_ROLES.includes(subject.role_name ?? "")) {
    return null;
  }

  const mode = subject.visibility_mode ?? "default";

  // "all" mode -> fully unrestricted, same effective outcome as Admin,
  // just scoped to this specific user rather than the role.
  if (mode === "all") {
    return null;
  }

  const conditions: WhereOptions[] = [
    { created_at: { [Op.gte]: subject.created_at } },
  ];

  if (mode === "range" && subject.visibility_start_date) {
    if (subject.visibility_end_date) {
      conditions.push({
        created_at: {
          [Op.between]: [
            subject.visibility_start_date,
            subject.visibility_end_date,
          ],
        },
      });
    } else {
      // No end date given -> start_date through now. Left as a plain
      // gte so "now" always tracks the actual current time, rather than
      // freezing an upper bound at query-build time.
      conditions.push({
        created_at: { [Op.gte]: subject.visibility_start_date },
      });
    }
  }

  if (subject.role_name === "Host") {
    if (options?.assignmentField) {
      conditions.push({ [options.assignmentField]: subject.id });
    }

    if (options?.assignmentIds && options.assignmentIds.length > 0) {
      const idField = options.assignmentIdsField ?? "id";
      conditions.push({
        [idField]: { [Op.in]: options.assignmentIds },
      });
    }
  }

  return conditions.length === 1 ? conditions[0] : { [Op.or]: conditions };
}

/**
 * Merges a visibility filter into an existing `where` clause safely.
 * If there's no visibility filter to apply (e.g. requester is Admin,
 * or mode is "all"), the original where clause is returned untouched.
 */
export function mergeVisibilityFilter(
  existingWhere: WhereOptions = {},
  visibilityFilter: WhereOptions | null,
): WhereOptions {
  if (!visibilityFilter) {
    return existingWhere;
  }

  const hasExistingConditions = Object.keys(existingWhere).length > 0;

  if (!hasExistingConditions) {
    return visibilityFilter;
  }

  return {
    [Op.and]: [existingWhere, visibilityFilter],
  };
}
