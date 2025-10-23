/**
 * 대출 상품 등록/수정 폼 모달
 */

"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  AdminBankLoanProduct,
  LoanProductRequest,
  Currency,
} from "@/types/admin-lending";
import { X, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createLoanProduct, updateLoanProduct } from "@/services/admin-lending";

interface ProductFormModalProps {
  product: AdminBankLoanProduct | null;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const initialFormData: LoanProductRequest = {
  productName: "",
  bankName: "",
  collateralAsset: "BTC",
  loanTerm: "",
  ltv: 50,
  interestRate: 3.0,
  minLoanAmount: 1000000,
  maxLoanAmount: 100000000,
  earlyRepaymentFee: "면제",
  additionalCollateralAllowed: true,
  features: [],
  description: "",
};

export default function ProductFormModal({
  product,
  open,
  onClose,
  onSuccess,
}: ProductFormModalProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState<LoanProductRequest>(initialFormData);
  const [newFeature, setNewFeature] = useState("");
  const [loading, setLoading] = useState(false);

  const isEditMode = !!product;

  // 상품 데이터로 폼 초기화
  useEffect(() => {
    if (product) {
      setFormData({
        productName: product.productName,
        bankName: product.bankName,
        collateralAsset: product.collateralAsset as Currency,
        loanTerm: product.loanTerm,
        ltv: product.ltv,
        interestRate: product.interestRate,
        minLoanAmount: product.minLoanAmount,
        maxLoanAmount: product.maxLoanAmount,
        earlyRepaymentFee: product.earlyRepaymentFee,
        additionalCollateralAllowed: product.additionalCollateralAllowed,
        features: [...product.features],
        description: product.description,
      });
    } else {
      setFormData(initialFormData);
    }
  }, [product, open]);

  // 입력 핸들러
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "number"
          ? parseFloat(value) || 0
          : type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : value,
    }));
  };

  // 담보 자산 선택
  const handleAssetSelect = (asset: Currency) => {
    setFormData((prev) => ({ ...prev, collateralAsset: asset }));
  };

  // 특징 추가
  const handleAddFeature = () => {
    if (newFeature.trim() && !formData.features.includes(newFeature.trim())) {
      setFormData((prev) => ({
        ...prev,
        features: [...prev.features, newFeature.trim()],
      }));
      setNewFeature("");
    }
  };

  // 특징 제거
  const handleRemoveFeature = (feature: string) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.filter((f) => f !== feature),
    }));
  };

  // 폼 제출
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 유효성 검사
    if (!formData.productName.trim()) {
      toast({
        variant: "destructive",
        title: "입력 오류",
        description: "상품명을 입력해주세요.",
      });
      return;
    }

    if (formData.minLoanAmount >= formData.maxLoanAmount) {
      toast({
        variant: "destructive",
        title: "입력 오류",
        description: "최소 대출 금액은 최대 대출 금액보다 작아야 합니다.",
      });
      return;
    }

    setLoading(true);
    try {
      if (isEditMode) {
        await updateLoanProduct(product.id, formData);
        toast({
          description: "상품이 수정되었습니다.",
        });
      } else {
        await createLoanProduct(formData);
        toast({
          description: "상품이 등록되었습니다.",
        });
      }
      onSuccess();
      onClose();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "오류 발생",
        description: isEditMode
          ? "상품 수정에 실패했습니다."
          : "상품 등록에 실패했습니다.",
      });
    } finally {
      setLoading(false);
    }
  };

  const assetOptions: Currency[] = ["BTC", "ETH", "USDT", "USDC", "SOL"];
  const loanTermOptions = [
    "1개월",
    "3개월",
    "6개월",
    "1년",
    "2년",
    "3년",
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "대출 상품 수정" : "새 대출 상품 등록"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 기본 정보 */}
          <section>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              기본 정보
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  상품명 *
                </label>
                <Input
                  name="productName"
                  value={formData.productName}
                  onChange={handleChange}
                  placeholder="예: 비트코인 담보 단기대출"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  제휴 은행 *
                </label>
                <Input
                  name="bankName"
                  value={formData.bankName}
                  onChange={handleChange}
                  placeholder="예: 전북은행"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  담보 자산 *
                </label>
                <div className="flex flex-wrap gap-2">
                  {assetOptions.map((asset) => (
                    <Badge
                      key={asset}
                      onClick={() => handleAssetSelect(asset)}
                      className={`cursor-pointer transition-colors ${
                        formData.collateralAsset === asset
                          ? "bg-indigo-600 text-white hover:bg-indigo-700"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {asset}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  대출 기간 *
                </label>
                <select
                  name="loanTerm"
                  value={formData.loanTerm}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, loanTerm: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  required
                >
                  <option value="">선택하세요</option>
                  {loanTermOptions.map((term) => (
                    <option key={term} value={term}>
                      {term}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* 대출 조건 */}
          <section>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              대출 조건
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  LTV (%) *
                </label>
                <Input
                  type="number"
                  name="ltv"
                  value={formData.ltv}
                  onChange={handleChange}
                  min={1}
                  max={100}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  금리 (%) *
                </label>
                <Input
                  type="number"
                  name="interestRate"
                  value={formData.interestRate}
                  onChange={handleChange}
                  step={0.1}
                  min={0}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  최소 대출 금액 (원) *
                </label>
                <Input
                  type="number"
                  name="minLoanAmount"
                  value={formData.minLoanAmount}
                  onChange={handleChange}
                  min={0}
                  step={100000}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  최대 대출 금액 (원) *
                </label>
                <Input
                  type="number"
                  name="maxLoanAmount"
                  value={formData.maxLoanAmount}
                  onChange={handleChange}
                  min={0}
                  step={1000000}
                  required
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  조기 상환 수수료 *
                </label>
                <Input
                  name="earlyRepaymentFee"
                  value={formData.earlyRepaymentFee}
                  onChange={handleChange}
                  placeholder="예: 면제 또는 원금의 0.5%"
                  required
                />
              </div>

              <div className="col-span-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.additionalCollateralAllowed}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        additionalCollateralAllowed: e.target.checked,
                      }))
                    }
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700">
                    추가 담보 허용
                  </span>
                </label>
              </div>
            </div>
          </section>

          {/* 상품 특징 */}
          <section>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              상품 특징
            </h3>
            <div className="space-y-2">
              <div className="flex space-x-2">
                <Input
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  placeholder="특징을 입력하세요 (예: 24시간 신청)"
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddFeature())}
                />
                <Button
                  type="button"
                  onClick={handleAddFeature}
                  variant="outline"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {formData.features.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.features.map((feature, idx) => (
                    <Badge
                      key={idx}
                      variant="outline"
                      className="bg-indigo-50 text-indigo-700 pr-1"
                    >
                      {feature}
                      <button
                        type="button"
                        onClick={() => handleRemoveFeature(feature)}
                        className="ml-1.5 hover:text-indigo-900"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* 상품 설명 */}
          <section>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              상품 설명
            </h3>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              placeholder="상품에 대한 간단한 설명을 입력하세요"
            />
          </section>

          {/* 액션 버튼 */}
          <div className="flex space-x-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="flex-1"
            >
              취소
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700"
            >
              {loading
                ? "처리 중..."
                : isEditMode
                ? "수정 완료"
                : "등록하기"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
