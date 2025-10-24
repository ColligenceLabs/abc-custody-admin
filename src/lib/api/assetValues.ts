import { AssetValueData, AssetValueSummary, TimeGranularity } from '@/types/assetValue'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

/**
 * 시간별 자산 가치 조회 (최근 24시간)
 */
export async function getHourlyAssetValues(userId: string): Promise<AssetValueData[]> {
  const response = await fetch(
    `${API_BASE_URL}/api/asset-values/hourly?userId=${userId}`
  )

  if (!response.ok) {
    throw new Error('Failed to fetch hourly asset values')
  }

  return response.json()
}

/**
 * 일별 자산 가치 조회
 */
export async function getDailyAssetValues(
  userId: string,
  days: number = 30
): Promise<AssetValueData[]> {
  const response = await fetch(
    `${API_BASE_URL}/api/asset-values/daily?userId=${userId}&days=${days}`
  )

  if (!response.ok) {
    throw new Error('Failed to fetch daily asset values')
  }

  return response.json()
}

/**
 * 월별 자산 가치 조회 (최근 12개월)
 */
export async function getMonthlyAssetValues(
  userId: string,
  months: number = 12
): Promise<AssetValueData[]> {
  const response = await fetch(
    `${API_BASE_URL}/api/asset-values/monthly?userId=${userId}&months=${months}`
  )

  if (!response.ok) {
    throw new Error('Failed to fetch monthly asset values')
  }

  return response.json()
}

/**
 * 자산 가치 요약 조회
 */
export async function getAssetValueSummary(userId: string): Promise<AssetValueSummary> {
  const response = await fetch(
    `${API_BASE_URL}/api/asset-values/summary?userId=${userId}`
  )

  if (!response.ok) {
    throw new Error('Failed to fetch asset value summary')
  }

  return response.json()
}

/**
 * 기간별 자산 가치 조회 (통합 함수)
 */
export async function getAssetValuesByPeriod(
  userId: string,
  granularity: TimeGranularity,
  params?: { days?: number; months?: number }
): Promise<AssetValueData[]> {
  switch (granularity) {
    case 'hourly':
      return getHourlyAssetValues(userId)
    case 'daily':
      return getDailyAssetValues(userId, params?.days)
    case 'monthly':
      return getMonthlyAssetValues(userId, params?.months)
    default:
      throw new Error(`Unknown granularity: ${granularity}`)
  }
}
