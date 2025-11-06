/**
 * OrganizationDepositsModal Component
 * 법인 입금 내역 모달
 */

"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, Check, ExternalLink } from "lucide-react";
import CryptoIcon from "@/components/ui/CryptoIcon";
import { OrganizationDeposit, OrganizationDepositsResponse } from "@/types/onboardingAml";
import { fetchOrganizationDeposits } from "@/services/onboardingAmlApi";

interface OrganizationDepositsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationId: string;
  companyName: string;
}

export function OrganizationDepositsModal({
  open,
  onOpenChange,
  organizationId,
  companyName,
}: OrganizationDepositsModalProps) {
  const [data, setData] = useState<OrganizationDepositsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      loadDeposits();
    }
  }, [open, organizationId]);

  async function loadDeposits() {
    try {
      setLoading(true);
      const response = await fetchOrganizationDeposits(organizationId);
      setData(response);
    } catch (error) {
      console.error('Failed to load deposits:', error);
    } finally {
      setLoading(false);
    }
  }

  const copyToClipboard = async (text: string, hash: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedHash(hash);
      setTimeout(() => setCopiedHash(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const formatAmount = (amount: string) => {
    return parseFloat(amount).toLocaleString('en-US', {
      maximumFractionDigits: 8
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {companyName} - 입금 내역
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          {loading ? (
            <div className="p-6 text-center text-muted-foreground">
              <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent mr-2"></div>
              입금 내역을 불러오는 중...
            </div>
          ) : !data || data.deposits.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              입금 내역이 없습니다.
            </div>
          ) : (
            <>
              <div className="mb-3 px-2">
                <span className="text-sm font-semibold text-muted-foreground">
                  총 {data.totalDeposits}건
                </span>
              </div>

              <div className="bg-background rounded-lg border">
                <table className="w-full">
                  <thead className="border-b bg-muted/30">
                    <tr className="text-xs text-muted-foreground">
                      <th className="p-3 text-left font-medium">날짜</th>
                      <th className="p-3 text-left font-medium">사용자</th>
                      <th className="p-3 text-left font-medium">자산</th>
                      <th className="p-3 text-right font-medium">금액</th>
                      <th className="p-3 text-left font-medium">TxHash</th>
                      <th className="p-3 text-left font-medium">상태</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {data.deposits.map((deposit) => (
                      <tr key={deposit.id} className="hover:bg-muted/20 transition-colors text-sm">
                        <td className="p-3 text-muted-foreground">
                          {formatDate(deposit.detectedAt)}
                        </td>
                        <td className="p-3 font-medium">{deposit.userName}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <CryptoIcon symbol={deposit.asset} size={20} />
                            <span className="font-mono">{deposit.asset}</span>
                          </div>
                        </td>
                        <td className="p-3 text-right font-mono">
                          {formatAmount(deposit.amount)}
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-1">
                            <code className="text-xs bg-muted px-2 py-1 rounded">
                              {deposit.txHash.slice(0, 8)}...{deposit.txHash.slice(-6)}
                            </code>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0"
                              onClick={() => copyToClipboard(deposit.txHash, deposit.id)}
                            >
                              {copiedHash === deposit.id ? (
                                <Check className="h-3 w-3 text-sky-600" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </Button>
                          </div>
                        </td>
                        <td className="p-3">
                          <DepositStatusBadge status={deposit.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function DepositStatusBadge({ status }: { status: string }) {
  const statusConfig: Record<string, { label: string; className: string }> = {
    detected: {
      label: '감지됨',
      className: 'bg-yellow-50 text-yellow-600 border-yellow-200'
    },
    confirming: {
      label: '확인 중',
      className: 'bg-blue-50 text-blue-600 border-blue-200'
    },
    confirmed: {
      label: '확인 완료',
      className: 'bg-indigo-50 text-indigo-600 border-indigo-200'
    },
    credited: {
      label: '입금 완료',
      className: 'bg-sky-50 text-sky-600 border-sky-200'
    },
  };

  const config = statusConfig[status] || statusConfig.detected;

  return (
    <Badge variant="outline" className={`text-xs ${config.className}`}>
      {config.label}
    </Badge>
  );
}
