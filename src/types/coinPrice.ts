export interface CoinPrice {
  priceKRW: number;
  priceUSD: number;
  timestamp: string;
}

export interface CoinPrices {
  [coin: string]: CoinPrice;
}

export interface PriceChange {
  period: {
    hours: number;
    startTime: string;
    endTime: string;
  };
  krw: {
    currentPrice: number;
    startPrice: number;
    change: number;
    changePercent: number;
  };
  usd: {
    currentPrice: number;
    startPrice: number;
    change: number;
    changePercent: number;
  };
}

export interface PriceChangeResponse {
  [coin: string]: PriceChange | { error: string };
}

export interface PriceHistoryItem {
  priceKRW: number;
  priceUSD: number;
  timestamp: string;
}

export interface PriceHistory {
  coin: string;
  count: number;
  data: PriceHistoryItem[];
}
