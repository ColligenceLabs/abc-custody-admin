/**
 * Step 2: 대표자 KYC 정보
 * AML 규제 요건: 대표자 실명확인 및 상세 정보
 */

"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { CountrySelect } from "@/components/ui/CountrySelect";

interface Step2Data {
  // 대표자 기본 정보
  repName: string;
  repBirthDate: string;
  repGender: string;
  repNationality: string;

  // 대표자 실명확인
  repIdType: string;
  repIdNumber: string;

  // 대표자 연락처
  repPhone: string;
  repAddress: string;
  repZipCode: string;

  // AML 추가 필드
  isFiuTarget: boolean; // FIU 보고대상자 여부
  hasOwnership: boolean; // 지분소유 여부
}

interface Step2Props {
  data: Step2Data;
  onChange: (data: Partial<Step2Data>) => void;
}

export function Step2RepresentativeKYC({ data, onChange }: Step2Props) {
  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          법인의 대표자(KoFIU 보고 대표자) 정보를 입력하세요.
          실명확인번호는 암호화되어 저장됩니다.
        </p>
      </div>

      {/* 대표자 기본 정보 */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">대표자 기본 정보</h3>

        <div className="grid gap-4 md:grid-cols-2">
          {/* 대표자명 */}
          <div className="space-y-2">
            <Label htmlFor="repName">
              대표자명 <span className="text-red-600">*</span>
            </Label>
            <Input
              id="repName"
              value={data.repName}
              onChange={(e) => onChange({ repName: e.target.value })}
              placeholder="김철수"
              required
            />
          </div>

          {/* 생년월일 */}
          <div className="space-y-2">
            <Label htmlFor="repBirthDate">
              생년월일 <span className="text-red-600">*</span>
            </Label>
            <Input
              id="repBirthDate"
              type="date"
              value={data.repBirthDate}
              onChange={(e) => onChange({ repBirthDate: e.target.value })}
              required
            />
          </div>

          {/* 성별 */}
          <div className="space-y-2">
            <Label htmlFor="repGender">
              성별 <span className="text-red-600">*</span>
            </Label>
            <Select value={data.repGender} onValueChange={(value) => onChange({ repGender: value })}>
              <SelectTrigger id="repGender">
                <SelectValue placeholder="성별 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">남</SelectItem>
                <SelectItem value="2">여</SelectItem>
                <SelectItem value="9">알수없음</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 국적 */}
          <CountrySelect
            value={data.repNationality}
            onValueChange={(value) => onChange({ repNationality: value })}
            label="국적"
            required
            placeholder="국가 선택"
          />
        </div>
      </div>

      {/* 대표자 실명확인 */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">실명확인 정보</h3>

        <div className="grid gap-4 md:grid-cols-2">
          {/* 실명확인 구분 */}
          <div className="space-y-2">
            <Label htmlFor="repIdType">
              실명확인 구분 <span className="text-red-600">*</span>
            </Label>
            <Select value={data.repIdType} onValueChange={(value) => onChange({ repIdType: value })}>
              <SelectTrigger id="repIdType">
                <SelectValue placeholder="실명확인 방법 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="01">주민등록번호(개인)</SelectItem>
                <SelectItem value="04">여권번호</SelectItem>
                <SelectItem value="06">외국인등록번호</SelectItem>
                <SelectItem value="07">국내거소신고번호</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 실명확인번호 */}
          <div className="space-y-2">
            <Label htmlFor="repIdNumber">
              실명확인번호 <span className="text-red-600">*</span>
            </Label>
            <Input
              id="repIdNumber"
              value={data.repIdNumber}
              onChange={(e) => onChange({ repIdNumber: e.target.value })}
              placeholder="123456-1234567"
              required
            />
            <p className="text-xs text-gray-500">암호화되어 저장됩니다</p>
          </div>
        </div>
      </div>

      {/* 대표자 연락처 */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">대표자 연락처</h3>

        <div className="grid gap-4 md:grid-cols-2">
          {/* 전화번호 */}
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="repPhone">
              대표자 전화번호 <span className="text-red-600">*</span>
            </Label>
            <Input
              id="repPhone"
              type="tel"
              value={data.repPhone}
              onChange={(e) => onChange({ repPhone: e.target.value })}
              placeholder="02-1234-5678 또는 010-1234-5678"
              required
            />
            <p className="text-xs text-gray-500">법인: 대표자 회사 전화번호 / 모를 경우: 회사 전화번호</p>
          </div>

          {/* 우편번호 */}
          <div className="space-y-2">
            <Label htmlFor="repZipCode">
              우편번호 <span className="text-red-600">*</span>
            </Label>
            <Input
              id="repZipCode"
              value={data.repZipCode}
              onChange={(e) => onChange({ repZipCode: e.target.value })}
              placeholder="12345"
              maxLength={7}
              required
            />
          </div>

          {/* 주소 */}
          <div className="space-y-2">
            <Label htmlFor="repAddress">
              주소 <span className="text-red-600">*</span>
            </Label>
            <Input
              id="repAddress"
              value={data.repAddress}
              onChange={(e) => onChange({ repAddress: e.target.value })}
              placeholder="서울특별시 강남구 테헤란로 123"
              required
            />
            <p className="text-xs text-gray-500">대표자 회사 주소 / 모를 경우: 회사 주소</p>
          </div>
        </div>
      </div>

      {/* AML 추가 필드 */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">AML 추가 정보</h3>

        <div className="space-y-3">
          {/* FIU 보고대상자 여부 */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isFiuTarget"
              checked={data.isFiuTarget}
              onCheckedChange={(checked) => onChange({ isFiuTarget: checked as boolean })}
            />
            <Label htmlFor="isFiuTarget" className="cursor-pointer font-normal">
              FIU 보고대상자 (주 대표자)
            </Label>
          </div>
          <p className="text-xs text-gray-500 ml-6">법인에 주 대표자는 1명만 가능합니다</p>

          {/* 지분소유 여부 */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="hasOwnership"
              checked={data.hasOwnership}
              onCheckedChange={(checked) => onChange({ hasOwnership: checked as boolean })}
            />
            <Label htmlFor="hasOwnership" className="cursor-pointer font-normal">
              대표자 지분소유 여부
            </Label>
          </div>
        </div>
      </div>
    </div>
  );
}
