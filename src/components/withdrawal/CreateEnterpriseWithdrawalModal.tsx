import { useState, useRef } from "react";
import {
  DocumentIcon,
  XMarkIcon,
  PaperClipIcon,
} from "@heroicons/react/24/outline";
import {
  WithdrawalModalBase,
  NetworkAsset,
} from "./WithdrawalModalBase";
import { WhitelistedAddress } from "@/types/address";
import { EnterpriseWithdrawalFormData } from "@/types/withdrawal";

interface CreateEnterpriseWithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (request: EnterpriseWithdrawalFormData) => void;
  newRequest: EnterpriseWithdrawalFormData;
  onRequestChange: (request: EnterpriseWithdrawalFormData) => void;
  networkAssets: Record<string, NetworkAsset[]>;
  whitelistedAddresses: WhitelistedAddress[];
}

export function CreateEnterpriseWithdrawalModal({
  isOpen,
  onClose,
  onSubmit,
  newRequest,
  onRequestChange,
  networkAssets,
  whitelistedAddresses,
}: CreateEnterpriseWithdrawalModalProps) {
  // 파일 업로드 상태
  const [attachments, setAttachments] = useState<File[]>(
    newRequest.attachments || []
  );
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 파일 검증
  const validateFile = (file: File): { valid: boolean; error?: string } => {
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "application/x-hwp",
    ];

    const allowedExtensions = [
      ".pdf",
      ".doc",
      ".docx",
      ".xls",
      ".xlsx",
      ".ppt",
      ".pptx",
      ".hwp",
    ];
    const fileExtension = "." + file.name.split(".").pop()?.toLowerCase();

    const maxSize = 10 * 1024 * 1024; // 10MB

    if (
      !allowedTypes.includes(file.type) &&
      !allowedExtensions.includes(fileExtension)
    ) {
      return {
        valid: false,
        error: `${file.name}: 지원하지 않는 파일 형식입니다.`,
      };
    }

    if (file.size > maxSize) {
      return {
        valid: false,
        error: `${file.name}: 파일 크기는 10MB를 초과할 수 없습니다.`,
      };
    }

    return { valid: true };
  };

  // 파일 추가
  const handleFileAdd = (files: FileList | File[]) => {
    const fileArray = Array.from(files);

    if (attachments.length + fileArray.length > 5) {
      setUploadError("최대 5개까지 첨부할 수 있습니다.");
      setTimeout(() => setUploadError(null), 3000);
      return;
    }

    const validFiles: File[] = [];
    for (const file of fileArray) {
      const validation = validateFile(file);
      if (validation.valid) {
        validFiles.push(file);
      } else {
        setUploadError(
          validation.error || "파일 업로드 중 오류가 발생했습니다."
        );
        setTimeout(() => setUploadError(null), 3000);
        return;
      }
    }

    const newAttachments = [...attachments, ...validFiles];
    setAttachments(newAttachments);
    onRequestChange({ ...newRequest, attachments: newAttachments });
    setUploadError(null);
  };

  // 파일 삭제
  const handleFileRemove = (index: number) => {
    const newAttachments = attachments.filter((_, i) => i !== index);
    setAttachments(newAttachments);
    onRequestChange({ ...newRequest, attachments: newAttachments });
  };

  // 드래그 앤 드롭 핸들러
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileAdd(e.dataTransfer.files);
  };

  // 파일 선택
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFileAdd(e.target.files);
    }
  };

  // 파일 크기 포맷
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  };

  // 추가 필드 (우선순위 + 첨부파일)
  const additionalFields = (
    <>
      {/* 우선순위 */}
      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          우선순위 *
        </label>
        <select
          value={newRequest.priority}
          onChange={(e) =>
            onRequestChange({
              ...newRequest,
              priority: e.target.value as any,
            })
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        >
          <option value="low">낮음 - 일반 출금</option>
          <option value="medium">보통 - 정기 업무</option>
          <option value="high">높음 - 중요 거래</option>
          <option value="critical">긴급 - 즉시 처리</option>
        </select>
      </div>
    </>
  );

  // 첨부파일 필드 (설명 뒤에 위치)
  const attachmentFields = (
    <div className="flex-1">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        첨부 파일 (선택)
      </label>

      {/* 파일 업로드 영역 */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragging
            ? "border-primary-500 bg-primary-50"
            : uploadError
            ? "border-red-300 bg-red-50"
            : "border-gray-300 hover:border-gray-400"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.hwp"
          onChange={handleFileSelect}
          className="hidden"
        />
        <PaperClipIcon className="h-8 w-8 mx-auto mb-2 text-gray-400" />
        <p className="text-sm text-gray-600 font-medium mb-1">
          파일을 드래그하거나 클릭하여 업로드
        </p>
        <p className="text-xs text-gray-500">
          지원 형식: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, HWP
        </p>
        <p className="text-xs text-gray-500">
          최대 크기: 10MB / 최대 개수: 5개
        </p>
      </div>

      {/* 에러 메시지 */}
      {uploadError && (
        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-xs text-red-600">{uploadError}</p>
        </div>
      )}

      {/* 첨부 파일 목록 */}
      {attachments.length > 0 && (
        <div className="mt-3 space-y-2">
          {attachments.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center flex-1 min-w-0">
                <DocumentIcon className="h-5 w-5 text-gray-400 flex-shrink-0 mr-2" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(file.size)}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleFileRemove(index)}
                className="ml-3 p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <WithdrawalModalBase<EnterpriseWithdrawalFormData>
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={onSubmit}
      formData={newRequest}
      onFormDataChange={onRequestChange}
      networkAssets={networkAssets}
      whitelistedAddresses={whitelistedAddresses}
      additionalFieldsBeforeDescription={additionalFields}
      additionalFieldsAfterDescription={attachmentFields}
      modalTitle="새 출금 신청"
      submitButtonText="신청 제출"
    />
  );
}
