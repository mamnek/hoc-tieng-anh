'use client';

import { useState, useRef, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { Trophy, Flame, Coins, Users, Send, Medal, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

const mockUsers = [
  { id: 'u1', name: 'Minh Anh', avatar: '👩', streak: 45, coins: 2340 },
  { id: 'u2', name: 'Đức Huy', avatar: '👨', streak: 38, coins: 1890 },
  { id: 'u3', name: 'Thu Trang', avatar: '👩‍🎓', streak: 32, coins: 1650 },
  { id: 'u4', name: 'Văn Nam', avatar: '🧑', streak: 28, coins: 1420 },
  { id: 'u5', name: 'Hương Giang', avatar: '👧', streak: 25, coins: 1200 },
  { id: 'u6', name: 'Quốc Bảo', avatar: '👦', streak: 21, coins: 980 },
  { id: 'u7', name: 'Thanh Thảo', avatar: '👩‍💻', streak: 18, coins: 750 },
  { id: 'u8', name: 'Trịnh Hà', avatar: '🧑‍🏫', streak: 15, coins: 620 },
  { id: 'u9', name: 'Khoa Nguyên', avatar: '👨‍🔬', streak: 12, coins: 480 },
  { id: 'u10', name: 'Mai Linh', avatar: '👩‍🎨', streak: 8, coins: 320 },
];

export default function LeaderboardPage() {
  const { user, chatMessages, addChatMessage } = useAppStore();
  const [messageText, setMessageText] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Generate heatmap data
  const heatmapData = Array.from({ length: 140 }).map((_, i) => ({
    count: Math.floor(Math.random() * 8), // 0 to 7
    date: new Date(Date.now() - (139 - i) * 24 * 60 * 60 * 1000)
  }));

  const getHeatmapColor = (count: number) => {
    if (count === 0) return 'bg-gray-100 dark:bg-gray-800';
    if (count <= 2) return 'bg-green-200 dark:bg-green-900/40';
    if (count <= 5) return 'bg-green-400 dark:bg-green-700/60';
    return 'bg-green-600 dark:bg-green-500';
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    addChatMessage(messageText);
    setMessageText('');
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const sortedUsers = [...mockUsers].sort((a, b) => b.streak - a.streak);
  // Inject current user into mock list if not present, just for demo
  const userRank = 4; // Mock rank for current user

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Leaderboard */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-gradient-to-r from-primary to-purple-600 rounded-2xl p-6 text-white flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-3xl shadow-inner backdrop-blur-sm">
                🧑
              </div>
              <div>
                <h2 className="text-2xl font-bold">{user.name}</h2>
                <p className="text-primary-50 opacity-90 flex items-center gap-2">
                  Bạn đang xếp hạng #{userRank}
                </p>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-xl backdrop-blur-sm">
                <Flame className="w-5 h-5 text-orange-300 fill-orange-300" />
                <span className="font-bold">{user.streakCount} ngày</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Trophy className="w-6 h-6 text-yellow-500" /> Bảng xếp hạng
              </h3>
              <select className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm outline-none">
                <option>Tuần này</option>
                <option>Tháng này</option>
                <option>Tất cả</option>
              </select>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 text-sm">
                    <th className="py-4 px-6 font-medium">Hạng</th>
                    <th className="py-4 px-6 font-medium">Người dùng</th>
                    <th className="py-4 px-6 font-medium text-right">Streak</th>
                    <th className="py-4 px-6 font-medium text-right">Xu</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {sortedUsers.map((u, index) => {
                    const rank = index + 1;
                    const isCurrentUser = rank === userRank;
                    return (
                      <tr 
                        key={u.id} 
                        className={cn(
                          "transition-colors hover:bg-gray-50 dark:hover:bg-gray-750",
                          isCurrentUser && "bg-primary/5 dark:bg-primary/10"
                        )}
                      >
                        <td className="py-4 px-6 font-medium">
                          {rank === 1 && <span className="text-2xl" title="Hạng 1">🥇</span>}
                          {rank === 2 && <span className="text-2xl" title="Hạng 2">🥈</span>}
                          {rank === 3 && <span className="text-2xl" title="Hạng 3">🥉</span>}
                          {rank > 3 && <span className="text-gray-500 dark:text-gray-400 pl-2">#{rank}</span>}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center text-xl">
                              {u.avatar}
                            </div>
                            <span className={cn("font-medium", isCurrentUser ? "text-primary font-bold" : "text-gray-900 dark:text-gray-100")}>
                              {u.name} {isCurrentUser && "(Bạn)"}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-1.5 text-gray-700 dark:text-gray-300">
                            <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
                            <span className="font-semibold">{u.streak}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-1.5 text-gray-700 dark:text-gray-300">
                            <Coins className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                            <span className="font-semibold">{u.coins}</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Sidebar */}
        <div className="space-y-6">
          
          {/* Heatmap */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
              <Activity className="w-5 h-5 text-primary" /> Hoạt động học tập
            </h3>
            
            <div className="overflow-hidden">
              {/* Weeks grid */}
              <div 
                className="grid gap-1 mb-2" 
                style={{ 
                  gridTemplateColumns: `repeat(20, minmax(0, 1fr))`,
                  gridTemplateRows: `repeat(7, minmax(0, 1fr))`
                }}
              >
                {/* Organize into columns for proper vertical layout of days */}
                {Array.from({ length: 20 }).map((_, colIndex) => (
                  <div key={colIndex} className="grid grid-rows-7 gap-1">
                    {Array.from({ length: 7 }).map((_, rowIndex) => {
                      const dataIndex = colIndex * 7 + rowIndex;
                      const cell = heatmapData[dataIndex];
                      if (!cell) return null;
                      return (
                        <div
                          key={rowIndex}
                          className={cn(
                            "w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-[3px] transition-colors",
                            getHeatmapColor(cell.count)
                          )}
                          title={`${cell.count} hoạt động vào ${cell.date.toLocaleDateString()}`}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
              <div className="flex justify-end items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-4">
                <span>Ít</span>
                <div className="flex gap-1">
                  <div className="w-3 h-3 rounded-[2px] bg-gray-100 dark:bg-gray-800"></div>
                  <div className="w-3 h-3 rounded-[2px] bg-green-200 dark:bg-green-900/40"></div>
                  <div className="w-3 h-3 rounded-[2px] bg-green-400 dark:bg-green-700/60"></div>
                  <div className="w-3 h-3 rounded-[2px] bg-green-600 dark:bg-green-500"></div>
                </div>
                <span>Nhiều</span>
              </div>
            </div>
          </div>

          {/* Community Chat */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col h-[500px]">
            <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              <h3 className="font-bold text-gray-900 dark:text-white">Chat cộng đồng</h3>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatMessages.length === 0 ? (
                <div className="text-center text-gray-500 dark:text-gray-400 py-10">
                  Chưa có tin nhắn nào. Hãy bắt đầu trò chuyện!
                </div>
              ) : (
                chatMessages.map(msg => {
                  const isMe = msg.userId === user.id;
                  return (
                    <div key={msg.id} className={cn("flex gap-3", isMe && "flex-row-reverse")}>
                      <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex-shrink-0 flex items-center justify-center text-sm">
                        {msg.userAvatar}
                      </div>
                      <div className={cn("max-w-[75%]", isMe ? "items-end" : "items-start")}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                            {msg.userName}
                          </span>
                          <span className="text-[10px] text-gray-400">
                            {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </span>
                        </div>
                        <div className={cn(
                          "px-4 py-2 rounded-2xl text-sm",
                          isMe 
                            ? "bg-primary text-white rounded-tr-sm" 
                            : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-tl-sm"
                        )}>
                          {msg.content}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="p-4 border-t border-gray-100 dark:border-gray-700">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Nhập tin nhắn..."
                  className="flex-1 px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm text-gray-900 dark:text-white"
                />
                <button
                  type="submit"
                  disabled={!messageText.trim()}
                  className="bg-primary hover:bg-primary/90 disabled:opacity-50 text-white p-2.5 rounded-xl transition-colors flex items-center justify-center"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
              <div className="text-center mt-3">
                <a href="#" className="text-xs text-primary hover:underline">Liên hệ Admin</a>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
