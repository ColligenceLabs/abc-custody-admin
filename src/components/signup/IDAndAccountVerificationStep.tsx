"use client";

import { useState, useEffect, useRef } from "react";
import {
  CreditCardIcon,
  BanknotesIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
} from "@heroicons/react/24/outline";
import { SignupData } from "@/app/signup/page";

interface IDAndAccountVerificationStepProps {
  initialData: SignupData;
  onComplete: (data: Partial<SignupData>) => void;
  onBack: () => void;
}

// eKYC 응답 타입
interface EKYCResponse {
  result: "success" | "failed" | "complete" | "close";
  message?: string;
  review_result?: {
    id: number;
    transaction_id: string;
    result_type: 1 | 2 | 5; // 1: 자동승인, 2: 자동거부, 5: 심사필요
    name: string;
    phone_number: string;
    birthday: string;
    module: {
      id_card_ocr: boolean;
      id_card_verification: boolean;
      face_authentication: boolean;
      account_verification: boolean;
      liveness: boolean;
    };
    id_card?: any;
    face_check?: any;
    account?: {
      verified: boolean;
      finance_code: string;
      finance_company: string;
      account_number: string;
      account_holder: string;
      mod_account_holder: string | null;
      business_number: string | null;
    };
  };
  api_response?: {
    result_code: string;
    result_message: string;
  };
}

type VerificationPhase = "intro" | "qr" | "id" | "account" | "complete";

export default function IDAndAccountVerificationStep({
  initialData,
  onComplete,
  onBack,
}: IDAndAccountVerificationStepProps) {
  const [currentPhase, setCurrentPhase] = useState<VerificationPhase>("intro");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [idVerified, setIdVerified] = useState(false);
  const [accountVerified, setAccountVerified] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<'mobile' | 'pc' | null>(null);
  const [qrExpireTime, setQrExpireTime] = useState<number>(600); // 10분 = 600초
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const KYC_TARGET_ORIGIN = "https://kyc.useb.co.kr";
  const KYC_URL = "https://kyc.useb.co.kr/auth";
  const KYC_QR_URL = "https://kyc.useb.co.kr/qr";

  useEffect(() => {
    if (currentPhase === "intro") return;

    const handleMessage = (e: MessageEvent) => {
      // 보안: origin 확인
      if (e.origin !== KYC_TARGET_ORIGIN) return;

      console.log("eKYC response", e.data);
      console.log("origin :", e.origin);

      try {
        const decodedData = decodeURIComponent(atob(e.data));
        const json: EKYCResponse = JSON.parse(decodedData);
        console.log("decoded json", json);

        // 1차 postMessage: 인증 결과 데이터 (success/failed + review_result)
        if (json.result === "success" && json.review_result) {
          const { result_type, transaction_id, module, account } =
            json.review_result;

          // 신분증 인증 완료 확인
          if (
            module.id_card_verification &&
            module.face_authentication &&
            !idVerified
          ) {
            setIdVerified(true);
            setCurrentPhase("account");
            setMessage({
              type: "success",
              text: "신분증 인증이 완료되었습니다. 계좌 인증을 진행합니다.",
            });
            console.log("신분증 인증 완료 - transaction_id:", transaction_id);
          }

          // 계좌 인증 완료 확인
          if (
            module.account_verification &&
            account?.verified &&
            !accountVerified
          ) {
            setAccountVerified(true);

            if (result_type === 1) {
              // 자동 승인
              setMessage({
                type: "success",
                text: "계좌 인증이 자동 승인되었습니다.",
              });
              console.log("계좌 자동승인 - transaction_id:", transaction_id);
            } else if (result_type === 5) {
              // 심사 필요
              setMessage({
                type: "success",
                text: "계좌 인증이 완료되었습니다. 심사 후 이메일로 안내드립니다.",
              });
              console.log("계좌 심사필요 - transaction_id:", transaction_id);
            }

            console.log("계좌 정보:", account);
          }
        } else if (json.result === "failed" && json.review_result) {
          // 자동 거부 (result_type === 2)
          const phase = json.review_result.module.account_verification
            ? "계좌"
            : "신분증";
          setMessage({
            type: "error",
            text: `${phase} 인증이 실패했습니다. 다시 시도해주세요.`,
          });
          console.log(
            "자동거부 - transaction_id:",
            json.review_result.transaction_id
          );

          // 2차 postMessage: UI 처리 (complete/close)
        } else if (json.result === "complete") {
          // 전체 인증 완료
          setMessage({
            type: "success",
            text: "eKYC 인증이 모두 완료되었습니다!",
          });
          setLoading(false);
          setCurrentPhase("complete");

          // 인증 완료 후 다음 단계로 이동
          setTimeout(() => {
            onComplete({
              idVerified: true,
              accountVerified: true,
              kycMethod: selectedMethod || undefined,
            });
          }, 1500);
        } else if (json.result === "close") {
          // 인증 중단 또는 이탈
          setMessage({ type: "error", text: "eKYC 인증이 중단되었습니다." });
          setCurrentPhase("intro");
          setLoading(false);
          setIdVerified(false);
          setAccountVerified(false);
        }
      } catch (error) {
        console.error("eKYC 응답 처리 오류:", error);
        setMessage({
          type: "error",
          text: "eKYC 응답 처리 중 오류가 발생했습니다.",
        });
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [currentPhase, idVerified, accountVerified, onComplete]);

  const handleMethodSelect = async (method: 'mobile' | 'pc') => {
    console.log('=== handleMethodSelect 호출 ===');
    console.log('선택된 방식:', method);

    setSelectedMethod(method);
    setMessage(null);

    if (method === 'mobile') {
      console.log('QR 모드로 전환 시작');
      // QR 코드 화면으로 전환
      setCurrentPhase('qr');
      setLoading(true);
      console.log('currentPhase를 qr로 설정');
    } else if (method === 'pc') {
      console.log('PC 모드로 전환 시작');
      // 기존 PC 방식으로 전환
      setCurrentPhase('id');
      setLoading(true);
      console.log('currentPhase를 id로 설정');
    }
  };

  const handleBackToMethodSelection = () => {
    setCurrentPhase('intro');
    setSelectedMethod(null);
    setMessage(null);
    setLoading(false);
  };

  // iframe이 로드되면 파라미터 전송 (PC 방식)
  useEffect(() => {
    if (currentPhase === "intro" || currentPhase === "qr" || !iframeRef.current) return;

    const iframe = iframeRef.current;

    const handleLoad = async () => {
      try {
        // 주민번호에서 생년월일 추출 (YYYY-MM-DD 형식)
        const residentNumber = initialData.residentNumber || "";
        const parts = residentNumber.split("-");
        const birthPart = parts[0] || "";
        const genderPart = parts[1] || "";

        const yy = birthPart.substring(0, 2);
        const mm = birthPart.substring(2, 4);
        const dd = birthPart.substring(4, 6);
        const genderCode = genderPart.substring(0, 1);

        // 세기 판단 (1,2,9,0: 1900년대 / 3,4,7,8: 2000년대 / 5,6: 1900년대 외국인)
        const century = ["1", "2", "5", "6", "9", "0"].includes(genderCode)
          ? "19"
          : "20";
        const birthday = `${century}${yy}-${mm}-${dd}`;

        // 전화번호에서 하이픈 제거 (01012345678 형식)
        const phoneNumber = (initialData.phone || "").replace(/-/g, "");

        // Credential 방식 사용 (iframe에 직접 전달)
        // customer_id: 12 = Demo 계정 (카메라 촬영 모드 지원)
        const params = {
          customer_id: "12",
          id: "demoUser",
          key: "demoUser0000!",
          name: initialData.name || "",
          birthday: birthday,
          phone_number: phoneNumber,
          email: initialData.email || "",
          // Wasm OCR 강제 사용 (Server OCR 사용 안 함)
          isWasmOCRMode: "true",
          // 선택사항: 사본 탐지 활성화 (Wasm OCR 사용 시만 동작)
          isWasmSSAMode: "true",
        };

        console.log("eKYC params (통합 인증):", {
          customer_id: params.customer_id,
          id: params.id,
          key: "***" + params.key.slice(-3),
          name: params.name,
          birthday: params.birthday,
          phone_number: params.phone_number,
          email: params.email,
        });

        const encodedParams = btoa(encodeURIComponent(JSON.stringify(params)));
        iframe.contentWindow?.postMessage(encodedParams, KYC_TARGET_ORIGIN);
        console.log("postMessage sent to:", KYC_TARGET_ORIGIN);

        setLoading(false);
        setMessage({
          type: "success",
          text: "eKYC 인증을 시작합니다. 카메라 권한을 허용해주세요.",
        });
      } catch (error) {
        console.error("eKYC 초기화 오류:", error);
        setMessage({
          type: "error",
          text: "eKYC 초기화 중 오류가 발생했습니다.",
        });
        setLoading(false);
      }
    };

    iframe.addEventListener("load", handleLoad);
    return () => iframe.removeEventListener("load", handleLoad);
  }, [currentPhase, initialData]);

  // QR 코드 iframe 초기화 (모바일 방식)
  useEffect(() => {
    console.log('QR useEffect 실행, currentPhase:', currentPhase, 'iframeRef.current:', iframeRef.current);

    if (currentPhase !== 'qr') {
      console.log('currentPhase가 qr이 아님, useEffect 종료');
      return;
    }

    // iframe이 준비될 때까지 대기하고 초기화
    if (!iframeRef.current) {
      console.log('iframe이 아직 준비되지 않음');
      return;
    }

    console.log('QR iframe useEffect 시작');
    const iframe = iframeRef.current;

    // 이미 src가 설정되어 있으면 중복 실행 방지
    if (iframe.src && iframe.src !== 'about:blank' && iframe.src.includes('kyc.useb.co.kr/auth')) {
      console.log('QR iframe 이미 초기화됨, 중복 실행 방지');
      return;
    }

    const handleLoad = async () => {
      console.log('QR iframe onload 이벤트 발생');
      try {
        // QR 파라미터 생성
        // 주민번호에서 생년월일 추출 (YYYY-MM-DD 형식)
        const residentNumber = initialData.residentNumber || "";
        const parts = residentNumber.split("-");
        const birthPart = parts[0] || "";
        const genderPart = parts[1] || "";

        const yy = birthPart.substring(0, 2);
        const mm = birthPart.substring(2, 4);
        const dd = birthPart.substring(4, 6);
        const genderCode = genderPart.substring(0, 1);

        // 세기 판단 (1,2,9,0: 1900년대 / 3,4,7,8: 2000년대 / 5,6: 1900년대 외국인)
        const century = ["1", "2", "5", "6", "9", "0"].includes(genderCode)
          ? "19"
          : "20";
        const birthday = `${century}${yy}-${mm}-${dd}`;

        // 전화번호에서 하이픈 제거 (01012345678 형식)
        const phoneNumber = (initialData.phone || "").replace(/-/g, "");

        // QR 모드: Demo 샘플과 동일한 credential 사용
        // customer_id: "5"는 QR 모드 지원
        const qrParams = {
          customer_id: "5",
          id: "demoUser",
          key: "demoUser0000!",  // Demo kyc.js 파일에서 확인된 key
          name: initialData.name || "",
          birthday: birthday,
          phone_number: phoneNumber,
          email: initialData.email || "",
        };

        console.log("eKYC QR params (필수정보 포함):", {
          customer_id: qrParams.customer_id,
          id: qrParams.id,
          key: "***" + qrParams.key.slice(-3),
          name: qrParams.name,
          birthday: birthday.substring(0, 4) + "-**-**",
          phone_number: phoneNumber ? phoneNumber.substring(0, 3) + "****" + phoneNumber.substring(7) : "",
          email: qrParams.email,
        });

        const encodedParams = btoa(encodeURIComponent(JSON.stringify(qrParams)));
        iframe.contentWindow?.postMessage(encodedParams, KYC_TARGET_ORIGIN);
        console.log("postMessage sent to:", KYC_TARGET_ORIGIN);

        setLoading(false);
        setMessage({
          type: 'success',
          text: '모바일에서 QR 코드를 스캔하여 인증을 시작하세요.'
        });
      } catch (error) {
        console.error('QR 코드 생성 오류:', error);
        setMessage({
          type: 'error',
          text: 'QR 코드 생성 중 오류가 발생했습니다.'
        });
        setLoading(false);
      }
    };

    // onload 핸들러 먼저 등록
    iframe.addEventListener('load', handleLoad);

    // 그 다음 src 설정 (일반 AUTH URL 사용, QR은 postMessage로 생성)
    console.log('QR iframe src 설정:', KYC_URL);
    iframe.src = KYC_URL;

    return () => {
      iframe.removeEventListener('load', handleLoad);
    };
  }, [currentPhase, initialData]);

  // QR 코드 타임아웃 타이머
  useEffect(() => {
    if (currentPhase !== 'qr') return;

    setQrExpireTime(600); // 리셋

    const timer = setInterval(() => {
      setQrExpireTime(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setMessage({
            type: 'error',
            text: 'QR 코드가 만료되었습니다. 다시 생성해주세요.'
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentPhase]);

  const handleCancel = () => {
    setCurrentPhase("intro");
    setMessage(null);
    setIdVerified(false);
    setAccountVerified(false);
  };

  const handleSkipVerification = () => {
    // Skip 시 kycStatus를 'skipped'로 설정하고 다음 단계로 진행
    onComplete({
      kycStatus: 'skipped',
      idVerified: false,
      accountVerified: false
    });
  };

  // 인증 방식 선택 화면
  if (currentPhase === "intro") {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold text-gray-900">
            신분증 인증 방법을 선택하세요
          </h2>
          <p className="text-gray-600 mt-2">
            편리한 방법으로 신분증 인증을 진행하세요
          </p>
        </div>

        {/* 방식 선택 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* 모바일 진행 카드 */}
          <button
            onClick={() => handleMethodSelect('mobile')}
            className="relative p-8 border-2 border-primary-200 rounded-xl hover:border-primary-400 hover:bg-primary-50 transition-all text-center group"
          >
            <span className="absolute top-4 right-4 px-3 py-1 bg-sky-100 text-sky-700 text-xs font-semibold rounded-full">
              추천
            </span>

            <div className="w-20 h-20 mx-auto mb-4 bg-primary-100 rounded-full flex items-center justify-center group-hover:bg-primary-200">
              <DevicePhoneMobileIcon className="w-10 h-10 text-primary-600" />
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              모바일로 진행
            </h3>

            <p className="text-sm text-gray-600 mb-4">
              스마트폰으로 직접 촬영
            </p>

            <div className="space-y-2 text-left">
              <div className="flex items-start text-xs text-gray-600">
                <CheckCircleIcon className="w-4 h-4 text-sky-600 mr-2 flex-shrink-0 mt-0.5" />
                <span>더 선명한 촬영 품질</span>
              </div>
              <div className="flex items-start text-xs text-gray-600">
                <CheckCircleIcon className="w-4 h-4 text-sky-600 mr-2 flex-shrink-0 mt-0.5" />
                <span>간편한 촬영 가이드</span>
              </div>
              <div className="flex items-start text-xs text-gray-600">
                <CheckCircleIcon className="w-4 h-4 text-sky-600 mr-2 flex-shrink-0 mt-0.5" />
                <span>실시간 얼굴 가이드</span>
              </div>
            </div>
          </button>

          {/* PC 진행 카드 */}
          <button
            onClick={() => handleMethodSelect('pc')}
            className="p-8 border-2 border-gray-200 rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all text-center group"
          >
            <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-gray-200">
              <ComputerDesktopIcon className="w-10 h-10 text-gray-600" />
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              PC에서 진행
            </h3>

            <p className="text-sm text-gray-600 mb-4">
              이미 촬영한 사진을 업로드
            </p>

            <div className="space-y-2 text-left mb-4">
              <div className="flex items-start text-xs text-gray-600">
                <CheckCircleIcon className="w-4 h-4 text-gray-500 mr-2 flex-shrink-0 mt-0.5" />
                <span>기존 사진 활용</span>
              </div>
              <div className="flex items-start text-xs text-gray-600">
                <CheckCircleIcon className="w-4 h-4 text-gray-500 mr-2 flex-shrink-0 mt-0.5" />
                <span>PC 환경에서 처리</span>
              </div>
              <div className="flex items-start text-xs text-gray-600">
                <CheckCircleIcon className="w-4 h-4 text-gray-500 mr-2 flex-shrink-0 mt-0.5" />
                <span>파일 선택 가능</span>
              </div>
            </div>

            <p className="text-xs text-gray-500 text-left leading-relaxed mt-4">
              웹캠이 없는 경우 '모바일로 진행'을 선택하시면 더 편리하게 인증하실 수 있습니다.
            </p>
          </button>
        </div>

        {/* 안내 사항 */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="text-sm font-semibold text-blue-900 mb-2">
            안내 사항
          </h4>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• 주민등록증, 운전면허증, 여권을 사용할 수 있습니다</li>
            <li>• 신분증의 모든 정보가 선명하게 보여야 합니다</li>
            <li>• 인증 후 계좌 인증(1원 인증)이 이어서 진행됩니다</li>
            <li>• 전체 인증 과정은 약 5-7분 소요됩니다</li>
          </ul>
        </div>

        {/* Skip 안내 */}
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-xs text-yellow-800">
            eKYC 인증을 나중에 진행하실 수 있습니다. 단, 일부 서비스 이용이 제한될 수 있습니다.
          </p>
        </div>

        {/* 버튼 그룹 */}
        <div className="flex space-x-3">
          <button
            onClick={onBack}
            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            이전
          </button>

          <button
            onClick={handleSkipVerification}
            className="flex-1 px-4 py-3 border-2 border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition-colors"
          >
            다음에 하기
          </button>
        </div>
      </div>
    );
  }

  // QR 코드 화면
  if (currentPhase === "qr") {
    const minutes = Math.floor(qrExpireTime / 60);
    const seconds = qrExpireTime % 60;

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        {/* 헤더 */}
        <div className="text-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            모바일로 QR 코드를 스캔하세요
          </h2>
          <p className="text-gray-600 mt-2">
            카메라 앱으로 QR 코드를 스캔하면 인증이 시작됩니다
          </p>
        </div>

        {/* 메시지 */}
        {message && (
          <div className={`mb-4 p-4 rounded-lg border ${
            message.type === 'success'
              ? 'bg-primary-50 border-primary-200 text-primary-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <div className="flex items-center">
              {message.type === 'success' ? (
                <CheckCircleIcon className="w-5 h-5 mr-2" />
              ) : (
                <ExclamationTriangleIcon className="w-5 h-5 mr-2" />
              )}
              <span className="text-sm">{message.text}</span>
            </div>
          </div>
        )}

        {/* QR 코드 영역 */}
        <div className="mb-6">
          <div className="relative w-full" style={{ height: "900px" }}>
            <iframe
              ref={iframeRef}
              id="kyc_qr_iframe"
              className="w-full h-full rounded-lg border-2 border-gray-300 bg-white"
              allow="camera; microphone; fullscreen"
              title="eKYC QR 코드"
              style={{ border: 'none' }}
            />
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90">
                <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
        </div>

        {/* QR 만료 시간 */}
        {qrExpireTime > 0 && (
          <div className="mb-6 text-center">
            <p className="text-sm text-gray-600">
              QR 코드 유효 시간: <span className="font-semibold text-primary-600">{minutes}분 {seconds}초</span>
            </p>
          </div>
        )}

        {/* 안내 단계 */}
        <div className="mb-6 space-y-3">
          <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
            <div className="flex-shrink-0 w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
              1
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-700">
                모바일 카메라 앱으로 QR 코드를 스캔하세요
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
            <div className="flex-shrink-0 w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
              2
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-700">
                모바일에서 인증 화면이 열리면 안내에 따라 진행하세요
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
            <div className="flex-shrink-0 w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
              3
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-700">
                신분증 촬영 → 얼굴 인증 → 계좌 인증 순으로 진행됩니다
              </p>
            </div>
          </div>
        </div>

        {/* 주의사항 */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="text-sm font-semibold text-blue-900 mb-2">
            주의사항
          </h4>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• QR 코드는 10분간 유효합니다</li>
            <li>• 모바일에서 인증이 완료되면 자동으로 다음 단계로 이동합니다</li>
            <li>• 인증 중 이 화면을 벗어나지 마세요</li>
          </ul>
        </div>

        {/* 버튼 */}
        <div className="flex space-x-3">
          <button
            onClick={handleBackToMethodSelection}
            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            방식 다시 선택
          </button>

          <button
            onClick={handleSkipVerification}
            className="flex-1 px-4 py-3 border-2 border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition-colors"
          >
            다음에 하기
          </button>
        </div>
      </div>
    );
  }

  // 인증 진행 화면 (PC 방식)
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
      <div className="mb-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {currentPhase === "id" && !idVerified && "eKYC 인증 진행 중"}
              {currentPhase === "account" &&
                !accountVerified &&
                "계좌 인증 진행 중"}
              {currentPhase === "complete" && "인증 완료"}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              {idVerified && (
                <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-sky-50 text-sky-600 border border-sky-200">
                  <CheckCircleIcon className="w-3 h-3 mr-1" />
                  신분증 인증 완료
                </span>
              )}
              {accountVerified && (
                <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-sky-50 text-sky-600 border border-sky-200">
                  <CheckCircleIcon className="w-3 h-3 mr-1" />
                  계좌 인증 완료
                </span>
              )}
            </div>
          </div>
          {currentPhase !== "complete" && (
            <button
              onClick={handleCancel}
              className="text-sm text-gray-600 hover:text-gray-800 underline"
            >
              취소
            </button>
          )}
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

        {/* 로딩 상태 */}
        {loading && (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center">
              <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2" />
              <span className="text-sm text-blue-700">
                eKYC 시스템을 준비하고 있습니다...
              </span>
            </div>
          </div>
        )}
      </div>

      {/* eKYC iframe - 높이 900px로 증가 */}
      <div className="relative w-full" style={{ height: "900px" }}>
        <iframe
          ref={iframeRef}
          id="kyc_iframe"
          className="w-full h-full rounded-lg border-2 border-gray-300 bg-white"
          allow="camera; microphone; fullscreen"
          src={KYC_URL}
          title="eKYC 통합 인증"
        />
      </div>

      {/* 안내 정보 */}
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <p className="text-xs text-gray-600 text-center">
          {currentPhase === "id" &&
            "카메라 권한을 허용하고 안내에 따라 신분증을 촬영해주세요."}
          {currentPhase === "account" &&
            "은행을 선택하고 계좌번호를 입력한 후, 입금된 1원의 인증번호를 확인하여 입력해주세요."}
          {currentPhase === "complete" &&
            "모든 인증이 완료되었습니다. 잠시 후 다음 단계로 이동합니다."}
        </p>
      </div>

      {/* 버튼 */}
      {currentPhase !== "complete" && (
        <div className="flex space-x-3 mt-4">
          <button
            onClick={handleBackToMethodSelection}
            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            방식 다시 선택
          </button>

          <button
            onClick={handleSkipVerification}
            className="flex-1 px-4 py-3 border-2 border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition-colors"
          >
            다음에 하기
          </button>
        </div>
      )}
    </div>
  );
}
