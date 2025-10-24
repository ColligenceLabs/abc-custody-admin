'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  CurrencyDollarIcon,
  EyeIcon,
  EyeSlashIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  BanknotesIcon
} from '@heroicons/react/24/outline'
import { ServicePlan } from '@/app/page'
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Sector } from 'recharts'
import { useLanguage } from '@/contexts/LanguageContext'
import { useAuth } from '@/contexts/AuthContext'
import { PriorityBadge } from './withdrawal/PriorityBadge'
import { StatusBadge } from './withdrawal/StatusBadge'
import { mockWithdrawalRequests } from '@/data/mockWithdrawalData'
import { formatDateTime } from '@/utils/withdrawalHelpers'
import { formatCryptoAmount, formatKRW } from '@/lib/format'
import CryptoIcon from '@/components/ui/CryptoIcon'
import { IndividualWithdrawalRequest } from '@/types/withdrawal'
import { getIndividualWithdrawals } from '@/lib/api/withdrawal'
import { ProcessingTableRow } from './withdrawal/ProcessingTableRow'
import { Balance, AssetData } from '@/types/balance'
import { getUserBalances } from '@/lib/api/balances'
import { CoinPrices, PriceChangeResponse } from '@/types/coinPrice'
import { getCurrentPrices, getPriceChange } from '@/lib/api/coinPrices'
import { Tabs, TabItem } from './common/Tabs'
import { AssetValueData, TimeGranularity } from '@/types/assetValue'
import { getHourlyAssetValues, getDailyAssetValues, getMonthlyAssetValues } from '@/lib/api/assetValues'

interface AssetOverviewProps {
  plan: ServicePlan
}

export default function AssetOverview({ plan }: AssetOverviewProps) {
  const [showBalances, setShowBalances] = useState(true)
  const [selectedAssetIndex, setSelectedAssetIndex] = useState(0)
  const [timePeriod, setTimePeriod] = useState<'hour' | 'day' | 'month'>('month')
  const [ongoingWithdrawals, setOngoingWithdrawals] = useState<IndividualWithdrawalRequest[]>([])
  const [isLoadingWithdrawals, setIsLoadingWithdrawals] = useState(false)
  const [assets, setAssets] = useState<AssetData[]>([])
  const [isLoadingAssets, setIsLoadingAssets] = useState(true)

  // 자산 가치 그래프 관련 state
  const [assetValueData, setAssetValueData] = useState<AssetValueData[]>([])
  const [isLoadingAssetValues, setIsLoadingAssetValues] = useState(false)
  const [activeGranularity, setActiveGranularity] = useState<TimeGranularity>('daily')
  const [dailyPeriod, setDailyPeriod] = useState<number>(30)

  const { t, language } = useLanguage()
  const { user } = useAuth()
  const router = useRouter()

  // 자산별 이름 매핑
  const assetNames: Record<string, string> = {
    BTC: 'Bitcoin',
    ETH: 'Ethereum',
    USDT: 'Tether',
    USDC: 'USD Coin',
    SOL: 'Solana'
  }

  // Filter actual withdrawal requests with withdrawal_request status (pending approval)
  const mockWithdrawalApprovals = mockWithdrawalRequests.filter(request => request.status === 'withdrawal_request')

  // 사용자 자산 잔고 데이터 가져오기 (실시간 가격 포함)
  useEffect(() => {
    const fetchAssets = async () => {
      if (!user?.id) {
        setIsLoadingAssets(false)
        return
      }

      try {
        setIsLoadingAssets(true)

        // 1. 잔고 데이터 가져오기
        const balances = await getUserBalances({ userId: user.id })

        // 2. asset별로 그룹핑
        const assetMap: Record<string, number> = {}

        balances.forEach((balance: Balance) => {
          const asset = balance.asset
          const totalBalance = parseFloat(balance.totalBalance)

          if (assetMap[asset]) {
            assetMap[asset] += totalBalance
          } else {
            assetMap[asset] = totalBalance
          }
        })

        const assetSymbols = Object.keys(assetMap)

        if (assetSymbols.length === 0) {
          setAssets([])
          setIsLoadingAssets(false)
          return
        }

        // 3. 실시간 가격 가져오기
        const [currentPrices, priceChanges] = await Promise.all([
          getCurrentPrices(assetSymbols),
          getPriceChange(24, assetSymbols)
        ])

        // 4. AssetData 형식으로 변환
        const assetData: AssetData[] = Object.entries(assetMap).map(([symbol, balance]) => {
          const priceData = currentPrices[symbol]
          const changeData = priceChanges[symbol]

          const currentPrice = priceData?.priceKRW || 0
          const value = balance * currentPrice

          // changeData에 error가 있으면 0, 아니면 실제 변동률
          const change = changeData && 'krw' in changeData
            ? changeData.krw.changePercent
            : 0

          return {
            symbol,
            name: assetNames[symbol] || symbol,
            balance: balance.toString(),
            value: Math.round(value),
            change,
            currentPrice
          }
        })

        // 가치 순으로 정렬
        assetData.sort((a, b) => b.value - a.value)

        setAssets(assetData)
      } catch (error) {
        console.error('[AssetOverview] 자산 데이터 조회 실패:', error)
        setAssets([])
      } finally {
        setIsLoadingAssets(false)
      }
    }

    fetchAssets()
  }, [user])

  // 진행 중인 출금 데이터 가져오기
  useEffect(() => {
    const fetchOngoingWithdrawals = async () => {
      if (!user?.id || plan !== 'individual') {
        return
      }

      try {
        setIsLoadingWithdrawals(true)

        const { data } = await getIndividualWithdrawals({
          userId: user.id,
          _limit: 100,
          _sort: 'initiatedAt',
          _order: 'desc'
        })

        // 진행 중인 상태만 필터링 (완료/실패/취소 상태 제외)
        const completedStatuses = ['success', 'failed', 'admin_rejected', 'withdrawal_stopped', 'rejected', 'archived', 'cancelled', 'stopped', 'completed']
        const ongoing = data.filter(
          (w: any) => !completedStatuses.includes(w.status)
        )

        setOngoingWithdrawals(ongoing as IndividualWithdrawalRequest[])
      } catch (error) {
        console.error('[AssetOverview] 진행 중인 출금 데이터 조회 실패:', error)
        setOngoingWithdrawals([])
      } finally {
        setIsLoadingWithdrawals(false)
      }
    }

    fetchOngoingWithdrawals()
  }, [user, plan])

  // 자산 가치 데이터 가져오기
  useEffect(() => {
    const fetchAssetValues = async () => {
      if (!user?.id) {
        setIsLoadingAssetValues(false)
        return
      }

      try {
        setIsLoadingAssetValues(true)

        let data: AssetValueData[] = []

        switch (activeGranularity) {
          case 'hourly':
            data = await getHourlyAssetValues(user.id)
            break
          case 'daily':
            data = await getDailyAssetValues(user.id, dailyPeriod)
            break
          case 'monthly':
            data = await getMonthlyAssetValues(user.id, 12)
            break
        }

        setAssetValueData(data)
      } catch (error) {
        console.error('[AssetOverview] 자산 가치 데이터 조회 실패:', error)
        setAssetValueData([])
      } finally {
        setIsLoadingAssetValues(false)
      }
    }

    fetchAssetValues()
  }, [user, activeGranularity, dailyPeriod])

  // 자산 가치 데이터를 차트 형식으로 변환
  const formatChartData = (data: AssetValueData[], granularity: TimeGranularity) => {
    return data.map(item => {
      const date = new Date(item.timestamp)

      let label = ''
      switch (granularity) {
        case 'hourly':
          label = date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
          break
        case 'daily':
          label = `${date.getMonth() + 1}/${date.getDate()}`
          break
        case 'monthly':
          label = `${date.getFullYear()}년 ${date.getMonth() + 1}월`
          break
      }

      return {
        name: label,
        value: Math.round(item.totalValueKRW)
      }
    })
  }

  const chartData = formatChartData(assetValueData, activeGranularity)

  // 자산 데이터 (All 데이터만 사용)
  const colors = ['#0ea5e9', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#f97316', '#06b6d4', '#a855f7']
  const pieData = assets.map((asset, index) => ({
    name: asset.symbol,
    value: asset.value,
    balance: asset.balance,
    color: colors[index % colors.length]
  }))

  // 총 자산 가치 계산
  const totalValue = pieData.reduce((sum, item) => sum + item.value, 0)
  const selectedAsset = pieData[selectedAssetIndex]
  const selectedPercentage = selectedAsset ? ((selectedAsset.value / totalValue) * 100).toFixed(1) : '0'

  // 총 자산 가치 변동률 계산 (24시간 기준)
  const calculateTotalValueChange = () => {
    if (assets.length === 0) return 0

    let currentTotalValue = 0
    let previousTotalValue = 0

    assets.forEach(asset => {
      const balance = parseFloat(asset.balance)
      const currentPrice = asset.currentPrice
      const changePercent = asset.change

      // 현재 가치
      currentTotalValue += balance * currentPrice

      // 24시간 전 가격 역산
      const previousPrice = currentPrice / (1 + changePercent / 100)
      previousTotalValue += balance * previousPrice
    })

    if (previousTotalValue === 0) return 0

    const changePercent = ((currentTotalValue - previousTotalValue) / previousTotalValue) * 100
    return parseFloat(changePercent.toFixed(2))
  }

  const totalValueChangePercent = calculateTotalValueChange()

  const handlePieClick = (data: any, index: number) => {
    setSelectedAssetIndex(index)
  }

  // CustomActiveShapePieChart를 위한 renderActiveShape 함수
  const renderActiveShape = (props: any) => {
    const RADIAN = Math.PI / 180
    const {
      cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle,
      fill, payload, percent, value
    } = props

    const sin = Math.sin(-RADIAN * midAngle)
    const cos = Math.cos(-RADIAN * midAngle)
    const sx = cx + (outerRadius + 10) * cos
    const sy = cy + (outerRadius + 10) * sin
    const mx = cx + (outerRadius + 30) * cos
    const my = cy + (outerRadius + 30) * sin
    const ex = mx + (cos >= 0 ? 1 : -1) * 22
    const ey = my
    const textAnchor = cos >= 0 ? 'start' : 'end'

    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 10}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
        <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" strokeWidth={2} />
        <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
        <text
          x={ex + (cos >= 0 ? 1 : -1) * 12}
          y={ey}
          textAnchor={textAnchor}
          fill="#111827"
          style={{ fontSize: '14px', fontWeight: '600' }}
        >
          {payload.name}
        </text>
        <text
          x={ex + (cos >= 0 ? 1 : -1) * 12}
          y={ey}
          dy={18}
          textAnchor={textAnchor}
          fill="#6B7280"
          style={{ fontSize: '12px' }}
        >
          {formatCryptoAmount(payload.balance, payload.name)}
        </text>
        <text
          x={ex + (cos >= 0 ? 1 : -1) * 12}
          y={ey}
          dy={33}
          textAnchor={textAnchor}
          fill="#6B7280"
          style={{ fontSize: '12px' }}
        >
          {formatKRW(value)}
        </text>
        <text
          x={ex + (cos >= 0 ? 1 : -1) * 12}
          y={ey}
          dy={48}
          textAnchor={textAnchor}
          fill="#6B7280"
          style={{ fontSize: '12px' }}
        >
          {`${(percent * 100).toFixed(1)}%`}
        </text>
      </g>
    )
  }

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const date = new Date(timestamp)
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 60) {
      return `${diffInMinutes}분 전`
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}시간 전`
    } else {
      return `${Math.floor(diffInMinutes / 1440)}일 전`
    }
  }


  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical':
        return 'text-red-600 bg-red-50 border-red-200'
      case 'high':
        return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'normal':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const highUrgencyApprovals = mockWithdrawalApprovals.filter(request => request.priority === 'high' || request.priority === 'critical')
  const totalPendingValue = mockWithdrawalApprovals.reduce((sum, request) => {
    // Sum all amounts regardless of currency for display purposes
    return sum + request.amount;
  }, 0)

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('overview.title')}</h1>
          <p className="text-gray-600 mt-1">{t('overview.subtitle')}</p>
        </div>
        <button
          onClick={() => setShowBalances(!showBalances)}
          className="flex items-center px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          {showBalances ? (
            <>
              <EyeSlashIcon className="h-5 w-5 mr-2" />
              {t('overview.hide_balance')}
            </>
          ) : (
            <>
              <EyeIcon className="h-5 w-5 mr-2" />
              {t('overview.show_balance')}
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">{t('overview.total_asset_value')}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {showBalances ? formatKRW(totalValue) : '***,***,***'}
              </p>
            </div>
            <div className="p-3 bg-primary-50 rounded-full">
              <CurrencyDollarIcon className="h-6 w-6 text-primary-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">{t('overview.daily_change')}</p>
              <p className={`text-2xl font-bold mt-1 ${
                isLoadingAssets
                  ? 'text-gray-400'
                  : totalValueChangePercent >= 0
                  ? 'text-sky-600'
                  : 'text-red-600'
              }`}>
                {isLoadingAssets
                  ? '...'
                  : `${totalValueChangePercent >= 0 ? '+' : ''}${totalValueChangePercent}%`
                }
              </p>
            </div>
            <div className={`p-3 rounded-full ${
              isLoadingAssets
                ? 'bg-gray-50'
                : totalValueChangePercent >= 0
                ? 'bg-sky-50'
                : 'bg-red-50'
            }`}>
              <ArrowTrendingUpIcon className={`h-6 w-6 ${
                isLoadingAssets
                  ? 'text-gray-400'
                  : totalValueChangePercent >= 0
                  ? 'text-sky-600'
                  : 'text-red-600'
              }`} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">{t('overview.asset_types')}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {isLoadingAssets ? '...' : `${assets.length}${t('overview.asset_types_count')}`}
              </p>
            </div>
            <div className="p-3 bg-purple-50 rounded-full">
              <ChartBarIcon className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">원화 대출</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {showBalances ? '1,000,000 원' : '***,***,***'}
              </p>
            </div>
            <div className="p-3 bg-orange-50 rounded-full">
              <BanknotesIcon className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>

      </div>

      {/* Individual Ongoing Withdrawals Section - Always show for individual plan */}
      {plan === 'individual' && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <ClockIcon className="h-5 w-5 text-gray-500 mr-2" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">진행 중인 출금</h3>
                <p className="text-sm text-gray-600">
                  {isLoadingWithdrawals ? '로딩 중...' : ongoingWithdrawals.length > 0 ? `${ongoingWithdrawals.length}건의 출금이 처리되고 있습니다` : '진행 중인 출금이 없습니다'}
                </p>
              </div>
            </div>
            <button
              onClick={() => router.push('/withdrawal')}
              className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
            >
              출금 관리로 이동
            </button>
          </div>

          {ongoingWithdrawals.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        신청 ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        출금 내용
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        자산
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        수량
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        상태
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        진행률
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {ongoingWithdrawals.slice(0, 3).map((request) => (
                      <ProcessingTableRow
                        key={request.id}
                        request={request}
                        onToggleDetails={() => {}}
                        showActions={false}
                      />
                    ))}
                  </tbody>
                </table>
              </div>

              {ongoingWithdrawals.length > 3 && (
                <div className="mt-4 pt-4 border-t border-gray-200 text-center">
                  <span className="text-sm text-gray-600">
                    외 {ongoingWithdrawals.length - 3}건이 더 있습니다
                  </span>
                </div>
              )}
            </>
          ) : (
            !isLoadingWithdrawals && (
              <div className="text-center py-12">
                <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-500">진행 중인 출금이 없습니다</p>
              </div>
            )
          )}
        </div>
      )}

      {/* Withdrawal Approvals Section - Only show if there are pending approvals and plan is enterprise */}
      {plan === 'enterprise' && mockWithdrawalApprovals.length > 0 && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <ClockIcon className="h-5 w-5 text-gray-500 mr-2" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">출금 승인 대기</h3>
                <p className="text-sm text-gray-600">{mockWithdrawalApprovals.length}건의 출금 신청이 승인을 기다리고 있습니다</p>
              </div>
            </div>
            <button 
              onClick={() => router.push('/withdrawal')}
              className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
            >
              출금 관리로 이동
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">신청 ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">출금 내용</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">자산</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">기안자</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">우선순위</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">승인진행률</th>
                </tr>
              </thead>
              <tbody>
                {mockWithdrawalApprovals.slice(0, 3).map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{request.id}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {request.title}
                        </p>
                        <p className="text-sm text-gray-500">
                          {request.description}
                        </p>
                        <p className="text-xs text-gray-400">
                          {formatDateTime(request.initiatedAt)}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <CryptoIcon
                          symbol={request.currency}
                          size={32}
                          className="mr-3 flex-shrink-0"
                        />
                        <div className="text-sm">
                          <p className="font-semibold text-gray-900">
                            {formatCryptoAmount(request.amount, request.currency)}
                          </p>
                          <p className="text-gray-500">
                            {request.currency}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{request.initiator}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <PriorityBadge priority={request.priority as any} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={request.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-900">
                          {request.approvals.length}/{request.requiredApprovals.length}
                        </span>
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{
                              width: `${(request.approvals.length / request.requiredApprovals.length) * 100}%`
                            }}
                          ></div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {mockWithdrawalApprovals.length > 3 && (
            <div className="mt-4 pt-4 border-t border-gray-200 text-center">
              <span className="text-sm text-gray-600">
                외 {mockWithdrawalApprovals.length - 3}건이 더 있습니다
              </span>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('overview.price_trend')}</h3>

          <Tabs
            tabs={[
              {
                id: 'hourly',
                label: '시간별',
                content: (
                  <div>
                    {isLoadingAssetValues ? (
                      <div className="h-80 flex items-center justify-center">
                        <p className="text-gray-500">로딩 중...</p>
                      </div>
                    ) : chartData.length === 0 ? (
                      <div className="h-80 flex items-center justify-center">
                        <p className="text-gray-500">데이터가 없습니다</p>
                      </div>
                    ) : (
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 30 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis
                              dataKey="name"
                              stroke="#6b7280"
                              style={{ fontSize: '12px' }}
                            />
                            <YAxis
                              stroke="#6b7280"
                              style={{ fontSize: '12px' }}
                              tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                            />
                            <Tooltip
                              formatter={(value: number) => `${value.toLocaleString('ko-KR')}원`}
                              contentStyle={{
                                backgroundColor: 'white',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px'
                              }}
                            />
                            <Line
                              type="monotone"
                              dataKey="value"
                              name="총 자산 가치"
                              stroke="#0ea5e9"
                              strokeWidth={2}
                              dot={{ fill: '#0ea5e9', r: 4 }}
                              activeDot={{ r: 6 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </div>
                )
              },
              {
                id: 'daily',
                label: '일별',
                content: (
                  <div>
                    {/* 기간 선택 버튼 */}
                    <div className="flex space-x-2 mb-4">
                      {[7, 30, 90].map(days => (
                        <button
                          key={days}
                          onClick={() => setDailyPeriod(days)}
                          className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                            dailyPeriod === days
                              ? 'bg-primary-600 text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {days}일
                        </button>
                      ))}
                    </div>

                    {isLoadingAssetValues ? (
                      <div className="h-80 flex items-center justify-center">
                        <p className="text-gray-500">로딩 중...</p>
                      </div>
                    ) : chartData.length === 0 ? (
                      <div className="h-80 flex items-center justify-center">
                        <p className="text-gray-500">데이터가 없습니다</p>
                      </div>
                    ) : (
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 30 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis
                              dataKey="name"
                              stroke="#6b7280"
                              style={{ fontSize: '12px' }}
                            />
                            <YAxis
                              stroke="#6b7280"
                              style={{ fontSize: '12px' }}
                              tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                            />
                            <Tooltip
                              formatter={(value: number) => `${value.toLocaleString('ko-KR')}원`}
                              contentStyle={{
                                backgroundColor: 'white',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px'
                              }}
                            />
                            <Line
                              type="monotone"
                              dataKey="value"
                              name="총 자산 가치"
                              stroke="#0ea5e9"
                              strokeWidth={2}
                              dot={{ fill: '#0ea5e9', r: 4 }}
                              activeDot={{ r: 6 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </div>
                )
              },
              {
                id: 'monthly',
                label: '월별',
                content: (
                  <div>
                    {isLoadingAssetValues ? (
                      <div className="h-80 flex items-center justify-center">
                        <p className="text-gray-500">로딩 중...</p>
                      </div>
                    ) : chartData.length === 0 ? (
                      <div className="h-80 flex items-center justify-center">
                        <p className="text-gray-500">데이터가 없습니다</p>
                      </div>
                    ) : (
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 30 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis
                              dataKey="name"
                              stroke="#6b7280"
                              style={{ fontSize: '12px' }}
                            />
                            <YAxis
                              stroke="#6b7280"
                              style={{ fontSize: '12px' }}
                              tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                            />
                            <Tooltip
                              formatter={(value: number) => `${value.toLocaleString('ko-KR')}원`}
                              contentStyle={{
                                backgroundColor: 'white',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px'
                              }}
                            />
                            <Line
                              type="monotone"
                              dataKey="value"
                              name="총 자산 가치"
                              stroke="#0ea5e9"
                              strokeWidth={2}
                              dot={{ fill: '#0ea5e9', r: 4 }}
                              activeDot={{ r: 6 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </div>
                )
              }
            ]}
            defaultTab="daily"
            activeTab={activeGranularity}
            onChange={(tabId) => setActiveGranularity(tabId as TimeGranularity)}
          />
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{t('overview.asset_distribution')}</h3>
            </div>

            {/* 전체 자산을 오른쪽 위에 심플하게 배치 */}
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">
                {showBalances ? formatKRW(totalValue) : '***,***,***'}
              </div>
            </div>
          </div>
          <div className="flex flex-col lg:flex-row items-center gap-8">
            {/* Donut Chart - Left */}
            <div className="flex-shrink-0">
              <div className="relative w-96 h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      activeIndex={selectedAssetIndex}
                      activeShape={renderActiveShape}
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      dataKey="value"
                      onClick={handlePieClick}
                      onMouseEnter={(_, index) => setSelectedAssetIndex(index)}
                      className="cursor-pointer"
                    >
                      {pieData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.color}
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>

                {/* Center content - 선택한 자산 정보 */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center">
                    {selectedAsset && (
                      <>
                        <div className="text-xl font-bold text-gray-900">
                          {selectedAsset.name}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {selectedPercentage}%
                        </div>
                        <div className="text-sm font-medium text-gray-900 mt-1">
                          {showBalances ? formatKRW(selectedAsset.value) : '***,***,***'}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Legend - Right */}
            <div className="flex-1">
              <div className="space-y-2">
                {pieData.map((entry, index) => (
                  <div
                    key={entry.name}
                    className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                      selectedAssetIndex === index ? 'bg-gray-50' : 'hover:bg-gray-25'
                    }`}
                    onClick={() => setSelectedAssetIndex(index)}
                  >
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: entry.color }}
                      ></div>
                      <span className="text-sm font-medium text-gray-900">
                        {entry.name}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {showBalances ? formatCryptoAmount(entry.balance, entry.name) : '***'}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {showBalances ? `₩${entry.value.toLocaleString()}` : '₩***,***'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">{t('overview.holdings')}</h3>
        </div>
        <div className="overflow-x-auto rounded-b-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('overview.asset')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('overview.balance')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('overview.value_krw')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('overview.change_24h')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoadingAssets ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    자산 데이터를 불러오는 중...
                  </td>
                </tr>
              ) : assets.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    보유 자산이 없습니다
                  </td>
                </tr>
              ) : (
                assets.map((asset) => (
                <tr key={asset.symbol} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 mr-3">
                        <CryptoIcon
                          symbol={asset.symbol}
                          size={40}
                          className=""
                        />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{asset.symbol}</p>
                        <p className="text-sm text-gray-500">{asset.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                    {showBalances ? formatCryptoAmount(asset.balance, asset.symbol) : '***'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                    {showBalances ? formatKRW(asset.value) : '***,***,***'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`font-semibold ${
                      asset.change >= 0 ? 'text-sky-600' : 'text-red-600'
                    }`}>
                      {asset.change >= 0 ? '+' : ''}{asset.change}%
                    </span>
                  </td>
                </tr>
              ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}