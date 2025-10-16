"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  useAirGapQueue,
  useSignatureProgress,
  useExpirationDisplay,
  useSigningStatusColor,
  useSigningTypeDisplay,
} from "@/hooks/useAirGap";
import { AirGapSigningRequest } from "@/types/vault";
import { QrCode, ScanLine, Eye, Clock, CheckCircle2, XCircle } from "lucide-react";
import { AirGapFilter } from "@/services/airgapApi";

interface AirGapTableProps {
  filters?: AirGapFilter;
  onGenerateQR: (request: AirGapSigningRequest) => void;
  onScanSignature: (request: AirGapSigningRequest) => void;
  onViewDetail: (request: AirGapSigningRequest) => void;
}

/**
 * Air-gap 서명 대기열 테이블
 */
export function AirGapTable({
  filters,
  onGenerateQR,
  onScanSignature,
  onViewDetail,
}: AirGapTableProps) {
  const { data: requests, isLoading } = useAirGapQueue(filters);

  if (isLoading) {
    return (
      <div className="rounded-md border">
        <div className="p-8 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
          <p className="mt-2 text-sm text-muted-foreground">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!requests || requests.length === 0) {
    return (
      <div className="rounded-md border">
        <div className="p-8 text-center">
          <p className="text-sm text-muted-foreground">
            서명 대기 중인 요청이 없습니다.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[150px]">요청 ID</TableHead>
            <TableHead>유형</TableHead>
            <TableHead>자산/금액</TableHead>
            <TableHead className="w-[200px]">서명 진행률</TableHead>
            <TableHead>서명자</TableHead>
            <TableHead>만료 시간</TableHead>
            <TableHead>상태</TableHead>
            <TableHead className="text-right">작업</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((request) => (
            <AirGapTableRow
              key={request.id}
              request={request}
              onGenerateQR={onGenerateQR}
              onScanSignature={onScanSignature}
              onViewDetail={onViewDetail}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

/**
 * 테이블 행 컴포넌트
 */
function AirGapTableRow({
  request,
  onGenerateQR,
  onScanSignature,
  onViewDetail,
}: {
  request: AirGapSigningRequest;
  onGenerateQR: (request: AirGapSigningRequest) => void;
  onScanSignature: (request: AirGapSigningRequest) => void;
  onViewDetail: (request: AirGapSigningRequest) => void;
}) {
  const progress = useSignatureProgress(request);
  const expiration = useExpirationDisplay(request.expiresAt);
  const statusColor = useSigningStatusColor(request.status);
  const typeDisplay = useSigningTypeDisplay(request.type);

  const totalAmount = request.transactions.reduce(
    (sum, tx) => sum + parseFloat(tx.amount),
    0
  );

  return (
    <TableRow>
      {/* 요청 ID */}
      <TableCell className="font-mono text-xs">
        {request.id.substring(0, 16)}...
      </TableCell>

      {/* 유형 */}
      <TableCell>
        <Badge variant="outline" className={`border-${typeDisplay.color}-500`}>
          {typeDisplay.label}
        </Badge>
      </TableCell>

      {/* 자산/금액 */}
      <TableCell>
        <div className="flex flex-col">
          {request.transactions.map((tx, idx) => (
            <span key={idx} className="text-sm">
              {tx.assetSymbol} {parseFloat(tx.amount).toFixed(4)}
            </span>
          ))}
        </div>
      </TableCell>

      {/* 서명 진행률 */}
      <TableCell>
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium">{progress.label}</span>
            <span className="text-muted-foreground">{progress.percentage}%</span>
          </div>
          <Progress value={progress.percentage} className="h-2" />
        </div>
      </TableCell>

      {/* 서명자 */}
      <TableCell>
        <div className="flex -space-x-2">
          {request.signers.slice(0, 3).map((signer) => (
            <Avatar
              key={signer.id}
              className={`h-8 w-8 border-2 ${
                signer.hasSignedAt
                  ? "border-green-500"
                  : "border-gray-300 dark:border-gray-700"
              }`}
            >
              <AvatarFallback
                className={
                  signer.hasSignedAt
                    ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
                    : "bg-gray-100 dark:bg-gray-800"
                }
              >
                {signer.name.substring(0, 2)}
              </AvatarFallback>
            </Avatar>
          ))}
          {request.signers.length > 3 && (
            <Avatar className="h-8 w-8 border-2 border-gray-300 dark:border-gray-700">
              <AvatarFallback className="bg-gray-100 dark:bg-gray-800 text-xs">
                +{request.signers.length - 3}
              </AvatarFallback>
            </Avatar>
          )}
        </div>
      </TableCell>

      {/* 만료 시간 */}
      <TableCell>
        <div
          className={`flex items-center gap-1 text-sm ${
            expiration.isCritical
              ? "text-red-500"
              : expiration.isExpiringSoon
              ? "text-yellow-500"
              : "text-muted-foreground"
          }`}
        >
          <Clock className="h-3 w-3" />
          {expiration.display}
        </div>
      </TableCell>

      {/* 상태 */}
      <TableCell>
        <Badge
          variant={
            request.status === "completed"
              ? "default"
              : request.status === "cancelled" || request.status === "expired"
              ? "destructive"
              : "secondary"
          }
        >
          {request.status === "pending"
            ? "대기"
            : request.status === "partial"
            ? "부분서명"
            : request.status === "completed"
            ? "완료"
            : request.status === "expired"
            ? "만료"
            : "취소"}
        </Badge>
      </TableCell>

      {/* 작업 */}
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-2">
          {request.status === "pending" && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onGenerateQR(request)}
            >
              <QrCode className="h-4 w-4 mr-1" />
              QR 생성
            </Button>
          )}

          {(request.status === "pending" || request.status === "partial") && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onScanSignature(request)}
            >
              <ScanLine className="h-4 w-4 mr-1" />
              서명 스캔
            </Button>
          )}

          <Button size="sm" variant="ghost" onClick={() => onViewDetail(request)}>
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
