import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, userUpdates, progress, wordSets, words, sessions, speakingAttempts } = body;

    if (!userId) {
      return NextResponse.json({ success: false, error: 'Thiếu userId.' }, { status: 400 });
    }

    const db = await getDatabase();

    // 1. Update user profile (coins, streak, etc.)
    if (userUpdates && Object.keys(userUpdates).length > 0) {
      const usersCollection = db.collection('users');
      await usersCollection.updateOne(
        { id: userId },
        { $set: userUpdates },
        { upsert: false }
      );
    }

    // 2. Update user full data
    const userDataCollection = db.collection('user_data');
    await userDataCollection.updateOne(
      { userId },
      {
        $set: {
          userId,
          progress: progress || [],
          wordSets: wordSets || [],
          words: words || [],
          sessions: sessions || [],
          speakingAttempts: speakingAttempts || [],
          updatedAt: new Date().toISOString(),
        },
      },
      { upsert: true }
    );

    return NextResponse.json({ success: true, message: 'Đồng bộ dữ liệu đám mây thành công.' });
  } catch (error: any) {
    console.error('[MongoDB Sync Error]:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Không thể đồng bộ dữ liệu.' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ success: false, error: 'Thiếu userId.' }, { status: 400 });
    }

    const db = await getDatabase();
    const usersCollection = db.collection('users');
    const userDataCollection = db.collection('user_data');

    const user = await usersCollection.findOne({ id: userId });
    const userData = await userDataCollection.findOne({ userId });

    return NextResponse.json({
      success: true,
      user,
      cloudData: userData || null,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Lỗi tải dữ liệu.' },
      { status: 500 }
    );
  }
}
