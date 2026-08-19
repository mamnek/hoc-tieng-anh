'use client';

import { useEffect } from 'react';
import { DEFAULT_SOCKET_URL } from '@/lib/socket-battle';

export function KeepAlive() {
  useEffect(() => {
    // Silent keep-alive ping function
    const pingServers = async () => {
      try {
        // 1. Ping web-ielts internal endpoint
        await fetch('/api/ping', { cache: 'no-store' });

        // 2. Ping external Render Socket backend (if any)
        const socketBaseUrl = DEFAULT_SOCKET_URL.replace(/\/$/, '');
        await fetch(`${socketBaseUrl}/ping`, {
          mode: 'no-cors',
          cache: 'no-store',
        });
      } catch (_) {
        // Silently ignore any network errors
      }
    };

    // Initial ping on load
    pingServers();

    // Ping every 5 minutes (300,000 ms) to prevent Render 15-minute sleep
    const interval = setInterval(pingServers, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return null;
}
