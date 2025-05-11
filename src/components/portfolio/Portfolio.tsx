import React, { useEffect, useState } from 'react';
import { useStore } from '../../store/useStore';
import { Coin, PortfolioItem } from '../../types/crypto';
import { getCoins } from '../../services/api';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const Portfolio: React.FC = () => {
  const { portfolio, removeFromPortfolio, updatePortfolioItem } = useStore();
  const [coins, setCoins] = useState<Coin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);
  const [editQuantity, setEditQuantity] = useState('');
  const [editBuyPrice, setEditBuyPrice] = useState('');

  useEffect(() => {
    const fetchCoins = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getCoins(1, 100); // Fetch top 100 coins
        setCoins(data);
      } catch (error) {
        console.error('Error fetching coins:', error);
        setError('Failed to fetch cryptocurrency data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCoins();
    const interval = setInterval(fetchCoins, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const getCurrentPrice = (coinId: string): number => {
    const coin = coins.find(c => c.id === coinId);
    return coin?.current_price || 0;
  };

  const calculateTotalValue = (): number => {
    return portfolio.reduce((total, item) => {
      const currentPrice = getCurrentPrice(item.coin.id);
      return total + (currentPrice * item.quantity);
    }, 0);
  };

  const calculateProfitLoss = (item: PortfolioItem): { value: number; percentage: number } => {
    const currentPrice = getCurrentPrice(item.coin.id);
    const currentValue = currentPrice * item.quantity;
    const initialValue = item.buyPrice * item.quantity;
    const profitLoss = currentValue - initialValue;
    const percentage = (profitLoss / initialValue) * 100;
    return { value: profitLoss, percentage };
  };

  const handleEdit = (item: PortfolioItem) => {
    setEditingItem(item);
    setEditQuantity(item.quantity.toString());
    setEditBuyPrice(item.buyPrice.toString());
  };

  const handleSave = () => {
    if (editingItem && editQuantity && editBuyPrice) {
      const quantity = parseFloat(editQuantity);
      const buyPrice = parseFloat(editBuyPrice);
      if (!isNaN(quantity) && !isNaN(buyPrice) && quantity > 0 && buyPrice > 0) {
        updatePortfolioItem(editingItem.id, quantity, buyPrice);
        setEditingItem(null);
        setEditQuantity('');
        setEditBuyPrice('');
      }
    }
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatPercentage = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value / 100);
  };

  const chartData = {
    labels: portfolio.map(item => item.coin.name),
    datasets: [
      {
        data: portfolio.map(item => {
          const currentPrice = getCurrentPrice(item.coin.id);
          return currentPrice * item.quantity;
        }),
        backgroundColor: [
          '#3B82F6', // blue-500
          '#10B981', // emerald-500
          '#F59E0B', // amber-500
          '#EF4444', // red-500
          '#8B5CF6', // violet-500
          '#EC4899', // pink-500
          '#06B6D4', // cyan-500
          '#F97316', // orange-500
        ],
      },
    ],
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

  return (
    <div className="space-y-8">
      <div className="card">
        <h2 className="text-2xl font-bold mb-6 gradient-text">Portfolio Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Total Value</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(calculateTotalValue())}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Total Holdings</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {portfolio.length}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Last Updated</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card">
          <h3 className="text-xl font-bold mb-6 gradient-text">Portfolio Distribution</h3>
          {portfolio.length > 0 ? (
            <div className="h-80">
              <Pie data={chartData} options={{ maintainAspectRatio: false }} />
            </div>
          ) : (
            <div className="text-center text-gray-500 dark:text-gray-400 py-8">
              No holdings in your portfolio yet
            </div>
          )}
        </div>

        <div className="card">
          <h3 className="text-xl font-bold mb-6 gradient-text">Holdings</h3>
          {portfolio.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b border-gray-200 dark:border-gray-700">
                    <th className="pb-4 font-medium text-gray-500 dark:text-gray-400">Asset</th>
                    <th className="pb-4 font-medium text-gray-500 dark:text-gray-400">Quantity</th>
                    <th className="pb-4 font-medium text-gray-500 dark:text-gray-400">Avg. Buy</th>
                    <th className="pb-4 font-medium text-gray-500 dark:text-gray-400">Current</th>
                    <th className="pb-4 font-medium text-gray-500 dark:text-gray-400">P/L</th>
                    <th className="pb-4 font-medium text-gray-500 dark:text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {portfolio.map((item) => {
                    const currentPrice = getCurrentPrice(item.coin.id);
                    const { value: profitLoss, percentage } = calculateProfitLoss(item);
                    const isEditing = editingItem?.id === item.id;

                    return (
                      <tr
                        key={item.id}
                        className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                      >
                        <td className="py-4">
                          <div className="flex items-center space-x-3">
                            <img src={item.coin.image} alt={item.coin.name} className="w-8 h-8" />
                            <div>
                              <div className="font-medium text-gray-900 dark:text-white">
                                {item.coin.name}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {item.coin.symbol.toUpperCase()}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4">
                          {isEditing ? (
                            <input
                              type="number"
                              value={editQuantity}
                              onChange={(e) => setEditQuantity(e.target.value)}
                              className="w-24 px-2 py-1 rounded border border-gray-200 dark:border-gray-700"
                            />
                          ) : (
                            item.quantity
                          )}
                        </td>
                        <td className="py-4">
                          {isEditing ? (
                            <input
                              type="number"
                              value={editBuyPrice}
                              onChange={(e) => setEditBuyPrice(e.target.value)}
                              className="w-24 px-2 py-1 rounded border border-gray-200 dark:border-gray-700"
                            />
                          ) : (
                            formatCurrency(item.buyPrice)
                          )}
                        </td>
                        <td className="py-4 font-medium text-gray-900 dark:text-white">
                          {formatCurrency(currentPrice)}
                        </td>
                        <td className="py-4">
                          <div
                            className={`font-medium ${
                              profitLoss >= 0 ? 'text-green-500' : 'text-red-500'
                            }`}
                          >
                            <div>{formatCurrency(profitLoss)}</div>
                            <div className="text-sm">{formatPercentage(percentage)}</div>
                          </div>
                        </td>
                        <td className="py-4">
                          <div className="flex space-x-2">
                            {isEditing ? (
                              <button
                                onClick={handleSave}
                                className="p-1 text-green-500 hover:text-green-600"
                              >
                                Save
                              </button>
                            ) : (
                              <button
                                onClick={() => handleEdit(item)}
                                className="p-1 text-gray-400 hover:text-primary-500"
                              >
                                <PencilIcon className="w-5 h-5" />
                              </button>
                            )}
                            <button
                              onClick={() => removeFromPortfolio(item.id)}
                              className="p-1 text-gray-400 hover:text-red-500"
                            >
                              <TrashIcon className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center text-gray-500 dark:text-gray-400 py-8">
              No holdings in your portfolio yet. Add some from the Markets page!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Portfolio; 