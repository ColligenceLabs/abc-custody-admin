/**
 * 주소 타입 정의
 * 개인회원과 법인회원 모두 사용하는 공통 주소 타입
 */

/**
 * 한국 주소 타입
 */
export interface AddressKorea {
  type: 'korea';
  postalCode: string;        // 우편번호 (5자리)
  address: string;           // 기본주소 (도로명 또는 지번)
  detailAddress: string;     // 상세주소
}

/**
 * 해외 주소 타입
 */
export interface AddressInternational {
  type: 'international';
  fullAddress: string;       // 전체 주소 (자유 형식)
}

/**
 * 통합 주소 타입
 * 한국 주소 또는 해외 주소, 또는 null
 */
export type UserAddress = AddressKorea | AddressInternational | null;

/**
 * 국가 정보
 */
export interface Country {
  code: string;              // ISO 국가 코드 (예: "KR", "US")
  name: string;              // 국가명 (예: "한국", "미국")
}
