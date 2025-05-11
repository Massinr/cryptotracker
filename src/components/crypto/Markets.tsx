import React, { useEffect, useState } from 'react';
import { getCoins } from '../../services/api';
import { Coin } from '../../types/crypto';
import { MagnifyingGlassIcon, StarIcon, PlusIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { useStore } from '../../store/useStore';

type SortField = 'market_cap_rank' | 'current_price' | 'price_change_percentage_24h' | 'total_volume';
type SortOrder = 'asc' | 'desc';

const Markets: React.FC = () => {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('market_cap_rank');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [page, setPage] = useState(1);
  const { favoriteCoins, toggleFavorite, addToPortfolio } = useStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCoin, setSelectedCoin] = useState<Coin | null>(null);
  const [quantity, setQuantity] = useState('');
  const [buyPrice, setBuyPrice] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getCoins(page, 50);
        setCoins(data);
      } catch (error) {
        console.error('Error fetching coins:', error);
        setError('Failed to fetch cryptocurrency data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [page]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleAddToPortfolio = (coin: Coin) => {
    setSelectedCoin(coin);
    setBuyPrice(coin.current_price.toString());
    setShowAddModal(true);
  };

  const handleSubmit = () => {
    if (selectedCoin && quantity && buyPrice) {
      const quantityNum = parseFloat(quantity);
      const buyPriceNum = parseFloat(buyPrice);
      if (!isNaN(quantityNum) && !isNaN(buyPriceNum) && quantityNum > 0 && buyPriceNum > 0) {
        addToPortfolio(selectedCoin, quantityNum, buyPriceNum);
        setShowAddModal(false);
        setQuantity('');
        setBuyPrice('');
        setSelectedCoin(null);
      }
    }
  };

  const filteredCoins = React.useMemo(() => {
    if (!searchQuery.trim()) {
      return coins;
    }

    const query = searchQuery.toLowerCase().trim();
    return coins.filter((coin) => {
      const nameMatch = coin.name.toLowerCase().includes(query);
      const symbolMatch = coin.symbol.toLowerCase().includes(query);
      return nameMatch || symbolMatch;
    }).sort((a, b) => {
      const multiplier = sortOrder === 'asc' ? 1 : -1;
      if (sortField === 'market_cap_rank') {
        return (a[sortField] - b[sortField]) * multiplier;
      }
      return ((a[sortField] as number) - (b[sortField] as number)) * multiplier;
    });
  }, [coins, searchQuery, sortField, sortOrder]);

  const SortButton: React.FC<{ field: SortField; label: string }> = ({ field, label }) => (
    <button
      onClick={() => handleSort(field)}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
        sortField === field
          ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
      }`}
    >
      {label}
      {sortField === field && (
        <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
      )}
    </button>
  );

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex items-center space-x-4 mb-6">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search cryptocurrencies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="flex space-x-2">
            <SortButton field="market_cap_rank" label="Rank" />
            <SortButton field="current_price" label="Price" />
            <SortButton field="price_change_percentage_24h" label="24h %" />
            <SortButton field="total_volume" label="Volume" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-gray-200 dark:border-gray-700">
                <th className="pb-4 font-medium text-gray-500 dark:text-gray-400">#</th>
                <th className="pb-4 font-medium text-gray-500 dark:text-gray-400">Name</th>
                <th className="pb-4 font-medium text-gray-500 dark:text-gray-400">Price</th>
                <th className="pb-4 font-medium text-gray-500 dark:text-gray-400">24h %</th>
                <th className="pb-4 font-medium text-gray-500 dark:text-gray-400">Volume</th>
                <th className="pb-4 font-medium text-gray-500 dark:text-gray-400">Market Cap</th>
                <th className="pb-4 font-medium text-gray-500 dark:text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-red-500">
                    {error}
                  </td>
                </tr>
              ) : filteredCoins.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-500 dark:text-gray-400">
                    {searchQuery ? 'No cryptocurrencies found matching your search.' : 'No cryptocurrencies available.'}
                  </td>
                </tr>
              ) : (
                filteredCoins.map((coin) => (
                  <tr
                    key={coin.id}
                    className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200"
                  >
                    <td className="py-4 text-gray-500 dark:text-gray-400">
                      {coin.market_cap_rank}
                    </td>
                    <td className="py-4">
                      <div className="flex items-center space-x-3">
                        <img src={coin.image} alt={coin.name} className="w-8 h-8" />
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {coin.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {coin.symbol.toUpperCase()}
                          </div>
                        </div>
                        <button
                          onClick={() => toggleFavorite(coin.id)}
                          className="text-gray-400 hover:text-yellow-500 transition-colors duration-200"
                        >
                          {favoriteCoins.includes(coin.id) ? (
                            <StarIconSolid className="w-5 h-5 text-yellow-500" />
                          ) : (
                            <StarIcon className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="py-4 font-medium text-gray-900 dark:text-white">
                      ${coin.current_price.toLocaleString()}
                    </td>
                    <td
                      className={`py-4 font-medium ${
                        coin.price_change_percentage_24h >= 0
                          ? 'text-green-500'
                          : 'text-red-500'
                      }`}
                    >
                      {coin.price_change_percentage_24h.toFixed(2)}%
                    </td>
                    <td className="py-4 text-gray-500 dark:text-gray-400">
                      ${coin.total_volume.toLocaleString()}
                    </td>
                    <td className="py-4 text-gray-500 dark:text-gray-400">
                      ${coin.market_cap.toLocaleString()}
                    </td>
                    <td className="py-4">
                      <button
                        onClick={() => handleAddToPortfolio(coin)}
                        className="p-1 text-gray-400 hover:text-primary-500 transition-colors duration-200"
                      >
                        <PlusIcon className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex justify-center mt-6 space-x-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <button
            onClick={() => setPage((p) => p + 1)}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
          >
            Next
          </button>
        </div>
      </div>

      {showAddModal && selectedCoin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4 gradient-text">
              Add {selectedCoin.name} to Portfolio
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Quantity
                </label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50"
                  placeholder="Enter quantity"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Buy Price (USD)
                </label>
                <input
                  type="number"
                  value={buyPrice}
                  onChange={(e) => setBuyPrice(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50"
                  placeholder="Enter buy price"
                />
              </div>
              <div className="flex justify-end space-x-2 mt-6">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-primary-500 text-white hover:bg-primary-600"
                >
                  Add to Portfolio
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Markets; 