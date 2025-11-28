/**
 * 법인 코드 값 라벨 변환 함수
 */

// 법인유형 코드
export function getCorporateTypeLabel(code: string): string {
  const types: Record<string, string> = {
    '01': '금융기관',
    '02': '국가 및 지방자치단체',
    '03': '공공기관',
    '04': '상장법인',
    '05': '비영리법인',
    '06': '특수목적회사(SPC)',
    '09': '기타'
  };
  return types[code] || code;
}

// 성별 코드
export function getGenderLabel(code: string): string {
  const genders: Record<string, string> = {
    '1': '남',
    '2': '여',
    '9': '알수없음'
  };
  return genders[code] || code;
}

// 실명확인 구분 코드
export function getIdTypeLabel(code: string): string {
  const types: Record<string, string> = {
    '01': '주민등록번호(개인)',
    '04': '여권번호',
    '06': '외국인등록번호',
    '07': '국내거소신고번호',
    '14': 'CI번호'
  };
  return types[code] || code;
}

// 소유자 구분
export function getOwnerTypeLabel(code: string): string {
  const types: Record<string, string> = {
    '1': '주주 (L3)',
    '2': '임원 (L3)',
    '3': '실소유자 (L1)'
  };
  return types[code] || code;
}

// 확인방법 코드
export function getVerificationMethodLabel(code: string): string {
  const methods: Record<string, string> = {
    '01': '주주명부',
    '02': '사원명부',
    '03': '정관',
    '04': '이사명부',
    '06': '실제소유자명부',
    '99': '기타(공문 등)'
  };
  return methods[code] || code;
}

// 실소유자 구분
export function getRealOwnerTypeLabel(code: string): string {
  const types: Record<string, string> = {
    '01': '25% 이상 지분 보유 최대주주',
    '02': '최대 지분 소유자 중 1인',
    '03': '대표자·임원의 과반수 선임한 주주',
    '04': '법인·단체 사실상 지배하는 사람',
    '05': '법인·단체 대표자 중 1인(공동대표자)'
  };
  return types[code] || code;
}

// 기업 규모
export function getCompanySizeLabel(code: string): string {
  const sizes: Record<string, string> = {
    '01': '대기업',
    '02': '중소기업'
  };
  return sizes[code] || code;
}

// 금액 포맷 (원화)
export function formatCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return '-';
  return `${amount.toLocaleString('ko-KR')}원`;
}

// 민감정보 마스킹
export function maskSensitiveData(data: string, visibleStart = 4, visibleEnd = 4): string {
  if (!data || data.length <= visibleStart + visibleEnd) return data;
  const start = data.substring(0, visibleStart);
  const end = data.substring(data.length - visibleEnd);
  const masked = '*'.repeat(data.length - visibleStart - visibleEnd);
  return `${start}${masked}${end}`;
}
