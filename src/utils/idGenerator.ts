/**
 * User ID Generator Utility
 *
 * Generates unique IDs for individual and corporate members.
 *
 * ID Pattern: {prefix}_{timestamp}_{random}
 * - Individual: indi_1761900813580_rog9di0ne
 * - Corporate:  corp_1761900813580_abc1def2g
 *
 * Legacy users with "user_" prefix are preserved.
 * New registrations use "indi_" or "corp_" prefix based on member type.
 */

export type MemberType = 'INDIVIDUAL' | 'CORPORATE';

/**
 * Generates a unique user ID based on member type
 *
 * @param memberType - The type of member ('INDIVIDUAL' | 'CORPORATE')
 * @returns Generated user ID with appropriate prefix
 *
 * @example
 * generateUserId('INDIVIDUAL') // Returns: "indi_1761900813580_rog9di0ne"
 * generateUserId('CORPORATE')  // Returns: "corp_1761900813580_abc1def2g"
 */
export const generateUserId = (memberType: MemberType): string => {
  // Determine prefix based on member type
  const prefix = memberType === 'CORPORATE' ? 'corp' : 'indi';

  // Generate timestamp (milliseconds since epoch)
  const timestamp = Date.now();

  // Generate random alphanumeric string (9 characters)
  // Uses base36 encoding: 0-9, a-z
  const random = Math.random().toString(36).substring(2, 11);

  // Combine components
  return `${prefix}_${timestamp}_${random}`;
};

/**
 * Validates user ID format
 *
 * Supports legacy "user_" prefix and new "indi_"/"corp_" prefixes
 *
 * @param id - User ID to validate
 * @returns true if valid format
 *
 * @example
 * isValidUserId('indi_1761900813580_rog9di0ne') // true
 * isValidUserId('user_1761900813580_abc123def') // true (legacy)
 * isValidUserId('invalid_id') // false
 */
export const isValidUserId = (id: string): boolean => {
  const pattern = /^(user|indi|corp)_\d+_[a-z0-9]{9}$/;
  return pattern.test(id);
};

/**
 * Extracts member type from user ID
 *
 * @param id - User ID
 * @returns Member type or null if invalid
 *
 * @example
 * getMemberTypeFromId('indi_1761900813580_rog9di0ne') // 'INDIVIDUAL'
 * getMemberTypeFromId('corp_1761900813580_abc1def2g') // 'CORPORATE'
 * getMemberTypeFromId('user_1761900813580_abc123def') // 'INDIVIDUAL' (legacy)
 */
export const getMemberTypeFromId = (id: string): MemberType | null => {
  if (!isValidUserId(id)) return null;

  if (id.startsWith('corp_')) {
    return 'CORPORATE';
  }

  // Both 'user_' and 'indi_' are treated as INDIVIDUAL
  return 'INDIVIDUAL';
};
