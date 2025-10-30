/**
 * KYCSection Component
 * KYC 정보 섹션
 *
 * 신청자가 입력한 KYC 정보 표시
 */

"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, FileText } from "lucide-react";
import { KYCInfo } from "@/types/onboardingAml";

interface KYCSectionProps {
  kyc: KYCInfo;
  userId: string;
}

export function KYCSection({ kyc, userId }: KYCSectionProps) {
  // 백엔드 API URL 생성
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
  const idCardImageUrl = userId
    ? `${API_URL}/api/users/${userId}/kyc-idcard-image`
    : kyc.idImageUrl;
  const selfieImageUrl = userId
    ? `${API_URL}/api/users/${userId}/kyc-selfie-image`
    : null;
  return (
    <Card>
      <CardHeader>
        <CardTitle>KYC 정보</CardTitle>
        <CardDescription>신청자가 제출한 본인확인 정보</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 신분증 정보 */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm">신분증 정보</h4>
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <div className="text-sm text-muted-foreground mb-1">신분증 유형</div>
              <div className="font-medium">{kyc.idType}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">신분증 번호</div>
              <div className="font-medium">{kyc.idNumber}</div>
            </div>
          </div>
          {idCardImageUrl && (
            <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <a
                href={idCardImageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline"
              >
                신분증 이미지 보기
              </a>
            </div>
          )}
          {selfieImageUrl && (
            <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <a
                href={selfieImageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline"
              >
                셀피 이미지 보기
              </a>
            </div>
          )}
        </div>

        {/* 주소 증명 */}
        <div className="space-y-3 pt-4 border-t">
          <h4 className="font-medium text-sm">주소 증명</h4>
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <div className="text-sm text-muted-foreground mb-1">주소증명 유형</div>
              <div className="font-medium">{kyc.addressProofType}</div>
            </div>
          </div>
          {kyc.addressProofUrl && (
            <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <a
                href={kyc.addressProofUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline"
              >
                주소증명 서류 보기
              </a>
            </div>
          )}
        </div>

        {/* 인증 상태 */}
        <div className="space-y-3 pt-4 border-t">
          <h4 className="font-medium text-sm">인증 상태</h4>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="flex items-center gap-2">
              {kyc.phoneVerified ? (
                <>
                  <CheckCircle className="h-4 w-4 text-sky-600" />
                  <span className="text-sm font-medium text-sky-600">전화번호 인증 완료</span>
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 text-red-600" />
                  <span className="text-sm font-medium text-red-600">전화번호 미인증</span>
                </>
              )}
            </div>
            <div className="flex items-center gap-2">
              {kyc.emailVerified ? (
                <>
                  <CheckCircle className="h-4 w-4 text-sky-600" />
                  <span className="text-sm font-medium text-sky-600">이메일 인증 완료</span>
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 text-red-600" />
                  <span className="text-sm font-medium text-red-600">이메일 미인증</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* 완료 일시 */}
        {kyc.completedAt && (
          <div className="pt-4 border-t">
            <div className="text-sm text-muted-foreground">완료 일시</div>
            <div className="text-sm font-medium mt-1">
              {new Date(kyc.completedAt).toLocaleString('ko-KR')}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
