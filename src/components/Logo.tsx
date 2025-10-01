import { useLanguage } from '@/contexts/LanguageContext';
import { useCompany } from '@/contexts/CompanyContext';

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function Logo({ className = '', showText = true, size = 'md' }: LogoProps) {
  const { t } = useLanguage();
  const { companySettings } = useCompany();

  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-9 w-9',
    lg: 'h-12 w-12'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-xl',
    lg: 'text-2xl'
  };

  // 회사 설정에서 브랜딩 정보 가져오기
  const companyName = companySettings.companyName || t('header.title');
  const companySubtitle = companySettings.companySubtitle || '';
  const logoUrl = companySettings.logoUrl;
  const logoText = companySettings.logoText || (companySettings.companyName ? companySettings.companyName.charAt(0) : t('header.title').charAt(0));

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {/* 로고 이미지 또는 기본 아이콘 */}
      <div className={`${sizeClasses[size]} relative flex-shrink-0`}>
        {logoUrl ? (
          <img
            src={logoUrl}
            alt={`${companyName} 로고`}
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="w-full h-full bg-primary-600 rounded flex items-center justify-center text-white font-bold">
            <span className={size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-lg'}>
              {logoText}
            </span>
          </div>
        )}
      </div>

      {showText && (
        <div>
          <h1 className={`${textSizeClasses[size]} font-bold text-gray-900 leading-tight`}>
            {companyName}
          </h1>
          {size !== 'sm' && companySubtitle && companySubtitle.trim() && (
            <p className="text-sm text-gray-600 leading-tight">
              {companySubtitle}
            </p>
          )}
        </div>
      )}
    </div>
  );
}