"use client";

import { useState, useEffect } from "react";
import { AirGapStats } from "./AirGapStats";
import { AirGapTable } from "./AirGapTable";
import { AirGapFilter } from "./AirGapFilter";
import { QRGenerateModal } from "./QRGenerateModal";
import { SignatureScanModal } from "./SignatureScanModal";
import { AirGapDetailModal } from "./AirGapDetailModal";
import { AirGapSigningRequest } from "@/types/vault";
import { AirGapFilter as AirGapFilterType } from "@/services/airgapApi";
import { initializeMockAirGapRequests } from "@/services/airgapApi";

/**
 * Air-gap 서명 관리 페이지
 * Task 4.3: Air-gap 통신 시스템
 *
 * 완전 구현된 기능:
 * - QR 코드 생성 모달 (qrcode.react)
 * - 서명 스캔 모달 (카메라/파일/텍스트 3가지 방식)
 * - 상세 정보 모달 (3개 탭: 트랜잭션 정보/서명 현황/감사 로그)
 * - 필터 및 검색 UI (상태/유형/진행률 필터)
 */
export default function AirGapPage() {
  const [selectedRequest, setSelectedRequest] = useState<AirGapSigningRequest | null>(
    null
  );
  const [showQRModal, setShowQRModal] = useState(false);
  const [showScanModal, setShowScanModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [filters, setFilters] = useState<AirGapFilterType>({});

  // Mock 데이터 초기화
  useEffect(() => {
    initializeMockAirGapRequests();
  }, []);

  const handleGenerateQR = (request: AirGapSigningRequest) => {
    setSelectedRequest(request);
    setShowQRModal(true);
  };

  const handleScanSignature = (request: AirGapSigningRequest) => {
    setSelectedRequest(request);
    setShowScanModal(true);
  };

  const handleViewDetail = (request: AirGapSigningRequest) => {
    setSelectedRequest(request);
    setShowDetailModal(true);
  };

  const handleCloseModals = () => {
    setShowQRModal(false);
    setShowScanModal(false);
    setShowDetailModal(false);
    setSelectedRequest(null);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* 페이지 헤더 */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Air-gap 서명 관리</h1>
        <p className="text-muted-foreground mt-2">
          오프라인 서명 시스템을 통한 안전한 트랜잭션 서명 관리
        </p>
      </div>

      {/* 통계 카드 */}
      <AirGapStats />

      {/* 필터 및 검색 */}
      <AirGapFilter filters={filters} onFilterChange={setFilters} />

      {/* 서명 대기열 테이블 */}
      <div>
        <h2 className="text-xl font-semibold mb-4">서명 대기열</h2>
        <AirGapTable
          filters={filters}
          onGenerateQR={handleGenerateQR}
          onScanSignature={handleScanSignature}
          onViewDetail={handleViewDetail}
        />
      </div>

      {/* 모달들 */}
      {showQRModal && selectedRequest && (
        <QRGenerateModal request={selectedRequest} onClose={handleCloseModals} />
      )}

      {showScanModal && selectedRequest && (
        <SignatureScanModal
          request={selectedRequest}
          onClose={handleCloseModals}
          onSuccess={handleCloseModals}
        />
      )}

      {showDetailModal && selectedRequest && (
        <AirGapDetailModal
          request={selectedRequest}
          onClose={handleCloseModals}
          onCancel={handleCloseModals}
        />
      )}
    </div>
  );
}
