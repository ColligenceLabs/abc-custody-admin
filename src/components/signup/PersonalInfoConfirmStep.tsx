"use client";

import { useState, useEffect } from "react";
import {
  UserIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";
import { SignupData } from "@/app/signup/page";

interface PersonalInfoConfirmStepProps {
  initialData: SignupData;
  onComplete: (data: Partial<SignupData>) => void;
  onBack: () => void;
}

// 다음 주소 검색 API 타입 정의
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

interface DaumPostcodeData {
  zonecode: string;
  address: string;
  roadAddress: string;
  jibunAddress: string;
  buildingName: string;
  userSelectedType: 'R' | 'J';
}

export default function PersonalInfoConfirmStep({
  initialData,
  onComplete,
  onBack,
}: PersonalInfoConfirmStepProps) {
  const [allAgreed, setAllAgreed] = useState(false);
  const [agreements, setAgreements] = useState({
    serviceTerms: false,
    personalInfo: false,
    carrierTerms: false,
    marketing: false,
  });

  // PASS 인증 정보로 채워진 개인정보 (읽기 전용)
  const [name, setName] = useState(initialData.passName || "");
  const [residentNumber, setResidentNumber] = useState(
    initialData.passBirthDate
      ? `${initialData.passBirthDate.replace(/-/g, '').substring(2)}-${initialData.passGender === 'MALE' ? '1' : '2'}******`
      : ""
  );

  // 주소 정보
  const [zipCode, setZipCode] = useState(initialData.zipCode || "");
  const [address, setAddress] = useState(initialData.address || "");
  const [detailAddress, setDetailAddress] = useState(initialData.detailAddress || "");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // 다음 주소 검색 스크립트 로드
  useEffect(() => {
    const script = document.createElement('script');
    script.src = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
    script.async = true;
    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  useEffect(() => {
    const allChecked = agreements.serviceTerms && agreements.personalInfo && agreements.carrierTerms;
    setAllAgreed(allChecked && agreements.marketing);
  }, [agreements]);

  const handleAllAgreement = (checked: boolean) => {
    setAllAgreed(checked);
    setAgreements({
      serviceTerms: checked,
      personalInfo: checked,
      carrierTerms: checked,
      marketing: checked,
    });
  };

  const handleAgreementChange = (
    key: keyof typeof agreements,
    checked: boolean
  ) => {
    setAgreements((prev) => ({ ...prev, [key]: checked }));
  };

  const handleAddressSearch = () => {
    if (!window.daum) {
      setMessage({
        type: "error",
        text: "주소 검색 서비스를 불러오는 중입니다. 잠시 후 다시 시도해주세요."
      });
      return;
    }

    new window.daum.Postcode({
      oncomplete: function(data: DaumPostcodeData) {
        // 도로명 주소 또는 지번 주소 선택
        const fullAddress = data.userSelectedType === 'R'
          ? data.roadAddress
          : data.jibunAddress;

        setZipCode(data.zonecode);
        setAddress(fullAddress);
        setMessage({
          type: "success",
          text: "주소가 입력되었습니다. 상세 주소를 입력해주세요."
        });
      }
    }).open();
  };

  const handleNext = () => {
    // 필수 약관 동의 확인
    if (!agreements.serviceTerms || !agreements.personalInfo || !agreements.carrierTerms) {
      setMessage({
        type: "error",
        text: "필수 약관에 동의해주세요."
      });
      return;
    }

    // 주소 정보 입력 확인
    if (!zipCode || !address || !detailAddress) {
      setMessage({
        type: "error",
        text: "주소 정보를 모두 입력해주세요."
      });
      return;
    }

    setLoading(true);
    setMessage(null);

    // 약간의 딜레이 후 다음 단계로 이동
    setTimeout(() => {
      onComplete({
        zipCode,
        address,
        detailAddress,
        serviceTermsAgreed: agreements.serviceTerms,
        personalInfoAgreed: agreements.personalInfo,
        carrierTermsAgreed: agreements.carrierTerms,
        marketingAgreed: agreements.marketing
      });
      setLoading(false);
    }, 500);
  };

  const isValid =
    agreements.serviceTerms &&
    agreements.personalInfo &&
    agreements.carrierTerms &&
    zipCode.length > 0 &&
    address.length > 0 &&
    detailAddress.length > 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
      {/* 헤더 */}
      <div className="text-center mb-6">
        <div className="mx-auto w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mb-4">
          <UserIcon className="w-6 h-6 text-primary-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900">
          개인정보 확인 및 주소 등록
        </h2>
        <p className="text-gray-600 mt-1">
          본인 정보를 확인하고 주소를 등록해주세요
        </p>
      </div>

      {/* 메시지 */}
      {message && (
        <div
          className={`mb-4 p-4 rounded-lg border ${
            message.type === "success"
              ? "bg-primary-50 border-primary-200 text-primary-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          <div className="flex items-center">
            {message.type === "success" ? (
              <CheckCircleIcon className="w-5 h-5 mr-2" />
            ) : (
              <ExclamationTriangleIcon className="w-5 h-5 mr-2" />
            )}
            <span className="text-sm">{message.text}</span>
          </div>
        </div>
      )}

      {/* 약관 동의 */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <label className="flex items-center cursor-pointer mb-3 pb-3 border-b border-gray-200">
          <input
            type="checkbox"
            checked={allAgreed}
            onChange={(e) => handleAllAgreement(e.target.checked)}
            className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
          />
          <span className="ml-3 text-sm font-semibold text-gray-900">
            전체 동의
          </span>
        </label>
        <div className="space-y-2">
          <label className="flex items-center justify-between cursor-pointer group">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={agreements.serviceTerms}
                onChange={(e) =>
                  handleAgreementChange("serviceTerms", e.target.checked)
                }
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <span className="ml-3 text-sm text-gray-700">
                서비스 이용약관 동의 (필수)
              </span>
            </div>
            <svg
              className="w-4 h-4 text-gray-400 group-hover:text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </label>
          <label className="flex items-center justify-between cursor-pointer group">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={agreements.personalInfo}
                onChange={(e) =>
                  handleAgreementChange("personalInfo", e.target.checked)
                }
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <span className="ml-3 text-sm text-gray-700">
                개인정보 수집 및 이용 동의 (필수)
              </span>
            </div>
            <svg
              className="w-4 h-4 text-gray-400 group-hover:text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </label>
          <label className="flex items-center justify-between cursor-pointer group">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={agreements.carrierTerms}
                onChange={(e) =>
                  handleAgreementChange("carrierTerms", e.target.checked)
                }
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <span className="ml-3 text-sm text-gray-700">
                통신사 이용약관 동의 (필수)
              </span>
            </div>
            <svg
              className="w-4 h-4 text-gray-400 group-hover:text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </label>
          <label className="flex items-center justify-between cursor-pointer group">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={agreements.marketing}
                onChange={(e) =>
                  handleAgreementChange("marketing", e.target.checked)
                }
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <span className="ml-3 text-sm text-gray-700">
                마케팅 정보 수신 동의 (선택)
              </span>
            </div>
            <svg
              className="w-4 h-4 text-gray-400 group-hover:text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </label>
        </div>
      </div>

      {/* 개인정보 확인 (읽기 전용) */}
      <div className="space-y-4 mb-6">
        {/* 이름 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            이름
          </label>
          <input
            type="text"
            value={name}
            readOnly
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
          />
        </div>

        {/* 생년월일 (주민번호 앞자리) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            생년월일
          </label>
          <input
            type="text"
            value={residentNumber}
            readOnly
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
          />
        </div>
      </div>

      {/* 주소 등록 */}
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
          disabled={!isValid || loading}
          className="flex-1 px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
          ) : null}
          {loading ? "처리 중..." : "다음"}
        </button>
      </div>
    </div>
  );
}
