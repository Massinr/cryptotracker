import React, { useEffect, useState } from 'react';
import { getCoins } from '../../services/api';
import { Coin } from '../../types/crypto';
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid';

const PriceTicker: React.FC = () => {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getCoins(1, 10);
        setCoins(data);
      } catch (error) {
        console.error('Error fetching coins:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse flex space-x-4 overflow-x-auto p-4">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="flex-shrink-0 w-48 h-24 bg-gray-200 dark:bg-gray-700 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <div className="flex space-x-4 p-4 min-w-max">
        {coins.map((coin) => (
          <div
            key={coin.id}
            className="flex-shrink-0 w-48 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg p-4 border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-shadow duration-200"
          >
            <div className="flex items-center space-x-2">
              <img src={coin.image} alt={coin.name} className="w-8 h-8" />
              <div>
                <span className="font-medium text-gray-900 dark:text-white">{coin.symbol.toUpperCase()}</span>
                <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">{coin.name}</span>
              </div>
            </div>
            <div className="mt-3">
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                ${coin.current_price.toLocaleString()}
              </div>
              <div
                className={`flex items-center text-sm mt-1 ${
                  coin.price_change_percentage_24h >= 0
                    ? 'text-green-500'
                    : 'text-red-500'
                }`}
              >
                {coin.price_change_percentage_24h >= 0 ? (
                  <ArrowUpIcon className="w-4 h-4 mr-1" />
                ) : (
                  <ArrowDownIcon className="w-4 h-4 mr-1" />
                )}
                {Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PriceTicker; 