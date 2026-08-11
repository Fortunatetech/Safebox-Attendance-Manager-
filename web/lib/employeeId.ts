/**
 * Employee ID format: SBX-DEPT-YYMM-NN
 *   SBX  — fixed company prefix
 *   DEPT — 2-4 letter department code (DT, HR, DEV, ENG, ...)
 *   YYMM — joining year + month
 *   NN   — 2-digit sequence number, a single company-wide counter (not scoped
 *          per department/month) — matches the numbering already in use.
 *
 * Example: SBX-DEV-2201-07
 *
 * Note: 2 digits caps this at 99 employees total before it needs to widen to
 * 3 digits — worth watching as headcount grows.
 */

export const EMPLOYEE_ID_PATTERN = /^SBX-[A-Z]{2,4}-\d{4}-\d{2}$/;
const COMPACT_PATTERN = /^SBX([A-Z]{2,4})(\d{4})(\d{2})$/;

/**
 * Accepts whatever a human typed — different case, missing/extra hyphens,
 * stray spaces — and returns the canonical `SBX-DEPT-YYMM-NN` form, or null
 * if it doesn't resolve to a validly-shaped ID. The letter/digit boundary
 * disambiguates a variable-length department code without needing separators.
 */
export function normalizeEmployeeId(raw: string): string | null {
  const compact = raw.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
  const match = compact.match(COMPACT_PATTERN);
  if (!match) return null;

  const [, dept, yymm, serial] = match;
  return `SBX-${dept}-${yymm}-${serial}`;
}

/** Builds a canonical ID from its parts. `serial` is the next company-wide sequence number. */
export function buildEmployeeId(departmentCode: string, joiningDateISO: string, serial: number): string {
  const dept = departmentCode.trim().toUpperCase();
  const [year, month] = joiningDateISO.split("-");
  const yymm = `${year.slice(-2)}${month}`;
  const serialStr = String(serial).padStart(2, "0");
  return `SBX-${dept}-${yymm}-${serialStr}`;
}

/** Highest sequence number among existing IDs that match the canonical format (0 if none). */
export function maxEmployeeSerial(employeeIds: string[]): number {
  const idPattern = /^SBX-[A-Z]{2,4}-\d{4}-(\d{2})$/;
  return employeeIds.reduce((max, id) => {
    const match = id.match(idPattern);
    const n = match ? Number(match[1]) : 0;
    return n > max ? n : max;
  }, 0);
}
