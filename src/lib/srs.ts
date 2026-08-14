// SRS intervals in days for each level
const SRS_INTERVALS = [1, 3, 7, 14, 30, 60];

export function calculateNextReview(
  currentLevel: number,
  isCorrect: boolean
): { newLevel: number; nextReviewDate: Date } {
  let newLevel: number;
  
  if (isCorrect) {
    newLevel = Math.min(currentLevel + 1, 5);
  } else {
    newLevel = 0; // Reset to 0 on wrong answer
  }
  
  const intervalDays = SRS_INTERVALS[newLevel];
  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + intervalDays);
  nextReviewDate.setHours(0, 0, 0, 0); // Start of day
  
  return { newLevel, nextReviewDate };
}

export function isDueForReview(nextReviewDate: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const reviewDate = new Date(nextReviewDate);
  reviewDate.setHours(0, 0, 0, 0);
  return reviewDate <= today;
}

export function getSRSLevelLabel(level: number): string {
  const labels = ['Mới học', 'Nhận biết', 'Quen thuộc', 'Nhớ tốt', 'Thành thạo', 'Đã thuộc'];
  return labels[Math.min(level, 5)];
}

export function getSRSLevelColor(level: number): string {
  const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#6C5CE7'];
  return colors[Math.min(level, 5)];
}
