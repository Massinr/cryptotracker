import axios from 'axios';
import { Coin, MarketData } from '../types/crypto';

const BASE_URL = 'https://api.coingecko.com/api/v3';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000, // 10 second timeout
  headers: {
    'Accept': 'application/json',
  }
});

export const getCoins = async (page: number = 1, perPage: number = 50): Promise<Coin[]> => {
  try {
    console.log('Fetching coins from CoinGecko API...');
    const response = await api.get('/coins/markets', {
      params: {
        vs_currency: 'usd',
        order: 'market_cap_desc',
        per_page: perPage,
        page: page,
        sparkline: false,
        price_change_percentage: '24h'
      }
    });
    
    if (!response.data) {
      throw new Error('No data received from API');
    }

    console.log('Successfully fetched coins:', response.data.length);
    return response.data.map((coin: any) => ({
      id: coin.id,
      symbol: coin.symbol,
      name: coin.name,
      image: coin.image,
      current_price: coin.current_price,
      market_cap: coin.market_cap,
      market_cap_rank: coin.market_cap_rank,
      price_change_percentage_24h: coin.price_change_percentage_24h,
      total_volume: coin.total_volume,
    }));
  } catch (error) {
    console.error('Error in getCoins:', error);
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 429) {
        throw new Error('Rate limit exceeded. Please try again in a minute.');
      }
      throw new Error(`API Error: ${error.response?.data?.error || error.message}`);
    }
    throw error;
  }
};

export const getCoinDetails = async (id: string): Promise<any> => {
  try {
    const response = await api.get(`/coins/${id}`, {
      params: {
        localization: false,
        tickers: false,
        market_data: true,
        community_data: false,
        developer_data: false,
        sparkline: false
      }
    });

    if (!response.data) {
      throw new Error('No data received from API');
    }

    return response.data;
  } catch (error) {
    console.error('Error in getCoinDetails:', error);
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 429) {
        throw new Error('Rate limit exceeded. Please try again in a minute.');
      }
      throw new Error(`API Error: ${error.response?.data?.error || error.message}`);
    }
    throw error;
  }
};

export const getMarketData = async (): Promise<MarketData> => {
  try {
    console.log('Fetching market data from CoinGecko API...');
    const response = await api.get('/global');

    if (!response.data || !response.data.data) {
      throw new Error('No data received from API');
    }

    console.log('Successfully fetched market data');
    return response.data.data;
  } catch (error) {
    console.error('Error in getMarketData:', error);
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 429) {
        throw new Error('Rate limit exceeded. Please try again in a minute.');
      }
      throw new Error(`API Error: ${error.response?.data?.error || error.message}`);
    }
    throw error;
  }
};

export const searchCoins = async (query: string): Promise<Coin[]> => {
  try {
    const response = await api.get('/search', {
      params: { query }
    });

    if (!response.data || !response.data.coins) {
      throw new Error('No data received from API');
    }

    return response.data.coins;
  } catch (error) {
    console.error('Error in searchCoins:', error);
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 429) {
        throw new Error('Rate limit exceeded. Please try again in a minute.');
      }
      throw new Error(`API Error: ${error.response?.data?.error || error.message}`);
    }
    throw error;
  }
}; 