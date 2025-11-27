/**
 * Step 5: 서류 업로드 + 최종 확인
 */

"use client";

import { S3FileUploadButton } from "@/components/ui/S3FileUploadButton";

interface Step5Data {
  documents: {
    businessLicense?: string; // 사업자등록증
    corporateRegistry?: string; // 법인등기부등본
    articlesOfIncorporation?: string; // 정관
    shareholderList?: string; // 주주명부
    representativeId?: string; // 대표자 신분증
    representativeSeal?: string; // 대표자 인감증명서
  };
}

interface Step5Props {
  data: Step5Data;
  formData: any; // 전체 폼 데이터 (확인용)
  onChange: (data: Partial<Step5Data>) => void;
}

export function Step5DocumentsReview({ data, formData, onChange }: Step5Props) {
  const updateDocument = (key: string, value: string) => {
    onChange({
      documents: {
        ...data.documents,
        [key]: value,
      },
    });
  };

  return (
    <div className="space-y-8">
      {/* 서류 업로드 */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">법인 서류 업로드</h3>

        <div className="grid gap-4 md:grid-cols-2">
          {/* 사업자등록증 */}
          <S3FileUploadButton
            label="사업자등록증"
            required
            documentType="business-registration"
            s3Key={data.documents.businessLicense || ""}
            onUploadSuccess={(key) => updateDocument("businessLicense", key)}
            onRemove={() => updateDocument("businessLicense", "")}
          />

          {/* 법인등기부등본 */}
          <S3FileUploadButton
            label="법인등기부등본"
            required
            documentType="corporate-registry"
            s3Key={data.documents.corporateRegistry || ""}
            onUploadSuccess={(key) => updateDocument("corporateRegistry", key)}
            onRemove={() => updateDocument("corporateRegistry", "")}
          />

          {/* 정관 */}
          <S3FileUploadButton
            label="정관"
            required
            documentType="articles-of-incorporation"
            s3Key={data.documents.articlesOfIncorporation || ""}
            onUploadSuccess={(key) => updateDocument("articlesOfIncorporation", key)}
            onRemove={() => updateDocument("articlesOfIncorporation", "")}
          />

          {/* 주주명부 */}
          <S3FileUploadButton
            label="주주명부"
            required
            documentType="shareholder-list"
            s3Key={data.documents.shareholderList || ""}
            onUploadSuccess={(key) => updateDocument("shareholderList", key)}
            onRemove={() => updateDocument("shareholderList", "")}
          />

          {/* 대표자 신분증 */}
          <S3FileUploadButton
            label="대표자 신분증"
            required
            documentType="representative-id"
            s3Key={data.documents.representativeId || ""}
            onUploadSuccess={(key) => updateDocument("representativeId", key)}
            onRemove={() => updateDocument("representativeId", "")}
          />

          {/* 대표자 인감증명서 */}
          <S3FileUploadButton
            label="대표자 인감증명서"
            required
            documentType="representative-seal-cert"
            s3Key={data.documents.representativeSeal || ""}
            onUploadSuccess={(key) => updateDocument("representativeSeal", key)}
            onRemove={() => updateDocument("representativeSeal", "")}
          />
        </div>
      </div>

      {/* 최종 확인 */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">입력 정보 확인</h3>

        <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
          {/* 법인 정보 요약 */}
          <div>
            <p className="text-sm font-semibold text-gray-700">법인명</p>
            <p className="text-sm">{formData.companyName || "-"}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-semibold text-gray-700">사업자등록번호</p>
              <p className="text-sm">{formData.businessNumber || "-"}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-700">법인등록번호</p>
              <p className="text-sm">{formData.corporateRegistryNumber || "-"}</p>
            </div>
          </div>

          {/* 담당자 정보 요약 */}
          <div className="pt-3 border-t">
            <p className="text-sm font-semibold text-gray-700 mb-2">담당자</p>
            <p className="text-sm">
              {formData.contactName} / {formData.contactEmail} / {formData.contactPhone}
            </p>
          </div>

          {/* 대표자 정보 요약 */}
          <div className="pt-3 border-t">
            <p className="text-sm font-semibold text-gray-700 mb-2">대표자</p>
            <p className="text-sm">{formData.repName || "-"}</p>
          </div>

          {/* 소유자 수 */}
          <div className="pt-3 border-t">
            <p className="text-sm font-semibold text-gray-700">소유자 수</p>
            <p className="text-sm">{formData.owners?.length || 0}명</p>
          </div>

          {/* 서류 업로드 상태 */}
          <div className="pt-3 border-t">
            <p className="text-sm font-semibold text-gray-700 mb-2">서류 업로드 상태</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className={data.documents.businessLicense ? "text-green-600" : "text-red-600"}>
                • 사업자등록증 {data.documents.businessLicense ? "✓" : "✗"}
              </div>
              <div className={data.documents.corporateRegistry ? "text-green-600" : "text-red-600"}>
                • 법인등기부등본 {data.documents.corporateRegistry ? "✓" : "✗"}
              </div>
              <div
                className={data.documents.articlesOfIncorporation ? "text-green-600" : "text-red-600"}
              >
                • 정관 {data.documents.articlesOfIncorporation ? "✓" : "✗"}
              </div>
              <div className={data.documents.shareholderList ? "text-green-600" : "text-red-600"}>
                • 주주명부 {data.documents.shareholderList ? "✓" : "✗"}
              </div>
              <div className={data.documents.representativeId ? "text-green-600" : "text-red-600"}>
                • 대표자 신분증 {data.documents.representativeId ? "✓" : "✗"}
              </div>
              <div className={data.documents.representativeSeal ? "text-green-600" : "text-red-600"}>
                • 대표자 인감증명서 {data.documents.representativeSeal ? "✓" : "✗"}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-800">
          <strong>주의:</strong> 모든 필수 서류를 업로드한 후 "등록하기" 버튼을 클릭하세요.
          등록 후에는 정보 수정이 제한될 수 있습니다.
        </p>
      </div>
    </div>
  );
}
