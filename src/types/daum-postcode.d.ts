/**
 * 다음 주소검색 API 타입 정의
 */

interface Window {
  daum: {
    Postcode: new (options: DaumPostcodeOptions) => DaumPostcodeInstance;
  };
}

interface DaumPostcodeOptions {
  oncomplete: (data: DaumPostcodeData) => void;
  onclose?: () => void;
  width?: string | number;
  height?: string | number;
}

interface DaumPostcodeInstance {
  open: () => void;
  embed: (element: HTMLElement) => void;
}

interface DaumPostcodeData {
  zonecode: string;           // 우편번호 (5자리)
  address: string;            // 기본주소
  addressEnglish: string;     // 영문주소
  addressType: 'R' | 'J';     // 주소타입: R(도로명), J(지번)
  userSelectedType: 'R' | 'J';// 사용자가 선택한 주소타입
  roadAddress: string;        // 도로명주소
  jibunAddress: string;       // 지번주소
  bname: string;              // 법정동/법정리 이름
  buildingName: string;       // 건물명
  apartment: 'Y' | 'N';       // 공동주택 여부
  sido: string;               // 시도명
  sigungu: string;            // 시군구명
}
