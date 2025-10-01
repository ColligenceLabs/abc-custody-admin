import type { Metadata } from "next";
import "./globals.css";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ServicePlanProvider } from "@/contexts/ServicePlanContext";
import { SidebarProvider } from "@/contexts/SidebarContext";
import { SecurityPolicyProvider } from "@/contexts/SecurityPolicyContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { CompanyProvider } from "@/contexts/CompanyContext";
import ErrorBoundary from "@/components/ErrorBoundary";
import ErrorGuard from "@/components/ErrorGuard";
import MetaMaskErrorHandler from "@/components/MetaMaskErrorHandler";
import Script from "next/script";
import dynamic from "next/dynamic";

// 클라이언트에서만 실행되는 에러 억제 컴포넌트
const UltimateErrorSuppression = dynamic(
  () =>
    import("@/utils/ultimateErrorSuppression").then(() => {
      // 컴포넌트 대신 즉시 실행하는 더미 컴포넌트 반환
      return () => null;
    }),
  { ssr: false }
);

export const metadata: Metadata = {
  title: "ABC Custody - 커스터디 서비스",
  description: "기업용/개인용 디지털 자산 커스터디 플랫폼",
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
      </head>
      <body>
        <Script id="error-suppression" strategy="beforeInteractive">
          {`
            if (typeof window !== 'undefined') {
              // 모든 console 메서드 오버라이드
              const originalError = console.error;
              const originalWarn = console.warn;
              const originalLog = console.log;
              const originalInfo = console.info;

              const isMetaMaskMessage = (message) => {
                return message.includes('Minified React error') ||
                       message.includes('inpage.js') ||
                       message.includes('runtime.lastError') ||
                       message.includes('chrome-extension') ||
                       message.includes('MetaMask') ||
                       message.includes('Receiving end does not exist') ||
                       message.includes('Could not establish connection') ||
                       message.includes('Unchecked runtime.lastError');
              };

              console.error = (...args) => {
                const message = args.join(' ');
                if (!isMetaMaskMessage(message)) {
                  originalError.apply(console, args);
                }
              };

              console.warn = (...args) => {
                const message = args.join(' ');
                if (!isMetaMaskMessage(message)) {
                  originalWarn.apply(console, args);
                }
              };

              console.log = (...args) => {
                const message = args.join(' ');
                if (!isMetaMaskMessage(message)) {
                  originalLog.apply(console, args);
                }
              };

              console.info = (...args) => {
                const message = args.join(' ');
                if (!isMetaMaskMessage(message)) {
                  originalInfo.apply(console, args);
                }
              };

              // 더 강력한 에러 이벤트 차단
              const blockError = (e) => {
                const message = e.message || e.error?.message || e.reason?.message || '';
                if (isMetaMaskMessage(message) ||
                    e.filename?.includes('chrome-extension') ||
                    e.filename?.includes('inpage.js')) {
                  e.preventDefault();
                  e.stopPropagation();
                  e.stopImmediatePropagation();
                  return false;
                }
              };

              window.addEventListener('error', blockError, { capture: true, passive: false });
              window.addEventListener('unhandledrejection', blockError, { capture: true, passive: false });

              // DOM ready 후 추가 설정
              document.addEventListener('DOMContentLoaded', () => {
                // 모든 iframe에도 에러 차단 적용
                const frames = document.querySelectorAll('iframe');
                frames.forEach(frame => {
                  try {
                    frame.contentWindow?.addEventListener?.('error', blockError, true);
                  } catch (e) {
                    // Cross-origin iframe 무시
                  }
                });
              });
            }
          `}
        </Script>
        <ErrorBoundary>
          <ErrorGuard>
            <UltimateErrorSuppression />
            <MetaMaskErrorHandler />
            <LanguageProvider>
              <SecurityPolicyProvider>
                <AuthProvider>
                  <CompanyProvider>
                    <ServicePlanProvider>
                      <SidebarProvider>{children}</SidebarProvider>
                    </ServicePlanProvider>
                  </CompanyProvider>
                </AuthProvider>
              </SecurityPolicyProvider>
            </LanguageProvider>
          </ErrorGuard>
        </ErrorBoundary>
      </body>
    </html>
  );
}
