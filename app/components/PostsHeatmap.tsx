// Posts heatmap: a 14-week × 7-day grid (周日..周六 row labels). Each cell is
// shaded by how many posts were published that day; days outside the window
// are transparent. The header row carries the section title on the left and
// the yearly summary on the right.
import { useMemo } from 'react';
import { BarChart3 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/ui/tooltip';

interface PostStub {
  date: string;
}

interface PostsHeatmapProps {
  posts: PostStub[];
  totalCount: number;
}

const WEEKS_TO_SHOW = 14;
const SUMMARY_DAYS = 365;
const WEEKDAY_LABELS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

function toDateKey(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

// 0 = no posts, 4 = five or more.
function levelOf(count: number): number {
  if (count >= 5) return 4;
  if (count >= 3) return 3;
  if (count >= 2) return 2;
  if (count >= 1) return 1;
  return 0;
}

function buildTitle(count: number, date: Date): string {
  const label = date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
  return count === 0 ? `无文章 · ${label}` : `${count} 篇文章 · ${label}`;
}

export function PostsHeatmap({ posts, totalCount }: PostsHeatmapProps) {
  const { weeks, yearActiveDays } = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of posts) {
      if (!p.date) continue;
      const d = new Date(p.date);
      if (Number.isNaN(d.getTime())) continue;
      const key = toDateKey(d);
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    // 年度统计与网格窗口分开算：摘要按近一年，网格按最近 14 周。
    let yearActiveDays = 0;
    for (let offset = 0; offset < SUMMARY_DAYS; offset += 1) {
      const date = new Date(today);
      date.setDate(today.getDate() - offset);
      if ((counts.get(toDateKey(date)) ?? 0) > 0) yearActiveDays += 1;
    }

    const rangeStart = new Date(today);
    rangeStart.setDate(rangeStart.getDate() - (WEEKS_TO_SHOW * 7 - 1));
    // Align the grid to full weeks: back to Sunday, forward to Saturday.
    const gridStart = new Date(rangeStart);
    gridStart.setDate(gridStart.getDate() - gridStart.getDay());

    const weekCount = Math.ceil(((today.getTime() - gridStart.getTime()) / 86_400_000 + 1) / 7);
    const weeks: Array<Array<{ count: number; title: string } | null>> = [];

    for (let w = 0; w < weekCount; w += 1) {
      const week: Array<{ count: number; title: string } | null> = [];
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
  }, [posts]);

  return (
    <div>
      {/* 头部：标题居左，年度统计居右两行 */}
      <div className="flex items-start justify-between gap-2 mb-4">
        <h3 className="inline-flex items-center gap-2 text-[1.05rem] font-semibold text-foreground">
          <BarChart3 className="h-4 w-4 text-(--brand)" aria-hidden />
          统计
        </h3>
        <div className="mono-meta text-right leading-relaxed">
          <span className="block">共 {totalCount} 篇文章</span>
          <span className="block">过去一年 {yearActiveDays} 天有更新</span>
        </div>
      </div>

      <div className="grid grid-cols-[38px_1fr] pt-1">
        <div className="grid grid-rows-[repeat(7,14px)] gap-[2px] pr-1.5">
          {WEEKDAY_LABELS.map((label) => (
            <span key={label} className="mono-meta !text-[0.6rem] h-[14px] leading-[14px]">
              {label}
            </span>
          ))}
        </div>
        <div className="flex gap-[2px]">
          {weeks.map((week, wi) => (
            <div key={wi} className="grid grid-rows-[repeat(7,14px)] gap-[2px] flex-1">
              {week.map((day, di) =>
                day ? (
                  <Tooltip key={`${wi}-${di}`}>
                    <TooltipTrigger asChild>
                      <span
                        className={`block h-[14px] w-auto ${day.count > 0 ? 'heatmap-cell-active' : 'heatmap-cell-empty'}`}
                        style={day.count > 0 ? { opacity: 0.45 + levelOf(day.count) * 0.14 } : undefined}
                      />
                    </TooltipTrigger>
                    <TooltipContent>{day.title}</TooltipContent>
                  </Tooltip>
                ) : (
                  <span key={`${wi}-${di}`} />
                )
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
