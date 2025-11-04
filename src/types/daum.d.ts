// Daum Postcode API 타입 정의

interface DaumPostcodeData {
  zonecode: string;
  address: string;
  addressEnglish: string;
  addressType: 'R' | 'J';
  userSelectedType: 'R' | 'J';
  roadAddress: string;
  jibunAddress: string;
  bname: string;
  buildingName: string;
  apartment: 'Y' | 'N';
  sido: string;
  sigungu: string;
  sigunguCode: string;
  roadnameCode: string;
  bcode: string;
  roadname: string;
}

declare global {
  interface Window {
    daum: {
      Postcode: new (options: {
        oncomplete: (data: DaumPostcodeData) => void;
      }) => {
        open: () => void;
      };
    };
  }
}

export {};
