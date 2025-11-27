/**
 * Step 4: 사업/재무 정보
 * AML 규제 요건: 법인 사업 실태 및 재무 현황
 */

"use client";

import { Input } from "@/components/ui/input";
import { NumberInput } from "@/components/ui/NumberInput";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CountrySelect } from "@/components/ui/CountrySelect";

interface Step4Data {
  // 사업 정보
  mainBusiness: string; // 주요사업
  majorCustomers: string; // 주요고객명
  majorSuppliers: string; // 주요공급자명
  mainProducts: string; // 주요상품 및 서비스
  homepageUrl: string; // 홈페이지주소
  employeeCount: number; // 재직 종업원 수
  businessLocations: number; // 보유 사업장 수
  isVASP: boolean; // 가상자산사업자 여부

  // 재무 정보 (L3)
  monthlyRevenue: number; // 월평균매출액
  totalAssets: number; // 직전 사업연도 총자산금액
  totalCapital: number; // 직전 사업연도 총자본
  totalLiabilities: number; // 직전 사업연도 총부채
  netIncome: number; // 직전 사업연도 당기순이익
  marketShare: number; // 시장점유율 (%)

  // 거래 은행 정보
  mainBankName: string; // 주거래은행명
  mainBankAccountCountry: string; // 주거래은행 계좌 국가
  mainBankAccount: string; // 주거래은행 계좌번호
  mainBankAccountHolder: string; // 주거래은행 계좌명의인

  // 기업 규모
  companySize: string; // 01:대기업, 02:중소기업
  isFinancialInstitution: boolean; // 금융기관 여부
}

interface Step4Props {
  data: Step4Data;
  onChange: (data: Partial<Step4Data>) => void;
}

export function Step4BusinessFinance({ data, onChange }: Step4Props) {
  return (
    <div className="space-y-8">
      {/* 사업 정보 */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">사업 정보</h3>

        <div className="grid gap-4 md:grid-cols-2">
          {/* 주요사업 */}
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="mainBusiness">주요사업 (L3)</Label>
            <Textarea
              id="mainBusiness"
              value={data.mainBusiness}
              onChange={(e) => onChange({ mainBusiness: e.target.value })}
              placeholder="예: IT 솔루션 개발 및 공급"
              rows={2}
            />
          </div>

          {/* 주요상품/서비스 */}
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="mainProducts">주요상품 및 서비스 (L3)</Label>
            <Input
              id="mainProducts"
              value={data.mainProducts}
              onChange={(e) => onChange({ mainProducts: e.target.value })}
              placeholder="예: 블록체인 플랫폼, 보안 솔루션"
            />
          </div>

          {/* 주요고객 */}
          <div className="space-y-2">
            <Label htmlFor="majorCustomers">주요고객명 (L2)</Label>
            <Input
              id="majorCustomers"
              value={data.majorCustomers}
              onChange={(e) => onChange({ majorCustomers: e.target.value })}
              placeholder="예: 대기업, 금융권"
            />
          </div>

          {/* 주요공급자 */}
          <div className="space-y-2">
            <Label htmlFor="majorSuppliers">주요공급자명 (L2)</Label>
            <Input
              id="majorSuppliers"
              value={data.majorSuppliers}
              onChange={(e) => onChange({ majorSuppliers: e.target.value })}
              placeholder="예: AWS, Microsoft"
            />
          </div>

          {/* 홈페이지 */}
          <div className="space-y-2">
            <Label htmlFor="homepageUrl">홈페이지주소 (L2)</Label>
            <Input
              id="homepageUrl"
              type="url"
              value={data.homepageUrl}
              onChange={(e) => onChange({ homepageUrl: e.target.value })}
              placeholder="https://example.com"
            />
          </div>

          {/* 종업원 수 */}
          <div className="space-y-2">
            <Label htmlFor="employeeCount">재직 종업원 수 (L2)</Label>
            <NumberInput
              id="employeeCount"
              value={data.employeeCount}
              onValueChange={(value) => onChange({ employeeCount: value })}
              placeholder="50"
              min={0}
            />
          </div>

          {/* 사업장 수 */}
          <div className="space-y-2">
            <Label htmlFor="businessLocations">보유 사업장 수 (L3)</Label>
            <NumberInput
              id="businessLocations"
              value={data.businessLocations}
              onValueChange={(value) => onChange({ businessLocations: value })}
              placeholder="1"
              min={1}
            />
          </div>

          {/* 기업 규모 */}
          <div className="space-y-2">
            <Label htmlFor="companySize">기업 규모 (L2)</Label>
            <Select
              value={data.companySize}
              onValueChange={(value) => onChange({ companySize: value })}
            >
              <SelectTrigger id="companySize">
                <SelectValue placeholder="기업 규모 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="01">대기업</SelectItem>
                <SelectItem value="02">중소기업</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* 체크박스 */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isVASP"
              checked={data.isVASP}
              onCheckedChange={(checked) => onChange({ isVASP: checked as boolean })}
            />
            <Label htmlFor="isVASP" className="cursor-pointer font-normal">
              가상자산사업자 (L1)
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isFinancialInstitution"
              checked={data.isFinancialInstitution}
              onCheckedChange={(checked) => onChange({ isFinancialInstitution: checked as boolean })}
            />
            <Label htmlFor="isFinancialInstitution" className="cursor-pointer font-normal">
              금융기관
            </Label>
          </div>
        </div>
      </div>

      {/* 재무 정보 */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">재무 정보 (L3 - 선택)</h3>

        <div className="grid gap-4 md:grid-cols-2">
          {/* 월평균매출액 */}
          <div className="space-y-2">
            <Label htmlFor="monthlyRevenue">월평균매출액 (원)</Label>
            <NumberInput
              id="monthlyRevenue"
              value={data.monthlyRevenue}
              onValueChange={(value) => onChange({ monthlyRevenue: value })}
              placeholder="10000000"
              min={0}
            />
          </div>

          {/* 총자산 */}
          <div className="space-y-2">
            <Label htmlFor="totalAssets">직전 사업연도 총자산 (원)</Label>
            <NumberInput
              id="totalAssets"
              value={data.totalAssets}
              onValueChange={(value) => onChange({ totalAssets: value })}
              placeholder="500000000"
              min={0}
            />
          </div>

          {/* 총자본 */}
          <div className="space-y-2">
            <Label htmlFor="totalCapital">직전 사업연도 총자본 (원)</Label>
            <NumberInput
              id="totalCapital"
              value={data.totalCapital}
              onValueChange={(value) => onChange({ totalCapital: value })}
              placeholder="300000000"
              min={0}
            />
          </div>

          {/* 총부채 */}
          <div className="space-y-2">
            <Label htmlFor="totalLiabilities">직전 사업연도 총부채 (원)</Label>
            <NumberInput
              id="totalLiabilities"
              value={data.totalLiabilities}
              onValueChange={(value) => onChange({ totalLiabilities: value })}
              placeholder="200000000"
              min={0}
            />
          </div>

          {/* 당기순이익 */}
          <div className="space-y-2">
            <Label htmlFor="netIncome">직전 사업연도 당기순이익 (원)</Label>
            <NumberInput
              id="netIncome"
              value={data.netIncome}
              onValueChange={(value) => onChange({ netIncome: value })}
              placeholder="50000000"
            />
            <p className="text-xs text-gray-500">음수 가능 (손실인 경우)</p>
          </div>

          {/* 시장점유율 */}
          <div className="space-y-2">
            <Label htmlFor="marketShare">시장점유율 (%) (L2)</Label>
            <NumberInput
              id="marketShare"
              value={data.marketShare}
              onValueChange={(value) => onChange({ marketShare: value })}
              placeholder="5.5"
              min={0}
              max={100}
              step={0.01}
            />
          </div>
        </div>
      </div>

      {/* 주거래은행 정보 */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">주거래은행 정보 (L3 - 선택)</h3>

        <div className="grid gap-4 md:grid-cols-2">
          {/* 주거래은행명 */}
          <div className="space-y-2">
            <Label htmlFor="mainBankName">주거래은행명</Label>
            <Input
              id="mainBankName"
              value={data.mainBankName}
              onChange={(e) => onChange({ mainBankName: e.target.value })}
              placeholder="국민은행"
            />
          </div>

          {/* 계좌 국가 */}
          <CountrySelect
            value={data.mainBankAccountCountry}
            onValueChange={(value) => onChange({ mainBankAccountCountry: value })}
            label="계좌 국가"
            placeholder="국가 선택"
          />

          {/* 계좌번호 */}
          <div className="space-y-2">
            <Label htmlFor="mainBankAccount">계좌번호</Label>
            <Input
              id="mainBankAccount"
              value={data.mainBankAccount}
              onChange={(e) => onChange({ mainBankAccount: e.target.value })}
              placeholder="123-45-678901"
            />
            <p className="text-xs text-gray-500">암호화되어 저장됩니다</p>
          </div>

          {/* 계좌명의인 */}
          <div className="space-y-2">
            <Label htmlFor="mainBankAccountHolder">계좌명의인</Label>
            <Input
              id="mainBankAccountHolder"
              value={data.mainBankAccountHolder}
              onChange={(e) => onChange({ mainBankAccountHolder: e.target.value })}
              placeholder="(주)테크이노베이션"
            />
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>L1:</strong> 필수 | <strong>L2:</strong> 권고 | <strong>L3:</strong> 선택
        </p>
        <p className="text-sm text-blue-800 mt-1">
          고위험 법인의 경우 L2, L3 정보도 수집을 권장합니다.
        </p>
      </div>
    </div>
  );
}
