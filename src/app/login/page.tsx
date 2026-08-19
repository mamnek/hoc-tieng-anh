'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { Sparkles, Mail, Lock, LogIn, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const loginUser = useAppStore((state) => state.loginUser);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Vui lòng nhập địa chỉ email!');
      return;
    }

    if (!password) {
      setError('Vui lòng nhập mật khẩu!');
      return;
    }

    setIsLoading(true);

    try {
      const res = await loginUser(email, password);
      setIsLoading(false);
      if (res.success) {
        router.push('/');
      } else {
        setError(res.error || 'Đăng nhập thất bại!');
      }
    } catch (_) {
      setIsLoading(false);
      setError('Có lỗi xảy ra khi kết nối máy chủ!');
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const res = await loginUser('hocvien@gmail.com', '123456');
      if (!res.success) {
        const reg = await useAppStore.getState().registerUser('Học viên Google', 'hocvien@gmail.com', '123456');
        if (reg.success) router.push('/');
        else setError(reg.error || 'Đăng nhập thất bại!');
      } else {
        router.push('/');
      }
    } catch (_) {
      setError('Có lỗi khi đăng nhập!');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    alert('Tính năng khôi phục mật khẩu: Hệ thống đã gửi hướng dẫn tới email của bạn (demo).');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-[#0F0F23] dark:via-[#1A1A2E] dark:to-[#16162A] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#1A1A2E] rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 p-8 max-w-md w-full animate-fade-in">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="bg-primary/10 dark:bg-primary/20 p-3.5 rounded-2xl text-primary mb-3">
            <Sparkles className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">VocabMaster</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Đăng nhập để tiếp tục hành trình học tập</p>
        </div>

        {/* Error alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800/50 rounded-2xl flex items-center gap-3 text-red-600 dark:text-red-400 text-sm animate-shake">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nhap@email.com"
                className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-sm"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                Mật khẩu
              </label>
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-xs text-primary hover:underline font-medium"
              >
                Quên mật khẩu?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <LogIn className="w-5 h-5" />
            {isLoading ? 'Đang xử lý...' : 'Đăng nhập'}
          </button>
        </form>

        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200 dark:border-gray-800" />
          </div>
          <span className="relative bg-white dark:bg-[#1A1A2E] px-3 text-xs text-gray-400 font-medium">
            Hoặc
          </span>
        </div>

        {/* Google login button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 font-semibold py-3 rounded-2xl transition-all flex items-center justify-center gap-3 cursor-pointer text-sm mb-6"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          Đăng nhập với Google
        </button>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
          Chưa có tài khoản?{' '}
          <Link href="/register" className="text-primary font-bold hover:underline">
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </div>
  );
}
