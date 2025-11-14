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
import { FileText, Eye } from "lucide-react";
import { ImageViewerModal } from "@/components/ui/ImageViewerModal";
import { KYCInfo } from "@/types/onboardingAml";
import { getIdCardTypeLabel } from "@/utils/kycUtils";
import { useToast } from "@/hooks/use-toast";

/**
 * 주민등록증 신분증 번호 마스킹 처리
 * 형식: YYMMDD-G****** (뒷자리 6자리 마스킹, 성별 1자리는 표시)
 */
function maskResidentNumber(idNumber: string): string {
  if (!idNumber) return idNumber;

  // 하이픈이 있는 경우와 없는 경우 처리
  const cleaned = idNumber.replace(/-/g, '');

  if (cleaned.length !== 13) {
    // 주민번호 형식이 아니면 그대로 반환
    return idNumber;
  }

  // YYMMDD-G****** 형식으로 마스킹
  const birthPart = cleaned.substring(0, 6);  // YYMMDD
  const genderPart = cleaned.substring(6, 7); // G

  return `${birthPart}-${genderPart}******`;
}

/**
 * 주소증명 유형 한글 변환
 */
function getAddressProofTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    'REGISTRY': '등기부등본',
    'UTILITY_BILL': '공과금 고지서'
  };
  return labels[type] || type;
}

interface KYCSectionProps {
  kyc: KYCInfo;
  userId: string;
  userName: string;
  userEmail: string;
  userGender?: string;
  userNationality?: string;
  userPhone: string;
}

/**
 * 국가 코드를 한글로 변환 (주요 30개국)
 */
function getCountryLabel(countryCode?: string): string {
  const labels: Record<string, string> = {
    // 아시아
    'KOR': '대한민국',
    'JPN': '일본',
    'CHN': '중국',
    'TWN': '대만',
    'HKG': '홍콩',
    'SGP': '싱가포르',
    'THA': '태국',
    'VNM': '베트남',
    'PHL': '필리핀',
    'MYS': '말레이시아',
    'IDN': '인도네시아',
    'IND': '인도',

    // 북미
    'USA': '미국',
    'CAN': '캐나다',
    'MEX': '멕시코',

    // 유럽
    'GBR': '영국',
    'FRA': '프랑스',
    'DEU': '독일',
    'ITA': '이탈리아',
    'ESP': '스페인',
    'NLD': '네덜란드',
    'BEL': '벨기에',
    'CHE': '스위스',
    'AUT': '오스트리아',
    'SWE': '스웨덴',
    'NOR': '노르웨이',
    'DNK': '덴마크',

    // 오세아니아
    'AUS': '호주',
    'NZL': '뉴질랜드',

    // 중동
    'ARE': '아랍에미리트',
    'SAU': '사우디아라비아'
  };
  return countryCode ? (labels[countryCode] || countryCode) : '-';
}

export function KYCSection({ kyc, userId, userName, userEmail, userGender, userNationality, userPhone }: KYCSectionProps) {
  const { toast } = useToast();

  // 신분증 번호 표시 (주민등록증인 경우 마스킹)
  const displayIdNumber = (kyc.idCardType === 1 || kyc.idCardType === '1' as any)
    ? maskResidentNumber(kyc.idNumber)
    : kyc.idNumber;

  // Pre-signed URL 상태
  const [idCardImageUrl, setIdCardImageUrl] = useState<string | null>(null);
  const [selfieImageUrl, setSelfieImageUrl] = useState<string | null>(null);

  // 이미지 모달 상태
  const [isIdCardModalOpen, setIsIdCardModalOpen] = useState(false);
  const [isSelfieModalOpen, setIsSelfieModalOpen] = useState(false);

  // Pre-signed URL 가져오기
  useEffect(() => {
    const fetchImageUrls = async () => {
      const isS3Key = kyc.idImageUrl?.startsWith('kyc/');

      if (!userId || !isS3Key) {
        setIdCardImageUrl(kyc.idImageUrl || null);
        setSelfieImageUrl(kyc.selfieImageUrl || null);
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
        {/* 기본 정보 */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm">기본 정보</h4>
          <div className="grid gap-3 md:grid-cols-3">
            <div>
              <div className="text-sm text-muted-foreground mb-1">이름</div>
              <div className="font-medium">{userName}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">이메일</div>
              <div className="font-medium">{userEmail}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">연락처</div>
              <div className="font-medium">{userPhone}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">성별</div>
              <div className="font-medium">{userGender === 'male' ? '남성' : userGender === 'female' ? '여성' : '-'}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">국적</div>
              <div className="font-medium">{getCountryLabel(userNationality)}</div>
            </div>
          </div>
        </div>

        {/* 신분증 정보 */}
        <div className="space-y-3 pt-4 border-t">
          <h4 className="font-medium text-sm">신분증 정보</h4>

          <div className="grid gap-6 md:grid-cols-2">
            {/* 왼쪽: 신분증 정보 */}
            <div className="space-y-4">
              {/* 신분증 유형 */}
              <div>
                <div className="text-sm text-muted-foreground mb-1">신분증 유형</div>
                <div className="font-medium">{getIdCardTypeLabel(kyc.idCardType)}</div>
              </div>

              {/* 신분증 번호 */}
              <div>
                <div className="text-sm text-muted-foreground mb-1">신분증 번호</div>
                <div className="font-medium">{displayIdNumber}</div>
              </div>
            </div>

            {/* 오른쪽: 이미지 미리보기 */}
            <div className="flex gap-4">
              {/* 신분증 이미지 */}
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">신분증 이미지</div>
                <div
                  onClick={() => handleOpenImage('idcard')}
                  className="cursor-pointer border rounded-lg overflow-hidden hover:border-primary-500 transition-colors group relative w-32 h-24"
                >
                  {idCardImageUrl ? (
                    <>
                      <img
                        src={idCardImageUrl}
                        alt="신분증"
                        className="w-full h-full object-contain bg-gray-50"
                        crossOrigin="anonymous"
                        onError={(e) => {
                          const target = e.currentTarget;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent && parent.parentElement) {
                            parent.parentElement.innerHTML = '<div class="w-full h-24 flex items-center justify-center bg-muted text-muted-foreground text-xs border rounded-lg">이미지 로딩 실패</div>';
                          }
                        }}
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center pointer-events-none">
                        <Eye className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-24 flex items-center justify-center bg-muted text-muted-foreground text-xs">
                      이미지 없음
                    </div>
                  )}
                </div>
              </div>

              {/* 셀피 이미지 */}
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">셀피 이미지</div>
                <div
                  onClick={() => handleOpenImage('selfie')}
                  className="cursor-pointer border rounded-lg overflow-hidden hover:border-primary-500 transition-colors group relative w-32 h-24"
                >
                  {selfieImageUrl ? (
                    <>
                      <img
                        src={selfieImageUrl}
                        alt="셀피"
                        className="w-full h-full object-cover bg-gray-50"
                        crossOrigin="anonymous"
                        onError={(e) => {
                          const target = e.currentTarget;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent && parent.parentElement) {
                            parent.parentElement.innerHTML = '<div class="w-full h-24 flex items-center justify-center bg-muted text-muted-foreground text-xs border rounded-lg">이미지 로딩 실패</div>';
                          }
                        }}
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center pointer-events-none">
                        <Eye className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-24 flex items-center justify-center bg-muted text-muted-foreground text-xs">
                      이미지 없음
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 회원가입 시 등록한 주소 */}
        {(kyc.zipCode || kyc.address || kyc.detailAddress) && (
          <div className="space-y-3 pt-4 border-t">
            <h4 className="font-medium text-sm">등록 주소</h4>
            <div className="grid gap-3">
              <div className="flex items-start gap-2">
                <div className="text-sm text-muted-foreground min-w-[80px]">우편번호</div>
                <div className="text-sm font-medium">{kyc.zipCode || '-'}</div>
              </div>
              <div className="flex items-start gap-2">
                <div className="text-sm text-muted-foreground min-w-[80px]">기본 주소</div>
                <div className="text-sm font-medium">{kyc.address || '-'}</div>
              </div>
              <div className="flex items-start gap-2">
                <div className="text-sm text-muted-foreground min-w-[80px]">상세 주소</div>
                <div className="text-sm font-medium">{kyc.detailAddress || '-'}</div>
              </div>
            </div>
          </div>
        )}

        {/* 주소 증명 */}
        {kyc.addressProofUrl && (
          <div className="space-y-3 pt-4 border-t">
            <h4 className="font-medium text-sm">주소 증명</h4>
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <div className="text-sm text-muted-foreground mb-1">주소증명 유형</div>
                <div className="font-medium">{getAddressProofTypeLabel(kyc.addressProofType)}</div>
              </div>
            </div>
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
          </div>
        )}

        {/* 회원가입 일시 */}
        {kyc.completedAt && (
          <div className="pt-4 border-t">
            <div className="text-sm text-muted-foreground">회원가입 일시</div>
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
