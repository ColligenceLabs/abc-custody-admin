import { InformationCircleIcon } from "@heroicons/react/24/outline";
import {
  WithdrawalModalBase,
  WhitelistedAddress,
  NetworkAsset,
} from "./WithdrawalModalBase";
import { IndividualWithdrawalFormData } from "@/types/withdrawal";

interface CreateIndividualWithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (request: IndividualWithdrawalFormData) => void;
  newRequest: IndividualWithdrawalFormData;
  onRequestChange: (request: IndividualWithdrawalFormData) => void;
  networkAssets: Record<string, NetworkAsset[]>;
  whitelistedAddresses: WhitelistedAddress[];
}

export function CreateIndividualWithdrawalModal({
  isOpen,
  onClose,
  onSubmit,
  newRequest,
  onRequestChange,
  networkAssets,
  whitelistedAddresses,
}: CreateIndividualWithdrawalModalProps) {
  // 24시간 대기 안내 메시지
  const waitingNotice = (
    <div className="flex-1">
      <div className="p-4 bg-sky-50 border border-sky-200 rounded-lg">
        <div className="flex items-start">
          <InformationCircleIcon className="h-5 w-5 text-sky-600 mt-0.5 mr-2 flex-shrink-0" />
          <div className="text-sm text-sky-800">
            <p className="font-semibold mb-1">오출금 방지 안내</p>
            <p className="text-sky-700">
              출금 신청 후 24시간 대기 기간이 적용됩니다. 대기 중에는 언제든지
              출금을 취소할 수 있으며, 24시간 경과 후 자동으로 처리됩니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <WithdrawalModalBase<IndividualWithdrawalFormData>
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={onSubmit}
      formData={newRequest}
      onFormDataChange={onRequestChange}
      networkAssets={networkAssets}
      whitelistedAddresses={whitelistedAddresses}
      additionalFieldsAfterDescription={waitingNotice}
      modalTitle="새 출금 신청"
      submitButtonText="출금 신청"
    />
  );
}
