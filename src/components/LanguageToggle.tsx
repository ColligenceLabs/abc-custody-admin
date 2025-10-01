'use client'

import { GlobeAltIcon } from '@heroicons/react/24/outline'
import { useLanguage } from '@/contexts/LanguageContext'

export default function LanguageToggle() {
  const { language, toggleLanguage } = useLanguage()

  const handleLanguageSelect = (langCode: 'ko' | 'en') => {
    if (language !== langCode) {
      toggleLanguage()
    }
  }

  return (
    <div className="flex items-center space-x-1">
      <GlobeAltIcon className="h-4 w-4 text-gray-500" />
      <div className="flex items-center">
        <button
          onClick={() => handleLanguageSelect('ko')}
          className={`px-1 py-0.5 text-xs transition-colors ${
            language === 'ko' 
              ? 'font-bold text-gray-900' 
              : 'font-normal text-gray-500 hover:text-gray-700'
          }`}
        >
          KO
        </button>
        <button
          onClick={() => handleLanguageSelect('en')}
          className={`px-1 py-0.5 text-xs transition-colors ${
            language === 'en' 
              ? 'font-bold text-gray-900' 
              : 'font-normal text-gray-500 hover:text-gray-700'
          }`}
        >
          EN
        </button>
      </div>
    </div>
  )
}