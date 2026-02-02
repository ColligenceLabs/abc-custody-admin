'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
// import { useAdminPermissions } from '@/hooks/useAdminPermissions';
import { AdminResource, AdminAction } from '@/types/admin';

import {
  LayoutDashboard,
  Building2,
  ArrowDownUp,
  ArrowUp,
  ArrowDown,
  Vault,
  Shield,
  FileText,
  Settings,
  UserPlus,
  Users,
  User,
  ChevronDown,
  ChevronRight,
  Badge as BadgeIcon,
  QrCode,
  Activity,
  TrendingUp,
  FileSignature,
  CheckSquare,
  AlertTriangle,
  Coins,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';

interface AdminMenuItem {
  id: string;
  label: string;
  href: string;
  icon: React.ComponentType<any>;
  requiredPermissions: {
    resource: AdminResource;
    action: AdminAction;
  }[];
  children?: AdminMenuItem[];
  badge?: {
    count: number;
    variant: 'default' | 'secondary' | 'destructive' | 'outline';
  };
}

const ADMIN_MENU_ITEMS: AdminMenuItem[] = [
  {
    id: 'dashboard',
    label: '대시보드',
    href: '/admin/dashboard',
    icon: LayoutDashboard,
    requiredPermissions: [{ resource: AdminResource.VAULT, action: AdminAction.READ }],
  },
  {
    id: 'members',
    label: '회원 관리',
    href: '/admin/members',
    icon: Building2,
    requiredPermissions: [{ resource: AdminResource.MEMBERS, action: AdminAction.READ }],
    children: [
      // {
      //   id: 'members-onboarding',
      //   label: '온보딩 관리',
      //   href: '/admin/members/onboarding',
      //   icon: UserPlus,
      //   requiredPermissions: [{ resource: AdminResource.MEMBERS, action: AdminAction.APPROVE }],
      // },
      {
        id: 'members-onboarding-aml-individual',
        label: '개인회원',
        href: '/admin/members/onboarding-aml/individual',
        icon: User,
        requiredPermissions: [{ resource: AdminResource.COMPLIANCE, action: AdminAction.READ }],
      },
      {
        id: 'members-onboarding-aml-corporate',
        label: '법인회원',
        href: '/admin/members/onboarding-aml/corporate',
        icon: Building2,
        requiredPermissions: [{ resource: AdminResource.COMPLIANCE, action: AdminAction.READ }],
      },
      {
        id: 'members-onboarding-aml-monitoring',
        label: '모니터링',
        href: '/admin/members/onboarding-aml/monitoring',
        icon: Activity,
        requiredPermissions: [{ resource: AdminResource.COMPLIANCE, action: AdminAction.READ }],
      },
    ],
  },
  {
    id: 'deposits',
    label: '입금 관리',
    href: '/admin/deposits',
    icon: ArrowDown,
    requiredPermissions: [{ resource: AdminResource.DEPOSITS, action: AdminAction.READ }],
    children: [
      {
        id: 'deposits-monitoring',
        label: '입금 모니터링',
        href: '/admin/deposits/monitoring',
        icon: ArrowDown,
        requiredPermissions: [{ resource: AdminResource.DEPOSITS, action: AdminAction.READ }],
      },
      {
        id: 'deposits-returns',
        label: '환불 처리',
        href: '/admin/deposits/returns',
        icon: ArrowDownUp,
        requiredPermissions: [{ resource: AdminResource.DEPOSITS, action: AdminAction.UPDATE }],
      },
    ],
  },
  // {
  //   id: 'withdrawals',
  //   label: '출금 관리',
  //   href: '/admin/withdrawals',
  //   icon: ArrowUp,
  //   requiredPermissions: [{ resource: AdminResource.WITHDRAWALS, action: AdminAction.READ }],
  //   badge: { count: 8, variant: 'default' },
  //   children: [
  //     {
  //       id: 'withdrawals-queue',
  //       label: '출금 대기열',
  //       href: '/admin/withdrawals/queue',
  //       icon: ArrowUp,
  //       requiredPermissions: [{ resource: AdminResource.WITHDRAWALS, action: AdminAction.UPDATE }],
  //       badge: { count: 8, variant: 'default' },
  //     },
  //     {
  //       id: 'withdrawals-aml',
  //       label: 'AML 검토',
  //       href: '/admin/withdrawals/aml',
  //       icon: Shield,
  //       requiredPermissions: [{ resource: AdminResource.COMPLIANCE, action: AdminAction.APPROVE }],
  //     },
  //     {
  //       id: 'withdrawals-airgap',
  //       label: 'Air-gap 서명',
  //       href: '/admin/withdrawals/airgap',
  //       icon: QrCode,
  //       requiredPermissions: [{ resource: AdminResource.WITHDRAWALS, action: AdminAction.APPROVE }],
  //       badge: { count: 2, variant: 'secondary' },
  //     },
  //     {
  //       id: 'withdrawals-execution',
  //       label: '출금 실행',
  //       href: '/admin/withdrawals/execution',
  //       icon: Activity,
  //       requiredPermissions: [{ resource: AdminResource.WITHDRAWALS, action: AdminAction.READ }],
  //     },
  //   ],
  // },
  {
    id: 'withdrawal-v2',
    label: '출금 관리',
    href: '/admin/withdrawal-v2',
    icon: ArrowUp,
    requiredPermissions: [{ resource: AdminResource.WITHDRAWALS, action: AdminAction.READ }],
    children: [
      {
        id: 'withdrawal-v2-requests',
        label: '출금 모니터링',
        href: '/admin/withdrawal-v2/requests',
        icon: Activity,
        requiredPermissions: [{ resource: AdminResource.WITHDRAWALS, action: AdminAction.UPDATE }],
      },
    ],
  },
  // {
  //   id: 'compliance',
  //   label: '컴플라이언스',
  //   href: '/admin/compliance',
  //   icon: Shield,
  //   requiredPermissions: [{ resource: AdminResource.COMPLIANCE, action: AdminAction.READ }],
  //   children: [
  //     {
  //       id: 'compliance-reports',
  //       label: '규제 보고서',
  //       href: '/admin/compliance/reports',
  //       icon: FileText,
  //       requiredPermissions: [{ resource: AdminResource.COMPLIANCE, action: AdminAction.READ }],
  //     },
  //     {
  //       id: 'compliance-policies',
  //       label: 'AML 정책',
  //       href: '/admin/compliance/policies',
  //       icon: Settings,
  //       requiredPermissions: [{ resource: AdminResource.COMPLIANCE, action: AdminAction.UPDATE }],
  //     },
  //   ],
  // },
  // {
  //   id: 'reports',
  //   label: '보고서',
  //   href: '/admin/reports',
  //   icon: FileText,
  //   requiredPermissions: [{ resource: AdminResource.REPORTS, action: AdminAction.READ }],
  // },
  {
    id: 'lending',
    label: '대출 관리',
    href: '/admin/lending',
    icon: TrendingUp,
    requiredPermissions: [{ resource: AdminResource.VAULT, action: AdminAction.READ }],
    children: [
      // {
      //   id: 'lending-dashboard',
      //   label: '대출 대시보드',
      //   href: '/admin/lending/dashboard',
      //   icon: LayoutDashboard,
      //   requiredPermissions: [{ resource: AdminResource.VAULT, action: AdminAction.READ }],
      // },
      {
        id: 'lending-loans',
        label: '대출 목록',
        href: '/admin/lending/loans',
        icon: FileText,
        requiredPermissions: [{ resource: AdminResource.VAULT, action: AdminAction.READ }],
      },
      {
        id: 'lending-liquidation',
        label: '청산 관리',
        href: '/admin/lending/liquidation',
        icon: AlertTriangle,
        requiredPermissions: [{ resource: AdminResource.VAULT, action: AdminAction.READ }],
      },
      {
        id: 'lending-liquidation-history',
        label: '청산 내역',
        href: '/admin/lending/liquidation-history',
        icon: CheckSquare,
        requiredPermissions: [{ resource: AdminResource.VAULT, action: AdminAction.READ }],
      },
      {
        id: 'lending-products',
        label: '상품 관리',
        href: '/admin/lending/products',
        icon: BadgeIcon,
        requiredPermissions: [{ resource: AdminResource.VAULT, action: AdminAction.READ }],
      },
    ],
  },
  {
    id: 'audit-reports',
    label: '감사 및 리포트',
    href: '/admin/audit-reports',
    icon: FileText,
    requiredPermissions: [{ resource: AdminResource.VAULT, action: AdminAction.READ }],
    children: [
      {
        id: 'audit-dashboard',
        label: '감사 대시보드',
        href: '/admin/audit-reports',
        icon: Activity,
        requiredPermissions: [{ resource: AdminResource.VAULT, action: AdminAction.READ }],
      },
      {
        id: 'audit-logs',
        label: '감사 로그',
        href: '/admin/audit-reports/audit-logs',
        icon: FileSignature,
        requiredPermissions: [{ resource: AdminResource.VAULT, action: AdminAction.READ }],
      },
    ],
  },
  {
    id: 'system',
    label: '시스템 관리',
    href: '/admin/system',
    icon: Settings,
    requiredPermissions: [{ resource: AdminResource.ADMIN_USERS, action: AdminAction.READ }],
    children: [
      {
        id: 'system-admins',
        label: '관리자 계정',
        href: '/admin/system/admins',
        icon: Users,
        requiredPermissions: [{ resource: AdminResource.ADMIN_USERS, action: AdminAction.READ }],
      },
      {
        id: 'system-assets',
        label: '자산 관리',
        href: '/admin/system/assets',
        icon: Coins,
        requiredPermissions: [{ resource: AdminResource.VAULT, action: AdminAction.READ }],
      },
      {
        id: 'system-terms',
        label: '약관 관리',
        href: '/admin/system/terms',
        icon: FileText,
        requiredPermissions: [{ resource: AdminResource.ADMIN_USERS, action: AdminAction.READ }],
      },
    ],
  },
];

interface AdminSidebarProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function AdminSidebar({ collapsed = false, onToggleCollapse }: AdminSidebarProps) {
  const pathname = usePathname();
  // const { hasPermission, hasAnyPermission } = useAdminPermissions();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const hasRequiredPermissions = (requiredPermissions: { resource: AdminResource; action: AdminAction }[]) => {
    // return hasAnyPermission(requiredPermissions);
    return true; // 임시로 모든 권한 허용
  };

  const isActive = (href: string) => {
    if (href === '/admin/dashboard') {
      return pathname === '/admin/dashboard' || pathname === '/admin';
    }
    return pathname.startsWith(href);
  };

  const renderMenuItem = (item: AdminMenuItem, isChild = false) => {
    // Check permissions
    if (!hasRequiredPermissions(item.requiredPermissions)) {
      return null;
    }

    const active = isActive(item.href);
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.id);

    // Filter children based on permissions
    const visibleChildren = item.children?.filter(child =>
      hasRequiredPermissions(child.requiredPermissions)
    ) || [];

    const menuContent = (
      <div
        className={cn(
          'flex items-center justify-between w-full px-3 py-2 rounded-lg transition-all duration-200',
          active
            ? 'text-sapphire-600 font-semibold dark:text-sapphire-400'
            : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100/80 hover:text-gray-900 dark:hover:bg-gray-800/60 dark:hover:text-white',
          isChild ? (active ? 'ml-4 text-sm text-sapphire-600 font-semibold dark:text-sapphire-400' : 'ml-4 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100/60 dark:hover:bg-gray-800/40') : '',
          collapsed && 'justify-center px-2'
        )}
      >
        <div className="flex items-center gap-3">
          <item.icon
            className={cn(
              'flex-shrink-0',
              collapsed ? 'h-5 w-5' : 'h-4 w-4'
            )}
          />
          {!collapsed && (
            <span className="font-medium truncate">
              {item.label}
            </span>
          )}
        </div>

        {!collapsed && (
          <div className="flex items-center gap-2">
            {item.badge && (
              <Badge
                variant={item.badge.variant}
                className="text-xs px-1.5 py-0.5 min-w-[1.25rem] h-5 flex items-center justify-center"
              >
                {item.badge.count > 99 ? '99+' : item.badge.count}
              </Badge>
            )}

            {hasChildren && visibleChildren.length > 0 && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleExpanded(item.id);
                }}
                className={cn(
                  'p-1 rounded transition-transform duration-200',
                  'hover:bg-gray-200 dark:hover:bg-gray-700'
                )}
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
            )}
          </div>
        )}
      </div>
    );

    return (
      <div key={item.id} className="w-full">
        {hasChildren && visibleChildren.length > 0 ? (
          <div>
            <div
              className="cursor-pointer"
              onClick={() => toggleExpanded(item.id)}
            >
              {menuContent}
            </div>

            {!collapsed && isExpanded && (
              <div className="mt-1 space-y-1 pl-2">
                {visibleChildren.map(child => renderMenuItem(child, true))}
              </div>
            )}
          </div>
        ) : (
          <Link href={item.href} className="block">
            {menuContent}
          </Link>
        )}
      </div>
    );
  };

  return (
    <aside
      className={cn(
        'bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo Section */}
      <div className={`flex items-center h-16 ${collapsed ? 'justify-center px-2' : 'px-4'}`}>
        {collapsed ? (
          <img
            src="/logo/ABCcw_logo_symbol.png"
            alt="ABC Logo"
            className="h-5 w-5 object-contain"
          />
        ) : (
          <div className="flex items-center gap-2">
            <img
              src="/logo/ABCcw_logo_symbol.png"
              alt="ABC Logo"
              className="h-6 w-6 object-contain"
            />
            <img
              src="/logo/ABCcw_logo_text.png"
              alt="ABC Custody Wallet"
              className="h-4 w-auto object-contain"
            />
          </div>
        )}
      </div>

      {/* Navigation Menu */}
      <nav className="p-4 flex-1 overflow-y-auto">
        <div className="space-y-2">
          {ADMIN_MENU_ITEMS.map(item => renderMenuItem(item))}
        </div>
      </nav>

    </aside>
  );
}