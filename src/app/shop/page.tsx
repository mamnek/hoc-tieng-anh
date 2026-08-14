'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { ShoppingBag, Coins, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ShopPage() {
  const { user, shopItems, purchaseItem } = useAppStore();
  const [filter, setFilter] = useState<'all' | 'theme' | 'avatar' | 'item'>('all');
  const [toastMessage, setToastMessage] = useState('');

  const filteredItems = shopItems.filter(item => {
    if (filter === 'all') return true;
    return item.type === filter;
  });

  const handlePurchase = (item: typeof shopItems[0]) => {
    const success = purchaseItem(item.id);
    if (success) {
      setToastMessage(`Đổi thành công: ${item.name}`);
      setTimeout(() => setToastMessage(''), 3000);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-in slide-in-from-bottom-5 fade-in duration-300">
          <Check className="w-5 h-5" />
          {toastMessage}
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <ShoppingBag className="w-8 h-8 text-primary" />
            Cửa hàng
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Đổi xu lấy avatar, giao diện và vật phẩm đặc biệt
          </p>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 px-6 py-3 rounded-2xl font-bold flex items-center gap-3 text-lg border border-yellow-200 dark:border-yellow-900/50 shadow-sm">
          <Coins className="w-6 h-6 fill-current text-yellow-500" />
          {user.coins.toLocaleString()} xu
        </div>
      </div>

      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl w-fit mb-8 overflow-x-auto max-w-full">
        {(['all', 'theme', 'avatar', 'item'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={cn(
              "px-6 py-2.5 rounded-lg font-medium text-sm transition-all whitespace-nowrap",
              filter === tab
                ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            )}
          >
            {tab === 'all' && 'Tất cả'}
            {tab === 'theme' && 'Giao diện (Theme)'}
            {tab === 'avatar' && 'Ảnh đại diện (Avatar)'}
            {tab === 'item' && 'Vật phẩm'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => {
          const isOwned = !!item.owned;
          const canAfford = user.coins >= item.priceCoins;

          return (
            <div
              key={item.id}
              className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 dark:border-gray-700 flex flex-col items-center text-center group"
            >
              <div className="text-[4rem] mb-6 transform group-hover:scale-110 transition-transform duration-300">
                {item.imageUrl}
              </div>
              
              <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-2">
                {item.name}
              </h3>
              
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 flex-1">
                {item.description}
              </p>

              <div className="w-full pt-4 border-t border-gray-100 dark:border-gray-700">
                {!isOwned && (
                  <div className="flex justify-center items-center gap-1.5 mb-4 text-yellow-600 dark:text-yellow-400 font-bold text-lg">
                    <Coins className="w-5 h-5 fill-current" />
                    {item.priceCoins.toLocaleString()} xu
                  </div>
                )}
                
                {isOwned ? (
                  <button
                    disabled
                    className="w-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 font-medium py-3 rounded-xl cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <Check className="w-5 h-5" /> Đã sở hữu
                  </button>
                ) : (
                  <button
                    onClick={() => handlePurchase(item)}
                    disabled={!canAfford}
                    className={cn(
                      "w-full font-medium py-3 rounded-xl transition-colors",
                      canAfford
                        ? "bg-primary hover:bg-primary/90 text-white"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
                    )}
                  >
                    {canAfford ? 'Đổi ngay' : 'Không đủ xu'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      {filteredItems.length === 0 && (
        <div className="text-center py-20 text-gray-500 dark:text-gray-400">
          Không có vật phẩm nào trong mục này.
        </div>
      )}
    </div>
  );
}
