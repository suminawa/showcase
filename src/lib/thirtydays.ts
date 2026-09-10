export type DayRow = {
  day: number;
  date: string;
  revenue: number;
  proposals: number;
  replies: number;
  meetings: number;
  humanMinutes: number;
  release: string;
  ai: string;
};

export type Board = { startDate: string; days: DayRow[] };

export type Totals = {
  revenue: number;
  proposals: number;
  replies: number;
  meetings: number;
  humanMinutes: number;
  daysLogged: number;
  avgHumanMinutes: number;
};

export function totals(days: DayRow[]): Totals {
  const sum = (key: "revenue" | "proposals" | "replies" | "meetings" | "humanMinutes") =>
    days.reduce((acc, d) => acc + d[key], 0);
  const humanMinutes = sum("humanMinutes");
  const daysLogged = days.length;
  return {
    revenue: sum("revenue"),
    proposals: sum("proposals"),
    replies: sum("replies"),
    meetings: sum("meetings"),
    humanMinutes,
    daysLogged,
    avgHumanMinutes: daysLogged === 0 ? 0 : Math.round(humanMinutes / daysLogged),
  };
}

export function cumulativeRevenue(days: DayRow[]): number[] {
  let acc = 0;
  return days.map((d) => (acc += d.revenue));
}

/** 折れ線の path。最大値が上端、0 が下端。全部 0 なら下端に平らな線 */
export function sparklinePath(values: number[], width: number, height: number): string {
  if (values.length === 0) return "";
  const max = Math.max(...values, 1);
  const stepX = values.length > 1 ? width / (values.length - 1) : 0;
  return values
    .map((value, i) => {
      const v = Math.max(value, 0);
      return `${i === 0 ? "M" : "L"}${(i * stepX).toFixed(1)},${(height - (v / max) * height).toFixed(1)}`;
    })
    .join(" ");
}
