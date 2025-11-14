/**
 * KYCSection Component
 * KYC 정보 섹션
 *
 * 신청자가 입력한 KYC 정보 표시
 */

"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, FileText, Eye } from "lucide-react";
import { ImageViewerModal } from "@/components/ui/ImageViewerModal";
import { KYCInfo } from "@/types/onboardingAml";
import { getIdCardTypeLabel } from "@/utils/kycUtils";
import { useToast } from "@/hooks/use-toast";

interface KYCSectionProps {
  kyc: KYCInfo;
  userId: string;
}

export function KYCSection({ kyc, userId }: KYCSectionProps) {
  const { toast } = useToast();

  // Pre-signed URL 상태
  const [idCardImageUrl, setIdCardImageUrl] = useState<string | null>(null);
  const [selfieImageUrl, setSelfieImageUrl] = useState<string | null>(null);

  // 이미지 모달 상태
  const [isIdCardModalOpen, setIsIdCardModalOpen] = useState(false);
  const [isSelfieModalOpen, setIsSelfieModalOpen] = useState(false);

  // Pre-signed URL 가져오기
  useEffect(() => {
    const fetchImageUrls = async () => {
      if (!userId) {
        setIdCardImageUrl(kyc.idImageUrl || null);
        return;
      }

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const token = localStorage.getItem('admin-auth');
      const accessToken = token ? JSON.parse(token).accessToken : null;

      // 신분증 이미지 URL
      try {
        const response = await fetch(`${API_URL}/api/users/${userId}/kyc-image`, {
          headers: {
            ...(accessToken && { 'Authorization': `Bearer ${accessToken}` }),
          }
        });

        if (response.ok) {
          const data = await response.json();
          setIdCardImageUrl(data.imageUrl);
        }
      } catch (error) {
        console.error('신분증 이미지 URL 가져오기 실패:', error);
      }

      // 셀피 이미지 URL
      try {
        const response = await fetch(`${API_URL}/api/users/${userId}/kyc-selfie-image`, {
          headers: {
            ...(accessToken && { 'Authorization': `Bearer ${accessToken}` }),
          }
        });

        if (response.ok) {
          const data = await response.json();
          setSelfieImageUrl(data.imageUrl);
        }
      } catch (error) {
        console.error('셀피 이미지 URL 가져오기 실패:', error);
      }
    };

    fetchImageUrls();
  }, [userId, kyc.idImageUrl]);

  // 이미지 모달 열기
  const handleOpenImage = (type: 'idcard' | 'selfie') => {
    const imageUrl = type === 'idcard' ? idCardImageUrl : selfieImageUrl;

    if (!imageUrl) {
      toast({
        variant: "destructive",
        description: "등록된 이미지가 없습니다.",
      });
      return;
    }

    // 이미지 모달 열기
    if (type === 'idcard') {
      setIsIdCardModalOpen(true);
    } else {
      setIsSelfieModalOpen(true);
    }
  };

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
              <div className="font-medium">{getIdCardTypeLabel(kyc.idCardType)}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">신분증 번호</div>
              <div className="font-medium">{kyc.residentNumber || kyc.idNumber}</div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleOpenImage('idcard')}
              className="flex-shrink-0"
            >
              <Eye className="h-4 w-4 mr-2" />
              신분증 이미지 보기
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleOpenImage('selfie')}
              className="flex-shrink-0"
            >
              <Eye className="h-4 w-4 mr-2" />
              셀피 이미지 보기
            </Button>
          </div>
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

      {/* 이미지 뷰어 모달 */}
      {idCardImageUrl && (
        <ImageViewerModal
          isOpen={isIdCardModalOpen}
          onClose={() => setIsIdCardModalOpen(false)}
          imageUrl={idCardImageUrl}
          title="신분증 이미지"
        />
      )}
      {selfieImageUrl && (
        <ImageViewerModal
          isOpen={isSelfieModalOpen}
          onClose={() => setIsSelfieModalOpen(false)}
          imageUrl={selfieImageUrl}
          title="셀피 이미지"
        />
      )}
    </Card>
  );
}
