"use client";

import React, { useState } from "react";
import {
  PlusIcon,
  XMarkIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import { useCompany } from "@/contexts/CompanyContext";
import { CompanyBrandingForm, DomainSettingsForm } from "@/types/company";
import { normalizeDomains } from "@/utils/emailValidation";

export default function CompanySettingsTab() {
  const { companySettings, updateCompanySettings } = useCompany();

  // 브랜딩 폼 상태
  const [brandingForm, setBrandingForm] = useState<CompanyBrandingForm>({
    companyName: companySettings?.companyName || "",
    companySubtitle: companySettings?.companySubtitle || "",
    logoText: companySettings?.logoText || "",
  });

  // 로고 이미지 상태
  const [logoPreview, setLogoPreview] = useState<string | null>(
    companySettings?.logoUrl || null
  );

  // 도메인 설정 폼 상태
  const [domainForm, setDomainForm] = useState<DomainSettingsForm>({
    allowedEmailDomains: companySettings?.allowedEmailDomains || [],
    isEmailDomainRequired: companySettings?.isEmailDomainRequired || false,
    newDomain: "",
  });

  // 저장 상태
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // 로고 파일 선택 처리
  const handleLogoFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // 파일 크기 제한 (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setSaveMessage("파일 크기는 5MB 이하여야 합니다.");
        setTimeout(() => setSaveMessage(null), 3000);
        return;
      }

      // 파일 형식 확인
      if (!file.type.startsWith('image/') && file.type !== 'image/svg+xml') {
        setSaveMessage("이미지 파일만 업로드 가능합니다.");
        setTimeout(() => setSaveMessage(null), 3000);
        return;
      }

      setBrandingForm(prev => ({ ...prev, logoFile: file }));

      // 미리보기 생성
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // 로고 제거
  const handleRemoveLogo = () => {
    setBrandingForm(prev => ({ ...prev, logoFile: undefined }));
    setLogoPreview(null);
  };

  // 회사 정보 저장
  const handleSaveBranding = async () => {
    setIsSaving(true);
    try {
      const updateData: any = {
        companyName: brandingForm.companyName,
        companySubtitle: brandingForm.companySubtitle,
        logoText: brandingForm.logoText,
      };

      // 로고 파일이 있으면 URL 생성 (실제로는 서버에 업로드)
      if (brandingForm.logoFile) {
        // 실제 구현에서는 서버에 파일을 업로드하고 URL을 받아와야 함
        updateData.logoUrl = logoPreview;
      } else if (logoPreview === null) {
        updateData.logoUrl = null;
      }

      await updateCompanySettings(updateData);
      setSaveMessage("회사 정보가 저장되었습니다.");
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      setSaveMessage("저장 중 오류가 발생했습니다.");
      setTimeout(() => setSaveMessage(null), 3000);
    }
    setIsSaving(false);
  };

  // 도메인 추가
  const handleAddDomain = () => {
    const domain = domainForm.newDomain.trim().toLowerCase();
    if (!domain) return;

    const updatedDomains = [...domainForm.allowedEmailDomains, domain];
    const normalizedDomains = normalizeDomains(updatedDomains);

    setDomainForm(prev => ({
      ...prev,
      allowedEmailDomains: normalizedDomains,
      newDomain: "",
    }));
  };

  // 도메인 제거
  const handleRemoveDomain = (domainToRemove: string) => {
    setDomainForm(prev => ({
      ...prev,
      allowedEmailDomains: prev.allowedEmailDomains.filter(d => d !== domainToRemove),
    }));
  };

  // 도메인 설정 저장
  const handleSaveDomainSettings = async () => {
    setIsSaving(true);
    try {
      await updateCompanySettings({
        allowedEmailDomains: domainForm.allowedEmailDomains,
        isEmailDomainRequired: domainForm.isEmailDomainRequired,
      });
      setSaveMessage("도메인 설정이 저장되었습니다.");
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      setSaveMessage("저장 중 오류가 발생했습니다.");
      setTimeout(() => setSaveMessage(null), 3000);
    }
    setIsSaving(false);
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">회사 설정 관리</h1>
          <p className="text-sm text-gray-600">브랜딩 정보와 이메일 도메인을 관리하세요</p>
        </div>
      </div>

      {/* 저장 메시지 */}
      {saveMessage && (
        <div className="flex items-center space-x-2 p-3 bg-sky-50 border border-sky-200 rounded-md">
          <CheckIcon className="w-5 h-5 text-sky-600" />
          <span className="text-sm text-sky-700">{saveMessage}</span>
        </div>
      )}

      {/* 회사 정보 섹션 */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900">회사 정보</h2>
        </div>

        <div className="space-y-4">
          {/* 로고 이미지 섹션 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              회사 로고
            </label>
            <div className="space-y-3">
              {/* 로고 미리보기 */}
              {logoPreview ? (
                <div className="relative inline-block">
                  <img
                    src={logoPreview}
                    alt="로고 미리보기"
                    className="w-24 h-24 object-contain border border-gray-300 rounded-md bg-gray-50"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center bg-gray-50">
                  <span className="text-gray-400 text-xs">로고</span>
                </div>
              )}

              {/* 파일 업로드 */}
              <div>
                <input
                  type="file"
                  id="logoFile"
                  accept="image/*,.svg"
                  onChange={handleLogoFileChange}
                  className="hidden"
                />
                <label
                  htmlFor="logoFile"
                  className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  {logoPreview ? "로고 변경" : "로고 업로드"}
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  PNG, JPG, GIF, SVG 파일 (최대 5MB)<br />
                  권장 사이즈: 36px × 36px 또는 비율 1:1
                </p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              회사명
            </label>
            <input
              type="text"
              value={brandingForm.companyName}
              onChange={(e) => setBrandingForm(prev => ({
                ...prev,
                companyName: e.target.value
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="회사명을 입력하세요"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              서브타이틀
            </label>
            <input
              type="text"
              value={brandingForm.companySubtitle}
              onChange={(e) => setBrandingForm(prev => ({
                ...prev,
                companySubtitle: e.target.value
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="서브타이틀을 입력하세요"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              로고 텍스트
            </label>
            <input
              type="text"
              value={brandingForm.logoText}
              onChange={(e) => setBrandingForm(prev => ({
                ...prev,
                logoText: e.target.value
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="로고 대신 표시할 텍스트"
            />
            <p className="text-xs text-gray-500 mt-1">
              로고 이미지가 없을 때 표시될 텍스트입니다.
            </p>
          </div>

          <div className="flex justify-end pt-4">
            <button
              onClick={handleSaveBranding}
              disabled={isSaving}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSaving ? "저장 중..." : "회사 정보 저장"}
            </button>
          </div>
        </div>
      </div>

      {/* 이메일 도메인 관리 섹션 */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900">이메일 도메인 관리</h2>
        </div>

        <div className="space-y-4">
          {/* 도메인 제한 설정 */}
          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={domainForm.isEmailDomainRequired}
                onChange={(e) => setDomainForm(prev => ({
                  ...prev,
                  isEmailDomainRequired: e.target.checked
                }))}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm font-medium text-gray-700">
                허용된 도메인만 사용자 등록 허용
              </span>
            </label>
            <p className="text-xs text-gray-500 ml-6 mt-1">
              체크 시 아래 등록된 도메인의 이메일만 사용자 등록이 가능합니다.
            </p>
          </div>

          {/* 새 도메인 추가 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              허용 도메인 추가
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={domainForm.newDomain}
                onChange={(e) => setDomainForm(prev => ({
                  ...prev,
                  newDomain: e.target.value
                }))}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleAddDomain();
                  }
                }}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="example.com"
              />
              <button
                onClick={handleAddDomain}
                className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
              >
                <PlusIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* 허용된 도메인 목록 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              허용된 도메인 ({domainForm.allowedEmailDomains.length}개)
            </label>
            {domainForm.allowedEmailDomains.length > 0 ? (
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {domainForm.allowedEmailDomains.map((domain, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                    <span className="text-sm text-gray-700">{domain}</span>
                    <button
                      onClick={() => handleRemoveDomain(domain)}
                      className="text-red-600 hover:text-red-800 transition-colors"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 bg-gray-50 p-3 rounded-md">
                등록된 도메인이 없습니다. 모든 도메인이 허용됩니다.
              </p>
            )}
          </div>

          <div className="flex justify-end pt-4">
            <button
              onClick={handleSaveDomainSettings}
              disabled={isSaving}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSaving ? "저장 중..." : "도메인 설정 저장"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}