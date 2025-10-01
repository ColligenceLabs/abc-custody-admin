"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { PlusIcon } from "@heroicons/react/24/outline";
import { WhitelistedAddress, AddressFormData } from "@/types/address";
import AddressModal from "./address/AddressModal";
import AddressTable from "./address/AddressTable";
import PaginationNav from "./address/PaginationNav";
import SearchInput from "./address/SearchInput";
import { mockAddresses } from "@/data/mockAddresses";
import {
  validateBlockchainAddress,
  checkDuplicateAddress,
  createPersonalWalletDefaults,
  resetDailyUsageIfNeeded,
  getVASPById,
  getDailyLimitStatus
} from "@/utils/addressHelpers";

interface AddressManagementProps {
  initialTab?: "personal" | "vasp";
}

export default function AddressManagement({ initialTab }: AddressManagementProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [addresses, setAddresses] = useState<WhitelistedAddress[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"personal" | "vasp" | undefined>();
  const [searchTerm, setSearchTerm] = useState("");
  const [permissionFilter, setPermissionFilter] = useState<"all" | "deposit" | "withdrawal" | "both">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "normal" | "warning" | "danger">("all");
  const [activeTab, setActiveTab] = useState<"personal" | "vasp">(initialTab || "personal");


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

  // 주소 목록 로드
  useEffect(() => {
    const savedAddresses = localStorage.getItem("whitelistedAddresses");
    if (savedAddresses) {
      try {
        const parsedAddresses = JSON.parse(savedAddresses);

        // mock 데이터의 최신 정보로 기존 주소들을 업데이트하되, 사용자가 추가한 주소는 유지
        const updatedAddresses: WhitelistedAddress[] = [];
        const existingAddressMap = new Map<string, WhitelistedAddress>(parsedAddresses.map((addr: WhitelistedAddress) => [addr.address, addr]));

        // mock 데이터를 우선적으로 사용하여 최신 정보 적용
        mockAddresses.forEach(mockAddr => {
          const existingAddr: WhitelistedAddress | undefined = existingAddressMap.get(mockAddr.address);
          if (existingAddr) {
            // 기존 주소가 있으면 mock 데이터의 최신 정보로 업데이트 (사용자 추가 필드는 유지)
            updatedAddresses.push({
              ...mockAddr,
              id: existingAddr.id, // 기존 ID 유지
              addedAt: existingAddr.addedAt, // 추가 날짜 유지
              lastUsed: existingAddr.lastUsed, // 마지막 사용 시간 유지
            });
            existingAddressMap.delete(mockAddr.address);
          } else {
            // 새로운 mock 주소
            updatedAddresses.push(mockAddr);
          }
        });

        // 사용자가 추가한 주소들 (mock에 없는 주소들)
        existingAddressMap.forEach((userAddr: WhitelistedAddress) => {
          updatedAddresses.push(userAddr);
        });

        const finalAddresses = updatedAddresses.map(resetDailyUsageIfNeeded);
        setAddresses(finalAddresses);
        localStorage.setItem("whitelistedAddresses", JSON.stringify(finalAddresses));
      } catch (error) {
        console.error("주소 목록 로드 실패:", error);
        // 로컬 스토리지 오류 시 mock data 사용
        setAddresses(mockAddresses.map(resetDailyUsageIfNeeded));
      }
    } else {
      // 저장된 데이터가 없으면 mock data 사용
      const updatedAddresses = mockAddresses.map(resetDailyUsageIfNeeded);
      setAddresses(updatedAddresses);
      localStorage.setItem("whitelistedAddresses", JSON.stringify(updatedAddresses));
    }
  }, []);

  // 주소 목록 저장
  const saveAddresses = (newAddresses: WhitelistedAddress[]) => {
    setAddresses(newAddresses);
    localStorage.setItem("whitelistedAddresses", JSON.stringify(newAddresses));
  };

  const handleAddAddress = (formData: AddressFormData) => {
    try {
      // 주소 유효성 검증
      if (!validateBlockchainAddress(formData.address, formData.coin)) {
        alert(`유효하지 않은 ${formData.coin} 주소입니다.`);
        return;
      }

      // 중복 주소 체크
      if (checkDuplicateAddress(formData.address, addresses)) {
        alert("이미 등록된 주소입니다.");
        return;
      }

      const newAddress: WhitelistedAddress = {
        id: `addr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        label: formData.label,
        address: formData.address,
        coin: formData.coin,
        type: formData.type as "personal" | "vasp",
        permissions: formData.permissions,
        addedAt: new Date().toISOString(),
        txCount: 0,
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

      const updatedAddresses = [...addresses, newAddress];
      saveAddresses(updatedAddresses);
      setIsModalOpen(false);
    } catch (error) {
      console.error("주소 추가 실패:", error);
      alert("주소 추가 중 오류가 발생했습니다.");
    }
  };

  const handleDeleteAddress = (id: string) => {
    if (confirm("정말로 이 주소를 삭제하시겠습니까?")) {
      const updatedAddresses = addresses.filter(addr => addr.id !== id);
      saveAddresses(updatedAddresses);
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">주소 관리</h2>
          <p className="text-gray-600 mt-1">지갑 주소를 등록하고 입출금 내역을 관리합니다</p>
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex">
            <button
              onClick={() => handleTabChange("personal")}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "personal"
                  ? "border-primary-500 text-primary-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              개인 지갑 ({filteredPersonalAddresses.length})
            </button>
            <button
              onClick={() => handleTabChange("vasp")}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
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
          <>
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
          </>
        )}

        {/* VASP 지갑 탭 컨텐츠 */}
        {activeTab === "vasp" && (
          <>
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
          </>
        )}


      </div>

      {/* 주소 추가 모달 */}
      <AddressModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={handleAddAddress}
        initialType={modalType}
      />
    </div>
  );
}