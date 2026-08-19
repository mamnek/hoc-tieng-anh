import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

export async function GET(req: NextRequest) {
  try {
    const db = await getDatabase();
    const usersCollection = db.collection('users');

    const topUsers = await usersCollection
      .find({})
      .sort({ coins: -1, streakCount: -1 })
      .limit(50)
      .project({ password: 0 })
      .toArray();

    return NextResponse.json(
      {
        success: true,
        leaderboard: topUsers.map((u, idx) => ({
          rank: idx + 1,
          id: u.id || u._id.toString(),
          name: u.name || 'Học viên IELTS',
          avatarUrl: u.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(u.name || 'user')}`,
          coins: u.coins || 0,
          streakCount: u.streakCount || 0,
          masteredWords: u.masteredWords || Math.floor((u.coins || 0) / 5),
        })),
      },
      {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      }
    );
  } catch (error: any) {
    console.error('[MongoDB Leaderboard Error]:', error);
    return NextResponse.json(
      { success: false, error: 'Không thể tải bảng xếp hạng đám mây.' },
      { status: 500 }
    );
  }
}
