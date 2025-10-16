/**
 * RecentActivityFeed Component
 *
 * 최근 활동 타임라인
 * 출금 요청, 리밸런싱, 서명 완료 등 최근 이벤트 표시
 */

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, AlertCircle, FileSignature, RefreshCw } from "lucide-react";

interface ActivityEvent {
  id: string;
  type: "withdrawal" | "rebalancing" | "signing" | "alert";
  title: string;
  description: string;
  timestamp: Date;
  status: "success" | "warning" | "info" | "error";
  blockchain?: string;
  amount?: string;
}

interface RecentActivityFeedProps {
  events?: ActivityEvent[];
  maxEvents?: number;
}

export function RecentActivityFeed({
  events,
  maxEvents = 10,
}: RecentActivityFeedProps) {
  // Mock 데이터 (실제로는 props로 전달받음)
  const mockEvents: ActivityEvent[] = [
    {
      id: "evt-001",
      type: "withdrawal",
      title: "출금 요청 승인",
      description: "회원사 Alpha Corp - BTC 0.5 출금 승인 완료",
      timestamp: new Date(Date.now() - 5 * 60000),
      status: "success",
      blockchain: "BITCOIN",
      amount: "0.5 BTC",
    },
    {
      id: "evt-002",
      type: "rebalancing",
      title: "리밸런싱 시작",
      description: "Ethereum 블록체인 Hot → Cold 리밸런싱 시작",
      timestamp: new Date(Date.now() - 15 * 60000),
      status: "info",
      blockchain: "ETHEREUM",
    },
    {
      id: "evt-003",
      type: "signing",
      title: "Air-gap 서명 완료",
      description: "리밸런싱 트랜잭션 서명 완료 (3/3)",
      timestamp: new Date(Date.now() - 30 * 60000),
      status: "success",
      blockchain: "ETHEREUM",
    },
    {
      id: "evt-004",
      type: "alert",
      title: "Hot 잔고 부족 알림",
      description: "Bitcoin Hot 잔고 15% 미만 (현재 12%)",
      timestamp: new Date(Date.now() - 45 * 60000),
      status: "warning",
      blockchain: "BITCOIN",
    },
    {
      id: "evt-005",
      type: "withdrawal",
      title: "출금 AML 검토 통과",
      description: "회원사 Beta Inc - USDT 50,000 AML 검토 통과",
      timestamp: new Date(Date.now() - 60 * 60000),
      status: "success",
      blockchain: "ETHEREUM",
      amount: "50,000 USDT",
    },
  ];

  const displayEvents = (events || mockEvents).slice(0, maxEvents);

  const getEventIcon = (type: ActivityEvent["type"]) => {
    switch (type) {
      case "withdrawal":
        return <CheckCircle className="w-4 h-4" />;
      case "rebalancing":
        return <RefreshCw className="w-4 h-4" />;
      case "signing":
        return <FileSignature className="w-4 h-4" />;
      case "alert":
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: ActivityEvent["status"]) => {
    switch (status) {
      case "success":
        return "text-green-600 dark:text-green-400";
      case "warning":
        return "text-yellow-600 dark:text-yellow-400";
      case "info":
        return "text-blue-600 dark:text-blue-400";
      case "error":
        return "text-red-600 dark:text-red-400";
    }
  };

  const getStatusBadgeVariant = (
    status: ActivityEvent["status"]
  ): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case "success":
        return "default";
      case "warning":
        return "secondary";
      case "info":
        return "outline";
      case "error":
        return "destructive";
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - timestamp.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 1) return "방금 전";
    if (diffMins < 60) return `${diffMins}분 전`;
    if (diffHours < 24) return `${diffHours}시간 전`;
    return timestamp.toLocaleDateString("ko-KR");
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          최근 활동
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          최근 {displayEvents.length}개 이벤트
        </p>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {displayEvents.map((event, index) => (
            <div
              key={event.id}
              className={`flex gap-3 ${
                index !== displayEvents.length - 1 ? "pb-4 border-b" : ""
              }`}
            >
              {/* 아이콘 */}
              <div
                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  event.status === "success"
                    ? "bg-green-100 dark:bg-green-900/20"
                    : event.status === "warning"
                    ? "bg-yellow-100 dark:bg-yellow-900/20"
                    : event.status === "info"
                    ? "bg-blue-100 dark:bg-blue-900/20"
                    : "bg-red-100 dark:bg-red-900/20"
                }`}
              >
                <div className={getStatusColor(event.status)}>
                  {getEventIcon(event.type)}
                </div>
              </div>

              {/* 내용 */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold truncate">
                    {event.title}
                  </p>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatTimestamp(event.timestamp)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {event.description}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  {event.blockchain && (
                    <Badge variant="outline" className="text-xs">
                      {event.blockchain === "BITCOIN" && "Bitcoin"}
                      {event.blockchain === "ETHEREUM" && "Ethereum"}
                      {event.blockchain === "SOLANA" && "Solana"}
                    </Badge>
                  )}
                  {event.amount && (
                    <span className="text-xs font-mono text-muted-foreground">
                      {event.amount}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}

          {displayEvents.length === 0 && (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                최근 활동이 없습니다
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
