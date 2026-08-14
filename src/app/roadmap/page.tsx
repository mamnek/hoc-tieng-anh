'use client';

import { useAppStore } from '@/lib/store';
import { Map, Lock, Check, Star, BookOpen, GraduationCap, Zap, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const roadmapNodes = [
  { id: '1', title: 'Nền tảng cơ bản', description: 'Học 200 từ vựng cơ bản nhất', level: 'beginner', isUnlocked: true, isCompleted: true },
  { id: '2', title: 'Giao tiếp hàng ngày', description: 'Từ vựng sử dụng trong cuộc sống', level: 'beginner', isUnlocked: true, isCompleted: true },
  { id: '3', title: 'IELTS - Kinh doanh', description: 'Từ vựng IELTS chủ đề kinh doanh', level: 'intermediate', isUnlocked: true, isCompleted: false },
  { id: '4', title: 'IELTS - Giáo dục', description: 'Từ vựng IELTS chủ đề giáo dục', level: 'intermediate', isUnlocked: true, isCompleted: false },
  { id: '5', title: 'IELTS - Môi trường', description: 'Từ vựng IELTS chủ đề môi trường', level: 'intermediate', isUnlocked: false, isCompleted: false },
  { id: '6', title: 'IELTS - Công nghệ', description: 'Từ vựng IELTS chủ đề công nghệ', level: 'advanced', isUnlocked: false, isCompleted: false },
  { id: '7', title: 'IELTS - Sức khỏe', description: 'Từ vựng IELTS chủ đề y tế', level: 'advanced', isUnlocked: false, isCompleted: false },
  { id: '8', title: 'Master IELTS', description: 'Tổng hợp tất cả chủ đề', level: 'advanced', isUnlocked: false, isCompleted: false },
];

export default function RoadmapPage() {
  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'text-green-500 bg-green-100 dark:bg-green-900/30 border-green-200 dark:border-green-800';
      case 'intermediate': return 'text-blue-500 bg-blue-100 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800';
      case 'advanced': return 'text-purple-500 bg-purple-100 dark:bg-purple-900/30 border-purple-200 dark:border-purple-800';
      default: return 'text-gray-500 bg-gray-100 dark:bg-gray-800';
    }
  };

  const getLevelBadgeText = (level: string) => {
    switch (level) {
      case 'beginner': return 'Sơ cấp';
      case 'intermediate': return 'Trung cấp';
      case 'advanced': return 'Nâng cao';
      default: return '';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
          <Map className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Lộ trình học
        </h1>
        <p className="text-gray-500 dark:text-gray-400 max-w-lg mx-auto">
          Hoàn thành các chặng đường để chinh phục từ vựng IELTS. Mỗi bước đi là một thành tựu mới trên hành trình của bạn.
        </p>
      </div>

      <div className="relative py-8">
        {/* Vertical line connecting nodes */}
        <div className="absolute left-[28px] md:left-1/2 top-0 bottom-0 w-1 bg-gray-200 dark:bg-gray-700 transform md:-translate-x-1/2 z-0"></div>

        <div className="space-y-12">
          {roadmapNodes.map((node, index) => {
            const isLeft = index % 2 === 0;
            const isCurrent = node.isUnlocked && !node.isCompleted;
            
            return (
              <div key={node.id} className="relative z-10 flex flex-col md:flex-row items-start md:items-center w-full">
                
                {/* Desktop Left content */}
                <div className={cn(
                  "hidden md:block w-1/2 pr-12 text-right",
                  !isLeft ? "md:invisible" : ""
                )}>
                  <div className={cn(
                    "bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border inline-block max-w-md w-full transition-all duration-300",
                    !node.isUnlocked ? "opacity-60 border-gray-100 dark:border-gray-700 grayscale" : "border-gray-200 dark:border-gray-700 hover:shadow-md hover:scale-[1.02]",
                    isCurrent && "border-primary/50 shadow-[0_0_15px_rgba(99,102,241,0.1)]"
                  )}>
                    <div className="flex justify-end mb-2">
                      <span className={cn("text-xs font-bold px-2.5 py-1 rounded-full border", getLevelColor(node.level))}>
                        {getLevelBadgeText(node.level)}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{node.title}</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">{node.description}</p>
                    {node.isUnlocked && (
                      <Link href="/word-sets" className="text-primary text-sm font-medium hover:underline inline-flex items-center gap-1">
                        Tới bài học <Zap className="w-4 h-4" />
                      </Link>
                    )}
                  </div>
                </div>

                {/* Center Icon */}
                <div className="absolute left-0 md:left-1/2 transform md:-translate-x-1/2 flex items-center justify-center w-14 h-14 rounded-full border-4 border-gray-50 dark:border-gray-900 bg-white dark:bg-gray-800 z-20">
                  {node.isCompleted ? (
                    <div className="w-full h-full rounded-full bg-green-500 flex items-center justify-center text-white">
                      <Check className="w-6 h-6" strokeWidth={3} />
                    </div>
                  ) : isCurrent ? (
                    <div className="w-full h-full rounded-full bg-primary flex items-center justify-center text-white relative">
                      <div className="absolute inset-0 rounded-full bg-primary animate-ping opacity-20"></div>
                      <Star className="w-6 h-6 fill-current" />
                    </div>
                  ) : (
                    <div className="w-full h-full rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400">
                      <Lock className="w-5 h-5" />
                    </div>
                  )}
                </div>

                {/* Desktop Right content / Mobile full content */}
                <div className={cn(
                  "w-full md:w-1/2 pl-20 md:pl-12",
                  isLeft ? "md:invisible hidden md:block" : ""
                )}>
                  <div className={cn(
                    "bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border max-w-md w-full transition-all duration-300",
                    !node.isUnlocked ? "opacity-60 border-gray-100 dark:border-gray-700 grayscale" : "border-gray-200 dark:border-gray-700 hover:shadow-md hover:scale-[1.02]",
                    isCurrent && "border-primary/50 shadow-[0_0_15px_rgba(99,102,241,0.1)]"
                  )}>
                    <div className="flex justify-start mb-2">
                      <span className={cn("text-xs font-bold px-2.5 py-1 rounded-full border", getLevelColor(node.level))}>
                        {getLevelBadgeText(node.level)}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{node.title}</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">{node.description}</p>
                    {node.isUnlocked && (
                      <Link href="/word-sets" className="text-primary text-sm font-medium hover:underline inline-flex items-center gap-1">
                        Tới bài học <Zap className="w-4 h-4" />
                      </Link>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
