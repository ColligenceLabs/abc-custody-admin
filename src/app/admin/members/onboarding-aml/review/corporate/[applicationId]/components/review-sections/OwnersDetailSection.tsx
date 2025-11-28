/**
 * 소유자 상세 정보 섹션 (N명 × 14개 필드, Tabs)
 */

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OwnerDetail } from "@/types/corporateOnboardingReview";
import {
  getOwnerTypeLabel,
  getIdTypeLabel,
  getVerificationMethodLabel,
  getRealOwnerTypeLabel,
  maskSensitiveData
} from "@/lib/corporateLabels";

interface OwnersDetailSectionProps {
  owners: OwnerDetail[];
}

export function OwnersDetailSection({ owners }: OwnersDetailSectionProps) {
  const getOwnerTypeBadgeColor = (ownerType: string) => {
    switch (ownerType) {
      case '1':
        return 'bg-blue-50 text-blue-600 border-blue-200';
      case '2':
        return 'bg-purple-50 text-purple-600 border-purple-200';
      case '3':
        return 'bg-red-50 text-red-600 border-red-200';
      default:
        return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>소유자 상세 정보</CardTitle>
        <p className="text-sm text-gray-500 mt-2">
          총 {owners.length}명의 소유자 정보
        </p>
      </CardHeader>
      <CardContent>
        {owners.length === 0 ? (
          <div className="text-center py-6 text-gray-500">소유자 정보가 없습니다.</div>
        ) : (
          <Tabs defaultValue={`owner-${owners[0].id}`} className="w-full">
            <TabsList className="w-full grid gap-2 h-auto flex-wrap">
              {owners.map((owner) => (
                <TabsTrigger
                  key={owner.id}
                  value={`owner-${owner.id}`}
                  className="flex items-center gap-2"
                >
                  <Badge className={`${getOwnerTypeBadgeColor(owner.ownerType)} border`}>
                    {getOwnerTypeLabel(owner.ownerType)}
                  </Badge>
                  <span className="text-sm">{owner.name}</span>
                  {owner.sharePercentage > 0 && (
                    <span className="text-xs text-gray-500">
                      ({owner.sharePercentage}%)
                    </span>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>
            {owners.map((owner) => (
              <TabsContent
                key={owner.id}
                value={`owner-${owner.id}`}
                className="space-y-6 pt-4"
              >
                {/* 기본정보 */}
                <div>
                  <h4 className="text-sm font-semibold mb-3 border-b pb-2">
                    기본정보
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-gray-500">순번</label>
                      <p className="font-medium">{owner.serialNumber}</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">소유자 구분</label>
                      <p>{getOwnerTypeLabel(owner.ownerType)}</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">성명(한글)</label>
                      <p className="font-medium">{owner.name}</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">성명(영문)</label>
                      <p>{owner.nameEn || '-'}</p>
                    </div>
                  </div>
                </div>

                {/* 신원확인 */}
                <div>
                  <h4 className="text-sm font-semibold mb-3 border-b pb-2">
                    신원확인
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-gray-500">
                        신원확인 구분
                      </label>
                      <p>{getIdTypeLabel(owner.idType)}</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">
                        신원확인 번호
                      </label>
                      <p className="font-mono">
                        {maskSensitiveData(owner.idNumber)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 개인정보 */}
                <div>
                  <h4 className="text-sm font-semibold mb-3 border-b pb-2">
                    개인정보
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-gray-500">생년월일</label>
                      <p>{owner.birthDate || '-'}</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">국적</label>
                      <p>{owner.nationality || '-'}</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">성별</label>
                      <p>
                        {owner.gender === '1'
                          ? '남'
                          : owner.gender === '2'
                            ? '여'
                            : '알수없음'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 지분정보 */}
                <div>
                  <h4 className="text-sm font-semibold mb-3 border-b pb-2">
                    지분정보
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-gray-500">지분율</label>
                      <p className="font-medium">{owner.sharePercentage}%</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">주식수</label>
                      <p>
                        {owner.shareCount
                          ? `${owner.shareCount.toLocaleString('ko-KR')}주`
                          : '-'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 확인방법 */}
                <div>
                  <h4 className="text-sm font-semibold mb-3 border-b pb-2">
                    확인방법
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-gray-500">확인방법</label>
                      <p>
                        {getVerificationMethodLabel(owner.verificationMethod)}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">
                        확인방법 상세
                      </label>
                      <p>{owner.verificationMethodDetail || '-'}</p>
                    </div>
                  </div>
                </div>

                {/* 실소유자 정보 */}
                {owner.realOwnerType && (
                  <div>
                    <h4 className="text-sm font-semibold mb-3 border-b pb-2">
                      실소유자 정보
                    </h4>
                    <div>
                      <label className="text-xs text-gray-500 block mb-2">
                        실소유자 구분
                      </label>
                      <p className="text-sm">
                        {getRealOwnerTypeLabel(owner.realOwnerType)}
                      </p>
                    </div>
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}
