import { NextRequest, NextResponse } from 'next/server';
import { videoTaskMap } from '@/lib/video-task-manager';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const taskId = searchParams.get('taskId');

    if (!taskId) {
      return NextResponse.json(
        { success: false, error: 'Thiếu tham số taskId.' },
        { status: 400 }
      );
    }

    const task = videoTaskMap.get(taskId);
    if (!task) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy tác vụ hoặc tác vụ đã hết hạn.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      task: {
        taskId: task.taskId,
        youtubeId: task.youtubeId,
        title: task.title,
        status: task.status,
        progress: task.progress,
        stepMessage: task.stepMessage,
        durationSeconds: task.durationSeconds,
        segments: task.status === 'ready' ? task.segments : undefined,
        quizzes: task.status === 'ready' ? task.quizzes : undefined,
        error: task.error,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Lỗi kiểm tra trạng thái tác vụ.' },
      { status: 500 }
    );
  }
}
