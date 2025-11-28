/**
 * 대표자 KYC 정보 섹션 (14개 필드)
 */

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RepresentativeDetail, FilesUrls } from "@/types/corporateOnboardingReview";
import {
  getGenderLabel,
  getIdTypeLabel,
  maskSensitiveData
} from "@/lib/corporateLabels";
import { FileText, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RepresentativeKYCSectionProps {
  representative: RepresentativeDetail | null;
  files: FilesUrls;
}

export function RepresentativeKYCSection({ representative, files }: RepresentativeKYCSectionProps) {
  if (!representative) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>대표자 KYC 정보</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-gray-500">대표자 정보가 없습니다.</div>
        </CardContent>
      </Card>
    );
  }

  const handleFileView = (url?: string) => {
    if (url) window.open(url, '_blank');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>대표자 KYC 정보</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 기본정보 */}
        <div>
          <h3 className="text-sm font-semibold mb-3 border-b pb-2">기본정보</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500">성명(한글)</label>
              <p className="font-medium">{representative.name}</p>
            </div>
            <div>
              <label className="text-xs text-gray-500">성명(영문)</label>
              <p>{representative.nameEn || '-'}</p>
            </div>
            <div>
              <label className="text-xs text-gray-500">생년월일</label>
              <p>{representative.birthDate || '-'}</p>
            </div>
            <div>
              <label className="text-xs text-gray-500">성별</label>
              <p>{getGenderLabel(representative.gender)}</p>
            </div>
            <div>
              <label className="text-xs text-gray-500">국적</label>
              <p>{representative.nationality || '-'}</p>
            </div>
          </div>
        </div>

        {/* 실명확인 */}
        <div>
          <h3 className="text-sm font-semibold mb-3 border-b pb-2">실명확인</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500">신원확인 구분</label>
              <p>{getIdTypeLabel(representative.idType)}</p>
            </div>
            <div>
              <label className="text-xs text-gray-500">신원확인 번호</label>
              <p className="font-mono">{maskSensitiveData(representative.idNumber)}</p>
            </div>
          </div>
        </div>

        {/* 연락처 */}
        <div>
          <h3 className="text-sm font-semibold mb-3 border-b pb-2">연락처</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500">전화번호</label>
              <p>{representative.phone || '-'}</p>
            </div>
            <div>
              <label className="text-xs text-gray-500">우편번호</label>
              <p>{representative.zipCode || '-'}</p>
            </div>
            <div className="col-span-2">
              <label className="text-xs text-gray-500">주소</label>
              <p>{representative.address || '-'}</p>
            </div>
          </div>
        </div>

        {/* FIU 관련 정보 */}
        <div>
          <h3 className="text-sm font-semibold mb-3 border-b pb-2">FIU 관련 정보</h3>
          <div className="flex gap-2">
            <Badge variant={representative.isFiuTarget ? "destructive" : "secondary"}>
              FIU 대상자: {representative.isFiuTarget ? 'Y' : 'N'}
            </Badge>
            <Badge variant={representative.hasOwnership ? "default" : "secondary"}>
              지분보유: {representative.hasOwnership ? 'Y' : 'N'}
            </Badge>
          </div>
        </div>

        {/* 제출 서류 */}
        <div>
          <h3 className="text-sm font-semibold mb-3 border-b pb-2">제출 서류</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-gray-400" />
                <span className="text-sm">신원확인증</span>
              </div>
              {files.representativeIdCard ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleFileView(files.representativeIdCard)}
                >
                  <ExternalLink className="h-3 w-3" />
                </Button>
              ) : (
                <Badge variant="secondary" className="text-xs">
                  미제출
                </Badge>
              )}
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-gray-400" />
                <span className="text-sm">인감증명</span>
              </div>
              {files.representativeSealCert ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleFileView(files.representativeSealCert)}
                >
                  <ExternalLink className="h-3 w-3" />
                </Button>
              ) : (
                <Badge variant="secondary" className="text-xs">
                  미제출
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
