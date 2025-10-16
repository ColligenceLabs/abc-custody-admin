/**
 * RecentTransactionsTable Component
 *
 * 최근 거래 내역 표시
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowDownToLine, ArrowUpFromLine, ExternalLink } from 'lucide-react';
import CryptoIcon from '@/components/ui/CryptoIcon';
import { RecentTransaction } from '../hooks/useDashboardData';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

interface RecentTransactionsTableProps {
  transactions: RecentTransaction[];
}

export function RecentTransactionsTable({
  transactions,
}: RecentTransactionsTableProps) {
  const getStatusBadge = (status: 'completed' | 'pending' | 'failed') => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-600">완료</Badge>;
      case 'pending':
        return <Badge variant="secondary">대기중</Badge>;
      case 'failed':
        return <Badge variant="destructive">실패</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>최근 거래</CardTitle>
          <Button variant="ghost" size="sm">
            더보기
            <ExternalLink className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {transactions.map((tx) => (
            <div
              key={tx.id}
              className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
            >
              {/* 왼쪽: 타입, 자산, 회원사 */}
              <div className="flex items-center gap-3 flex-1">
                {/* 거래 타입 아이콘 */}
                <div
                  className={`p-2 rounded-full ${
                    tx.type === 'deposit'
                      ? 'bg-green-100 dark:bg-green-900/20'
                      : 'bg-blue-100 dark:bg-blue-900/20'
                  }`}
                >
                  {tx.type === 'deposit' ? (
                    <ArrowDownToLine
                      className={`w-4 h-4 ${
                        tx.type === 'deposit'
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-blue-600 dark:text-blue-400'
                      }`}
                    />
                  ) : (
                    <ArrowUpFromLine className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  )}
                </div>

                {/* 자산 및 정보 */}
                <div className="flex items-center gap-2 flex-1">
                  <CryptoIcon symbol={tx.asset} size={24} />
                  <div>
                    <p className="text-sm font-medium">
                      {tx.amount} {tx.asset}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {tx.memberName}
                    </p>
                  </div>
                </div>
              </div>

              {/* 오른쪽: 상태, 시간 */}
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="mb-1">{getStatusBadge(tx.status)}</div>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(tx.timestamp, {
                      addSuffix: true,
                      locale: ko,
                    })}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
