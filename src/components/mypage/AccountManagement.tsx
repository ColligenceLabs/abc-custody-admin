"use client";

import { useState } from "react";
import {
  BuildingLibraryIcon,
  PlusIcon,
  TrashIcon,
  XMarkIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import { Modal } from "@/components/common/Modal";
import { ServicePlan } from "@/app/page";
import OneWonVerification from "./OneWonVerification";
import { BANK_OPTIONS, mockConnectedAccounts, ConnectedAccount } from "@/data/mockAccounts";

interface AccountManagementProps {
  plan: ServicePlan;
}

export default function AccountManagement({ plan }: AccountManagementProps) {
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showOneWonVerification, setShowOneWonVerification] = useState(false);
  const [pendingAccount, setPendingAccount] = useState<Omit<ConnectedAccount, 'id' | 'status' | 'connectedAt' | 'isVerified'> | null>(null);
  const [connectedAccounts, setConnectedAccounts] = useState<ConnectedAccount[]>(mockConnectedAccounts);

  const [newAccount, setNewAccount] = useState({
    bankName: "",
    bankCode: "",
    accountNumber: "",
    accountHolder: "",
    accountType: "입출금통장",
    dailyLimit: 5000000,
    monthlyLimit: 50000000
  });

  const handleAddAccount = () => {
    if (newAccount.bankCode && newAccount.accountNumber && newAccount.accountHolder) {
      // 먼저 pending 계정 정보를 저장
      setPendingAccount({
        bankName: newAccount.bankName,
        bankCode: newAccount.bankCode,
        accountNumber: newAccount.accountNumber,
        accountHolder: newAccount.accountHolder,
        accountType: newAccount.accountType,
        dailyLimit: newAccount.dailyLimit,
        monthlyLimit: newAccount.monthlyLimit
      });

      // 모달 닫고 1원 인증 시작
      setShowAccountModal(false);
      setShowOneWonVerification(true);
    }
  };

  const handleVerificationComplete = (isSuccess: boolean) => {
    setShowOneWonVerification(false);

    if (isSuccess && pendingAccount) {
      // 기존 pending 계좌가 있는지 확인
      const existingAccountIndex = connectedAccounts.findIndex(
        acc => acc.accountNumber === pendingAccount.accountNumber &&
               acc.bankCode === pendingAccount.bankCode
      );

      if (existingAccountIndex >= 0) {
        // 기존 pending 계좌 업데이트
        const updatedAccounts = [...connectedAccounts];
        updatedAccounts[existingAccountIndex] = {
          ...updatedAccounts[existingAccountIndex],
          status: 'connected',
          isVerified: true
        };
        setConnectedAccounts(updatedAccounts);
      } else {
        // 새 계좌 추가
        const account: ConnectedAccount = {
          id: Date.now().toString(),
          ...pendingAccount,
          status: 'connected',
          connectedAt: new Date().toISOString(),
          isVerified: true
        };
        setConnectedAccounts([...connectedAccounts, account]);
      }

      // 폼 초기화
      setNewAccount({
        bankName: "",
        bankCode: "",
        accountNumber: "",
        accountHolder: "",
        accountType: "입출금통장",
        dailyLimit: 5000000,
        monthlyLimit: 50000000
      });
      setPendingAccount(null);
    } else {
      // 인증 실패 시 원래 모달로 돌아가기 (새 계좌 추가인 경우만)
      const existingAccount = connectedAccounts.find(
        acc => acc.accountNumber === pendingAccount?.accountNumber &&
               acc.bankCode === pendingAccount?.bankCode
      );

      if (!existingAccount) {
        setShowAccountModal(true);
      }
      setPendingAccount(null);
    }
  };

  const handleVerificationCancel = () => {
    setShowOneWonVerification(false);
    setShowAccountModal(true);
    setPendingAccount(null);
  };

  const handleRetryVerification = (account: ConnectedAccount) => {
    setPendingAccount({
      bankName: account.bankName,
      bankCode: account.bankCode,
      accountNumber: account.accountNumber,
      accountHolder: account.accountHolder,
      accountType: account.accountType,
      dailyLimit: account.dailyLimit,
      monthlyLimit: account.monthlyLimit
    });
    setShowOneWonVerification(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ko-KR");
  };

  const getStatusIcon = (status: ConnectedAccount['status']) => {
    switch (status) {
      case 'connected':
        return <CheckCircleIcon className="h-5 w-5 text-sky-600" />;
      case 'pending':
        return <ClockIcon className="h-5 w-5 text-yellow-600" />;
      case 'expired':
      case 'error':
        return <ExclamationCircleIcon className="h-5 w-5 text-red-600" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusText = (status: ConnectedAccount['status']) => {
    switch (status) {
      case 'connected':
        return '연결됨';
      case 'pending':
        return '인증 대기';
      case 'expired':
        return '재인증 필요';
      case 'error':
        return '오류';
      default:
        return '알 수 없음';
    }
  };

  const getStatusColor = (status: ConnectedAccount['status']) => {
    switch (status) {
      case 'connected':
        return 'bg-sky-100 text-sky-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'expired':
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (plan === 'free') {
    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="text-center py-12">
            <BuildingLibraryIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              계좌 연동 기능
            </h3>
            <p className="text-gray-600 mb-4">
              원화 교환 서비스를 이용하기 위해서는 계좌 연동이 필요합니다.
            </p>
            <p className="text-sm text-amber-600 bg-amber-50 px-4 py-2 rounded-lg inline-block">
              스탠다드 이상 플랜에서 이용 가능합니다.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 연결된 은행 계좌 섹션 */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <BuildingLibraryIcon className="h-6 w-6 mr-2 text-primary-600" />
              연결된 은행 계좌
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              원화 교환 서비스를 위한 은행 계좌 연동 관리
            </p>
          </div>
          <button
            onClick={() => setShowAccountModal(true)}
            className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            계좌 연결
          </button>
        </div>

        {connectedAccounts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    은행/계좌
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    상태
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    잔액
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    한도
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    연결일
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    작업
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {connectedAccounts.map((account) => (
                  <tr key={account.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {account.bankName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {account.accountNumber} ({account.accountHolder})
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {getStatusIcon(account.status)}
                        <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(account.status)}`}>
                          {getStatusText(account.status)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {account.balance !== undefined ?
                        `₩${account.balance.toLocaleString()}` :
                        <span className="text-gray-400">-</span>
                      }
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div>
                        <div>일 ₩{account.dailyLimit.toLocaleString()}</div>
                        <div className="text-xs text-gray-500">월 ₩{account.monthlyLimit.toLocaleString()}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {formatDate(account.connectedAt)}
                      {account.lastUsed && (
                        <div className="text-xs text-gray-500">
                          최근: {formatDate(account.lastUsed)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        {account.status === 'pending' && (
                          <button
                            onClick={() => handleRetryVerification(account)}
                            className="text-primary-600 hover:text-primary-900 transition-colors text-sm px-2 py-1 border border-primary-300 rounded hover:bg-primary-50"
                            title="1원 인증하기"
                          >
                            인증하기
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setConnectedAccounts(connectedAccounts.filter(acc => acc.id !== account.id));
                          }}
                          className="text-red-600 hover:text-red-900 transition-colors"
                          title="연결 해제"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <BuildingLibraryIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">연결된 은행 계좌가 없습니다.</p>
            <p className="text-sm text-gray-400">
              원화 교환을 위해 은행 계좌를 연결해 주세요.
            </p>
          </div>
        )}

        {/* 안내사항 */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <InformationCircleIcon className="h-5 w-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-800 mb-1">오픈뱅킹 연결 안내</p>
              <ul className="text-blue-700 space-y-1 list-disc list-inside">
                <li>본인 명의 계좌만 연결 가능합니다.</li>
                <li>연결 시 1원 입금을 통한 계좌 인증이 진행됩니다.</li>
                <li>연결된 계좌는 원화 입출금에만 사용됩니다.</li>
                <li>보안을 위해 주기적인 재인증이 필요할 수 있습니다.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* 계좌 연결 모달 */}
      <Modal isOpen={showAccountModal}>
        <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">계좌 연결</h3>
              <button
                onClick={() => setShowAccountModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAddAccount();
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  은행 선택 *
                </label>
                <select
                  required
                  value={newAccount.bankCode}
                  onChange={(e) => {
                    const selectedBank = BANK_OPTIONS.find(bank => bank.code === e.target.value);
                    setNewAccount({
                      ...newAccount,
                      bankCode: e.target.value,
                      bankName: selectedBank?.name || ""
                    });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">은행을 선택하세요</option>
                  {BANK_OPTIONS.map((bank) => (
                    <option key={bank.code} value={bank.code}>
                      {bank.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  계좌번호 *
                </label>
                <input
                  type="text"
                  required
                  value={newAccount.accountNumber}
                  onChange={(e) =>
                    setNewAccount({ ...newAccount, accountNumber: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="'-' 없이 숫자만 입력"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  예금주 *
                </label>
                <input
                  type="text"
                  required
                  value={newAccount.accountHolder}
                  onChange={(e) =>
                    setNewAccount({ ...newAccount, accountHolder: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="계좌의 예금주명을 입력하세요"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    일간 한도 (원)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newAccount.dailyLimit}
                    onChange={(e) =>
                      setNewAccount({
                        ...newAccount,
                        dailyLimit: parseInt(e.target.value) || 0
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    월간 한도 (원)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newAccount.monthlyLimit}
                    onChange={(e) =>
                      setNewAccount({
                        ...newAccount,
                        monthlyLimit: parseInt(e.target.value) || 0
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAccountModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  연결하기
                </button>
              </div>
            </form>
        </div>
      </Modal>

      {/* 1원 인증 모달 */}
      {showOneWonVerification && pendingAccount && (
        <OneWonVerification
          bankName={pendingAccount.bankName}
          accountNumber={pendingAccount.accountNumber}
          accountHolder={pendingAccount.accountHolder}
          onComplete={handleVerificationComplete}
          onCancel={handleVerificationCancel}
        />
      )}
    </div>
  );
}