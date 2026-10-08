import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/ui/tooltip';
import type { HeatmapData } from '~/lib/content/heatmap';

const WEEKDAY_LABELS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

function levelOf(count: number): number {
  if (count >= 5) return 4;
  if (count >= 3) return 3;
  if (count >= 2) return 2;
  if (count >= 1) return 1;
  return 0;
}

export function PostsHeatmap({
  data,
  totalCount,
}: {
  data: HeatmapData;
  totalCount: number;
}) {
  const { weeks, yearActiveDays } = data;

  return (
    <div>
      <p className="mb-4 text-sm leading-relaxed text-black/60">
        <span className="block tabular-nums">共 {totalCount} 篇文章</span>
        <span className="block tabular-nums">过去一年 {yearActiveDays} 天有更新</span>
      </p>

      <div className="posts-heatmap grid min-w-0 grid-cols-[38px_minmax(0,1fr)] pt-1">
        <div className="grid grid-rows-[repeat(7,14px)] gap-[2px] pr-1.5">
          {WEEKDAY_LABELS.map((label) => (
            <span key={label} className="mono-meta !text-[0.6rem] h-[14px] leading-[14px]">
              {label}
            </span>
          ))}
        </div>
        <div className="flex min-w-0 gap-[2px]">
          {weeks.map((week, wi) => (
            <div key={wi} className="grid min-w-0 flex-1 grid-rows-[repeat(7,14px)] gap-[2px]">
              {week.map((day, di) =>
                day ? (
                  <Tooltip key={`${wi}-${di}`}>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        aria-label={day.title}
                        className={`block h-[14px] w-auto cursor-default appearance-none border-0 p-0 ${day.count > 0 ? 'heatmap-cell-active' : 'heatmap-cell-empty'}`}
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
