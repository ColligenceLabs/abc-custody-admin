"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export type Language = "ko" | "en";

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

interface LanguageProviderProps {
  children: ReactNode;
}

const translations = {
  ko: {
    // Header
    "header.title": "ABC Custody",
    "header.subtitle": "디지털 자산 커스터디 서비스",
    "header.admin": "admin@custody.co.kr",

    // Service Plans
    "plan.enterprise.name": "기업용 커스터디",
    "plan.premium.name": "프리미엄 개인용",
    "plan.free.name": "개인용 (Free)",
    "plan.default.name": "커스터디 서비스",
    "plan.active": "활성 플랜",

    // Menu Items
    "menu.overview": "대시보드",
    "menu.transactions": "거래 내역",
    "menu.users": "사용자 관리",
    "menu.services": "부가 서비스",
    "menu.security": "보안 설정",

    // Footer
    "footer.mpc_security": "MPC 기반 보안",
    "footer.connected": "● 연결됨",

    // Asset Overview
    "overview.title": "대시보드",
    "overview.subtitle": "디지털 자산 현황과 포트폴리오를 한눈에 확인하세요",
    "overview.hide_balance": "잔액 숨김",
    "overview.show_balance": "잔액 표시",
    "overview.total_asset_value": "총 자산 가치",
    "overview.daily_change": "24시간 변동",
    "overview.asset_types": "보유 자산 종류",
    "overview.asset_types_count": "개",
    "overview.mpc_status": "MPC 상태",
    "overview.status_normal": "정상",
    "overview.price_trend": "자산 가치",
    "overview.asset_distribution": "자산 구성",
    "overview.holdings": "보유 자산",
    "overview.asset": "자산",
    "overview.balance": "잔액",
    "overview.value_krw": "가치 (KRW)",
    "overview.change_24h": "24시간 변동",
    "overview.current_price": "현재시세",
    "overview.total_holdings": "총 보유수량",
    "overview.percentage": "비중",
    "overview.months.jan": "1월",
    "overview.months.feb": "2월",
    "overview.months.mar": "3월",
    "overview.months.apr": "4월",
    "overview.months.may": "5월",
    "overview.months.jun": "6월",
    "overview.months.jul": "7월",
    "overview.months.aug": "8월",
    "overview.months.sep": "9월",

    // Service Plan Selector
    "selector.title": "커스터디 서비스 플랜 선택",
    "selector.subtitle":
      "MPC 기반 보안 강화와 Off-chain UI를 통한 차세대 디지털 자산 커스터디 플랫폼",
    "selector.key_management": "키 관리 방식",
    "selector.main_features": "주요 기능",
    "selector.pricing": "요금제",
    "selector.select_plan": "선택",

    // Plan Details
    "plan.enterprise.target": "법인 고객 (VC, 거래소, 기업 등)",
    "plan.enterprise.key_management": "Blockdaemon MPC",
    "plan.enterprise.pricing": "월 사용료 + 거래 수수료",
    "plan.enterprise.features.0": "키 분산 저장",
    "plan.enterprise.features.1": "다중 승인",
    "plan.enterprise.features.2": "감사 대응",
    "plan.enterprise.features.3": "대출 서비스",
    "plan.enterprise.features.4": "원화 출금",
    "plan.enterprise.features.5": "외부 감사 대응",
    "plan.enterprise.features.6": "전용 포털 (웹)",

    "plan.premium.target": "고액 자산 보유 개인",
    "plan.premium.key_management": "Blockdaemon MPC",
    "plan.premium.pricing": "월 구독료 + 서비스 수수료",
    "plan.premium.features.0": "정책 기반 출금",
    "plan.premium.features.1": "트랜잭션 정책 설정",
    "plan.premium.features.2": "대출 서비스",
    "plan.premium.features.3": "OTC 연동",
    "plan.premium.features.4": "세무 리포트",
    "plan.premium.features.5": "모바일/웹 포털",

    "plan.free.target": "일반 유저",
    "plan.free.key_management": "자체 MPC",
    "plan.free.pricing": "무료 (교환 수수료만 적용)",
    "plan.free.features.0": "기본 자산 보관/출금",
    "plan.free.features.1": "2FA 보안",
    "plan.free.features.2": "간편 교환",
    "plan.free.features.3": "모바일/웹 포털",

    // Transaction History
    "transactions.title": "거래 내역",
    "transactions.subtitle": "모든 거래 기록을 확인하고 관리하세요",
    "transactions.download": "내역 다운로드",
    "transactions.search_placeholder": "거래 검색...",
    "transactions.filter_all_types": "모든 유형",
    "transactions.filter_all_status": "모든 상태",
    "transactions.no_results": "조건에 맞는 거래 내역이 없습니다.",

    // Transaction Types
    "transaction.type.deposit": "입금",
    "transaction.type.withdrawal": "출금",
    "transaction.type.swap": "교환",
    "transaction.type.lending": "대출",
    "transaction.type.staking": "스테이킹",

    // Transaction Status
    "transaction.status.completed": "완료",
    "transaction.status.pending": "처리중",
    "transaction.status.failed": "실패",

    // Table Headers
    "transactions.table.type": "유형",
    "transactions.table.asset": "자산",
    "transactions.table.amount": "수량",
    "transactions.table.value": "가치 (KRW)",
    "transactions.table.status": "상태",
    "transactions.table.time": "시간",
    "transactions.table.details": "Details",

    // User Management
    "users.title": "사용자 관리",
    "users.subtitle": "RBAC 기반 권한 관리 및 다중 승인 설정",
    "users.add_user": "사용자 추가",
    "users.search_placeholder": "사용자 검색...",
    "users.filter_all_roles": "모든 역할",
    "users.no_results": "조건에 맞는 사용자가 없습니다.",
    "users.not_available":
      "이 기능은 프리미엄 또는 기업용 플랜에서 사용할 수 있습니다.",

    // User Stats
    "users.stats.total": "전체 사용자",
    "users.stats.active": "활성 사용자",
    "users.stats.admins": "관리자",
    "users.stats.pending": "승인 대기",

    // User Roles
    "user.role.admin": "관리자",
    "user.role.manager": "매니저",
    "user.role.viewer": "조회자",
    "user.role.approver": "승인자",

    // User Status
    "user.status.active": "활성",
    "user.status.inactive": "비활성",
    "user.status.pending": "대기",

    // User Table Headers
    "users.table.user": "사용자",
    "users.table.role": "역할",
    "users.table.status": "상태",
    "users.table.permissions": "권한",
    "users.table.last_login": "마지막 로그인",
    "users.table.actions": "작업",

    // User Permissions
    "permission.all": "모든 권한",
    "permission.view_assets": "자산 조회",
    "permission.approve_transactions": "거래 승인",
    "permission.manage_users": "사용자 관리",
    "permission.view_transactions": "거래 내역 조회",
    "permission.set_policies": "정책 설정",

    // Multi-approval Settings
    "approval.title": "다중 승인 설정",
    "approval.transaction_policy": "거래 승인 정책",
    "approval.over_10m": "1,000만원 이상 거래 시 2인 승인",
    "approval.new_address": "신규 주소로의 출금 시 관리자 승인",
    "approval.all_transactions": "모든 거래에 대해 이중 승인",
    "approval.ip_restrictions": "IP 및 지역 제한",
    "approval.allowed_ip_only": "허용된 IP에서만 접근 가능",
    "approval.block_vpn": "VPN 차단",
    "approval.block_countries": "특정 국가 차단",

    // Common
    "common.loading": "로딩 중...",
    "common.error": "오류가 발생했습니다",
  },
  en: {
    // Header
    "header.title": "ABC Custody",
    "header.subtitle": "Digital Asset Custody Service",
    "header.admin": "admin@custody.co.kr",

    // Service Plans
    "plan.enterprise.name": "Enterprise Custody",
    "plan.premium.name": "Premium Personal",
    "plan.free.name": "Personal (Free)",
    "plan.default.name": "Custody Service",
    "plan.active": "Active Plan",

    // Menu Items
    "menu.overview": "Dashboard",
    "menu.transactions": "Transaction History",
    "menu.users": "User Management",
    "menu.services": "Additional Services",
    "menu.security": "Security Settings",

    // Footer
    "footer.mpc_security": "MPC-based Security",
    "footer.connected": "● Connected",

    // Asset Overview
    "overview.title": "Dashboard",
    "overview.subtitle":
      "Monitor your digital assets and portfolio at a glance",
    "overview.hide_balance": "Hide Balance",
    "overview.show_balance": "Show Balance",
    "overview.total_asset_value": "Total Asset Value",
    "overview.daily_change": "24h Change",
    "overview.asset_types": "Asset Types",
    "overview.asset_types_count": " assets",
    "overview.mpc_status": "MPC Status",
    "overview.status_normal": "Normal",
    "overview.price_trend": "Asset Value",
    "overview.asset_distribution": "Asset Distribution",
    "overview.holdings": "Holdings",
    "overview.asset": "Asset",
    "overview.balance": "Balance",
    "overview.value_krw": "Value (KRW)",
    "overview.change_24h": "24h Change",
    "overview.current_price": "Current Price",
    "overview.total_holdings": "Total Holdings",
    "overview.percentage": "Percentage",
    "overview.months.jan": "Jan",
    "overview.months.feb": "Feb",
    "overview.months.mar": "Mar",
    "overview.months.apr": "Apr",
    "overview.months.may": "May",
    "overview.months.jun": "Jun",
    "overview.months.jul": "Jul",
    "overview.months.aug": "Aug",
    "overview.months.sep": "Sep",

    // Service Plan Selector
    "selector.title": "Choose Your Custody Service Plan",
    "selector.subtitle":
      "Next-generation digital asset custody platform with MPC-based security enhancement and Off-chain UI",
    "selector.key_management": "Key Management Method",
    "selector.main_features": "Key Features",
    "selector.pricing": "Pricing",
    "selector.select_plan": "Select",

    // Plan Details
    "plan.enterprise.target": "Corporate Clients (VCs, Exchanges, Companies)",
    "plan.enterprise.key_management": "Blockdaemon MPC",
    "plan.enterprise.pricing": "Monthly Fee + Transaction Fees",
    "plan.enterprise.features.0": "Distributed Key Storage",
    "plan.enterprise.features.1": "Multi-signature Approval",
    "plan.enterprise.features.2": "Audit Support",
    "plan.enterprise.features.3": "Lending Service",
    "plan.enterprise.features.4": "KRW Withdrawal",
    "plan.enterprise.features.5": "External Audit Support",
    "plan.enterprise.features.6": "Dedicated Portal (Web)",

    "plan.premium.target": "High Net Worth Individuals",
    "plan.premium.key_management": "Blockdaemon MPC",
    "plan.premium.pricing": "Monthly Subscription + Service Fees",
    "plan.premium.features.0": "Policy-based Withdrawal",
    "plan.premium.features.1": "Transaction Policy Settings",
    "plan.premium.features.2": "Lending Service",
    "plan.premium.features.3": "OTC Integration",
    "plan.premium.features.4": "Tax Reports",
    "plan.premium.features.5": "Mobile/Web Portal",

    "plan.free.target": "General Users",
    "plan.free.key_management": "Self MPC",
    "plan.free.pricing": "Free (Exchange fees only)",
    "plan.free.features.0": "Basic Asset Storage/Withdrawal",
    "plan.free.features.1": "2FA Security",
    "plan.free.features.2": "Simple Exchange",
    "plan.free.features.3": "Mobile/Web Portal",

    // Transaction History
    "transactions.title": "Transaction History",
    "transactions.subtitle": "View and manage all transaction records",
    "transactions.download": "Download History",
    "transactions.search_placeholder": "Search transactions...",
    "transactions.filter_all_types": "All Types",
    "transactions.filter_all_status": "All Status",
    "transactions.no_results": "No transactions match the criteria.",

    // Transaction Types
    "transaction.type.deposit": "Deposit",
    "transaction.type.withdrawal": "Withdrawal",
    "transaction.type.swap": "Swap",
    "transaction.type.lending": "Lending",
    "transaction.type.staking": "Staking",

    // Transaction Status
    "transaction.status.completed": "Completed",
    "transaction.status.pending": "Pending",
    "transaction.status.failed": "Failed",

    // Table Headers
    "transactions.table.type": "Type",
    "transactions.table.asset": "Asset",
    "transactions.table.amount": "Amount",
    "transactions.table.value": "Value (KRW)",
    "transactions.table.status": "Status",
    "transactions.table.time": "Time",
    "transactions.table.details": "Details",

    // User Management
    "users.title": "User Management",
    "users.subtitle":
      "RBAC-based permission management and multi-approval settings",
    "users.add_user": "Add User",
    "users.search_placeholder": "Search users...",
    "users.filter_all_roles": "All Roles",
    "users.no_results": "No users match the criteria.",
    "users.not_available":
      "This feature is available in Premium or Enterprise plans.",

    // User Stats
    "users.stats.total": "Total Users",
    "users.stats.active": "Active Users",
    "users.stats.admins": "Administrators",
    "users.stats.pending": "Pending Approval",

    // User Roles
    "user.role.admin": "Administrator",
    "user.role.manager": "Manager",
    "user.role.viewer": "Viewer",
    "user.role.approver": "Approver",

    // User Status
    "user.status.active": "Active",
    "user.status.inactive": "Inactive",
    "user.status.pending": "Pending",

    // User Table Headers
    "users.table.user": "User",
    "users.table.role": "Role",
    "users.table.status": "Status",
    "users.table.permissions": "Permissions",
    "users.table.last_login": "Last Login",
    "users.table.actions": "Actions",

    // User Permissions
    "permission.all": "All Permissions",
    "permission.view_assets": "View Assets",
    "permission.approve_transactions": "Approve Transactions",
    "permission.manage_users": "Manage Users",
    "permission.view_transactions": "View Transaction History",
    "permission.set_policies": "Set Policies",

    // Multi-approval Settings
    "approval.title": "Multi-approval Settings",
    "approval.transaction_policy": "Transaction Approval Policy",
    "approval.over_10m": "Require 2 approvals for transactions over 10M KRW",
    "approval.new_address":
      "Require admin approval for new address withdrawals",
    "approval.all_transactions": "Require dual approval for all transactions",
    "approval.ip_restrictions": "IP and Geographic Restrictions",
    "approval.allowed_ip_only": "Allow access only from approved IPs",
    "approval.block_vpn": "Block VPN",
    "approval.block_countries": "Block specific countries",

    // Common
    "common.loading": "Loading...",
    "common.error": "An error occurred",
  },
};

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguage] = useState<Language>("ko");

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "ko" ? "en" : "ko"));
  };

  const t = (key: string): string => {
    return (
      translations[language][key as keyof (typeof translations)["ko"]] || key
    );
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
