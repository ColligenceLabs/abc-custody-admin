"use client";

import { useState, useEffect } from "react";
import { MapPinIcon } from "@heroicons/react/24/outline";

// 다음 주소 검색 API 타입 정의
declare global {
  interface Window {
    daum: any;
  }
}

interface AddressData {
  zipCode: string;
  address: string;
  detailAddress: string;
}

interface AddressSearchProps {
  initialData?: AddressData;
  onChange: (data: AddressData) => void;
}

export default function AddressSearch({ initialData, onChange }: AddressSearchProps) {
  const [zipCode, setZipCode] = useState(initialData?.zipCode || '');
  const [address, setAddress] = useState(initialData?.address || '');
  const [detailAddress, setDetailAddress] = useState(initialData?.detailAddress || '');
  const [scriptLoaded, setScriptLoaded] = useState(false);

  // 다음 주소 검색 스크립트 로드
  useEffect(() => {
    const script = document.createElement('script');
    script.src = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
    script.async = true;
    script.onload = () => {
      console.log('[AddressSearch] 다음 주소 검색 API 로드 완료');
      setScriptLoaded(true);
    };
    script.onerror = () => {
      console.error('[AddressSearch] 다음 주소 검색 API 로드 실패');
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // 주소 데이터 변경 시 부모에게 전달
  useEffect(() => {
    onChange({ zipCode, address, detailAddress });
  }, [zipCode, address, detailAddress, onChange]);

  const handleAddressSearch = () => {
    if (!scriptLoaded) {
      alert('주소 검색 서비스를 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    new window.daum.Postcode({
      oncomplete: function (data: any) {
        // 도로명 주소 또는 지번 주소 선택
        const selectedAddress = data.userSelectedType === 'R' ? data.roadAddress : data.jibunAddress;

        setZipCode(data.zonecode);
        setAddress(selectedAddress);
        setDetailAddress(''); // 새 주소 선택 시 상세주소 초기화

        console.log('[AddressSearch] 주소 선택:', {
          zonecode: data.zonecode,
          address: selectedAddress
        });
      }
    }).open();
  };

  return (
    <div className="space-y-4">
      {/* 우편번호 + 주소 검색 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <MapPinIcon className="w-4 h-4 inline-block mr-1" />
          우편번호
        </label>
        <div className="flex space-x-2">
          <input
            type="text"
            value={zipCode}
            readOnly
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
            placeholder="우편번호"
          />
          <button
            onClick={handleAddressSearch}
            type="button"
            className="px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors whitespace-nowrap"
          >
            주소 검색
          </button>
        </div>
      </div>

      {/* 기본 주소 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          기본 주소
        </label>
        <input
          type="text"
          value={address}
          readOnly
          className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
          placeholder="주소 검색 버튼을 클릭해주세요"
        />
      </div>

      {/* 상세 주소 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          상세 주소
        </label>
        <input
          type="text"
          value={detailAddress}
          onChange={(e) => setDetailAddress(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          placeholder="동, 호수 등 상세 주소를 입력해주세요"
        />
      </div>
    </div>
  );
}
