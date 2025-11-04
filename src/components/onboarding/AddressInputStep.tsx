"use client";

import { useState, useEffect } from "react";
import { MapPinIcon, UserIcon, PhoneIcon, EnvelopeIcon } from "@heroicons/react/24/outline";

// DaumPostcodeData는 src/types/daum.d.ts에 정의됨

interface AddressInputStepProps {
  passData: {
    name: string;
    phone: string;
    email: string;
  };
  onComplete: (addressData: { zipCode: string; address: string; detailAddress: string }) => void;
  onBack: () => void;
}

export default function AddressInputStep({
  passData,
  onComplete,
  onBack,
}: AddressInputStepProps) {
  const [zipCode, setZipCode] = useState('');
  const [address, setAddress] = useState('');
  const [detailAddress, setDetailAddress] = useState('');
  const [scriptLoaded, setScriptLoaded] = useState(false);

  // 다음 주소 검색 스크립트 로드
  useEffect(() => {
    const script = document.createElement('script');
    script.src = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
    script.async = true;
    script.onload = () => {
      console.log('[AddressInput] 다음 주소 검색 API 로드 완료');
      setScriptLoaded(true);
    };
    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  const handleAddressSearch = () => {
    if (!scriptLoaded) {
      alert('주소 검색 서비스를 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    new window.daum.Postcode({
      oncomplete: function (data: any) {
        const selectedAddress = data.userSelectedType === 'R' ? data.roadAddress : data.jibunAddress;
        setZipCode(data.zonecode);
        setAddress(selectedAddress);
        setDetailAddress('');
      }
    }).open();
  };

  const handleNext = () => {
    if (!zipCode || !address) {
      alert('주소를 입력해주세요');
      return;
    }

    onComplete({ zipCode, address, detailAddress });
  };

  const isValid = zipCode && address;

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          개인정보 확인 및 주소 등록
        </h2>
        <p className="text-gray-600">
          본인 정보를 확인하고 주소를 등록해주세요
        </p>
      </div>

      {/* PASS 인증 정보 (읽기 전용) */}
      <div className="space-y-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            PASS 본인인증 정보 (수정 불가)
          </h3>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <UserIcon className="w-4 h-4 inline-block mr-1" />
                이름
              </label>
              <input
                type="text"
                value={passData.name}
                readOnly
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <PhoneIcon className="w-4 h-4 inline-block mr-1" />
                휴대폰 번호
              </label>
              <input
                type="text"
                value={passData.phone}
                readOnly
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <EnvelopeIcon className="w-4 h-4 inline-block mr-1" />
                이메일
              </label>
              <input
                type="text"
                value={passData.email}
                readOnly
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white cursor-not-allowed"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 주소 등록 */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-700">거주지 주소</h3>

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

      {/* 버튼 */}
      <div className="flex space-x-3 mt-6">
        <button
          onClick={onBack}
          className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          이전
        </button>
        <button
          onClick={handleNext}
          disabled={!isValid}
          className="flex-1 px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          다음
        </button>
      </div>
    </div>
  );
}
