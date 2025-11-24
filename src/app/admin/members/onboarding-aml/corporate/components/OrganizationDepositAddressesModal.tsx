/**
 * OrganizationDepositAddressesModal Component
 * 법인 입금 주소 관리 모달
 */

"use client";

import { useEffect, useState } from "react";
import { fetchWithCsrf } from '@/lib/fetchWithCsrf';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import CryptoIcon from "@/components/ui/CryptoIcon";
import { OrganizationDepositAddress, OrganizationDepositAddressesResponse } from "@/types/onboardingAml";
import { fetchOrganizationDepositAddresses } from "@/services/onboardingAmlApi";

interface OrganizationDepositAddressesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationId: string;
  companyName: string;
}

export function OrganizationDepositAddressesModal({
  open,
  onOpenChange,
  organizationId,
  companyName,
}: OrganizationDepositAddressesModalProps) {
  const [data, setData] = useState<OrganizationDepositAddressesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      loadAddresses();
    }
  }, [open, organizationId]);

  async function loadAddresses() {
    try {
      setLoading(true);
      const response = await fetchOrganizationDepositAddresses(organizationId);
      setData(response);
    } catch (error) {
      console.error('Failed to load deposit addresses:', error);
    } finally {
      setLoading(false);
    }
  }

  const copyToClipboard = async (address: string, id: string) => {
    try {
      await navigator.clipboard.writeText(address);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {companyName} - 입금 주소 관리
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          {loading ? (
            <div className="p-6 text-center text-muted-foreground">
              <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent mr-2"></div>
              입금 주소를 불러오는 중...
            </div>
          ) : !data || data.addresses.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              등록된 입금 주소가 없습니다.
            </div>
          ) : (
            <>
              <div className="mb-3 px-2">
                <span className="text-sm font-semibold text-muted-foreground">
                  총 {data.totalAddresses}개 주소
                </span>
              </div>

              <div className="bg-background rounded-lg border">
                <table className="w-full">
                  <thead className="border-b bg-muted/30">
                    <tr className="text-xs text-muted-foreground">
                      <th className="p-3 text-left font-medium">사용자</th>
                      <th className="p-3 text-left font-medium">자산</th>
                      <th className="p-3 text-left font-medium">네트워크</th>
                      <th className="p-3 text-left font-medium">주소</th>
                      <th className="p-3 text-left font-medium">라벨</th>
                      <th className="p-3 text-left font-medium">타입</th>
                      <th className="p-3 text-left font-medium">상태</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {data.addresses.map((address) => (
                      <tr key={address.id} className="hover:bg-muted/20 transition-colors text-sm">
                        <td className="p-3">
                          <span className="font-medium">{address.userName}</span>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <CryptoIcon symbol={address.coin} size={20} />
                            <span className="font-mono">{address.coin}</span>
                          </div>
                        </td>
                        <td className="p-3 text-muted-foreground">{address.network}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <code className="text-xs bg-muted px-2 py-1 rounded">
                              {address.address.slice(0, 10)}...{address.address.slice(-8)}
                            </code>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0"
                              onClick={() => copyToClipboard(address.address, address.id)}
                            >
                              {copiedId === address.id ? (
                                <Check className="h-3 w-3 text-sky-600" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </Button>
                          </div>
                        </td>
                        <td className="p-3 text-muted-foreground">{address.label}</td>
                        <td className="p-3">
                          <AddressTypeBadge type={address.type} />
                        </td>
                        <td className="p-3">
                          <StatusBadge isActive={address.isActive} />
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

function AddressTypeBadge({ type }: { type: string }) {
  const config = type === 'personal'
    ? { label: '개인지갑', className: 'bg-purple-50 text-purple-600 border-purple-200' }
    : { label: '거래소', className: 'bg-blue-50 text-blue-600 border-blue-200' };

  return (
    <Badge variant="outline" className={`text-xs ${config.className}`}>
      {config.label}
    </Badge>
  );
}

function StatusBadge({ isActive }: { isActive: boolean }) {
  return isActive ? (
    <Badge variant="outline" className="text-xs bg-sky-50 text-sky-600 border-sky-200">
      활성
    </Badge>
  ) : (
    <Badge variant="outline" className="text-xs bg-gray-50 text-gray-600 border-gray-200">
      비활성
    </Badge>
  );
}
