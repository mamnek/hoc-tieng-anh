import { NextRequest, NextResponse } from 'next/server';
import { videoTaskMap, startVideoProcessingTask, VideoTask } from '@/lib/video-task-manager';

export const maxDuration = 300;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { youtubeId, title } = body;

    if (!youtubeId || typeof youtubeId !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Thiếu mã video YouTube (youtubeId) hợp lệ.' },
        { status: 400 }
      );
    }

    const taskId = `task-${youtubeId}-${Date.now()}`;
    const newTask: VideoTask = {
      taskId,
      youtubeId,
      title: title || 'Video YouTube',
      status: 'pending',
      progress: 5,
      stepMessage: 'Đang khởi tạo tác vụ xử lý...',
      createdAt: Date.now(),
    };

    videoTaskMap.set(taskId, newTask);

    // Launch background worker without awaiting (returns in < 50ms)
    startVideoProcessingTask(taskId, youtubeId, title).catch((err) => {
      console.error(`[Background Task ${taskId}] Error:`, err);
    });

    return NextResponse.json({
      success: true,
      taskId,
      message: 'Tác vụ phân tích video đã được khởi chạy thành công.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Lỗi khởi tạo tác vụ.' },
      { status: 500 }
    );
  }
}
