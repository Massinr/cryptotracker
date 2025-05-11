import React, { useEffect, useState } from 'react';
import { getMarketData } from '../../services/api';
import { MarketData } from '../../types/crypto';
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid';

const Dashboard: React.FC = () => {
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getMarketData();
        setMarketData(data);
      } catch (error) {
        console.error('Error fetching market data:', error);
        setError('Failed to fetch market data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 2,
    }).format(num);
  };

  const formatPercentage = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num / 100);
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="card animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <div className="text-red-500 text-center">{error}</div>
      </div>
    );
  }

  if (!marketData) {
    return (
      <div className="card">
        <div className="text-gray-500 dark:text-gray-400 text-center">No market data available</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="card">
        <h2 className="text-2xl font-bold mb-6 gradient-text">Market Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Total Market Cap</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatNumber(marketData.total_market_cap.usd)}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500 dark:text-gray-400">24h Trading Volume</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatNumber(marketData.total_volume.usd)}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Market Cap Change (24h)</div>
            <div className="flex items-center space-x-2">
              <div
                className={`text-2xl font-bold ${
                  marketData.market_cap_change_percentage_24h_usd >= 0
                    ? 'text-green-500'
                    : 'text-red-500'
                }`}
              >
                {formatPercentage(marketData.market_cap_change_percentage_24h_usd)}
              </div>
              {marketData.market_cap_change_percentage_24h_usd >= 0 ? (
                <ArrowUpIcon className="w-5 h-5 text-green-500" />
              ) : (
                <ArrowDownIcon className="w-5 h-5 text-red-500" />
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="text-2xl font-bold mb-6 gradient-text">Market Dominance</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(marketData.market_cap_percentage)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 4)
            .map(([symbol, percentage]) => (
              <div key={symbol} className="p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {symbol.toUpperCase()}
                </div>
                <div className="text-xl font-bold text-gray-900 dark:text-white">
                  {formatPercentage(percentage)}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 