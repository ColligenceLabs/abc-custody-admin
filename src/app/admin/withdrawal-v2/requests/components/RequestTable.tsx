/**
 * RequestTable Component
 *
 * 출금 요청 목록 테이블
 * 필터링, 정렬, 상태별 필터링 지원
 */

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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  WithdrawalV2Request,
  WithdrawalStatus,
} from "@/types/withdrawalV2";
import { Search, Filter, Eye } from "lucide-react";

interface RequestTableProps {
  requests: WithdrawalV2Request[];
  onView: (request: WithdrawalV2Request) => void;
}

export function RequestTable({
  requests,
  onView,
}: RequestTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<WithdrawalStatus | "all">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // 필터링된 요청 목록
  const filteredRequests = requests.filter((request) => {
    const matchesSearch =
      request.memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.toAddress.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || request.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // 페이징 계산
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedRequests = filteredRequests.slice(startIndex, endIndex);

  // 검색/필터 변경 시 첫 페이지로 이동
  const handleSearchOrFilterChange = () => {
    setCurrentPage(1);
  };

  const getStatusBadge = (status: WithdrawalStatus) => {
    const variants: Record<
      WithdrawalStatus,
      { variant: "default" | "secondary" | "destructive" | "outline"; label: string; className?: string }
    > = {
      pending: { variant: "secondary", label: "AML 검토 중", className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200" },
      approval_waiting: { variant: "default", label: "승인 대기", className: "bg-blue-600" },
      aml_flagged: { variant: "destructive", label: "AML 문제" },
      processing: { variant: "outline", label: "처리 중", className: "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-200" },
      completed: { variant: "default", label: "완료", className: "bg-green-600" },
      rejected: { variant: "destructive", label: "거부됨" },
      failed: { variant: "destructive", label: "실패" },
    };

    const config = variants[status];
    return <Badge variant={config.variant} className={config.className}>{config.label}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const variants: Record<
      string,
      { variant: "default" | "secondary" | "destructive" | "outline"; label: string; className?: string }
    > = {
      urgent: { variant: "destructive", label: "긴급", className: "bg-red-600 text-white" },
      normal: { variant: "default", label: "보통", className: "bg-blue-600 text-white" },
      low: { variant: "secondary", label: "낮음", className: "bg-gray-400 text-white dark:bg-gray-600" },
    };

    const config = variants[priority] || variants.normal;
    return <Badge variant={config.variant} className={config.className}>{config.label}</Badge>;
  };


  const getBlockchainBadge = (blockchain: string) => {
    const colors: Record<string, string> = {
      BITCOIN:
        "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-200",
      ETHEREUM:
        "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200",
      SOLANA:
        "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-200",
    };

    const labels: Record<string, string> = {
      BITCOIN: "Bitcoin",
      ETHEREUM: "Ethereum",
      SOLANA: "Solana",
    };

    return (
      <Badge variant="outline" className={colors[blockchain]}>
        {labels[blockchain]}
      </Badge>
    );
  };

  const getMemberTypeBadge = (memberType: "individual" | "corporate") => {
    if (memberType === "individual") {
      return (
        <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200">
          개인
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200">
        기업
      </Badge>
    );
  };

  return (
    <div className="space-y-4">
      {/* 검색 및 필터 */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="회원명, 요청 ID, 출금 주소로 검색..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              handleSearchOrFilterChange();
            }}
            className="pl-10"
          />
        </div>

        <Select
          value={statusFilter}
          onValueChange={(value) => {
            setStatusFilter(value as WithdrawalStatus | "all");
            handleSearchOrFilterChange();
          }}
        >
          <SelectTrigger className="w-[200px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="상태 필터" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체 상태</SelectItem>
            <SelectItem value="pending">AML 검토 중</SelectItem>
            <SelectItem value="approval_waiting">승인 대기</SelectItem>
            <SelectItem value="aml_flagged">AML 문제</SelectItem>
            <SelectItem value="processing">처리 중</SelectItem>
            <SelectItem value="completed">완료</SelectItem>
            <SelectItem value="rejected">거부됨</SelectItem>
            <SelectItem value="failed">실패</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 테이블 */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>요청 ID</TableHead>
              <TableHead>회원구분</TableHead>
              <TableHead>회원명</TableHead>
              <TableHead>자산</TableHead>
              <TableHead>수량</TableHead>
              <TableHead>블록체인</TableHead>
              <TableHead>우선순위</TableHead>
              <TableHead>상태</TableHead>
              <TableHead>요청 시각</TableHead>
              <TableHead className="text-right">작업</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedRequests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-8">
                  <p className="text-muted-foreground">
                    검색 결과가 없습니다
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              paginatedRequests.map((request) => (
                <TableRow key={request.id} className="hover:bg-muted/50">
                  <TableCell className="font-mono text-xs">
                    {request.id}
                  </TableCell>
                  <TableCell>
                    {getMemberTypeBadge(request.memberType)}
                  </TableCell>
                  <TableCell className="font-medium">
                    {request.memberName}
                  </TableCell>
                  <TableCell>
                    <span className="font-semibold">{request.asset}</span>
                  </TableCell>
                  <TableCell className="font-mono">
                    {request.amount}
                  </TableCell>
                  <TableCell>{getBlockchainBadge(request.blockchain)}</TableCell>
                  <TableCell>{getPriorityBadge(request.priority)}</TableCell>
                  <TableCell>{getStatusBadge(request.status)}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {request.createdAt.toLocaleString("ko-KR")}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onView(request)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      상세 보기
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* 결과 요약 및 페이징 */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          전체 {filteredRequests.length}건 중 {startIndex + 1}-{Math.min(endIndex, filteredRequests.length)}건 표시
        </div>

        {filteredRequests.length > 0 && (
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                // 첫 페이지, 마지막 페이지, 현재 페이지 근처만 표시
                if (
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1)
                ) {
                  return (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => setCurrentPage(page)}
                        isActive={currentPage === page}
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  );
                } else if (page === currentPage - 2 || page === currentPage + 2) {
                  return (
                    <PaginationItem key={page}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  );
                }
                return null;
              })}

              <PaginationItem>
                <PaginationNext
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
    </div>
  );
}
