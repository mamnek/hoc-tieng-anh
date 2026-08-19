import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: 'Vui lòng điền đầy đủ họ tên, email và mật khẩu.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const db = await getDatabase();
    const usersCollection = db.collection('users');

    // Check if user already exists
    const existingUser = await usersCollection.findOne({ email: cleanEmail });
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Email này đã được đăng ký tài khoản. Vui lòng đăng nhập.' },
        { status: 400 }
      );
    }

    const userId = 'user_' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
    const avatarUrl = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`;

    const newUser = {
      id: userId,
      name: name.trim(),
      email: cleanEmail,
      password: password, // In production, password hash is recommended
      avatarUrl,
      streakCount: 1,
      lastActiveDate: new Date().toISOString().split('T')[0],
      coins: 50,
      createdAt: new Date().toISOString(),
    };

    await usersCollection.insertOne(newUser);

    return NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        avatarUrl: newUser.avatarUrl,
        streakCount: newUser.streakCount,
        lastActiveDate: newUser.lastActiveDate,
        coins: newUser.coins,
        createdAt: newUser.createdAt,
      },
    });
  } catch (error: any) {
    console.error('[MongoDB Auth Register Error]:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi máy chủ cơ sở dữ liệu: ' + (error?.message || 'Không thể tạo tài khoản.') },
      { status: 500 }
    );
  }
}
