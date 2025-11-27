/**
 * Step 3: 소유자 정보 (주주/임원/실소유자)
 * AML 규제 요건: 25% 이상 지분 소유자 확인
 */

"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { CountrySelect } from "@/components/ui/CountrySelect";
import { Plus, Trash2 } from "lucide-react";

interface Owner {
  type: string; // 1:주주, 2:임원, 3:실소유자
  serialNumber: number;
  name: string;
  nameEn: string;
  idType: string;
  idNumber: string;
  birthDate: string;
  nationality: string;
  sharePercentage: number;
  verificationMethod: string; // 확인방법 (주주명부, 사원명부 등)
}

interface Step3Data {
  owners: Owner[];
  isRealOwnerExempt: boolean; // 실소유자 확인 면제 여부
  realOwnerExemptCode: string; // 면제 코드
}

interface Step3Props {
  data: Step3Data;
  onChange: (data: Partial<Step3Data>) => void;
}

export function Step3Owners({ data, onChange }: Step3Props) {
  const handleAddOwner = () => {
    const newOwner: Owner = {
      type: "1",
      serialNumber: data.owners.length + 1,
      name: "",
      nameEn: "",
      idType: "01",
      idNumber: "",
      birthDate: "",
      nationality: "KR",
      sharePercentage: 0,
      verificationMethod: "01",
    };

    onChange({ owners: [...data.owners, newOwner] });
  };

  const handleRemoveOwner = (index: number) => {
    const newOwners = data.owners.filter((_, i) => i !== index);
    // 일련번호 재정렬
    newOwners.forEach((owner, i) => {
      owner.serialNumber = i + 1;
    });
    onChange({ owners: newOwners });
  };

  const handleOwnerChange = (index: number, field: keyof Owner, value: any) => {
    const newOwners = [...data.owners];
    newOwners[index] = { ...newOwners[index], [field]: value };
    onChange({ owners: newOwners });
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          25% 이상 지분을 가진 주주, 임원, 실소유자 정보를 입력하세요.
          실명확인번호는 암호화되어 저장됩니다.
        </p>
      </div>

      {/* 실소유자 확인 면제 */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="isRealOwnerExempt"
            checked={data.isRealOwnerExempt}
            onCheckedChange={(checked) => onChange({ isRealOwnerExempt: checked as boolean })}
          />
          <Label htmlFor="isRealOwnerExempt" className="cursor-pointer font-normal">
            실제소유자 확인 면제 대상
          </Label>
        </div>

        {data.isRealOwnerExempt && (
          <div className="space-y-2 ml-6">
            <Label htmlFor="realOwnerExemptCode">면제 코드</Label>
            <Select
              value={data.realOwnerExemptCode}
              onValueChange={(value) => onChange({ realOwnerExemptCode: value })}
            >
              <SelectTrigger id="realOwnerExemptCode">
                <SelectValue placeholder="면제 사유 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="01">금융회사(단, 카지노사업자, 가상자산사업자 제외)</SelectItem>
                <SelectItem value="02">국가 또는 지방자치단체</SelectItem>
                <SelectItem value="03">공공단체</SelectItem>
                <SelectItem value="04">사업보고서 제출대상법인(주권상장법인 등)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* 소유자 목록 */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">소유자 목록</h3>
          <Button type="button" variant="outline" size="sm" onClick={handleAddOwner}>
            <Plus className="h-4 w-4 mr-1" />
            소유자 추가
          </Button>
        </div>

        {data.owners.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            소유자 정보를 추가해주세요
          </div>
        )}

        {data.owners.map((owner, index) => (
          <div key={index} className="p-4 border rounded-lg space-y-4 bg-gray-50">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">소유자 #{owner.serialNumber}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveOwner(index)}
              >
                <Trash2 className="h-4 w-4 text-red-600" />
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {/* 소유자 구분 */}
              <div className="space-y-2">
                <Label>
                  소유자 구분 <span className="text-red-600">*</span>
                </Label>
                <Select
                  value={owner.type}
                  onValueChange={(value) => handleOwnerChange(index, "type", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">주주 (L3)</SelectItem>
                    <SelectItem value="2">임원 (L3)</SelectItem>
                    <SelectItem value="3">실소유자 (L1)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 이름 */}
              <div className="space-y-2">
                <Label>
                  이름 <span className="text-red-600">*</span>
                </Label>
                <Input
                  value={owner.name}
                  onChange={(e) => handleOwnerChange(index, "name", e.target.value)}
                  placeholder="홍길동"
                  required
                />
              </div>

              {/* 영문명 */}
              <div className="space-y-2">
                <Label>영문명</Label>
                <Input
                  value={owner.nameEn}
                  onChange={(e) => handleOwnerChange(index, "nameEn", e.target.value)}
                  placeholder="Hong Gildong"
                />
              </div>

              {/* 실명확인 구분 */}
              <div className="space-y-2">
                <Label>
                  실명확인 구분 <span className="text-red-600">*</span>
                </Label>
                <Select
                  value={owner.idType}
                  onValueChange={(value) => handleOwnerChange(index, "idType", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="01">주민등록번호(개인)</SelectItem>
                    <SelectItem value="04">여권번호</SelectItem>
                    <SelectItem value="06">외국인등록번호</SelectItem>
                    <SelectItem value="14">CI번호</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 실명확인번호 */}
              <div className="space-y-2">
                <Label>
                  실명확인번호 <span className="text-red-600">*</span>
                </Label>
                <Input
                  value={owner.idNumber}
                  onChange={(e) => handleOwnerChange(index, "idNumber", e.target.value)}
                  placeholder="123456-1234567"
                  required
                />
              </div>

              {/* 생년월일 */}
              <div className="space-y-2">
                <Label>
                  생년월일 <span className="text-red-600">*</span>
                </Label>
                <Input
                  type="date"
                  value={owner.birthDate}
                  onChange={(e) => handleOwnerChange(index, "birthDate", e.target.value)}
                  required
                />
              </div>

              {/* 국적 */}
              <CountrySelect
                value={owner.nationality}
                onValueChange={(value) => handleOwnerChange(index, "nationality", value)}
                label="국적"
                required
              />

              {/* 지분율 */}
              <div className="space-y-2">
                <Label>지분율 (%)</Label>
                <Input
                  type="number"
                  value={owner.sharePercentage}
                  onChange={(e) =>
                    handleOwnerChange(index, "sharePercentage", parseFloat(e.target.value) || 0)
                  }
                  placeholder="25.5"
                  min="0"
                  max="100"
                  step="0.01"
                />
              </div>

              {/* 확인방법 */}
              <div className="space-y-2">
                <Label>
                  확인방법 <span className="text-red-600">*</span>
                </Label>
                <Select
                  value={owner.verificationMethod}
                  onValueChange={(value) => handleOwnerChange(index, "verificationMethod", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="01">주주명부</SelectItem>
                    <SelectItem value="02">사원명부</SelectItem>
                    <SelectItem value="03">정관</SelectItem>
                    <SelectItem value="04">이사명부</SelectItem>
                    <SelectItem value="06">실제소유자명부</SelectItem>
                    <SelectItem value="99">기타(공문 등)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-800">
          실소유자 구분이 "3:실소유자"인 경우, 추가 확인이 필요할 수 있습니다.
        </p>
      </div>
    </div>
  );
}
