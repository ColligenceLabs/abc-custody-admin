/**
 * KYC 유틸리티 함수
 * eKYC 데이터 변환 및 표시 관련 헬퍼 함수
 */

/**
 * eKYC idCardType 매핑 (eKYC 원본값 → 한글 표시)
 *
 * @param idCardType - eKYC에서 반환된 신분증 유형 (1, 2, 3, 4, 5-1, 5-2, 5-3)
 * @returns 한글 신분증 유형 또는 기본값
 */
export function getIdCardTypeLabel(idCardType: string | null | undefined): string {
  if (!idCardType) {
    return '미확인';
  }

  const idCardTypeMap: Record<string, string> = {
    '1': '주민등록증',
    '2': '운전면허증',
    '3': '한국여권',
    '4': '외국인여권',
    '5-1': '외국인등록증',
    '5-2': '국내거소신고증',
    '5-3': '영주증',
  };

  return idCardTypeMap[idCardType] || '기타 신분증';
}

/**
 * 외국인 신분증 여부 확인
 *
 * @param idCardType - eKYC 신분증 유형
 * @returns 외국인 신분증 여부
 */
export function isForeignIdCard(idCardType: string | null | undefined): boolean {
  if (!idCardType) return false;
  return idCardType === '4' || idCardType.startsWith('5-');
}

/**
 * 주민등록번호 마스킹 해제 (필요시)
 *
 * @param residentNumber - 주민등록번호
 * @param masked - 마스킹 여부
 * @returns 마스킹되거나 원본 주민등록번호
 */
export function formatResidentNumber(
  residentNumber: string | null | undefined,
  masked: boolean = true
): string {
  if (!residentNumber) {
    return '-';
  }

  if (!masked) {
    return residentNumber;
  }

  // 마스킹: 앞 6자리만 표시, 뒤는 *******
  if (residentNumber.length >= 6) {
    return `${residentNumber.substring(0, 6)}-*******`;
  }

  return residentNumber;
}
