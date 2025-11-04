/**
 * KYC 유틸리티 함수
 */

/**
 * 신분증 유형 레이블 반환
 * @param idCardType - 신분증 유형 코드 (1-5)
 * @returns 신분증 유형 한글 레이블
 */
export function getIdCardTypeLabel(idCardType: number | string | null | undefined): string {
  if (!idCardType) return '-';

  const typeNum = typeof idCardType === 'string' ? parseInt(idCardType) : idCardType;

  const labels: Record<number, string> = {
    1: '주민등록증',
    2: '운전면허증',
    3: '한국여권',
    4: '외국인여권',
    5: '외국인등록증'
  };

  return labels[typeNum] || '-';
}
