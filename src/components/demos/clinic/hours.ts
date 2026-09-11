/**
 * 見本「月白歯科クリニック」の診療時間。架空の医院の、架空の時間割。
 * 午前と午後に分かれ、木曜の午後だけ休診、土曜の午後だけ短い ── 歯科の掲示でよくある形。
 * 時刻と曜日の部品は ../openHours（店の営業時間と共通）。
 * 表示に出る時間は必ずここの Span から組み立てる。数字を二か所に書かない。
 */
import {
  dayLabel,
  formatMinute,
  inSpan,
  minuteOfDay,
  type Span,
  type Weekday,
} from "../openHours";

/** 午前・午後の標準の時間帯 */
export const MORNING: Span = { start: 9 * 60 + 30, end: 13 * 60 };
export const AFTERNOON: Span = { start: 14 * 60 + 30, end: 19 * 60 };
/** 土曜の午後だけ、始まりが早く終わりも早い */
export const SATURDAY_AFTERNOON: Span = { start: 14 * 60, end: 17 * 60 };

export type ClinicDay = {
  day: Weekday;
  morning: Span | null;
  afternoon: Span | null;
};

/** 月曜から土曜まで。日曜と祝日は休診なので、この配列に入れない */
export const CLINIC_DAYS: readonly ClinicDay[] = [
  { day: 1, morning: MORNING, afternoon: AFTERNOON },
  { day: 2, morning: MORNING, afternoon: AFTERNOON },
  { day: 3, morning: MORNING, afternoon: AFTERNOON },
  { day: 4, morning: MORNING, afternoon: null },
  { day: 5, morning: MORNING, afternoon: AFTERNOON },
  { day: 6, morning: MORNING, afternoon: SATURDAY_AFTERNOON },
];

/** 表のます目の印 */
export type Mark = "open" | "short" | "closed";

export const MARK_SYMBOLS: Record<Mark, string> = {
  open: "●",
  short: "▲",
  closed: "−",
};

/** 記号だけでは読み上げに乗らないので、同じ意味の語も持つ */
export const MARK_LABELS: Record<Mark, string> = {
  open: "診療",
  short: "短縮",
  closed: "休診",
};

/** その日のその時間帯が、標準どおりか・短縮か・休診か */
export function markFor(span: Span | null, standard: Span): Mark {
  if (!span) return "closed";
  return span.start === standard.start && span.end === standard.end
    ? "open"
    : "short";
}

/** "9:30 - 13:00"。医院の掲示に合わせて時の 0 詰めはしない */
export function spanLabel(span: Span): string {
  return `${formatMinute(span.start, { pad: false })} - ${formatMinute(span.end, { pad: false })}`;
}

/** 表の見出しに出す曜日（月〜土） */
export function clinicDayLabels(): string[] {
  return CLINIC_DAYS.map((entry) => dayLabel(entry.day));
}

/** その時刻に診療しているか。午前と午後のどちらかに入っていれば診療中 */
export function isOpenAtClinic(date: Date): boolean {
  const day = date.getDay() as Weekday;
  const today = CLINIC_DAYS.find((entry) => entry.day === day);
  if (!today) return false;
  const minute = minuteOfDay(date);
  return (
    (today.morning !== null && inSpan(minute, today.morning)) ||
    (today.afternoon !== null && inSpan(minute, today.afternoon))
  );
}

/** 予約フォームの時間帯の選択肢。時間の出どころは上の Span だけにする */
export function slotOptions(): string[] {
  return [
    `午前（${spanLabel(MORNING)}）`,
    `午後（${spanLabel(AFTERNOON)}）`,
    `土曜の午後（${spanLabel(SATURDAY_AFTERNOON)}）`,
  ];
}

/** 表の下に出す一行 */
export const CLOSED_NOTE = "休診：木曜の午後、日曜・祝日";
