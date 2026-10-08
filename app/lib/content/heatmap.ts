// 由 loader 计算时间窗口，避免 SSR 与客户端重复取当前时间。

export const HEATMAP_WEEKS = 14;
export const HEATMAP_SUMMARY_DAYS = 365;

export interface HeatmapDay {
  count: number;
  title: string;
}

export interface HeatmapData {
  weeks: Array<Array<HeatmapDay | null>>;
  yearActiveDays: number;
}

function toDateKey(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function buildTitle(count: number, date: Date): string {
  const label = date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
  return count === 0 ? `无文章 · ${label}` : `${count} 篇文章 · ${label}`;
}

export function buildHeatmap(dates: string[], now = new Date()): HeatmapData {
  const counts = new Map<string, number>();
  for (const raw of dates) {
    if (!raw) continue;
    const date = new Date(raw);
    if (Number.isNaN(date.getTime())) continue;
    const key = toDateKey(date);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  let yearActiveDays = 0;
  for (let offset = 0; offset < HEATMAP_SUMMARY_DAYS; offset += 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - offset);
    if ((counts.get(toDateKey(date)) ?? 0) > 0) yearActiveDays += 1;
  }

  const rangeStart = new Date(today);
  rangeStart.setDate(rangeStart.getDate() - (HEATMAP_WEEKS * 7 - 1));
  // 对齐到整周：回退到周日，向后补到周六。
  const gridStart = new Date(rangeStart);
  gridStart.setDate(gridStart.getDate() - gridStart.getDay());

  const weekCount = Math.ceil(((today.getTime() - gridStart.getTime()) / 86_400_000 + 1) / 7);
  const weeks: HeatmapData['weeks'] = [];

  for (let w = 0; w < weekCount; w += 1) {
    const week: Array<HeatmapDay | null> = [];
    for (let d = 0; d < 7; d += 1) {
      const date = new Date(gridStart);
      date.setDate(gridStart.getDate() + w * 7 + d);
      if (date < rangeStart || date > today) {
        week.push(null);
        continue;
      }
      const count = counts.get(toDateKey(date)) ?? 0;
      week.push({ count, title: buildTitle(count, date) });
    }
    weeks.push(week);
  }

  return { weeks, yearActiveDays };
}
