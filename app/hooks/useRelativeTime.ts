// 相对时间格式化：今天 / 昨天 / N天前 / 超过一周回退到 zh-CN 短日期。
import { useEffect, useState } from 'react';

// 以"日历日"为粒度计算而不是 Math.ceil 毫秒差，避免凌晨跨天时出现差一天。
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '未知日期';
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const dayDiff = Math.round((startOfDay(new Date()) - startOfDay(date)) / 86_400_000);
  if (dayDiff <= 0) return '今天';
  if (dayDiff === 1) return '昨天';
  if (dayDiff <= 7) return `${dayDiff}天前`;
  return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'short', day: 'numeric' });
}

// 渲染相对时间，并每分钟自校准一次，跨天后无需手动刷新页面。
// 仅在客户端挂载后开定时器（服务端只算一次），调用方需保证数据本身是
// 客户端获取的（如朋友圈 RSS 流），避免 SSR/CSR 文案不一致。
export function useRelativeTime(dateString: string): string {
  const [label, setLabel] = useState(() => formatRelativeTime(dateString));
  useEffect(() => {
    setLabel(formatRelativeTime(dateString));
    const timer = window.setInterval(() => setLabel(formatRelativeTime(dateString)), 60_000);
    return () => window.clearInterval(timer);
  }, [dateString]);
  return label;
}
