'use client'

import { BuildingOfficeIcon, UserIcon, GiftIcon, CheckIcon } from '@heroicons/react/24/outline'
import { ServicePlan } from '@/app/page'
import { useLanguage } from '@/contexts/LanguageContext'

interface ServicePlanSelectorProps {
  onSelectPlan: (plan: ServicePlan) => void
}

export default function ServicePlanSelector({ onSelectPlan }: ServicePlanSelectorProps) {
  const { t } = useLanguage()
  const plans = [
    {
      id: 'enterprise' as const,
      name: t('plan.enterprise.name'),
      target: t('plan.enterprise.target'),
      icon: BuildingOfficeIcon,
      keyManagement: t('plan.enterprise.key_management'),
      color: 'primary',
      features: [
        t('plan.enterprise.features.0'),
        t('plan.enterprise.features.1'),
        t('plan.enterprise.features.2'),
        t('plan.enterprise.features.3'),
        t('plan.enterprise.features.4'),
        t('plan.enterprise.features.5'),
        t('plan.enterprise.features.6')
      ],
      pricing: t('plan.enterprise.pricing')
    },
    {
      id: 'premium' as const,
      name: t('plan.premium.name'),
      target: t('plan.premium.target'),
      icon: UserIcon,
      keyManagement: t('plan.premium.key_management'),
      color: 'purple',
      features: [
        t('plan.premium.features.0'),
        t('plan.premium.features.1'),
        t('plan.premium.features.2'),
        t('plan.premium.features.3'),
        t('plan.premium.features.4'),
        t('plan.premium.features.5')
      ],
      pricing: t('plan.premium.pricing')
    },
    {
      id: 'free' as const,
      name: t('plan.free.name'),
      target: t('plan.free.target'),
      icon: GiftIcon,
      keyManagement: t('plan.free.key_management'),
      color: 'sky',
      features: [
        t('plan.free.features.0'),
        t('plan.free.features.1'),
        t('plan.free.features.2'),
        t('plan.free.features.3')
      ],
      pricing: t('plan.free.pricing')
    }
  ]

  const getCardStyles = (color: string) => {
    const styles = {
      primary: 'border-primary-200 hover:border-primary-300 hover:shadow-primary-100',
      purple: 'border-purple-200 hover:border-purple-300 hover:shadow-purple-100',
      sky: 'border-sky-200 hover:border-sky-300 hover:shadow-sky-100'
    }
    return styles[color as keyof typeof styles] || styles.primary
  }

  const getIconStyles = (color: string) => {
    const styles = {
      primary: 'text-primary-600 bg-primary-50',
      purple: 'text-purple-600 bg-purple-50',
      sky: 'text-sky-600 bg-sky-50'
    }
    return styles[color as keyof typeof styles] || styles.primary
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          {t('selector.title')}
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          {t('selector.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {plans.map((plan) => {
          const Icon = plan.icon
          return (
            <div
              key={plan.id}
              className={`bg-white rounded-xl shadow-lg border-2 transition-all duration-300 cursor-pointer transform hover:-translate-y-1 ${getCardStyles(plan.color)}`}
              onClick={() => onSelectPlan(plan.id)}
            >
              <div className="p-8">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 ${getIconStyles(plan.color)}`}>
                  <Icon className="h-8 w-8" />
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {plan.name}
                </h3>
                
                <p className="text-gray-600 mb-4">
                  {plan.target}
                </p>
                
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <p className="text-sm font-semibold text-gray-700 mb-1">{t('selector.key_management')}</p>
                  <p className="text-gray-900">{plan.keyManagement}</p>
                </div>
                
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">{t('selector.main_features')}</h4>
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <CheckIcon className="h-5 w-5 text-sky-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="border-t pt-4">
                  <p className="text-sm font-semibold text-gray-700 mb-1">{t('selector.pricing')}</p>
                  <p className="text-gray-900">{plan.pricing}</p>
                </div>
                
                <button className={`w-full mt-6 py-3 px-6 rounded-lg font-semibold transition-colors ${
                  plan.color === 'primary' 
                    ? 'bg-primary-600 hover:bg-primary-700 text-white' 
                    : plan.color === 'purple'
                    ? 'bg-purple-600 hover:bg-purple-700 text-white'
                    : 'bg-sky-600 hover:bg-sky-700 text-white'
                }`}>
                  {plan.name} {t('selector.select_plan')}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}