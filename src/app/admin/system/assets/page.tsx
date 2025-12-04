"use client";

import { useState, useEffect } from "react";
import { Coins, FileText, Eye } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import CryptoIcon from "@/components/ui/CryptoIcon";
import { useToast } from "@/hooks/use-toast";
import {
  getSupportedTokens,
  getCustomTokenRequests,
  toggleTokenStatus,
  updateTokenSettings,
  type SupportedToken,
  type CustomTokenRequest,
  type UpdateTokenSettingsRequest,
} from "@/services/tokenService";
import { formatCryptoAmount } from "@/lib/format";
import TokenSettingsModal from "./TokenSettingsModal";
import { CustomTokenReviewModal } from "./CustomTokenReviewModal";

export default function AssetSettingsPage() {
  const [activeTab, setActiveTab] = useState<"tokens" | "requests">("tokens");
  const [tokens, setTokens] = useState<SupportedToken[]>([]);
  const [customRequests, setCustomRequests] = useState<CustomTokenRequest[]>(
    []
  );
  const [statusFilter, setStatusFilter] = useState<
    "all" | "pending" | "approved" | "rejected"
  >("all");
  const [loading, setLoading] = useState(true);
  const [editingToken, setEditingToken] = useState<SupportedToken | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reviewingRequest, setReviewingRequest] =
    useState<CustomTokenRequest | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [tokensData, requestsData] = await Promise.all([
        getSupportedTokens(),
        getCustomTokenRequests(), // 모든 상태의 요청 조회
      ]);

      // 배열인지 확인 후 설정 (방어적 코드)
      setTokens(Array.isArray(tokensData) ? tokensData : []);
      setCustomRequests(Array.isArray(requestsData) ? requestsData : []);
    } catch (error) {
      console.error("데이터 로드 오류:", error);
      toast({
        variant: "destructive",
        description: "데이터를 불러오는 중 오류가 발생했습니다.",
      });
      // 에러 시 빈 배열로 초기화
      setTokens([]);
      setCustomRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (token: SupportedToken) => {
    try {
      const result = await toggleTokenStatus(token.id);

      toast({
        description:
          result.message ||
          `${token.symbol}이(가) ${
            result.data.isActive ? "활성화" : "비활성화"
          }되었습니다.`,
      });

      // 토큰 목록 갱신
      await loadData();
    } catch (error) {
      console.error("토큰 상태 변경 오류:", error);
      toast({
        variant: "destructive",
        description: "토큰 상태 변경 중 오류가 발생했습니다.",
      });
    }
  };

  const handleEditToken = (token: SupportedToken) => {
    setEditingToken(token);
    setIsModalOpen(true);
  };

  const handleSaveSettings = async (settings: UpdateTokenSettingsRequest) => {
    if (!editingToken) return;

    try {
      await updateTokenSettings(editingToken.id, settings);

      toast({
        description: "토큰 설정이 성공적으로 업데이트되었습니다.",
      });

      setIsModalOpen(false);
      setEditingToken(null);

      // 토큰 목록 갱신
      await loadData();
    } catch (error) {
      console.error("토큰 설정 업데이트 오류:", error);
      toast({
        variant: "destructive",
        description: "토큰 설정 업데이트 중 오류가 발생했습니다.",
      });
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* 페이지 헤더 */}
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-gradient-to-r from-sapphire-500 to-purple-600 rounded-lg">
          <Coins className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">자산 관리</h1>
          <p className="text-sm text-gray-500">지원 토큰 및 출금 설정 관리</p>
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <div className="border-b border-gray-200">
        <div className="flex space-x-8">
          <button
            onClick={() => setActiveTab("tokens")}
            className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === "tokens"
                ? "border-primary-600 text-primary-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <div className="flex items-center space-x-2">
              <Coins className="h-4 w-4" />
              <span>지원 토큰</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab("requests")}
            className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === "requests"
                ? "border-primary-600 text-primary-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>
                커스텀 토큰 요청
                {customRequests.filter((req) => req.status === "pending")
                  .length > 0 && (
                  <span className="ml-2 px-2 py-0.5 text-xs bg-red-100 text-red-600 rounded-full">
                    {
                      customRequests.filter((req) => req.status === "pending")
                        .length
                    }
                  </span>
                )}
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* 탭 컨텐츠 */}
      {loading ? (
        <Card className="p-8">
          <div className="flex items-center justify-center">
            <div className="text-gray-500">로딩 중...</div>
          </div>
        </Card>
      ) : (
        <>
          {activeTab === "tokens" && (
            <div className="space-y-4">
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">지원 자산목록</h2>
                {!Array.isArray(tokens) || tokens.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    등록된 자산이 없습니다.
                  </div>
                ) : (
                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>토큰</TableHead>
                          <TableHead>네트워크</TableHead>
                          <TableHead className="text-center">
                            입금 컨펌 수
                          </TableHead>
                          <TableHead className="text-right">
                            최소 출금
                          </TableHead>
                          <TableHead className="text-right">
                            출금 수수료
                          </TableHead>
                          <TableHead className="text-right">
                            환불 수수료
                          </TableHead>
                          <TableHead className="text-center">상태</TableHead>
                          <TableHead className="text-right">작업</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {tokens.map((token) => (
                          <TableRow key={token.id}>
                            <TableCell>
                              <div className="flex items-center space-x-3">
                                <CryptoIcon symbol={token.symbol} size={32} />
                                <div>
                                  <div className="font-medium text-gray-900">
                                    {token.name}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {token.symbol}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{token.network}</TableCell>
                            <TableCell className="text-center">
                              {token.requiredConfirmations ?? "-"}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="text-sm">
                                {formatCryptoAmount(
                                  token.minWithdrawalAmount,
                                  token.symbol
                                )}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {token.symbol}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="text-sm">
                                {formatCryptoAmount(
                                  token.withdrawalFee,
                                  token.withdrawalFeeType === "fixed"
                                    ? token.symbol
                                    : undefined
                                )}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {token.withdrawalFeeType === "fixed"
                                  ? token.symbol
                                  : "%"}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="text-sm">
                                {formatCryptoAmount(
                                  token.returnFeeValue,
                                  token.returnFeeType === "fixed"
                                    ? token.symbol
                                    : undefined
                                )}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {token.returnFeeType === "fixed"
                                  ? token.symbol
                                  : "%"}
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              <span
                                className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${
                                  token.isActive
                                    ? "bg-sky-50 text-sky-600 border border-sky-200"
                                    : "bg-gray-50 text-gray-600 border border-gray-200"
                                }`}
                              >
                                {token.isActive ? "활성" : "비활성"}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditToken(token)}
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                상세 보기
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </Card>
            </div>
          )}

          {activeTab === "requests" && (
            <div className="space-y-4">
              {/* 상태 필터 버튼 */}
              <div className="flex space-x-2">
                <button
                  onClick={() => setStatusFilter("all")}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    statusFilter === "all"
                      ? "bg-sapphire-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  전체 ({customRequests.length})
                </button>
                <button
                  onClick={() => setStatusFilter("pending")}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    statusFilter === "pending"
                      ? "bg-sapphire-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  대기 중 (
                  {
                    customRequests.filter((req) => req.status === "pending")
                      .length
                  }
                  )
                </button>
                <button
                  onClick={() => setStatusFilter("approved")}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    statusFilter === "approved"
                      ? "bg-sapphire-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  승인됨 (
                  {
                    customRequests.filter((req) => req.status === "approved")
                      .length
                  }
                  )
                </button>
                <button
                  onClick={() => setStatusFilter("rejected")}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    statusFilter === "rejected"
                      ? "bg-sapphire-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  반려됨 (
                  {
                    customRequests.filter((req) => req.status === "rejected")
                      .length
                  }
                  )
                </button>
              </div>

              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">
                  커스텀 토큰 요청 내역
                </h2>
                {(() => {
                  const filteredRequests =
                    statusFilter === "all"
                      ? customRequests
                      : customRequests.filter(
                          (req) => req.status === statusFilter
                        );

                  return !Array.isArray(filteredRequests) ||
                    filteredRequests.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      {statusFilter === "all"
                        ? "요청 내역이 없습니다."
                        : statusFilter === "pending"
                        ? "대기 중인 요청이 없습니다."
                        : statusFilter === "approved"
                        ? "승인된 요청이 없습니다."
                        : "반려된 요청이 없습니다."}
                    </div>
                  ) : (
                    <div className="border rounded-lg">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>토큰</TableHead>
                            <TableHead>네트워크</TableHead>
                            <TableHead>컨트랙트 주소</TableHead>
                            <TableHead>요청자</TableHead>
                            <TableHead>요청 일시</TableHead>
                            <TableHead className="text-center">상태</TableHead>
                            <TableHead className="text-right">작업</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredRequests.map((request) => (
                            <TableRow key={request.id}>
                              <TableCell>
                                <div className="flex items-center space-x-3">
                                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 text-xs font-semibold flex-shrink-0">
                                    {request.symbol.slice(0, 3)}
                                  </div>
                                  <div>
                                    <div className="font-medium text-gray-900">
                                      {request.name}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                      {request.symbol}
                                    </div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>{request.network}</TableCell>
                              <TableCell>
                                <code className="text-xs font-mono">
                                  {request.contractAddress.slice(0, 10)}...
                                  {request.contractAddress.slice(-8)}
                                </code>
                              </TableCell>
                              <TableCell>
                                <div>
                                  <div className="text-sm text-gray-900">
                                    {request.organizationName ||
                                      request.userName ||
                                      request.userId}
                                  </div>
                                  <span
                                    className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full mt-1 ${
                                      request.memberType === "corporate"
                                        ? "bg-indigo-50 text-indigo-600 border border-indigo-200"
                                        : "bg-purple-50 text-purple-600 border border-purple-200"
                                    }`}
                                  >
                                    {request.memberType === "corporate"
                                      ? "법인"
                                      : "개인"}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm">
                                  {new Date(
                                    request.createdAt
                                  ).toLocaleDateString("ko-KR", {
                                    year: "numeric",
                                    month: "2-digit",
                                    day: "2-digit",
                                  })}
                                </div>
                              </TableCell>
                              <TableCell className="text-center">
                                <span
                                  className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${
                                    request.status === "pending"
                                      ? "bg-yellow-50 text-yellow-600 border border-yellow-200"
                                      : request.status === "approved"
                                      ? "bg-sky-50 text-sky-600 border border-sky-200"
                                      : "bg-red-50 text-red-600 border border-red-200"
                                  }`}
                                >
                                  {request.status === "pending"
                                    ? "대기 중"
                                    : request.status === "approved"
                                    ? "승인됨"
                                    : "반려됨"}
                                </span>
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setReviewingRequest(request)}
                                >
                                  <Eye className="w-4 h-4 mr-1" />
                                  {request.status === "pending"
                                    ? "검토"
                                    : "상세보기"}
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  );
                })()}
              </Card>
            </div>
          )}
        </>
      )}

      {/* 토큰 설정 모달 */}
      {editingToken && (
        <TokenSettingsModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingToken(null);
          }}
          token={editingToken}
          onSave={handleSaveSettings}
        />
      )}

      {/* 커스텀 토큰 검토 모달 */}
      {reviewingRequest && (
        <CustomTokenReviewModal
          open={!!reviewingRequest}
          onOpenChange={(open) => !open && setReviewingRequest(null)}
          request={reviewingRequest}
          onSuccess={() => {
            toast({
              description: "요청이 처리되었습니다.",
            });
            loadData();
          }}
        />
      )}
    </div>
  );
}
