import { Op, WhereOptions } from "sequelize";

const RESTRICTED_ROLES = ["Staff", "Host"];

/**
 * Minimal shape this utility needs from the requesting user.
 * Your req.user / User model already has all of these — this interface
 * just documents what's required, so callers don't need to pass the
 * entire Sequelize instance if they don't want to.
 */
export interface VisibilitySubject {
  id: string;
  role_name: string | null | undefined;
  created_at: Date;
  visibility_start_date?: Date | null;
  visibility_end_date?: Date | null;
}

/**
 * Optional extra rule: in addition to the normal time-based visibility,
 * also treat rows as visible if they're directly assigned to this
 * subject via the given field (e.g. "host_id" on Guest/Interview).
 *
 * Only applies to Host — Staff has no assignment concept today. Admin
 * remains fully unrestricted regardless of this option.
 */
export interface VisibilityFilterOptions {
  assignmentField?: string;
}

/**
 * Builds the `created_at` visibility filter for a given requesting user,
 * optionally OR'd with a direct-assignment override.
 *
 * - Admin                 -> returns null (no filter, sees everything)
 * - Staff/Host, no window -> only rows with created_at >= their own created_at
 * - Staff/Host, window    -> rows with created_at >= their own created_at
 *                            OR rows created_at BETWEEN their granted window
 * - Host, with assignmentField -> the above OR rows where
 *                            [assignmentField] === subject.id, regardless
 *                            of created_at timing
 *
 * Returns `null` when no filter should be applied at all (Admin), so
 * callers can just skip merging when they get null back.
 */
export function getVisibilityFilter(
  subject: VisibilitySubject,
  options?: VisibilityFilterOptions,
): WhereOptions | null {
  if (!subject || !RESTRICTED_ROLES.includes(subject.role_name ?? "")) {
    return null;
  }

  const conditions: WhereOptions[] = [
    { created_at: { [Op.gte]: subject.created_at } },
  ];

  if (subject.visibility_start_date && subject.visibility_end_date) {
    conditions.push({
      created_at: {
        [Op.between]: [
          subject.visibility_start_date,
          subject.visibility_end_date,
        ],
      },
    });
  }

  // Direct-assignment override — Host only. Assigned rows are visible
  // regardless of created_at timing, since assignment is an explicit
  // grant that should always win over the time-based default.
  if (options?.assignmentField && subject.role_name === "Host") {
    conditions.push({ [options.assignmentField]: subject.id });
  }

  return conditions.length === 1 ? conditions[0] : { [Op.or]: conditions };
}

/**
 * Merges a visibility filter into an existing `where` clause safely.
 * If there's no visibility filter to apply (e.g. requester is Admin),
 * the original where clause is returned untouched.
 *
 * Usage:
 *   const where = mergeVisibilityFilter(existingWhere, getVisibilityFilter(req.user));
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
