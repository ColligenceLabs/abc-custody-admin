import { useState, useRef, useEffect } from "react";
import { ExclamationTriangleIcon, DocumentIcon, XMarkIcon, PaperClipIcon } from "@heroicons/react/24/outline";
import { Modal } from "@/components/common/Modal";
import CryptoIcon from "@/components/ui/CryptoIcon";
import { WhitelistedAddress } from "@/types/address";
import { WalletGroup } from "@/types/groups";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { OrganizationUser } from "@/types/organizationUser";
import { getNetworkByCurrency } from "@/utils/networkMapping";
import { createWithdrawal, uploadWithdrawalAttachments } from "@/lib/api/withdrawal";
// 재컴파일 강제

interface NewRequest {
  title: string;
  fromAddress: string;
  toAddress: string;
  amount: number;
  network: string;
  currency: string;
  description: string;
  priority: "low" | "medium" | "high" | "critical";
  groupId?: string;
  requiredApprovals?: string[];
  attachments?: File[];
}

interface NetworkAsset {
  value: string;
  name: string;
}

interface CreateWithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (request: NewRequest) => void;
  newRequest: NewRequest;
  onRequestChange: (request: NewRequest) => void;
  networkAssets: Record<string, NetworkAsset[]>;
  whitelistedAddresses: WhitelistedAddress[];
  groups?: WalletGroup[];
  managers?: OrganizationUser[];
}

export function CreateWithdrawalModal({
  isOpen,
  onClose,
  onSubmit,
  newRequest,
  onRequestChange,
  networkAssets,
  whitelistedAddresses,
  groups = [],
  managers = []
}: CreateWithdrawalModalProps) {
  if (!isOpen) return null;

  const { toast } = useToast();
  const { user } = useAuth();

  // 파일 업로드 상태
  const [attachments, setAttachments] = useState<File[]>(newRequest.attachments || []);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 결재자 선택 상태
  const [selectedApprovers, setSelectedApprovers] = useState<string[]>(newRequest.requiredApprovals || []);
  const [isApproverDropdownOpen, setIsApproverDropdownOpen] = useState(false);
  const approverDropdownRef = useRef<HTMLDivElement>(null);

  // 제출 상태
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [budgetError, setBudgetError] = useState<string | null>(null);

  // 선택된 그룹 정보
  const selectedGroup = groups.find(g => g.id === newRequest.groupId);

  // 그룹의 남은 예산 계산 (월별 기준)
  const getAvailableBudget = () => {
    if (!selectedGroup) return null;

    const budget = selectedGroup.monthlyBudget;
    const used = selectedGroup.budgetUsed;

    if (budget.currency !== used.currency) return null;

    return {
      total: budget.amount,
      used: used.amount,
      available: budget.amount - used.amount,
      currency: budget.currency
    };
  };

  const availableBudget = getAvailableBudget();

  // 자신을 제외한 매니저 목록
  const availableManagers = managers.filter(m => m.id !== user?.id);

  // 모달이 열릴 때 상태 초기화 (재신청 시 requiredApprovals 유지)
  useEffect(() => {
    if (isOpen) {
      setAttachments([]);
      setSelectedApprovers(newRequest.requiredApprovals || []);
      setBudgetError(null);
      setUploadError(null);
      setIsSubmitting(false);
      setIsApproverDropdownOpen(false);
    }
  }, [isOpen, newRequest.requiredApprovals]);

  // 드롭다운 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (approverDropdownRef.current && !approverDropdownRef.current.contains(event.target as Node)) {
        setIsApproverDropdownOpen(false);
      }
    };

    if (isApproverDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isApproverDropdownOpen]);

  // 금액 입력 시 예산 초과 검증
  useEffect(() => {
    if (!newRequest.groupId || !selectedGroup || !newRequest.amount) {
      setBudgetError(null);
      return;
    }

    // 예산 계산
    const budget = selectedGroup.monthlyBudget;
    const used = selectedGroup.budgetUsed;

    if (budget.currency !== used.currency) {
      setBudgetError(null);
      return;
    }

    const available = budget.amount - used.amount;

    if (newRequest.amount > available) {
      setBudgetError(
        `월별 잔여 예산(${available.toLocaleString()} ${budget.currency})을 초과할 수 없습니다.`
      );
    } else {
      setBudgetError(null);
    }
  }, [newRequest.amount, newRequest.groupId, selectedGroup]);

  // 결재자 선택/해제
  const toggleApprover = (userId: string) => {
    setSelectedApprovers(prev => {
      const newApprovers = prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId];
      onRequestChange({ ...newRequest, requiredApprovals: newApprovers });
      return newApprovers;
    });
  };

  // 결재자 순서 위로 이동
  const moveApproverUp = (index: number) => {
    if (index === 0) return;
    const newApprovers = [...selectedApprovers];
    [newApprovers[index - 1], newApprovers[index]] = [newApprovers[index], newApprovers[index - 1]];
    setSelectedApprovers(newApprovers);
    onRequestChange({ ...newRequest, requiredApprovals: newApprovers });
  };

  // 결재자 순서 아래로 이동
  const moveApproverDown = (index: number) => {
    if (index === selectedApprovers.length - 1) return;
    const newApprovers = [...selectedApprovers];
    [newApprovers[index], newApprovers[index + 1]] = [newApprovers[index + 1], newApprovers[index]];
    setSelectedApprovers(newApprovers);
    onRequestChange({ ...newRequest, requiredApprovals: newApprovers });
  };

  // 결재자 제거
  const removeApprover = (userId: string) => {
    const newApprovers = selectedApprovers.filter(id => id !== userId);
    setSelectedApprovers(newApprovers);
    onRequestChange({ ...newRequest, requiredApprovals: newApprovers });
  };

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
      'image/png',
      'image/jpeg',
      'image/jpg',
    ];

    const allowedExtensions = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.hwp', '.png', '.jpg', '.jpeg'];
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('[신청 제출] handleSubmit 시작');

    // 이미 제출 중이면 중복 방지
    if (isSubmitting) {
      console.log('[신청 제출] 이미 제출 중 - 중단');
      return;
    }

    console.log('[신청 제출] 검증 시작', {
      selectedApprovers: selectedApprovers.length,
      toAddress: newRequest.toAddress,
      budgetError
    });

    // 결재자 필수 검증 (최소 1명)
    if (selectedApprovers.length === 0) {
      console.log('[신청 제출] 결재자 미선택 - 중단');
      toast({
        variant: 'destructive',
        description: '결재자를 최소 1명 이상 선택해주세요.',
      });
      return;
    }

    // 출금 주소 필수 검증
    if (!newRequest.toAddress) {
      console.log('[신청 제출] 출금 주소 미선택 - 중단');
      toast({
        variant: 'destructive',
        description: '출금 주소를 선택해주세요.',
      });
      return;
    }

    // 예산 초과 검증
    if (budgetError) {
      console.log('[신청 제출] 예산 초과 - 중단', budgetError);
      toast({
        variant: 'destructive',
        description: budgetError,
      });
      return;
    }

    console.log('[신청 제출] 검증 통과 - API 호출 시작');

    try {
      setIsSubmitting(true);
      console.log('[신청 제출] isSubmitting = true');

      // 네트워크 매핑 (테스트넷 환경)
      const networkMapping: Record<string, string> = {
        'Ethereum Network': 'Holesky',
        'Bitcoin Network': 'Bitcoin',
        'Solana Network': 'Solana',
        'Ethereum': 'Holesky',
        'Bitcoin': 'Bitcoin',
        'Solana': 'Solana'
      };
      const apiNetwork = networkMapping[newRequest.network] || newRequest.network;

      // fromAddress 설정 (그룹 또는 Custody wallet)
      let fromAddress = newRequest.fromAddress;
      if (!fromAddress) {
        fromAddress = selectedGroup
          ? `${selectedGroup.name} 그룹 지갑`
          : "Custody wallet";
      }

      // API 요청 데이터 생성
      const withdrawalData: any = {
        id: `CORP-${Date.now()}`,
        title: newRequest.title,
        fromAddress: fromAddress,
        toAddress: newRequest.toAddress,
        amount: newRequest.amount,
        currency: newRequest.currency as any,
        network: apiNetwork,
        userId: user?.id || "0",
        memberType: "corporate" as const,
        initiator: user?.name || "사용자",
        status: "withdrawal_request" as const,
        priority: newRequest.priority,
        description: newRequest.description,
        requiredApprovals: selectedApprovers,
        approvals: [],
        rejections: [],
      };

      // groupId는 값이 있을 때만 추가
      if (newRequest.groupId) {
        withdrawalData.groupId = newRequest.groupId;
      }

      console.log('[CorporateWithdrawal] API 전송 데이터:', withdrawalData);

      // 출금 신청 생성
      const createdWithdrawal = await createWithdrawal(withdrawalData);

      console.log('[CorporateWithdrawal] 출금 신청 생성 완료:', createdWithdrawal);

      // 첨부파일 업로드 (있는 경우)
      if (attachments.length > 0) {
        console.log('[CorporateWithdrawal] 첨부파일 업로드 시작:', attachments.length);
        await uploadWithdrawalAttachments(createdWithdrawal.id, attachments);
        console.log('[CorporateWithdrawal] 첨부파일 업로드 완료');
      }

      // 성공 메시지
      toast({
        description: "출금 신청이 성공적으로 접수되었습니다.",
      });

      // 부모 컴포넌트의 onSubmit 호출 (목록 갱신용)
      onSubmit({
        ...newRequest,
        requiredApprovals: selectedApprovers
      });

    } catch (err) {
      console.error('[CorporateWithdrawal] 출금 신청 실패:', err);
      toast({
        variant: "destructive",
        description: err instanceof Error ? err.message : "출금 신청에 실패했습니다.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={true}>
      <div className="bg-white rounded-xl w-full max-w-lg mx-4 max-h-[90vh] flex flex-col overflow-hidden">
        {/* 헤더 - 고정 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">
            새 출금 신청
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
        <form id="withdrawal-submit-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-4">
          {/* 그룹 선택 */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              그룹 선택 <span className="text-gray-500 text-xs font-normal">(선택사항)</span>
            </label>
            <select
              value={newRequest.groupId || ''}
              onChange={(e) => {
                const selectedGroupId = e.target.value;
                const group = groups.find(g => g.id === selectedGroupId);

                if (group && group.currency) {
                  // 그룹 선택 시 해당 그룹의 currency에 맞는 네트워크와 자산 자동 선택
                  const network = getNetworkByCurrency(group.currency);

                  onRequestChange({
                    ...newRequest,
                    groupId: selectedGroupId,
                    network: network,
                    currency: group.currency,
                  });

                  console.log('[그룹 선택]', {
                    groupName: group.name,
                    currency: group.currency,
                    autoSelectedNetwork: network,
                  });
                } else {
                  // 그룹 외 출금 선택 시 기존 선택 유지
                  onRequestChange({ ...newRequest, groupId: selectedGroupId });
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">그룹 외 출금</option>
              {groups.filter(g => g.status === 'active').map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name} ({group.currency || '자산 미설정'})
                </option>
              ))}
            </select>

            {/* 선택 안내 메시지 */}
            {!newRequest.groupId && (
              <p className="mt-2 text-xs text-gray-600">
                그룹을 선택하지 않으면 그룹 외 출금으로 처리됩니다.
              </p>
            )}

            {/* 선택된 그룹의 예산 정보 표시 */}
            {selectedGroup && availableBudget && (
              <div className="mt-3 p-3 bg-sky-50 border border-sky-200 rounded-lg">
                <div className="flex items-center justify-between text-sm">
                  <div>
                    <p className="text-sky-900 font-medium">월별 예산</p>
                    <p className="text-sky-700 text-xs mt-1">
                      사용: {availableBudget.used.toLocaleString()} {availableBudget.currency}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sky-900 font-semibold">
                      {availableBudget.available.toLocaleString()} {availableBudget.currency}
                    </p>
                    <p className="text-sky-600 text-xs mt-1">사용 가능</p>
                  </div>
                </div>

                {/* 예산 사용률 바 */}
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        (availableBudget.used / availableBudget.total) > 0.9
                          ? 'bg-red-500'
                          : (availableBudget.used / availableBudget.total) > 0.7
                          ? 'bg-yellow-500'
                          : 'bg-sky-500'
                      }`}
                      style={{
                        width: `${Math.min((availableBudget.used / availableBudget.total) * 100, 100)}%`
                      }}
                    />
                  </div>
                  <p className="text-xs text-gray-600 mt-1 text-right">
                    {((availableBudget.used / availableBudget.total) * 100).toFixed(1)}% 사용됨
                  </p>
                </div>
              </div>
            )}
          </div>

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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                disabled={!!selectedGroup}
              >
                <option value="">네트워크를 선택하세요</option>
                <option value="Bitcoin">Bitcoin Network</option>
                <option value="Ethereum">Ethereum Network</option>
                <option value="Solana">Solana Network</option>
              </select>
              {selectedGroup && (
                <p className="mt-1 text-xs text-gray-500">그룹 자산에 따라 자동 선택됨</p>
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
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                  selectedGroup ? 'bg-gray-50 cursor-not-allowed' : ''
                }`}
                disabled={!newRequest.network || !!selectedGroup}
              >
                <option value="">
                  {newRequest.network
                    ? "자산을 선택하세요"
                    : "먼저 네트워크를 선택하세요"}
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
              {selectedGroup && (
                <p className="mt-1 text-xs text-gray-500">그룹 자산에 따라 자동 선택됨</p>
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
                type="text"
                inputMode="decimal"
                required
                value={newRequest.amount === 0 ? '' : newRequest.amount}
                onFocus={(e) => {
                  if (newRequest.amount === 0) {
                    onRequestChange({
                      ...newRequest,
                      amount: '' as any,
                    });
                  }
                }}
                onChange={(e) => {
                  const value = e.target.value;
                  // 숫자와 소수점만 허용
                  if (value === '' || /^\d*\.?\d*$/.test(value)) {
                    onRequestChange({
                      ...newRequest,
                      amount: value === '' ? ('' as any) : parseFloat(value) || 0,
                    });
                  }
                }}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                  budgetError ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="0.00"
              />
              {budgetError && (
                <p className="mt-1 text-sm text-red-600">{budgetError}</p>
              )}
            </div>
          </div>

          {/* 출금 주소 */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              출금 주소 *
            </label>
            <div className="space-y-2">
              {(() => {
                const filtered = whitelistedAddresses.filter(
                  (addr) =>
                    addr.coin === newRequest.currency &&
                    addr.permissions.canWithdraw
                );
                console.log('필터링 전 주소 목록:', whitelistedAddresses);
                console.log('선택된 자산:', newRequest.currency);
                console.log('필터링 후 주소 목록:', filtered);
                return filtered;
              })()
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

              {newRequest.currency &&
                whitelistedAddresses.filter(
                  (addr) =>
                    addr.coin === newRequest.currency &&
                    addr.permissions.canWithdraw
                ).length === 0 && (
                  <div className="p-4 border border-dashed border-gray-300 rounded-lg text-center">
                    <p className="text-gray-500 text-sm">
                      {newRequest.currency} 자산에 대한 등록된 출금 주소가 없습니다.
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

          {/* 상세 설명 */}
          <div>
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

          {/* 결재자 지정 */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              결재자 지정 <span className="text-red-600">*</span>
            </label>

            {/* 드롭다운 버튼 */}
            <div className="relative" ref={approverDropdownRef}>
              <button
                type="button"
                onClick={() => setIsApproverDropdownOpen(!isApproverDropdownOpen)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-left flex items-center justify-between hover:border-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <span className={selectedApprovers.length === 0 ? 'text-gray-500' : 'text-gray-900'}>
                  {selectedApprovers.length === 0
                    ? '결재자를 선택하세요'
                    : `${selectedApprovers.length}명 선택됨`}
                </span>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* 드롭다운 메뉴 */}
              {isApproverDropdownOpen && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {availableManagers.length === 0 ? (
                    <div className="px-3 py-4 text-sm text-gray-500 text-center">
                      선택 가능한 결재자가 없습니다
                    </div>
                  ) : (
                    availableManagers.map(manager => (
                      <label
                        key={manager.id}
                        className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                      >
                        <input
                          type="checkbox"
                          checked={selectedApprovers.includes(manager.id)}
                          onChange={() => toggleApprover(manager.id)}
                          className="mr-3 h-4 w-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                        />
                        <span className="text-sm text-gray-900">
                          {manager.name} - {manager.department} ({manager.position})
                        </span>
                      </label>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* 순차 결재 순서 영역 */}
            {selectedApprovers.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">순차 결재 순서:</p>
                <div className="space-y-2">
                  {selectedApprovers.map((approverId, index) => {
                    const approver = availableManagers.find(m => m.id === approverId);
                    if (!approver) return null;

                    return (
                      <div
                        key={approverId}
                        className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg"
                      >
                        {/* 순서 번호 및 결재자 정보 */}
                        <div className="flex items-center space-x-3">
                          <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-primary-100 text-primary-700 rounded-full text-sm font-semibold">
                            {index + 1}
                          </span>
                          <span className="text-sm text-gray-900">
                            {approver.name} - {approver.department}
                          </span>
                        </div>

                        {/* 제어 버튼 */}
                        <div className="flex items-center space-x-1">
                          {/* 위로 이동 */}
                          <button
                            type="button"
                            onClick={() => moveApproverUp(index)}
                            disabled={index === 0}
                            className={`p-1 rounded transition-colors ${
                              index === 0
                                ? 'opacity-30 cursor-not-allowed'
                                : 'hover:bg-gray-200'
                            }`}
                            title="위로 이동"
                          >
                            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                            </svg>
                          </button>

                          {/* 아래로 이동 */}
                          <button
                            type="button"
                            onClick={() => moveApproverDown(index)}
                            disabled={index === selectedApprovers.length - 1}
                            className={`p-1 rounded transition-colors ${
                              index === selectedApprovers.length - 1
                                ? 'opacity-30 cursor-not-allowed'
                                : 'hover:bg-gray-200'
                            }`}
                            title="아래로 이동"
                          >
                            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>

                          {/* 제거 */}
                          <button
                            type="button"
                            onClick={() => removeApprover(approverId)}
                            className="p-1 rounded hover:bg-red-100 transition-colors"
                            title="제거"
                          >
                            <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* 파일 첨부 */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              첨부 파일 <span className="text-gray-500 text-xs font-normal">(선택사항)</span>
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
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.hwp,.png,.jpg,.jpeg"
                onChange={handleFileSelect}
                className="hidden"
              />
              <PaperClipIcon className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-600 font-medium mb-1">
                파일을 드래그하거나 클릭하여 업로드
              </p>
              <p className="text-xs text-gray-500">
                지원 형식: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, HWP, PNG, JPG, JPEG
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
            type="submit"
            form="withdrawal-submit-form"
            onClick={() => {
              console.log('[버튼 클릭] 신청 제출 버튼 클릭됨');
            }}
            disabled={isSubmitting || !!budgetError}
            className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
              isSubmitting || budgetError
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-primary-600 hover:bg-primary-700'
            } text-white`}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                처리 중...
              </span>
            ) : (
              '신청 제출'
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}