"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

type VerificationStatus = "loading" | "success" | "error" | "invalid";

interface VerificationResult {
  success: boolean;
  message: string;
  user?: {
    id: string;
    name: string;
    email: string;
    status: string;
  };
  error?: string;
}

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<VerificationStatus>("loading");
  const [result, setResult] = useState<VerificationResult | null>(null);
  const hasCalledApi = useRef(false);

  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setStatus("invalid");
      return;
    }

    // API 호출이 이미 진행 중이거나 완료되었으면 스킵
    if (hasCalledApi.current) {
      return;
    }

    // 세션 스토리지에서 성공 여부 확인
    const sessionKey = `email-verified-${token}`;
    const cachedResult = sessionStorage.getItem(sessionKey);

    if (cachedResult) {
      // 이미 성공한 토큰이면 캐시된 결과 사용
      const data = JSON.parse(cachedResult);
      setStatus("success");
      setResult(data);
      return;
    }

    // API 호출 플래그 설정
    hasCalledApi.current = true;
    verifyEmail(token);
  }, [token]);

  const verifyEmail = async (token: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/api/verify-email?token=${token}`
      );

      const data = await response.json();

      if (response.ok && data.success) {
        // 성공 시 세션 스토리지에 저장
        const sessionKey = `email-verified-${token}`;
        sessionStorage.setItem(sessionKey, JSON.stringify(data));

        setStatus("success");
        setResult(data);
      } else {
        setStatus("error");
        setResult(data);
      }
    } catch (error) {
      console.error("이메일 확인 실패:", error);
      setStatus("error");
      setResult({
        success: false,
        message: "이메일 확인 중 오류가 발생했습니다.",
      });
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-sky-50 rounded-full mb-4">
              <div className="w-8 h-8 border-4 border-sky-600 border-t-transparent rounded-full animate-spin" />
            </div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">
              이메일 확인 중...
            </h1>
            <p className="text-gray-600">
              잠시만 기다려주세요.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (status === "invalid") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-50 rounded-full mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">
              유효하지 않은 요청
            </h1>
            <p className="text-gray-600 mb-6">
              이메일 확인 토큰이 제공되지 않았습니다.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center justify-center px-6 py-3 bg-sky-600 text-white font-medium rounded-lg hover:bg-sky-700 transition-colors"
            >
              로그인 페이지로 이동
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-sky-50 rounded-full mb-4">
              <svg className="w-8 h-8 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">
              이메일 인증 완료
            </h1>
            <p className="text-gray-600 mb-6">
              {result?.message || "이메일 인증이 성공적으로 완료되었습니다."}
            </p>

            {result?.user && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                <h3 className="text-sm font-medium text-gray-700 mb-2">계정 정보</h3>
                <div className="space-y-1 text-sm text-gray-600">
                  <div><span className="font-medium">이름:</span> {result.user.name}</div>
                  <div><span className="font-medium">이메일:</span> {result.user.email}</div>
                  <div>
                    <span className="font-medium">상태:</span>{" "}
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-sky-50 text-sky-600 border border-sky-200">
                      {result.user.status === "active" ? "활성" : result.user.status}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <Link
              href="/login"
              className="inline-flex items-center justify-center w-full px-6 py-3 bg-sky-600 text-white font-medium rounded-lg hover:bg-sky-700 transition-colors"
            >
              로그인하기
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Error status
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-50 rounded-full mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            이메일 인증 실패
          </h1>
          <p className="text-gray-600 mb-6">
            {result?.message || "이메일 인증에 실패했습니다."}
          </p>

          {result?.error && (
            <div className="bg-red-50 rounded-lg p-4 mb-6 text-left">
              <h3 className="text-sm font-medium text-red-800 mb-1">오류 상세</h3>
              <p className="text-sm text-red-700">
                {result.error === "INVALID_TOKEN" && "유효하지 않은 인증 토큰입니다."}
                {result.error === "TOKEN_EXPIRED" && "인증 토큰이 만료되었습니다."}
                {result.error === "ALREADY_VERIFIED" && "이미 인증이 완료된 계정입니다."}
                {!["INVALID_TOKEN", "TOKEN_EXPIRED", "ALREADY_VERIFIED"].includes(result.error) && result.error}
              </p>
            </div>
          )}

          <div className="space-y-3">
            {result?.error === "TOKEN_EXPIRED" && (
              <p className="text-sm text-gray-600">
                관리자에게 새 인증 링크 발송을 요청해주세요.
              </p>
            )}

            <Link
              href="/login"
              className="inline-flex items-center justify-center w-full px-6 py-3 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition-colors"
            >
              로그인 페이지로 이동
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
