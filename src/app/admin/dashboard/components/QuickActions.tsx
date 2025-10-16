/**
 * QuickActions Component
 *
 * 빠른 액션 버튼 그룹
 */

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserPlus, CheckSquare, Vault, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function QuickActions() {
  const router = useRouter();

  const actions = [
    {
      icon: UserPlus,
      label: '회원사 등록',
      description: '새 회원사 등록',
      onClick: () => router.push('/admin/members/onboarding'),
      color: 'text-sapphire-600 dark:text-sapphire-400',
    },
    {
      icon: CheckSquare,
      label: '출금 승인',
      description: '대기 중인 출금 승인',
      onClick: () => router.push('/admin/withdrawal-v2/requests'),
      color: 'text-green-600 dark:text-green-400',
    },
    {
      icon: Vault,
      label: '볼트 모니터링',
      description: '볼트 상태 확인',
      onClick: () => router.push('/admin/withdrawal-v2/monitoring'),
      color: 'text-purple-600 dark:text-purple-400',
    },
    {
      icon: FileText,
      label: '보고서',
      description: '보고서 생성',
      onClick: () => router.push('/admin/reports'),
      color: 'text-orange-600 dark:text-orange-400',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>빠른 액션</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {actions.map((action) => (
            <Button
              key={action.label}
              variant="outline"
              className="h-auto flex-col items-start p-4 hover:border-primary"
              onClick={action.onClick}
            >
              <action.icon className={`w-6 h-6 mb-2 ${action.color}`} />
              <span className="text-sm font-medium">{action.label}</span>
              <span className="text-xs text-muted-foreground mt-1">
                {action.description}
              </span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
