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

// Calendar uptime: "9 年 7 个月" / "3 个月" / "12 天".
export function formatUptime(startIso: string, now = new Date()): { text: string; days: number } {
  const start = new Date(startIso);
  if (Number.isNaN(start.getTime()) || now.getTime() < start.getTime()) {
    return { text: '0 天', days: 0 };
  }
  const days = Math.floor((now.getTime() - start.getTime()) / 86_400_000);
  let years = now.getFullYear() - start.getFullYear();
  let months = now.getMonth() - start.getMonth();
  let d = now.getDate() - start.getDate();
  if (d < 0) {
    months -= 1;
    d += new Date(now.getFullYear(), now.getMonth(), 0).getDate();
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  const parts: string[] = [];
  if (years > 0) parts.push(`${years} 年`);
  if (months > 0) parts.push(`${months} 个月`);
  if (years === 0 && months === 0) parts.push(`${d} 天`);
  return { text: parts.join(' ') || '0 天', days };
}
