/**
 * Helper utility to normalize text for flexible search:
 * - strips accents/diacritics
 * - strips punctuation (dots, hyphens, slashes, spaces) when comparing codes/digits
 */
export function normalizeSearch(str: string | undefined | null): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

export function stripPunctuation(str: string | undefined | null): string {
  if (!str) return '';
  return str.replace(/[\.\-\/\s,]/g, '').toLowerCase().trim();
}

/**
 * Checks if a target text matches the user's query either:
 * 1. Standard normalized text match (case/accent insensitive)
 * 2. Unpunctuated code/digit match (e.g. searching '10101' finds '01.01.01', '1.0101.11.00', '1.0101', etc.)
 */
export function matchesQuery(target: string | undefined | null, rawQuery: string): boolean {
  if (!rawQuery) return true;
  if (!target) return false;

  const normTarget = normalizeSearch(target);
  const normQuery = normalizeSearch(rawQuery);

  // 1. Direct normalized match
  if (normTarget.includes(normQuery)) {
    return true;
  }

  // 2. Unpunctuated match (ignoring dots, slashes, hyphens, spaces)
  const cleanTarget = stripPunctuation(target);
  const cleanQuery = stripPunctuation(rawQuery);

  if (cleanQuery.length > 0) {
    if (cleanTarget.includes(cleanQuery)) {
      return true;
    }

    // Also handle leading zero variations (e.g. user types '10101' for '010101' or vice versa)
    const strippedLeadingZerosTarget = cleanTarget.replace(/^0+/, '');
    const strippedLeadingZerosQuery = cleanQuery.replace(/^0+/, '');

    if (
      strippedLeadingZerosQuery.length >= 2 &&
      strippedLeadingZerosTarget.includes(strippedLeadingZerosQuery)
    ) {
      return true;
    }
  }

  return false;
}
