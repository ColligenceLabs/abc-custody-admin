export type TimeGranularity = 'hourly' | 'daily' | 'monthly'

export interface AssetValueData {
  timestamp: string // ISO 8601 형식
  totalValueKRW: number
  assets: Array<{
    asset: string
    balance: number
    priceKRW: number
    valueKRW: number
  }>
}

export interface AssetValueSummary {
  currentValueKRW: number
  change24h: {
    value: number
    percentage: number
  }
  change7d: {
    value: number
    percentage: number
  }
}
