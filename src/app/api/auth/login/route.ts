import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Vui lòng nhập đầy đủ email và mật khẩu.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const db = await getDatabase();
    const usersCollection = db.collection('users');

    const user = await usersCollection.findOne({ email: cleanEmail });
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Email không tồn tại trong hệ thống.' },
        { status: 401 }
      );
    }

    if (user.password !== password) {
      return NextResponse.json(
        { success: false, error: 'Mật khẩu không chính xác.' },
        { status: 401 }
      );
    }

    // Update lastActiveDate
    const today = new Date().toISOString().split('T')[0];
    await usersCollection.updateOne(
      { _id: user._id },
      { $set: { lastActiveDate: today } }
    );

    // Fetch user cloud data (word sets, progress, etc.)
    const userDataCollection = db.collection('user_data');
    const cloudUserData = await userDataCollection.findOne({ userId: user.id });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user.name)}`,
        streakCount: user.streakCount || 1,
        lastActiveDate: today,
        coins: user.coins || 50,
        createdAt: user.createdAt,
      },
      cloudData: cloudUserData ? {
        progress: cloudUserData.progress || [],
        wordSets: cloudUserData.wordSets || [],
        words: cloudUserData.words || [],
        sessions: cloudUserData.sessions || [],
      } : null,
    });
  } catch (error: any) {
    console.error('[MongoDB Auth Login Error]:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi máy chủ cơ sở dữ liệu: ' + (error?.message || 'Không thể đăng nhập.') },
      { status: 500 }
    );
  }
}
