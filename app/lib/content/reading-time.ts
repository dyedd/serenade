// Time/formatting utilities shared by content modules.
import dayjs from 'dayjs';

// Dates render as ISO `YYYY-MM-DD`: sortable, and pairs with the mono meta
// layer used across the site.
export function formatDate(date: string | Date | undefined | null): string {
  if (!date) return '';
  return dayjs(date).format('YYYY-MM-DD');
}

// Chinese-optimised reading time: counts CJK characters + English words
// (weighted 5x). 300 weighted tokens per minute.
export function calculateReadingTime(content: string): { minutes: number; text: string } {
  const plainText = content
    .replace(/`{1,3}[^`]*`{1,3}/g, '')
    .replace(/!\[[^\]]*\]\([^)]+\)/g, '')
    .replace(/\[[^\]]*\]\([^)]+\)/g, '$1')
    .replace(/#{1,6}\s*/g, '')
    .replace(/[*_~>`>-]/g, '')
    .replace(/\n+/g, ' ')
    .trim();

  const chineseChars = plainText.match(/[\u4e00-\u9fa5]/g) ?? [];
  const englishWords = plainText.match(/[a-zA-Z]+/g) ?? [];

  const minutes = Math.max(1, Math.ceil((chineseChars.length + englishWords.length * 5) / 300));
  return { minutes, text: `${minutes} 分钟阅读` };
}

// Sort by date string descending. Empty / invalid dates sink to bottom.
export function sortByDateDesc<T extends { date: string }>(a: T, b: T): number {
  return new Date(b.date).getTime() - new Date(a.date).getTime();
}
