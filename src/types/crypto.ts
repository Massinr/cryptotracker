export interface Coin {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  price_change_percentage_24h: number;
  total_volume: number;
}

export interface PortfolioItem {
  id: string;
  coin: Coin;
  quantity: number;
  buyPrice: number;
}

export interface MarketData {
  total_market_cap: {
    usd: number;
  };
  total_volume: {
    usd: number;
  };
  market_cap_change_percentage_24h_usd: number;
  market_cap_percentage: {
    [key: string]: number;
  };
  active_cryptocurrencies: number;
  total_cryptocurrencies: number;
  active_exchanges: number;
  total_exchanges: number;
  last_updated: number;
} 