"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { PlusIcon } from "@heroicons/react/24/outline";
import { WhitelistedAddress, AddressFormData } from "@/types/address";
import AddressModal from "./address/AddressModal";
import AddressTable from "./address/AddressTable";
import PaginationNav from "./address/PaginationNav";
import SearchInput from "./address/SearchInput";
import { useAuth } from "@/contexts/AuthContext";
import {
  validateBlockchainAddress,
  checkDuplicateAddress,
  createPersonalWalletDefaults,
  resetDailyUsageIfNeeded,
  getVASPById,
  getDailyLimitStatus
} from "@/utils/addressHelpers";
import {
  getAddresses,
  createAddress,
  deleteAddress
} from "@/utils/addressApi";

interface AddressManagementProps {
  initialTab?: "personal" | "vasp";
}

export default function AddressManagement({ initialTab }: AddressManagementProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuth();

  const [addresses, setAddresses] = useState<WhitelistedAddress[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"personal" | "vasp" | undefined>();
  const [searchTerm, setSearchTerm] = useState("");
  const [permissionFilter, setPermissionFilter] = useState<"all" | "deposit" | "withdrawal" | "both">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "normal" | "warning" | "danger">("all");
  const [activeTab, setActiveTab] = useState<"personal" | "vasp">(initialTab || "personal");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);


  // 페이징 상태 (각 탭별로 독립적)
  const [currentPage, setCurrentPage] = useState({
    personal: 1,
    vasp: 1
  });
  const [itemsPerPage] = useState(10);

  // 검색어나 필터 변경시 페이지를 1로 리셋
  useEffect(() => {
    setCurrentPage(prev => ({
      ...prev,
      [activeTab]: 1
    }));
  }, [searchTerm, permissionFilter, statusFilter, activeTab]);


  // initialTab이 변경되면 activeTab 업데이트
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // 주소 목록 로드 (API)
  useEffect(() => {
    const loadAddresses = async () => {
      // 로그인하지 않은 경우 로딩 종료
      if (!isAuthenticated || !user) {
        setIsLoading(false);
        setAddresses([]);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // userId로 주소 목록 조회
        const data = await getAddresses(user.id);

        // 일일 사용량 리셋이 필요한 주소 처리
        const updatedAddresses = data.map(resetDailyUsageIfNeeded);
        setAddresses(updatedAddresses);
      } catch (err) {
        console.error("주소 목록 로드 실패:", err);
        setError("주소 목록을 불러오는 중 오류가 발생했습니다.");
        setAddresses([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadAddresses();
  }, [user, isAuthenticated]);

  const handleAddAddress = async (formData: AddressFormData) => {
    // 로그인 체크
    if (!user) {
      alert("로그인이 필요합니다.");
      return;
    }

    // 타입 검증
    if (!formData.type) {
      alert("주소 타입을 선택해주세요.");
      return;
    }

    // 이미 제출 중이면 중복 방지
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      // 주소 유효성 검증
      if (!validateBlockchainAddress(formData.address, formData.coin)) {
        alert(`유효하지 않은 ${formData.coin} 주소입니다.`);
        setIsSubmitting(false);
        return;
      }

      // 중복 주소 체크
      if (checkDuplicateAddress(formData.address, addresses)) {
        alert("이미 등록된 주소입니다.");
        setIsSubmitting(false);
        return;
      }

      const newAddressData = {
        userId: user.id,
        label: formData.label,
        address: formData.address,
        coin: formData.coin,
        type: formData.type as "personal" | "vasp",
        permissions: formData.permissions,
        ...(formData.type === "personal" && createPersonalWalletDefaults()),
        ...(formData.type === "vasp" && formData.selectedVaspId ? (() => {
          const selectedVasp = getVASPById(formData.selectedVaspId);
          return selectedVasp ? {
            vaspInfo: {
              businessName: selectedVasp.businessName,
              travelRuleConnected: selectedVasp.travelRuleConnected,
              registrationNumber: selectedVasp.registrationNumber,
              countryCode: selectedVasp.countryCode,
              complianceScore: 5 // 등록된 VASP는 최고 점수
            }
          } : {};
        })() : {})
      };

      // API로 주소 추가
      const createdAddress = await createAddress(newAddressData);

      // 로컬 상태 업데이트
      setAddresses(prev => [...prev, createdAddress]);
      setIsModalOpen(false);
      setIsSubmitting(false);
      alert("주소가 성공적으로 추가되었습니다.");
    } catch (error) {
      console.error("주소 추가 실패:", error);
      setIsSubmitting(false);

      // 에러 타입에 따른 메시지
      const errorMessage = error instanceof Error
        ? error.message
        : "주소 추가 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
      alert(errorMessage);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (confirm("정말로 이 주소를 삭제하시겠습니까?")) {
      try {
        // API로 주소 삭제
        await deleteAddress(id);

        // 로컬 상태 업데이트 (낙관적 UI 업데이트)
        setAddresses(prev => prev.filter(addr => addr.id !== id));
        alert("주소가 성공적으로 삭제되었습니다.");
      } catch (error) {
        console.error("주소 삭제 실패:", error);
        alert("주소 삭제 중 오류가 발생했습니다.");
      }
    }
  };

  const openPersonalModal = () => {
    setModalType("personal");
    setIsModalOpen(true);
  };

  const openVaspModal = () => {
    setModalType("vasp");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalType(undefined);
  };


  // 필터링된 주소 목록
  const getFilteredAddresses = (type?: "personal" | "vasp") => {
    return addresses.filter(addr => {
      const matchesType = type ? addr.type === type : true;
      const matchesSearch = searchTerm === "" ||
        addr.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        addr.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        addr.coin.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesPermission = (() => {
        switch (permissionFilter) {
          case "deposit":
            return addr.permissions.canDeposit;
          case "withdrawal":
            return addr.permissions.canWithdraw;
          case "both":
            return addr.permissions.canDeposit && addr.permissions.canWithdraw;
          default:
            return true;
        }
      })();

      return matchesType && matchesSearch && matchesPermission;
    });
  };


  // 페이징된 데이터 가져오기
  const getPaginatedData = (data: WhitelistedAddress[], tabKey: "personal" | "vasp") => {
    const startIndex = (currentPage[tabKey] - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return {
      items: data.slice(startIndex, endIndex),
      totalItems: data.length,
      totalPages: Math.ceil(data.length / itemsPerPage),
      currentPage: currentPage[tabKey],
      itemsPerPage: itemsPerPage,
    };
  };

  // 페이지 변경 함수
  const handlePageChange = (tabKey: "personal" | "vasp", page: number) => {
    setCurrentPage(prev => ({
      ...prev,
      [tabKey]: page
    }));
  };

  // 탭 변경 함수 (URL도 함께 변경)
  const handleTabChange = (newTab: "personal" | "vasp") => {
    setActiveTab(newTab);
    router.push(`/security/addresses/${newTab}`);
  };

  // 각 탭별 데이터
  const filteredPersonalAddresses = getFilteredAddresses("personal");
  const filteredVaspAddresses = getFilteredAddresses("vasp");
  const paginatedPersonalData = getPaginatedData(filteredPersonalAddresses, "personal");
  const paginatedVaspData = getPaginatedData(filteredVaspAddresses, "vasp");

  const getAssetColor = (asset: string) => {
    const colors: Record<string, string> = {
      BTC: "bg-orange-100 text-orange-800",
      ETH: "bg-blue-100 text-blue-800",
      SOL: "bg-purple-100 text-purple-800",
      KRW: "bg-indigo-100 text-indigo-800",
      USDC: "bg-sky-100 text-sky-800"
    };
    return colors[asset] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">주소 관리</h1>
        <p className="text-gray-600 mt-1">지갑 주소를 등록하고 입출금 내역을 관리합니다</p>
      </div>

      {/* 로딩 상태 */}
      {isLoading && (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-primary-600"></div>
          <p className="mt-4 text-gray-600">주소 목록을 불러오는 중...</p>
        </div>
      )}

      {/* 에러 상태 */}
      {error && !isLoading && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* 탭 네비게이션 */}
      {!isLoading && (
      <>
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            <button
              onClick={() => handleTabChange("personal")}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "personal"
                  ? "border-primary-500 text-primary-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              개인 지갑 ({filteredPersonalAddresses.length})
            </button>
            <button
              onClick={() => handleTabChange("vasp")}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "vasp"
                  ? "border-primary-500 text-primary-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              거래소/VASP ({filteredVaspAddresses.length})
            </button>
          </nav>
        </div>

        {/* 개인 지갑 탭 컨텐츠 */}
        {activeTab === "personal" && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <SearchInput
                    placeholder="주소, 라벨, 자산 검색..."
                    value={searchTerm}
                    onChange={setSearchTerm}
                  />
                  <select
                    value={permissionFilter}
                    onChange={(e) => setPermissionFilter(e.target.value as "all" | "deposit" | "withdrawal" | "both")}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="all">모든 권한</option>
                    <option value="deposit">입금만</option>
                    <option value="withdrawal">출금만</option>
                    <option value="both">입출금 모두</option>
                  </select>
                </div>
                <button
                  onClick={openPersonalModal}
                  className="inline-flex items-center px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  개인 지갑 주소 추가
                </button>
              </div>
            </div>

            {/* 주소 테이블 */}
            <div className="p-6">
              <AddressTable
                addresses={paginatedPersonalData.items}
                onDelete={handleDeleteAddress}
                getAssetColor={getAssetColor}
              />
            </div>

            {/* 페이징 네비게이션 */}
            <PaginationNav
              paginatedData={paginatedPersonalData}
              tabKey="personal"
              onPageChange={handlePageChange}
            />
          </div>
        )}

        {/* VASP 지갑 탭 컨텐츠 */}
        {activeTab === "vasp" && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <SearchInput
                    placeholder="주소, 라벨, 자산 검색..."
                    value={searchTerm}
                    onChange={setSearchTerm}
                  />
                  <select
                    value={permissionFilter}
                    onChange={(e) => setPermissionFilter(e.target.value as "all" | "deposit" | "withdrawal" | "both")}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="all">모든 권한</option>
                    <option value="deposit">입금만</option>
                    <option value="withdrawal">출금만</option>
                    <option value="both">입출금 모두</option>
                  </select>
                </div>
                <button
                  onClick={openVaspModal}
                  className="inline-flex items-center px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  거래소/VASP 주소 추가
                </button>
              </div>
            </div>

            {/* 주소 테이블 */}
            <div className="p-6">
              <AddressTable
                addresses={paginatedVaspData.items}
                onDelete={handleDeleteAddress}
                getAssetColor={getAssetColor}
              />
            </div>

            {/* 페이징 네비게이션 */}
            <PaginationNav
              paginatedData={paginatedVaspData}
              tabKey="vasp"
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </>
      )}

      {/* 주소 추가 모달 */}
      <AddressModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={handleAddAddress}
        initialType={modalType}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}