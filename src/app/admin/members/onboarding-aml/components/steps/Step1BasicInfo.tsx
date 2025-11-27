/**
 * Step 1: 법인 기본정보 + 담당자
 */

"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Step1Data {
  companyName: string;
  businessNumber: string;
  corporateRegistryNumber: string;
  establishmentDate: string;
  corporateType: string;
  industryType: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
}

interface Step1Props {
  data: Step1Data;
  onChange: (data: Partial<Step1Data>) => void;
}

export function Step1BasicInfo({ data, onChange }: Step1Props) {
  return (
    <div className="space-y-8">
      {/* 법인 기본정보 섹션 */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">법인 기본정보</h3>

        <div className="grid gap-4 md:grid-cols-2">
          {/* 법인명 */}
          <div className="space-y-2">
            <Label htmlFor="companyName">
              법인명 <span className="text-red-600">*</span>
            </Label>
            <Input
              id="companyName"
              value={data.companyName}
              onChange={(e) => onChange({ companyName: e.target.value })}
              placeholder="(주)테크이노베이션"
              required
            />
          </div>

          {/* 사업자등록번호 */}
          <div className="space-y-2">
            <Label htmlFor="businessNumber">
              사업자등록번호 <span className="text-red-600">*</span>
            </Label>
            <Input
              id="businessNumber"
              value={data.businessNumber}
              onChange={(e) => onChange({ businessNumber: e.target.value })}
              placeholder="123-45-67890"
              required
            />
            <p className="text-xs text-gray-500">숫자만 입력 또는 하이픈 포함 가능</p>
          </div>

          {/* 법인등록번호 */}
          <div className="space-y-2">
            <Label htmlFor="corporateRegistryNumber">
              법인등록번호 <span className="text-red-600">*</span>
            </Label>
            <Input
              id="corporateRegistryNumber"
              value={data.corporateRegistryNumber}
              onChange={(e) => onChange({ corporateRegistryNumber: e.target.value })}
              placeholder="110111-0000001"
              required
            />
          </div>

          {/* 설립일자 */}
          <div className="space-y-2">
            <Label htmlFor="establishmentDate">
              설립일자 <span className="text-red-600">*</span>
            </Label>
            <Input
              id="establishmentDate"
              type="date"
              value={data.establishmentDate}
              onChange={(e) => onChange({ establishmentDate: e.target.value })}
              required
            />
          </div>

          {/* 법인유형 */}
          <div className="space-y-2">
            <Label htmlFor="corporateType">
              법인유형 <span className="text-red-600">*</span>
            </Label>
            <Select
              value={data.corporateType}
              onValueChange={(value) => onChange({ corporateType: value })}
            >
              <SelectTrigger id="corporateType">
                <SelectValue placeholder="법인유형 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="01">금융기관</SelectItem>
                <SelectItem value="02">국가 및 지방자치단체</SelectItem>
                <SelectItem value="03">공공기관</SelectItem>
                <SelectItem value="04">상장법인</SelectItem>
                <SelectItem value="05">비영리법인</SelectItem>
                <SelectItem value="06">특수목적회사(SPC)</SelectItem>
                <SelectItem value="09">기타</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 업종 */}
          <div className="space-y-2">
            <Label htmlFor="industryType">업종</Label>
            <Input
              id="industryType"
              value={data.industryType}
              onChange={(e) => onChange({ industryType: e.target.value })}
              placeholder="정보통신업"
            />
          </div>
        </div>
      </div>

      {/* 담당자 정보 섹션 */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">담당자 정보</h3>
        <p className="text-sm text-gray-600">
          법인 관리자 계정으로 생성됩니다. 담당자는 로그인하여 시스템을 사용할 수 있습니다.
        </p>

        <div className="grid gap-4 md:grid-cols-2">
          {/* 담당자명 */}
          <div className="space-y-2">
            <Label htmlFor="contactName">
              담당자명 <span className="text-red-600">*</span>
            </Label>
            <Input
              id="contactName"
              value={data.contactName}
              onChange={(e) => onChange({ contactName: e.target.value })}
              placeholder="홍길동"
              required
            />
          </div>

          {/* 담당자 이메일 */}
          <div className="space-y-2">
            <Label htmlFor="contactEmail">
              담당자 이메일 <span className="text-red-600">*</span>
            </Label>
            <Input
              id="contactEmail"
              type="email"
              value={data.contactEmail}
              onChange={(e) => onChange({ contactEmail: e.target.value })}
              placeholder="example@email.com"
              required
            />
          </div>

          {/* 담당자 전화번호 */}
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="contactPhone">
              담당자 전화번호 <span className="text-red-600">*</span>
            </Label>
            <Input
              id="contactPhone"
              type="tel"
              value={data.contactPhone}
              onChange={(e) => onChange({ contactPhone: e.target.value })}
              placeholder="010-1234-5678"
              required
            />
          </div>
        </div>
      </div>
    </div>
  );
}
