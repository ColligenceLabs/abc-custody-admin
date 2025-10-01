import { useState, useRef } from "react";
import { ExclamationTriangleIcon, DocumentIcon, XMarkIcon, PaperClipIcon } from "@heroicons/react/24/outline";
import { Modal } from "@/components/common/Modal";
import CryptoIcon from "@/components/ui/CryptoIcon";

interface NewRequest {
  title: string;
  fromAddress: string;
  toAddress: string;
  amount: number;
  network: string;
  currency: string;
  groupId: string;
  description: string;
  priority: "low" | "medium" | "high" | "critical";
  attachments?: File[];
}

interface WhitelistedAddress {
  id: string;
  label: string;
  address: string;
  network: string;
  coin: string;
  type: "personal" | "exchange" | "vasp";
}

interface NetworkAsset {
  value: string;
  name: string;
}

interface WalletGroup {
  id: string;
  name: string;
  type: string;
  description: string;
  balance: { amount: number; currency: string };
  monthlyBudget: { amount: number; currency: string };
  quarterlyBudget: { amount: number; currency: string };
  yearlyBudget: { amount: number; currency: string };
  budgetUsed: { amount: number; currency: string };
}

interface CreateGroupWithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (request: NewRequest) => void;
  newRequest: NewRequest;
  onRequestChange: (request: NewRequest) => void;
  networkAssets: Record<string, NetworkAsset[]>;
  whitelistedAddresses: WhitelistedAddress[];
  groups: WalletGroup[];
}

export function CreateGroupWithdrawalModal({
  isOpen,
  onClose,
  onSubmit,
  newRequest,
  onRequestChange,
  networkAssets,
  whitelistedAddresses,
  groups
}: CreateGroupWithdrawalModalProps) {
  if (!isOpen) return null;

  // 파일 업로드 상태
  const [attachments, setAttachments] = useState<File[]>(newRequest.attachments || []);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(newRequest);
  };

  // currency에서 network를 매핑하는 헬퍼 함수
  const getCurrencyNetwork = (currency: string): string => {
    switch (currency) {
      case "BTC":
        return "Bitcoin";
      case "ETH":
      case "USDT":
      case "USDC":
        return "Ethereum";
      case "SOL":
        return "Solana";
      default:
        return "";
    }
  };

  // 선택된 그룹 정보 가져오기
  const selectedGroup = groups.find(group => group.id === newRequest.groupId);

  // 파일 검증
  const validateFile = (file: File): { valid: boolean; error?: string } => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/x-hwp',
    ];

    const allowedExtensions = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.hwp'];
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();

    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
      return { valid: false, error: `${file.name}: 지원하지 않는 파일 형식입니다.` };
    }

    if (file.size > maxSize) {
      return { valid: false, error: `${file.name}: 파일 크기는 10MB를 초과할 수 없습니다.` };
    }

    return { valid: true };
  };

  // 파일 추가
  const handleFileAdd = (files: FileList | File[]) => {
    const fileArray = Array.from(files);

    if (attachments.length + fileArray.length > 5) {
      setUploadError('최대 5개까지 첨부할 수 있습니다.');
      setTimeout(() => setUploadError(null), 3000);
      return;
    }

    const validFiles: File[] = [];
    for (const file of fileArray) {
      const validation = validateFile(file);
      if (validation.valid) {
        validFiles.push(file);
      } else {
        setUploadError(validation.error || '파일 업로드 중 오류가 발생했습니다.');
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
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  };

  return (
    <Modal isOpen={true}>
      <div className="bg-white rounded-xl w-full max-w-lg mx-4 max-h-[90vh] flex flex-col overflow-hidden">
        {/* 헤더 - 고정 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">
            그룹 지출 신청
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg
              className="h-6 w-6 text-blue-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* 콘텐츠 - 스크롤 */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-4">
          {/* 그룹 선택 */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              출금 그룹 *
            </label>
            <select
              required
              value={newRequest.groupId}
              onChange={(e) => {
                const selectedGroupId = e.target.value;
                const group = groups.find(g => g.id === selectedGroupId);
                const currency = group?.balance.currency || "";
                const network = getCurrencyNetwork(currency);

                onRequestChange({
                  ...newRequest,
                  groupId: selectedGroupId,
                  network: network,
                  currency: currency,
                  toAddress: "" // 주소는 초기화
                });
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">그룹을 선택하세요</option>
              {groups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name} - {group.balance.amount.toLocaleString()} {group.balance.currency}
                </option>
              ))}
            </select>
          </div>

          {/* 선택된 그룹 정보 표시 */}
          {selectedGroup && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">{selectedGroup.name}</h4>
                  <p className="text-sm text-gray-600">{selectedGroup.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    잔액: {selectedGroup.balance.amount.toLocaleString()} {selectedGroup.balance.currency}
                  </div>
                  {selectedGroup.monthlyBudget.amount > 0 && (
                    <div className="text-xs text-gray-500">
                      월예산: {selectedGroup.monthlyBudget.amount.toLocaleString()} {selectedGroup.monthlyBudget.currency}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 출금 제목 */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              출금 제목 *
            </label>
            <input
              type="text"
              required
              value={newRequest.title}
              onChange={(e) =>
                onRequestChange({ ...newRequest, title: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="출금 목적을 간략히 입력하세요"
            />
          </div>

          {/* 네트워크 및 자산 선택 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                출금 네트워크 *
              </label>
              <select
                value={newRequest.network}
                onChange={(e) =>
                  onRequestChange({
                    ...newRequest,
                    network: e.target.value,
                    currency: "",
                    toAddress: "",
                  })
                }
                disabled={!!newRequest.groupId}
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                  newRequest.groupId ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
              >
                <option value="">
                  {newRequest.groupId ? newRequest.network || "자동 선택됨" : "네트워크를 선택하세요"}
                </option>
                <option value="Bitcoin">Bitcoin Network</option>
                <option value="Ethereum">Ethereum Network</option>
                <option value="Solana">Solana Network</option>
              </select>
              {newRequest.groupId && (
                <p className="text-xs text-gray-500 mt-1">
                  선택한 그룹의 자산에 따라 자동 설정됩니다
                </p>
              )}
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                출금 자산 *
              </label>
              <select
                value={newRequest.currency}
                onChange={(e) =>
                  onRequestChange({
                    ...newRequest,
                    currency: e.target.value,
                    toAddress: "",
                  })
                }
                disabled={!!newRequest.groupId}
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                  newRequest.groupId ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
              >
                <option value="">
                  {newRequest.groupId ? newRequest.currency || "자동 선택됨" : "자산을 선택하세요"}
                </option>
                {newRequest.network &&
                  networkAssets[
                    newRequest.network as keyof typeof networkAssets
                  ]?.map((asset) => (
                    <option key={asset.value} value={asset.value}>
                      {asset.name}
                    </option>
                  ))}
              </select>
              {newRequest.groupId && (
                <p className="text-xs text-gray-500 mt-1">
                  선택한 그룹의 자산에 따라 자동 설정됩니다
                </p>
              )}
            </div>
          </div>

          {/* 출금 금액 */}
          <div className="grid grid-cols-1 gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                출금 금액 *
              </label>
              <input
                type="number"
                step="0.00000001"
                required
                value={newRequest.amount}
                onChange={(e) =>
                  onRequestChange({
                    ...newRequest,
                    amount: Number(e.target.value),
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* 출금 주소 */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              출금 주소 *
            </label>
            <div className="space-y-2">
              {whitelistedAddresses
                .filter(
                  (addr) =>
                    addr.network === newRequest.network &&
                    addr.coin === newRequest.currency
                )
                .map((address) => (
                  <div
                    key={address.id}
                    onClick={() =>
                      onRequestChange({
                        ...newRequest,
                        toAddress: address.address,
                      })
                    }
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      newRequest.toAddress === address.address
                        ? "border-primary-500 bg-primary-50"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <CryptoIcon
                          symbol={address.coin}
                          size={20}
                          className="mr-2 flex-shrink-0"
                        />
                        <div>
                          <div className="font-medium text-gray-900 text-sm">
                            {address.label}
                          </div>
                          <div className="text-xs font-mono text-gray-500">
                            {address.address.length > 30
                              ? `${address.address.slice(
                                  0,
                                  15
                                )}...${address.address.slice(-15)}`
                              : address.address}
                          </div>
                        </div>
                      </div>
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          address.type === "personal"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-orange-100 text-orange-800"
                        }`}
                      >
                        {address.type === "personal" ? "개인지갑" : "VASP"}
                      </span>
                    </div>
                  </div>
                ))}

              {newRequest.network &&
                newRequest.currency &&
                whitelistedAddresses.filter(
                  (addr) =>
                    addr.network === newRequest.network &&
                    addr.coin === newRequest.currency
                ).length === 0 && (
                  <div className="p-4 border border-dashed border-gray-300 rounded-lg text-center">
                    <p className="text-gray-500 text-sm">
                      {newRequest.network} 네트워크의 {newRequest.currency}{" "}
                      자산에 대한 등록된 출금 주소가 없습니다.
                    </p>
                    <p className="text-gray-400 text-xs mt-1">
                      보안 설정에서 출금 주소를 먼저 등록해주세요.
                    </p>
                  </div>
                )}

              {(!newRequest.network || !newRequest.currency) && (
                <div className="p-4 border border-dashed border-gray-300 rounded-lg text-center">
                  <p className="text-gray-500 text-sm">
                    네트워크와 자산을 먼저 선택해주세요.
                  </p>
                </div>
              )}
            </div>
          </div>

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

          {/* 상세 설명 */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              상세 설명 *
            </label>
            <textarea
              required
              value={newRequest.description}
              onChange={(e) =>
                onRequestChange({
                  ...newRequest,
                  description: e.target.value,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="출금 목적과 상세 내용을 입력하세요"
              rows={3}
            />
          </div>

          {/* 파일 첨부 */}
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
                  ? 'border-primary-500 bg-primary-50'
                  : uploadError
                  ? 'border-red-300 bg-red-50'
                  : 'border-gray-300 hover:border-gray-400'
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
          </div>
        </form>

        {/* 하단 버튼 - 고정 */}
        <div className="flex space-x-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors bg-white"
          >
            취소
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              const form = e.currentTarget.closest('.flex.flex-col')?.querySelector('form') as HTMLFormElement;
              if (form) {
                form.requestSubmit();
              }
            }}
            className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            신청 제출
          </button>
        </div>
      </div>
    </Modal>
  );
}