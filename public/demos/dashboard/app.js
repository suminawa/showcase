// ダッシュボード キット — scripts/build.mjs が src/ から作る。ここを直接編集しない

(function () {
// ===== text.js =====
/**
 * ダッシュボードのどのファイルからも使う、文字まわりの小さな道具。
 * scripts/build.mjs が 1 本にまとめるので、同じ名前の関数をほかのファイルで定義しない。
 */

/**
 * 設定や集計の値を、前後の空白を落とした文字にする。null / undefined は ""。
 * 配列やオブジェクトも ""（読み込んだ値が思わぬ形で検査をすり抜けないように。toString が
 * 壊れた値で落ちることも防ぐ）
 */
function textOf(value) {
  if (value === null || value === undefined) return "";
  const kind = typeof value;
  if (kind === "string") return value.trim();
  if (kind === "number" || kind === "boolean" || kind === "bigint") return String(value);
  return "";
}

/** 全角の英数字・記号（！-～）と全角空白を半角にする（入力欄と検索で同一視するため） */
function toHalfWidth(value) {
  return String(value === null || value === undefined ? "" : value)
    .replace(/[！-～]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0xfee0))
    .replace(/　/g, " ");
}

const HTML_ESCAPES = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };

function escape_(value) {
  return String(value === null || value === undefined ? "" : value).replace(/[&<>"']/g, (ch) => HTML_ESCAPES[ch]);
}

/** 画面のテキストとして出す前に安全な文字にする（文字列を組み立てて innerHTML に渡すときに使う） */
function escapeHtml(value) {
  return escape_(value);
}

/** 属性値（"..."）の中に入れても安全な文字にする */
function escapeAttr(value) {
  return escape_(value);
}

/**
 * 字の幅の見積もりで、全角として数えない字の範囲。
 * 記号・矢印・幾何学模様（▲▼ … など）は、半角なみの幅で出るので外す
 */
const TEXT_NARROW_RANGES_ = [[0x2000, 0x2bff]];

function textIsWide_(code) {
  if (code < 0x1100) return false;
  for (const [from, to] of TEXT_NARROW_RANGES_) {
    if (code >= from && code <= to) return false;
  }
  return true;
}

/**
 * 字の幅を見積もる（字の形を測れないところで、余白・短くする長さ・間引きを決めるために使う）。
 * 全角 12px・半角 7px を目安にして、字の大きさに比例させる。
 * 棒を横にするかを決める model と、札を置く描く側が、同じ見積もりを使う
 */
function estimateTextWidth(text, fontPx = 12) {
  const source = text === null || text === undefined ? "" : String(text);
  let units = 0;
  for (const ch of source) units += textIsWide_(ch.codePointAt(0)) ? 12 : 7;
  return (units * fontPx) / 12;
}

/**
 * 名前をキーにした入れ物が、その名前を自分で持っているか。
 * "toString"・"constructor" のような、書いていないのに JS が最初から持っている名前を
 * 誤って拾わないために、値を読む前にここを通す
 */
function hasOwn(box, name) {
  if (box === null || box === undefined || typeof box !== "object") return false;
  if (typeof name !== "string" || name === "") return false;
  return Object.prototype.hasOwnProperty.call(box, name);
}

/**
 * 名前をキーにした入れ物へ、1 項目を「自分が持つ項目」として入れる。
 * 列の名前は取り込んだ表の見出しなので、"__proto__" のような名前が来ても
 * 入れ物そのものの素性を書き換えないようにする
 */
function setOwn(box, name, value) {
  Object.defineProperty(box, name, { value, writable: true, enumerable: true, configurable: true });
}

/**
 * 表のマスの値を並べ替えるときの比較。数どうしは数の大小、それ以外は文字の単純比較で、
 * order が "asc" なら小さい順、それ以外は大きい順にする。
 * 空（null・undefined・空文字）は、どちらの向きでもいつも最後に置く。
 * 同じ値のときは 0 を返すので、呼ぶ側が元の並びを保てる
 */
function compareCells(a, b, order) {
  const aEmpty = a === null || a === undefined || a === "";
  const bEmpty = b === null || b === undefined || b === "";
  if (aEmpty || bEmpty) return aEmpty && bEmpty ? 0 : aEmpty ? 1 : -1;

  let gap = 0;
  if (typeof a === "number" && typeof b === "number") {
    gap = a - b;
  } else {
    const at = String(a);
    const bt = String(b);
    gap = at < bt ? -1 : at > bt ? 1 : 0;
  }
  // 同じ値は 0 のまま返す（-0 を作らない。呼ぶ側が「変わらない」と見分けられるように）
  if (gap === 0) return 0;
  return order === "asc" ? gap : 0 - gap;
}

/** 行のセルがすべて空か。配列でなければ「見るセルが無い」として空とみなす */
function isBlankRow(row) {
  const cells = Array.isArray(row) ? row : [];
  for (let i = 0; i < cells.length; i += 1) {
    if (textOf(cells[i]) !== "") return false;
  }
  return true;
}

/** n を min〜max の範囲に収める。数として読めない値は min にする */
function clamp(n, min, max) {
  const num = Number(n);
  if (Number.isNaN(num)) return min;
  if (num < min) return min;
  if (num > max) return max;
  return num;
}

// ===== dates.js =====
/**
 * 日付はすべて暦の日付を表す文字 "YYYY-MM-DD"（日付キー）で持ち、計算も文字で行う。
 * Date を内部で使ってよいのは Date.UTC と getUTC* だけ（toDateKey が Date を受け取ったときだけ例外で、
 * ローカルの getFullYear/getMonth/getDate を使う。GAS から渡される Date はスクリプトの時間帯の時刻なので）。
 * 「今日」はここでは読まない。引数を渡さない Date の呼び出しと、いまの時刻を返す呼び出しは使わない。
 * 呼び出し側が today（"YYYY-MM-DD"）を渡す
 */


/** 2 桁に揃える */
function pad2(n) {
  return n < 10 ? "0" + n : String(n);
}

/** Date かどうか。realm をまたいでも見分けられるよう instanceof は使わない */
function isDate_(value) {
  return Object.prototype.toString.call(value) === "[object Date]";
}

/** 年月日から日付キーを作る。実在しない日（2/30 など）は "" */
function ymd_(year, month, day) {
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) return "";
  if (month < 1 || month > 12 || day < 1 || day > 31) return "";
  // Date.UTC(2026, 1, 30) は 3/2 に繰り上がるだけで無効値にならないので、年月日を読み戻して照合する
  const probe = new Date(Date.UTC(year, month - 1, day));
  if (probe.getUTCFullYear() !== year || probe.getUTCMonth() + 1 !== month || probe.getUTCDate() !== day) return "";
  return year + "-" + pad2(month) + "-" + pad2(day);
}

/**
 * 値を日付キー "YYYY-MM-DD" にする。読めなければ ""。
 * 受け付ける形: "2026-09-19"・"2026/9/19"・"2026.9.19"・"2026年9月19日"・ISO の日時の先頭 10 字・Date。
 * "9/19/2026" のような月が先の形は読まない（年の 4 桁で始まる形だけを受け付けるので、自然に弾かれる）。
 * Date は GAS がスクリプトの時間帯で渡すので、UTC ではなく getFullYear/getMonth/getDate を使う。
 */
function toDateKey(value) {
  if (value === null || value === undefined || value === "") return "";
  if (isDate_(value)) {
    if (Number.isNaN(value.getTime())) return "";
    return value.getFullYear() + "-" + pad2(value.getMonth() + 1) + "-" + pad2(value.getDate());
  }
  const raw = toHalfWidth(textOf(value)).trim();
  if (raw === "") return "";
  // ISO の日時（"2026-09-19T10:00:00Z"・"2026-09-19 10:00" など）は先頭 10 字だけを日付として読む
  const isoHead = raw.match(/^(\d{4})-(\d{2})-(\d{2})(?=[T ])/);
  if (isoHead) return ymd_(Number(isoHead[1]), Number(isoHead[2]), Number(isoHead[3]));
  const matched = raw.match(/^(\d{4})[-/年.](\d{1,2})[-/月.](\d{1,2})日?$/);
  if (!matched) return "";
  return ymd_(Number(matched[1]), Number(matched[2]), Number(matched[3]));
}

/** "YYYY-MM-DD" の形で、実在する日付か */
function isDateKey(value) {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) && toDateKey(value) === value;
}

/** 日付キーを、1970-01-01 からの日数にする（Date.UTC 経由） */
function epochDays_(key) {
  const parts = key.split("-").map(Number);
  return Math.round(Date.UTC(parts[0], parts[1] - 1, parts[2]) / 86400000);
}

/** "YYYY-MM-DD" に日数を足す（負の数は引く）。月・年をまたいでもよい */
function addDays(key, days) {
  const parts = key.split("-").map(Number);
  const at = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2] + days));
  return at.getUTCFullYear() + "-" + pad2(at.getUTCMonth() + 1) + "-" + pad2(at.getUTCDate());
}

/** a から b までの日数（b の方が後なら正の数） */
function diffDays(a, b) {
  return epochDays_(b) - epochDays_(a);
}

/** "YYYY-MM-DD" の曜日。0（日）〜6（土） */
function weekdayOf(key) {
  const parts = key.split("-").map(Number);
  return new Date(Date.UTC(parts[0], parts[1] - 1, parts[2])).getUTCDay();
}

/** その日を含む週の月曜日（週は月曜はじまり） */
function weekStartOf(key) {
  const back = (weekdayOf(key) + 6) % 7;
  return addDays(key, -back);
}

/** "YYYY-MM" */
function monthOf(key) {
  return key.slice(0, 7);
}

/** "YYYY-Qn" */
function quarterOf(key) {
  const year = key.slice(0, 4);
  const month = Number(key.slice(5, 7));
  const quarter = Math.floor((month - 1) / 3) + 1;
  return year + "-Q" + quarter;
}

/** "YYYY" */
function yearOf(key) {
  return key.slice(0, 4);
}

/** その日が属する月の初日 */
function monthStart_(key) {
  return key.slice(0, 7) + "-01";
}

/** 次の月の初日 */
function nextMonthStart_(key) {
  const year = Number(key.slice(0, 4));
  const month = Number(key.slice(5, 7));
  const nextYear = month === 12 ? year + 1 : year;
  const nextMonth = month === 12 ? 1 : month + 1;
  return nextYear + "-" + pad2(nextMonth) + "-01";
}

/** その日が属する月の末日 */
function lastDayOfMonth_(key) {
  return addDays(nextMonthStart_(key), -1);
}

/**
 * 日付キーを、指定した刻みの「刻みキー」にする。
 * day はそのまま日付キー、week はその週の月曜日、month は "YYYY-MM"、quarter は "YYYY-Qn"、year は "YYYY"
 */
function bucketKey(key, bucket) {
  if (bucket === "week") return weekStartOf(key);
  if (bucket === "month") return monthOf(key);
  if (bucket === "quarter") return quarterOf(key);
  if (bucket === "year") return yearOf(key);
  return key;
}

/** 刻みキーを、その刻みが始まる日付キーに戻す（bucketKey の逆） */
function bucketStart(bucketKeyString, bucket) {
  const key = textOf(bucketKeyString);
  if (bucket === "month") return key + "-01";
  if (bucket === "quarter") {
    const matched = key.match(/^(\d{4})-Q([1-4])$/);
    if (!matched) return "";
    const firstMonth = (Number(matched[2]) - 1) * 3 + 1;
    return matched[1] + "-" + pad2(firstMonth) + "-01";
  }
  if (bucket === "year") return key + "-01-01";
  return key; // day・week はすでに日付キー
}

/** 月の刻みキー "YYYY-MM" を、0 年 1 月から数えた通し番号にする */
function monthIndex_(key) {
  return Number(key.slice(0, 4)) * 12 + Number(key.slice(5, 7)) - 1;
}

/** 通し番号を月の刻みキー "YYYY-MM" に戻す */
function monthKeyOf_(index) {
  return Math.floor(index / 12) + "-" + pad2((index % 12) + 1);
}

/** 刻みキーを n だけ先へ進める（n が負なら戻る）。bucketsBetween の中だけで使う */
function bucketAdd_(key, bucket, n) {
  if (bucket === "week") return addDays(key, 7 * n);
  if (bucket === "month") return monthKeyOf_(monthIndex_(key) + n);
  if (bucket === "quarter") {
    const matched = key.match(/^(\d{4})-Q([1-4])$/);
    const index = Number(matched[1]) * 4 + Number(matched[2]) - 1 + n;
    return Math.floor(index / 4) + "-Q" + ((index % 4) + 1);
  }
  if (bucket === "year") return String(Number(key) + n);
  return addDays(key, n); // day
}

/** 刻みキーを 1 つ先へ進める（bucketsBetween の内部だけで使う） */
function nextBucketKey_(bucketKeyString, bucket) {
  return bucketAdd_(bucketKeyString, bucket, 1);
}

/**
 * from から to までに刻みがいくつあるか（端を含む）。並びを作らずに数えるので、
 * 何十万個になる組み合わせでも軽い。読めない日付・逆さまの範囲は 0
 */
function bucketCountBetween(from, to, bucket) {
  if (!isDateKey(from) || !isDateKey(to) || diffDays(from, to) < 0) return 0;
  const start = bucketKey(from, bucket);
  const end = bucketKey(to, bucket);
  if (bucket === "week") return Math.floor(diffDays(start, end) / 7) + 1;
  if (bucket === "month") return monthIndex_(end) - monthIndex_(start) + 1;
  if (bucket === "quarter") {
    const at = (key) => Number(key.slice(0, 4)) * 4 + Number(key.slice(6, 7)) - 1;
    return at(end) - at(start) + 1;
  }
  if (bucket === "year") return Number(end) - Number(start) + 1;
  return diffDays(start, end) + 1; // day
}

/** 1 回の呼び出しで並べる刻みキーの上限（超えるときは古いほうを落として、新しいほうを残す） */
const DATES_BUCKET_LIMIT_ = 100000;

/**
 * from から to までの刻みキーを、端を含めて並べる。
 * 数が上限（DATES_BUCKET_LIMIT_）を超えるときは、古いほうを落として**新しいほうから**
 * 上限ぶんだけを返す（末尾＝いちばん新しい刻みは必ず残す）。
 * 画面に出す 400 個までの絞り込みは、呼び出し側（aggregate.js）が行う
 */
function bucketsBetween(from, to, bucket) {
  const total = bucketCountBetween(from, to, bucket);
  if (total <= 0) return [];
  const endKey = bucketKey(to, bucket);
  const keep = Math.min(total, DATES_BUCKET_LIMIT_);
  let cursor = keep === total ? bucketKey(from, bucket) : bucketAdd_(endKey, bucket, -(keep - 1));

  const result = [];
  for (let i = 0; i < keep; i += 1) {
    result.push(cursor);
    if (cursor === endKey) break;
    cursor = nextBucketKey_(cursor, bucket);
  }
  return result;
}

/** 期間の長さから、ちょうどよい刻みを選ぶ（31 日以下は日、183 日以下は週、それ以外は月） */
function autoBucket(from, to) {
  const days = diffDays(from, to);
  if (days <= 31) return "day";
  if (days <= 183) return "week";
  return "month";
}

/** よく使う期間のプリセットを、today（"YYYY-MM-DD"）を基準にした日付キーの範囲にする */
function periodRange(preset, today) {
  const day = isDateKey(today) ? today : "";
  if (day === "") return { from: "", to: "" };
  if (preset === "thisMonth") return { from: monthStart_(day), to: day };
  if (preset === "lastMonth") {
    const prevMonthLastDay = addDays(monthStart_(day), -1);
    return { from: monthStart_(prevMonthLastDay), to: prevMonthLastDay };
  }
  if (preset === "last7") return { from: addDays(day, -6), to: day };
  if (preset === "last30") return { from: addDays(day, -29), to: day };
  if (preset === "last90") return { from: addDays(day, -89), to: day };
  if (preset === "thisYear") return { from: day.slice(0, 4) + "-01-01", to: day };
  // "all" と "custom"、読めない値: from/to は呼び出し側（設定の custom や「比べない」）が決める
  return { from: "", to: "" };
}

/**
 * いま選んでいる範囲の「ひとつ前」を返す。決まりは (a)〜(e):
 * (a) from が月の1日で to が同じ月の末日 → 前の月まるごと。
 * (b) from が月の1日で to が同じ月の途中 → 前の月の1日から同じ「日」まで（前の月が短ければ末日で止める）。
 * (c) from が1/1で to が同じ年 → 前の年の同じ月日まで。
 * (d) それ以外 → 同じ日数の直前の範囲。
 * (e) from も to も ""（all） → 比べない
 */
function previousRange(range) {
  const from = range && typeof range.from === "string" ? range.from : "";
  const to = range && typeof range.to === "string" ? range.to : "";
  if (from === "" && to === "") return { from: "", to: "" };
  if (!isDateKey(from) || !isDateKey(to)) return { from: "", to: "" };

  const fromIsMonthStart = from.slice(8) === "01";
  if (fromIsMonthStart && to.slice(0, 7) === from.slice(0, 7)) {
    const prevMonthStart = monthStart_(addDays(from, -1));
    if (to === lastDayOfMonth_(from)) {
      // (a) 月まるごと
      return { from: prevMonthStart, to: lastDayOfMonth_(prevMonthStart) };
    }
    // (b) 前の月の同じ「日」まで（短ければ末日で止める）
    const day = Number(to.slice(8));
    const prevLastDay = Number(lastDayOfMonth_(prevMonthStart).slice(8));
    return { from: prevMonthStart, to: prevMonthStart.slice(0, 8) + pad2(Math.min(day, prevLastDay)) };
  }

  const fromIsJan1 = from.slice(5) === "01-01";
  if (fromIsJan1 && to.slice(0, 4) === from.slice(0, 4)) {
    // (c) 前の年の同じ月日まで
    const prevYear = Number(from.slice(0, 4)) - 1;
    return { from: prevYear + "-01-01", to: prevYear + to.slice(4) };
  }

  // (d) 同じ日数の直前の範囲
  const length = diffDays(from, to) + 1;
  const newTo = addDays(from, -1);
  return { from: addDays(newTo, -(length - 1)), to: newTo };
}

const EN_MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** 刻みキーを、画面に出す短いラベルにする（lang は既定 "ja"、"en" のときだけ英語） */
function bucketLabel(bucketKeyString, bucket, lang) {
  const isEn = lang === "en";
  const key = textOf(bucketKeyString);
  if (bucket === "day" || bucket === "week") {
    const month = Number(key.slice(5, 7));
    const day = Number(key.slice(8, 10));
    if (bucket === "day") return isEn ? EN_MONTHS[month - 1] + " " + day : month + "/" + day;
    return isEn ? "Wk of " + EN_MONTHS[month - 1] + " " + day : month + "/" + day + "週";
  }
  if (bucket === "month") {
    const year = key.slice(0, 4);
    const month = Number(key.slice(5, 7));
    return isEn ? EN_MONTHS[month - 1] + " " + year : year + "年" + month + "月";
  }
  if (bucket === "quarter") return key.replace("-", " ");
  if (bucket === "year") return isEn ? key : key + "年";
  return key;
}

// ===== numbers.js =====
/**
 * 数の読み取りと書式づくりの道具。設定の値や取り込んだ表の値はここを通して数にする。
 * ここは純粋な計算だけを行い、画面や日時には触れない
 */


const NUMBER_STRIP_PATTERN_ = /[¥￥$,円]/g;
const NUMBER_ONLY_PATTERN_ = /^-?\d+(\.\d+)?$/;

/**
 * 値を数にする。数値はそのまま（NaN・Infinity は null）。
 * 文字は全角を半角にしたあと、通貨の記号（¥ ￥ $）・桁区切りのカンマ・「円」を外し、
 * 前後の空白を落とす。末尾の % は 100 で割らず、その数のまま外す（"12%" → 12）。
 * 残った文字が -?数字(.数字)? の形だけなら数にする。かっこの負数・指数表記・空文字は null
 */
function parseNumber(value) {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value !== "string") return null;
  let text = toHalfWidth(value).replace(NUMBER_STRIP_PATTERN_, "").trim();
  if (text.endsWith("%")) text = text.slice(0, -1).trim();
  return NUMBER_ONLY_PATTERN_.test(text) ? Number(text) : null;
}

/** 3 桁ごとにカンマを入れる（value は 0 以上、すでに小数の桁数を揃えた文字列にしてから呼ぶ） */
function numberGroup_(value, decimals) {
  const fixed = value.toFixed(decimals);
  const parts = fixed.split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.join(".");
}

/**
 * compact 用の書式。小数 1 桁のときだけ末尾の .0 を落とす。
 * grouped が true のときは（いちばん大きい単位で桁があふれたときのために）3 桁ごとにカンマも入れる
 */
function numberFixed_(value, decimals, dropTrailingZero, grouped) {
  const fixed = grouped ? numberGroup_(value, decimals) : value.toFixed(decimals);
  if (dropTrailingZero && decimals === 1 && fixed.endsWith(".0")) return fixed.slice(0, -2);
  return fixed;
}

/**
 * 縮めた数（compact）の小数の桁。札の場所どりを一定に保つため、書式の decimals に
 * 関わらずいつも 1 桁にする（末尾の .0 は落とす）。decimals は縮めない表示にだけ効く
 */
const NUMBER_COMPACT_DECIMALS_ = 1;

/** compact の単位。小さい方から並べる。ja は 万・億、en は K・M・B */
const NUMBER_COMPACT_UNITS_JA_ = [
  { divisor: 1e4, unit: "万" },
  { divisor: 1e8, unit: "億" },
];
const NUMBER_COMPACT_UNITS_EN_ = [
  { divisor: 1e3, unit: "K" },
  { divisor: 1e6, unit: "M" },
  { divisor: 1e9, unit: "B" },
];

/**
 * compact のときの単位と縮めた値。しきい値未満なら null（そのままの数で表す）。
 * まず raw の大きさで単位を選び、decimals 桁に丸めたあとの値が次の単位のしきい値に届くなら
 * （例: 万で丸めると 10000.0 になる）ひとつ上の単位に繰り上げる。届かなくなるまで、または
 * いちばん大きい単位に着くまで繰り返す。いちばん大きい単位（ja の億・en の B）はこれ以上
 * 繰り上げる先が無いので、terminal を true にして返す（3 桁区切りが要るかの目印にする）
 */
function numberCompactScale_(abs, isEn, decimals) {
  const units = isEn ? NUMBER_COMPACT_UNITS_EN_ : NUMBER_COMPACT_UNITS_JA_;
  let index = -1;
  for (let i = units.length - 1; i >= 0; i -= 1) {
    if (abs >= units[i].divisor) {
      index = i;
      break;
    }
  }
  if (index === -1) return null;

  let value = abs / units[index].divisor;
  while (index + 1 < units.length) {
    const rounded = Number(value.toFixed(decimals));
    const nextStep = units[index + 1].divisor / units[index].divisor;
    if (rounded < nextStep) break;
    index += 1;
    value = abs / units[index].divisor;
  }
  return { value, unit: units[index].unit, terminal: index === units.length - 1 };
}

/**
 * value を format・options に沿った文字列にする。
 * format は "number"|"yen"|"usd"|"percent" か { type: "custom", prefix, suffix, decimals }。
 * lang が "en" のときだけ英語の compact 単位（K/M/B）を使う（既定は ja の 万・億）。
 * 小数の桁は既定 0、percent は既定 1。options.decimals を渡すと、それがすべてに勝つ。
 * ただし縮めた数（compact）だけは、いつも 1 桁にする（末尾の .0 は落とす）。
 * 丸めた結果が 0 になったときは、負の符号を付けない（"-0" を作らない）。
 * value が数でなければ "—"
 */
function formatNumber(value, format, lang, options) {
  if (typeof value !== "number" || !Number.isFinite(value)) return "—";
  const opts = options && typeof options === "object" ? options : {};
  const fmt = format && typeof format === "object" ? format : { type: format };
  const isEn = lang === "en";

  const negative = value < 0;
  let abs = Math.abs(value);

  let unit = "";
  let compacting = false;
  let terminal = false;
  if (opts.compact === true && fmt.type !== "percent") {
    // 繰り上げの判定は「実際に表示する桁」で丸めてから行う。縮めた数の桁はいつも 1 つ
    const scaled = numberCompactScale_(abs, isEn, NUMBER_COMPACT_DECIMALS_);
    if (scaled) {
      abs = scaled.value;
      unit = scaled.unit;
      terminal = scaled.terminal;
      compacting = true;
    }
  }

  let decimals = 0;
  if (fmt.type === "percent") decimals = 1;
  if (fmt.type === "custom" && Number.isFinite(fmt.decimals)) decimals = fmt.decimals;
  if (Number.isFinite(opts.decimals)) decimals = opts.decimals;
  if (compacting) decimals = NUMBER_COMPACT_DECIMALS_;

  const numText = compacting ? numberFixed_(abs, decimals, true, terminal) : numberGroup_(abs, decimals);
  // 丸めた結果がゼロなら符号を落とす（-0.4 を小数 0 桁で出すと "-0" になってしまう）
  const sign = negative && Number(numText.split(",").join("")) !== 0 ? "-" : "";

  if (fmt.type === "yen") return sign + "¥" + numText + unit;
  if (fmt.type === "usd") return sign + "$" + numText + unit;
  if (fmt.type === "percent") return sign + numText + unit + "%";
  if (fmt.type === "custom") return sign + (fmt.prefix || "") + numText + unit + (fmt.suffix || "");
  return sign + numText + unit;
}

const NICE_STEP_MULTIPLES_ = [1, 2, 2.5, 5, 10];

/**
 * rawStep 以上になる、1・2・2.5・5 の倍数（× 10^n）でいちばん小さいもの。
 * magnitude は rawStep と同じ桁（10^n）なので residual は必ず 1〜10 未満になり、
 * NICE_STEP_MULTIPLES_ の最後の 10 でいつも見つかる
 */
function numberNiceStep_(rawStep) {
  const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep) + 1e-12));
  const residual = rawStep / magnitude;
  const multiple = NICE_STEP_MULTIPLES_.find((candidate) => residual <= candidate + 1e-9);
  return multiple * magnitude;
}

/** 浮動小数の誤差（0.1 + 0.2 のような）を消す丸め */
function numberRound_(value) {
  return Math.round(value * 1e9) / 1e9;
}

/**
 * min〜max を見やすく表す目盛りの配列を作る。0 以上の範囲は 0 から始める。
 * min が負のときは、min を下回らないきりのいい負の下限から始める。
 * 刻みは 1・2・2.5・5 × 10^n から、count 個ぶんの間隔にいちばん近いものを選ぶ。
 * 最後の目盛りは max 以上。max が min 以下、または max が 0 のときは [0, 1] にする
 */
function niceTicks(min, max, count = 4) {
  if (max <= min || max === 0) return [0, 1];

  const start = min >= 0 ? 0 : min;
  const rawStep = (max - start) / count;
  const step = numberNiceStep_(rawStep);
  const first = min >= 0 ? 0 : Math.floor(min / step) * step;

  const ticks = [first];
  let cursor = first;
  while (cursor < max) {
    cursor = numberRound_(cursor + step);
    ticks.push(cursor);
  }
  return ticks;
}

// ===== csv.js =====
/**
 * CSV の文字と行列（string[][]）を行き来する道具、行列と見出しつきの行の集まりを行き来する道具。
 * ここは純粋な文字処理だけを行う
 */


/**
 * CSV の文字を行列（string[][]）にする。先頭の BOM は外す。
 * 引用符で囲んだ値の中のカンマ・改行（\r\n・\n どちらも）・二重にした "" を読む。
 * 末尾の改行 1 つは行を増やさない（ファイルの終わりの改行はよくあるので、空行を作らない）
 */
function parseCsv(text) {
  let source = typeof text === "string" ? text : textOf(text);
  if (source.charCodeAt(0) === 0xfeff) source = source.slice(1);

  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;
  const length = source.length;
  let i = 0;

  while (i < length) {
    const ch = source[i];
    if (inQuotes) {
      if (ch === '"') {
        if (source[i + 1] === '"') {
          field += '"';
          i += 2;
        } else {
          inQuotes = false;
          i += 1;
        }
      } else {
        field += ch;
        i += 1;
      }
      continue;
    }
    if (ch === '"') {
      inQuotes = true;
      i += 1;
      continue;
    }
    if (ch === ",") {
      row.push(field);
      field = "";
      i += 1;
      continue;
    }
    if (ch === "\r" || ch === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
      i += ch === "\r" && source[i + 1] === "\n" ? 2 : 1;
      continue;
    }
    field += ch;
    i += 1;
  }
  if (field !== "" || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

/**
 * 行列を見出しつきの行の集まりにする。1 行目を見出しとして使う。
 * 見出しは textOf で前後の空白を落とし、空なら「列N」（N は 1 から始まる位置）、
 * 同じ名前が続けて出てきたら「名前 (2)」のように番号を付ける。
 * データ行のうち、セルがすべて空の行（isBlankRow）は読み飛ばす
 */
function rowsToObjects(matrix) {
  const grid = Array.isArray(matrix) ? matrix : [];
  if (grid.length === 0) return { columns: [], rows: [] };

  const headerRow = Array.isArray(grid[0]) ? grid[0] : [];
  // 見出しは取り込んだファイルの文字なので、"toString"・"__proto__" のような名前でも
  // JS が最初から持っている項目と取り違えないよう、Map で数える
  const seenCount = new Map();
  const columns = headerRow.map((cell, index) => {
    const name = textOf(cell) || "列" + (index + 1);
    const seen = (seenCount.get(name) || 0) + 1;
    seenCount.set(name, seen);
    return seen === 1 ? name : name + " (" + seen + ")";
  });

  const rows = [];
  for (let r = 1; r < grid.length; r += 1) {
    const raw = Array.isArray(grid[r]) ? grid[r] : [];
    if (isBlankRow(raw)) continue;
    const record = {};
    for (let c = 0; c < columns.length; c += 1) {
      setOwn(record, columns[c], raw[c] !== undefined ? raw[c] : "");
    }
    rows.push(record);
  }
  return { columns, rows };
}

const CSV_FORMULA_PATTERN_ = /^[=+\-@\t\r\n]/;
const CSV_NEEDS_QUOTE_PATTERN_ = /["\r\n,]/;
// BOM（U+FEFF）。ソースに見えない文字をそのまま置かず、文字コードから作る
const CSV_BOM_ = String.fromCharCode(0xfeff);

/** セル 1 つぶんを CSV の文字にする（数式ガードと引用符の付与） */
function csvFormatCell_(cell) {
  let text = textOf(cell);
  if (CSV_FORMULA_PATTERN_.test(text) && parseNumber(text) === null) {
    text = "'" + text;
  }
  if (CSV_NEEDS_QUOTE_PATTERN_.test(text)) {
    text = '"' + text.replace(/"/g, '""') + '"';
  }
  return text;
}

/**
 * 行列を CSV の文字にする。先頭に BOM、行の区切りは CRLF。
 * セルの先頭が = + - @ タブ 改行 のいずれかなら頭に ' を付けて表計算ソフトが数式と
 * 読まないようにする。ただし parseNumber で数と読める値（"-12" など）には付けない。
 * セルに " , 改行 のいずれかを含むときは引用符で囲み、中の " は "" にする
 */
function toCsv(matrix) {
  const grid = Array.isArray(matrix) ? matrix : [];
  const lines = grid.map((row) => {
    const cells = Array.isArray(row) ? row : [];
    return cells.map(csvFormatCell_).join(",");
  });
  const body = lines.join("\r\n");
  return CSV_BOM_ + body + (lines.length > 0 ? "\r\n" : "");
}

// ===== table.js =====
/**
 * 取り込んだ表の列の型を決め、値をその型に合わせ、行数を上限で切る道具。
 * ここは純粋な計算だけを行う
 */


const TABLE_LEADING_ZERO_PATTERN_ = /^0\d+$/;
const TABLE_LONG_DIGITS_PATTERN_ = /^\d{13,}$/;

/**
 * 電話番号・郵便番号のような先頭が 0 の数字列や、13 桁以上の長い数字列は、
 * 数として読めても「数の列」の証拠には数えない（先頭の 0 が消えたり、桁が大きすぎるため）
 */
function tableLooksLikeIdText_(text) {
  return TABLE_LEADING_ZERO_PATTERN_.test(text) || TABLE_LONG_DIGITS_PATTERN_.test(text);
}

/** 1 つの列について、空でない値のうち数・日付として読める割合から型を決める */
function tableInferColumnType_(rows, column) {
  let nonEmpty = 0;
  let numberish = 0;
  let dateish = 0;
  for (const row of rows) {
    const raw = row && typeof row === "object" ? row[column] : undefined;
    const text = textOf(raw);
    if (text === "") continue;
    nonEmpty += 1;
    if (!tableLooksLikeIdText_(text) && parseNumber(text) !== null) numberish += 1;
    if (toDateKey(text) !== "") dateish += 1;
  }
  if (nonEmpty === 0) return "text";
  if (numberish / nonEmpty >= 0.9) return "number";
  if (dateish / nonEmpty >= 0.9) return "date";
  return "text";
}

/**
 * 各列の型を "number"|"date"|"text" で決める。空でない値の 90% 以上が数なら number、
 * 90% 以上が日付として読めれば date、それ以外・値が無い列は text。
 * overrides（{ 列名: 型 }）に載っている列は、その型をそのまま使う（推論に勝つ）
 */
function inferTypes(columns, rows, overrides) {
  const cols = Array.isArray(columns) ? columns : [];
  const list = Array.isArray(rows) ? rows : [];
  const overrideMap = overrides && typeof overrides === "object" ? overrides : {};
  const result = {};
  for (const column of cols) {
    // 列の名前は取り込んだ表の見出しなので、"toString" のような名前で JS が最初から
    // 持っている項目を拾わないよう、自分が持つ項目だけを読む
    const forced = hasOwn(overrideMap, column) ? overrideMap[column] : undefined;
    const type = forced === "number" || forced === "date" || forced === "text" ? forced : tableInferColumnType_(list, column);
    setOwn(result, column, type);
  }
  return result;
}

/**
 * 行を型どおりの値に作り直す（新しいオブジェクトを返し、元の行は変えない）。
 * number は parseNumber、date は toDateKey、それ以外（text）は textOf の値にする。
 * number・date で読めない値は null、text は読めなくても空文字にする
 */
function coerceRows(rows, types) {
  const list = Array.isArray(rows) ? rows : [];
  const typeMap = types && typeof types === "object" ? types : {};
  const columns = Object.keys(typeMap);
  return list.map((row) => {
    const src = row && typeof row === "object" ? row : {};
    const record = {};
    for (const column of columns) {
      const raw = src[column];
      const type = typeMap[column];
      if (type === "number") {
        setOwn(record, column, parseNumber(raw));
      } else if (type === "date") {
        const key = toDateKey(raw);
        setOwn(record, column, key === "" ? null : key);
      } else {
        setOwn(record, column, textOf(raw));
      }
    }
    return record;
  });
}

/** 1 つのデータにつき、画面が扱う行数の上限（README の「20,000 行」はこの数） */
const TABLE_ROW_LIMIT_ = 20000;

/**
 * 行数が max（既定 TABLE_ROW_LIMIT_）を超えたら、先頭から max 行だけにして truncated: true を返す。
 * 超えていなければそのまま truncated: false
 */
function limitRows(rows, max = TABLE_ROW_LIMIT_) {
  const list = Array.isArray(rows) ? rows : [];
  if (list.length <= max) return { rows: list, truncated: false };
  return { rows: list.slice(0, max), truncated: true };
}

// ===== i18n.js =====
/**
 * 画面に出す固定の文をここに 1 か所にまとめる。ja（既定）と en の 2 つ。
 * ここは文字の組み立てだけを行う純粋な道具
 */

/** 対応している言語 */
const LANGS = ["ja", "en"];

const MESSAGES = {
  ja: {
    "filter.period.thisMonth": "今月",
    "filter.period.lastMonth": "先月",
    "filter.period.last7": "直近 7 日",
    "filter.period.last30": "直近 30 日",
    "filter.period.last90": "直近 90 日",
    "filter.period.thisYear": "今年",
    "filter.period.all": "全期間",
    "filter.period.custom": "期間を指定",
    "filter.period": "期間",
    "filter.from": "開始日",
    "filter.to": "終了日",
    "filter.allValues": "すべて",
    "filter.reset": "絞り込みを戻す",

    "widget.showTable": "表で見る",
    "widget.showChart": "グラフで見る",

    "action.downloadCsv": "CSV をダウンロード",

    "state.noData": "データがありません",
    "state.checkConfig": "設定をご確認ください",
    "state.configIssues": "設定をご確認ください（{count} 件）",
    "state.loading": "読み込んでいます…",
    "state.unavailable": "ただいま表示できません。しばらくしてからお試しください。",
    "state.truncated": "20,000 行までを表示しています",
    "state.bucketCapped": "期間が長いため、新しいほうから {count} 個の区切りだけを表示しています",
    "state.skippedValues": "数として読めない値を {count} 件のぞきました",

    "label.other": "その他",
    "label.goalReached": "達成",
    "label.blank": "（空欄）",
    "label.actual": "実績",
    "label.goal": "目標",
    "label.targetMonth": "対象の月",
    "label.progress": "達成率",
    "label.total": "合計",

    "table.item": "項目",
    "table.value": "値",
    "table.previous": "前の期間",
    "table.delta": "差",

    "error.datasetMissing": "データ「{name}」が見つかりません。設定をご確認ください。",
    "error.columnMissing": "データ「{dataset}」に列「{column}」が見つかりません。設定をご確認ください。",
    "error.goalMissing": "{month} の目標が見つかりません。目標のデータをご確認ください。",
    "error.goalNotPositive": "目標が 0 以下のため、達成率を計算できません。目標のデータをご確認ください。",
    "error.sampleOnlyInDemo": "見本のデータは、見本のページ（demo/app.js）にだけ入っています。配布物では、config と data にご自分のデータをお渡しください。",

    "compare.lastMonth": "先月比",
    "compare.last7": "前の 7 日比",
    "compare.last30": "前の 30 日比",
    "compare.last90": "前の 90 日比",
    "compare.thisYear": "昨年比",
    "compare.generic": "前の期間比",

    "agg.sum": "合計",
    "agg.avg": "平均",
    "agg.count": "件数",
    "agg.distinct": "種類の数",
    "agg.min": "最小",
    "agg.max": "最大",
  },
  en: {
    "filter.period.thisMonth": "This month",
    "filter.period.lastMonth": "Last month",
    "filter.period.last7": "Last 7 days",
    "filter.period.last30": "Last 30 days",
    "filter.period.last90": "Last 90 days",
    "filter.period.thisYear": "This year",
    "filter.period.all": "All time",
    "filter.period.custom": "Custom range",
    "filter.period": "Period",
    "filter.from": "Start date",
    "filter.to": "End date",
    "filter.allValues": "All",
    "filter.reset": "Reset filters",

    "widget.showTable": "View as table",
    "widget.showChart": "View as chart",

    "action.downloadCsv": "Download CSV",

    "state.noData": "No data for this period",
    "state.checkConfig": "Check the settings",
    "state.configIssues": "Check the settings ({count} issues)",
    "state.loading": "Loading…",
    "state.unavailable": "This dashboard is unavailable right now. Please try again later.",
    "state.truncated": "Showing the first 20,000 rows",
    "state.bucketCapped": "This period is long, so only the most recent {count} buckets are shown",
    "state.skippedValues": "Skipped {count} values that are not numbers",

    "label.other": "Other",
    "label.goalReached": "Goal reached",
    "label.blank": "(Blank)",
    "label.actual": "Actual",
    "label.goal": "Goal",
    "label.targetMonth": "Month",
    "label.progress": "Progress",
    "label.total": "Total",

    "table.item": "Item",
    "table.value": "Value",
    "table.previous": "Previous period",
    "table.delta": "Change",

    "error.datasetMissing": 'The dataset "{name}" was not found. Please check the settings.',
    "error.columnMissing": 'The column "{column}" was not found in the dataset "{dataset}". Please check the settings.',
    "error.goalMissing": "No goal was found for {month}. Please check the goal data.",
    "error.goalNotPositive": "Progress cannot be calculated because the goal is zero or less. Please check the goal data.",
    "error.sampleOnlyInDemo": "The sample data ships only with the demo page (demo/app.js). In the released bundle, pass your own data through config and data.",

    "compare.lastMonth": "vs last month",
    "compare.last7": "vs previous 7 days",
    "compare.last30": "vs previous 30 days",
    "compare.last90": "vs previous 90 days",
    "compare.thisYear": "vs last year",
    "compare.generic": "vs previous period",

    "agg.sum": "Sum",
    "agg.avg": "Average",
    "agg.count": "Count",
    "agg.distinct": "Distinct",
    "agg.min": "Min",
    "agg.max": "Max",
  },
};

const VAR_PATTERN_ = /\{(\w+)\}/g;

/** vars の値を文の {name} に差し込む。値が無ければ {name} をそのまま残す */
function fillVars_(text, vars) {
  if (!vars || typeof vars !== "object") return text;
  return text.replace(VAR_PATTERN_, (whole, name) => (vars[name] === undefined ? whole : String(vars[name])));
}

/**
 * lang・key から画面の文を返す。lang が LANGS に無ければ ja にする。
 * key が無ければ key をそのまま返す（差し込みは行わない）
 */
function t(lang, key, vars) {
  const table = MESSAGES[lang] || MESSAGES.ja;
  const text = table[key];
  if (text === undefined) return key;
  return fillVars_(text, vars);
}

// ===== config.js =====
/**
 * ダッシュボードの設定を検査し、そろった形にする 1 か所。
 * JSON から読んだ raw も、configFromSheets が シートから作った raw も、ここを通す。
 * ここは純粋な検査・組み立てだけを行う
 */


const CONFIG_LANGS_ = ["ja", "en"];
const CONFIG_THEMES_ = ["auto", "light", "dark"];
/**
 * 期間の名前の並び。設定の検査・URL の読み取り（filter.js）・画面の select（state.js）は、
 * どれもこの 1 つの並びを使う（3 か所に書くと、足したときに片方だけ古いままになるため）
 */
const CONFIG_PERIODS_ = ["thisMonth", "lastMonth", "last7", "last30", "last90", "thisYear", "all", "custom"];
const CONFIG_SIZES_ = ["s", "m", "l"];
const CONFIG_FORMATS_ = ["number", "yen", "usd", "percent"];
const CONFIG_WIDGET_TYPES_ = ["kpi", "line", "bar", "meter", "table"];
const CONFIG_AGGS_ = ["sum", "avg", "count", "distinct", "min", "max"];
const CONFIG_BUCKETS_ = ["auto", "day", "week", "month", "quarter", "year"];
const CONFIG_COMPARES_ = ["previous", "none"];
const CONFIG_GOOD_WHENS_ = ["up", "down"];
const CONFIG_BAR_SORTS_ = ["value", "label"];
const CONFIG_TABLE_ORDERS_ = ["desc", "asc"];
const CONFIG_MAX_DIMENSIONS_ = 3;
const CONFIG_BAR_TOP_RANGE_ = [1, 20];
const CONFIG_TABLE_TOP_RANGE_ = [1, 200];

const CONFIG_WIDGET_SIZE_DEFAULTS_ = { kpi: "s", meter: "m", bar: "m", line: "l", table: "l" };
/** 小さい札では目盛りも区分名も読めなくなるので、s を受け取らない部品 */
const CONFIG_WIDE_ONLY_TYPES_ = ["line", "bar"];

/** そろった形の設定の既定値。parseConfig はこれを土台にする（この定数自体は書き換えない） */
const DEFAULT_CONFIG = {
  title: "",
  lang: "ja",
  theme: "auto",
  cacheMinutes: 5,
  datasets: {},
  filters: { period: "thisMonth", from: "", to: "", dimensions: [] },
  widgets: [],
};

/** 呼び出しのたびに新しいオブジェクトを返す（DEFAULT_CONFIG を書き換えさせないため） */
function configDefault_() {
  return {
    title: "",
    lang: "ja",
    theme: "auto",
    cacheMinutes: 5,
    datasets: {},
    filters: { period: "thisMonth", from: "", to: "", dimensions: [] },
    widgets: [],
  };
}

function configIsPlainObject_(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

/**
 * 名前をキーにした入れ物（datasets など）から、自身が持つ項目だけを取り出す。
 * "toString"・"constructor" のような、書いていないのに JS が最初から持っている名前を
 * 誤って拾わないため（プロトタイプ越しの読み取りを防ぐ）。無ければ undefined
 */
function configOwn_(obj, name) {
  return name !== "" && Object.prototype.hasOwnProperty.call(obj, name) ? obj[name] : undefined;
}

/**
 * 名前をキーにした入れ物へ、"__proto__" という名前でも入れ物自体のプロトタイプを
 * 書き換えずに、普通の 1 項目として入れる
 */
function configSetOwn_(obj, name, value) {
  Object.defineProperty(obj, name, { value, writable: true, enumerable: true, configurable: true });
}

/**
 * value を「本当に数だけを表しているか」厳しく読む。数値はそのまま（有限のときだけ）。
 * 文字は全角を半角にして前後の空白を落とし、数字だけ（0〜9 の並び）ならその数にする。
 * true/false・配列・小数点を含む文字など、それ以外は null にする
 * （Number(true) が 1 になるような緩い読み替えで誤りを見逃さないため）
 */
function configStrictNumber_(value) {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value !== "string") return null;
  const text = toHalfWidth(value).trim();
  return /^\d+$/.test(text) ? Number(text) : null;
}

/** エラーの文の言語。raw.lang が厳密に "en" のときだけ英語。それ以外はすべて日本語 */
function configErrorLang_(raw) {
  return raw !== null && raw !== undefined && raw.lang === "en" ? "en" : "ja";
}

/** 全体の誤り（部品に属さない）の文 */
function configTopError_(lang, ja, en) {
  return "dashboard: " + (lang === "en" ? en : ja);
}

/** 部品の誤りの文。position は 1 から始まる順番、title は空でもよい */
function configWidgetError_(lang, position, title, ja, en) {
  if (lang === "en") {
    const label = title ? ' "' + title + '"' : "";
    return "dashboard: widget " + position + label + " " + en;
  }
  const label = title ? "「" + title + "」" : "";
  return "dashboard: " + position + " 番目の部品" + label + "の " + ja;
}

/** raw[field] が知られた値の並びに含まれるか。無ければ既定値を、あれば誤りとして知らせる印を返す */
function configPickEnum_(raw, field, allowed, fallback) {
  const value = raw[field];
  if (value === undefined) return { value: fallback, present: false };
  if (allowed.indexOf(value) === -1) return { value: fallback, present: true, invalid: true };
  return { value, present: true };
}

const CONFIG_URL_HTTP_PATTERN_ = /^http:/i;
const CONFIG_URL_HTTPS_PATTERN_ = /^https:/i;
const CONFIG_URL_SCHEME_PATTERN_ = /^[a-zA-Z][a-zA-Z0-9+.-]*:/;
const CONFIG_URL_CONTROL_CHAR_PATTERN_ = /[\x00-\x1f]/;

/**
 * データセットの url が使ってよい形か。使ってよいのは https の URL か、相対パス
 * （バックスラッシュを含まない・// で始まらない・スキームを持たない・制御文字を含まない）だけ。
 * "httpOnly" は http: だけが理由で誤りのとき、それ以外の誤りはまとめて "scheme"
 * （// で始まる、バックスラッシュを含む、https 以外のスキーム、制御文字を含む、のどれか）
 */
function configUrlProblem_(url) {
  if (CONFIG_URL_HTTPS_PATTERN_.test(url)) return null;
  if (CONFIG_URL_HTTP_PATTERN_.test(url)) return "httpOnly";
  if (url.indexOf("\\") !== -1) return "scheme"; // /\evil や \\evil\a のようなバックスラッシュの経路
  if (url.startsWith("//")) return "scheme"; // //evil.example.com のようなプロトコル相対 URL
  if (CONFIG_URL_SCHEME_PATTERN_.test(url)) return "scheme"; // javascript: や ftp: など、https 以外のスキーム
  if (CONFIG_URL_CONTROL_CHAR_PATTERN_.test(url)) return "scheme";
  return null; // スキームも // もバックスラッシュも無い相対パス
}

/**
 * その置き場所を取りに行ってよいか。決まりは configUrlProblem_ の 1 か所だけにあり、
 * これはそれをそのまま真偽で言い直したもの（空の url は「指定なし」なので取りに行かない）。
 * 設定の検査と、実際に取りに行く側の両方から、同じ答えを見られるようにするために外に出してある
 */
function isAllowedDataUrl(url) {
  const want = textOf(url);
  return want !== "" && configUrlProblem_(want) === null;
}

/** データセットの名前として使えない、JS が最初から特別に扱う名前 */
const CONFIG_RESERVED_DATASET_NAMES_ = ["__proto__", "prototype", "constructor"];

/**
 * データセットの url を検査する。空のときは「指定なし」として何も言わない
 * （data で行を渡すときと、スプレッドシート版では url を書かないため）。
 * 書かれているのに使えない形のときだけ誤りにし、url は空にして取りに行かせない。
 * source が "sheets" のときも同じ検査を通す（取りに行く側と同じ決まりにそろえるため）
 */
function configCheckUrl_(name, value, lang, errors) {
  const url = textOf(value);
  if (url === "") return "";
  const problem = configUrlProblem_(url);
  if (problem === null) return url;
  if (problem === "httpOnly") {
    errors.push(
      configTopError_(lang, "データセット「" + name + "」の url は https の URL にしてください", 'dataset "' + name + '" url must use https.')
    );
  } else {
    errors.push(configTopError_(lang, "データセット「" + name + "」の url を確認してください", 'dataset "' + name + '" url is not valid.'));
  }
  return "";
}

/**
 * raw.datasets を検査してそろえる。source が "sheets" かつ raw.datasets が無いときは、
 * GAS の仕組み（データセット名 = シート名、存在は読み込み時にサーバーが確かめる）として、
 * 「datasets が無い」という全体の誤りにしない
 */
function configBuildDatasets_(raw, lang, errors) {
  const isSheetsSource = raw.source === "sheets";
  const hasDatasets = raw.datasets !== undefined;

  if (!hasDatasets) {
    if (!isSheetsSource) {
      errors.push(configTopError_(lang, "datasets（データセット）を設定してください", "Add at least one dataset in datasets."));
    }
    return { datasets: {}, skipExistenceCheck: isSheetsSource, broken: false };
  }

  if (!configIsPlainObject_(raw.datasets)) {
    errors.push(configTopError_(lang, "datasets の形式を確認してください", "datasets is not a valid object."));
    return { datasets: {}, skipExistenceCheck: false, broken: true };
  }

  const datasets = {};
  for (const rawName of Object.keys(raw.datasets)) {
    const name = textOf(rawName);
    if (name === "") continue;
    if (CONFIG_RESERVED_DATASET_NAMES_.indexOf(name) !== -1) {
      errors.push(
        configTopError_(
          lang,
          "データの名前「" + name + "」は使えません。別の名前にしてください",
          'The name "' + name + '" cannot be used for a dataset. Please choose a different name.'
        )
      );
      continue;
    }
    const entry = raw.datasets[rawName];
    const src = configIsPlainObject_(entry) ? entry : {};
    const dateColumn = textOf(src.dateColumn);
    const url = configCheckUrl_(name, src.url, lang, errors);
    const types = configIsPlainObject_(src.types) ? src.types : {};
    datasets[name] = { url, dateColumn, types };
  }
  return { datasets, skipExistenceCheck: false, broken: false };
}

/** dataset 名が使えるか（存在の検査を省く場合は、空でなければ使えるとする） */
function configDatasetExists_(name, datasetsCtx) {
  if (name === "") return false;
  if (datasetsCtx.skipExistenceCheck) return true;
  return Object.prototype.hasOwnProperty.call(datasetsCtx.datasets, name);
}

function configBuildFilters_(raw, lang, errors) {
  const filters = configIsPlainObject_(raw.filters) ? raw.filters : {};

  const periodPick = configPickEnum_(filters, "period", CONFIG_PERIODS_, "thisMonth");
  if (periodPick.invalid) {
    errors.push(configTopError_(lang, "filters.period（期間）の値が正しくありません", "filters.period is not valid."));
  }

  let from = textOf(filters.from);
  if (from !== "" && !isDateKey(from)) {
    errors.push(configTopError_(lang, "filters.from の値が正しくありません", "filters.from is not valid."));
    from = "";
  }
  let to = textOf(filters.to);
  if (to !== "" && !isDateKey(to)) {
    errors.push(configTopError_(lang, "filters.to の値が正しくありません", "filters.to is not valid."));
    to = "";
  }

  let dimensions = Array.isArray(filters.dimensions) ? filters.dimensions.map(textOf).filter((v) => v !== "") : [];
  if (dimensions.length > CONFIG_MAX_DIMENSIONS_) {
    errors.push(
      configTopError_(
        lang,
        "filters.dimensions（絞り込みの列）は " + CONFIG_MAX_DIMENSIONS_ + " つまでにしてください",
        "filters.dimensions can have at most " + CONFIG_MAX_DIMENSIONS_ + " columns."
      )
    );
    dimensions = dimensions.slice(0, CONFIG_MAX_DIMENSIONS_);
  }

  return { period: periodPick.value, from, to, dimensions };
}

/** agg が "count" でなければ value が要る、という決まりに沿って value を取り出す */
function configRequireValue_(item, agg) {
  const value = textOf(item.value);
  if (value === "" && agg !== "count") return { ok: false };
  return { ok: true, value };
}

function configBuildFormat_(item) {
  if (item.format === undefined) return { ok: true, value: "number" };
  if (typeof item.format === "string") {
    if (CONFIG_FORMATS_.indexOf(item.format) === -1) return { ok: false };
    return { ok: true, value: item.format };
  }
  if (configIsPlainObject_(item.format) && item.format.type === "custom") {
    let decimals = 0;
    if (item.format.decimals !== undefined) {
      const num = configStrictNumber_(item.format.decimals);
      if (num === null || !Number.isInteger(num) || num < 0) return { ok: false };
      decimals = num;
    }
    return {
      ok: true,
      value: { type: "custom", prefix: textOf(item.format.prefix), suffix: textOf(item.format.suffix), decimals },
    };
  }
  return { ok: false };
}

/** top（上位の数）。範囲に丸めず、外れていれば誤り。true や "8.5" のような値も誤りにする */
function configBuildTop_(item, range, fallback) {
  if (item.top === undefined) return { ok: true, value: fallback };
  const num = configStrictNumber_(item.top);
  if (num === null || !Number.isInteger(num) || num < range[0] || num > range[1]) return { ok: false };
  return { ok: true, value: num };
}

/** 種類に関わらず使う size・format を組み立てる。誤りがあれば { ok:false, field } を返す */
function configBuildCommonTail_(item, type) {
  const sizePick = configPickEnum_(item, "size", CONFIG_SIZES_, CONFIG_WIDGET_SIZE_DEFAULTS_[type]);
  if (sizePick.invalid) return { ok: false, field: "size" };
  if (sizePick.value === "s" && CONFIG_WIDE_ONLY_TYPES_.indexOf(type) !== -1) return { ok: false, field: "sizeSmall" };
  const format = configBuildFormat_(item);
  if (!format.ok) return { ok: false, field: "format" };
  return { ok: true, size: sizePick.value, format: format.value, note: textOf(item.note) };
}

function configBuildKpi_(item, ctx) {
  const aggPick = configPickEnum_(item, "agg", CONFIG_AGGS_, "sum");
  if (aggPick.invalid) return { ok: false, field: "agg" };
  const valuePick = configRequireValue_(item, aggPick.value);
  if (!valuePick.ok) return { ok: false, field: "value" };

  const comparePick = configPickEnum_(item, "compare", CONFIG_COMPARES_, "previous");
  if (comparePick.invalid) return { ok: false, field: "compare" };
  const goodWhenPick = configPickEnum_(item, "goodWhen", CONFIG_GOOD_WHENS_, "up");
  if (goodWhenPick.invalid) return { ok: false, field: "goodWhen" };
  if (item.sparkline !== undefined && typeof item.sparkline !== "boolean") return { ok: false, field: "sparkline" };
  const sparkline = item.sparkline === undefined ? true : item.sparkline;

  let compare = comparePick.value;
  if (compare === "previous") {
    const dataset = configOwn_(ctx.datasets, textOf(item.dataset));
    if (!dataset || dataset.dateColumn === "") compare = "none";
  }

  return { ok: true, extra: { value: valuePick.value, agg: aggPick.value, compare, goodWhen: goodWhenPick.value, sparkline } };
}

function configBuildLine_(item, ctx) {
  const aggPick = configPickEnum_(item, "agg", CONFIG_AGGS_, "sum");
  if (aggPick.invalid) return { ok: false, field: "agg" };
  const valuePick = configRequireValue_(item, aggPick.value);
  if (!valuePick.ok) return { ok: false, field: "value" };
  const bucketPick = configPickEnum_(item, "bucket", CONFIG_BUCKETS_, "auto");
  if (bucketPick.invalid) return { ok: false, field: "bucket" };

  const dataset = configOwn_(ctx.datasets, textOf(item.dataset));
  const ownDateColumn = textOf(item.dateColumn);
  const dateColumn = ownDateColumn !== "" ? ownDateColumn : dataset ? dataset.dateColumn : "";
  if (dateColumn === "") return { ok: false, field: "dateColumn" };

  return {
    ok: true,
    extra: { value: valuePick.value, agg: aggPick.value, splitBy: textOf(item.splitBy), bucket: bucketPick.value, dateColumn },
  };
}

function configBuildBar_(item) {
  const category = textOf(item.category);
  if (category === "") return { ok: false, field: "category" };
  const aggPick = configPickEnum_(item, "agg", CONFIG_AGGS_, "sum");
  if (aggPick.invalid) return { ok: false, field: "agg" };
  const valuePick = configRequireValue_(item, aggPick.value);
  if (!valuePick.ok) return { ok: false, field: "value" };
  const topPick = configBuildTop_(item, CONFIG_BAR_TOP_RANGE_, 8);
  if (!topPick.ok) return { ok: false, field: "top" };
  const sortPick = configPickEnum_(item, "sort", CONFIG_BAR_SORTS_, "value");
  if (sortPick.invalid) return { ok: false, field: "sort" };
  const horizontal = item.horizontal;
  if (horizontal !== undefined && horizontal !== true && horizontal !== false && horizontal !== "auto") {
    return { ok: false, field: "horizontal" };
  }

  return {
    ok: true,
    extra: {
      category,
      value: valuePick.value,
      agg: aggPick.value,
      splitBy: textOf(item.splitBy),
      top: topPick.value,
      sort: sortPick.value,
      horizontal: horizontal === undefined ? "auto" : horizontal,
    },
  };
}

function configBuildMeterTarget_(item, ctx) {
  const raw = item.target;
  if (raw === undefined) return { ok: false, field: "target", reason: "missing" };
  if (typeof raw === "number") {
    if (!Number.isFinite(raw)) return { ok: false, field: "target", reason: "invalid" };
    return { ok: true, value: raw };
  }
  if (!configIsPlainObject_(raw)) return { ok: false, field: "target", reason: "invalid" };

  const dataset = textOf(raw.dataset);
  const value = textOf(raw.value);
  if (dataset === "" || value === "") return { ok: false, field: "target", reason: "invalid" };
  if (!configDatasetExists_(dataset, ctx)) return { ok: false, field: "target", reason: "notFound", dataset };
  const aggPick = configPickEnum_(raw, "agg", CONFIG_AGGS_, "sum");
  if (aggPick.invalid) return { ok: false, field: "target", reason: "invalid" };
  const matchMonth = textOf(raw.matchMonth) || "月";
  return { ok: true, value: { dataset, value, agg: aggPick.value, matchMonth } };
}

function configBuildMeter_(item, ctx) {
  const aggPick = configPickEnum_(item, "agg", CONFIG_AGGS_, "sum");
  if (aggPick.invalid) return { ok: false, field: "agg" };
  const valuePick = configRequireValue_(item, aggPick.value);
  if (!valuePick.ok) return { ok: false, field: "value" };
  const targetPick = configBuildMeterTarget_(item, ctx);
  if (!targetPick.ok) return targetPick;

  return { ok: true, extra: { value: valuePick.value, agg: aggPick.value, target: targetPick.value } };
}

function configBuildTableColumns_(columns) {
  const result = [];
  for (const columnDef of columns) {
    const src = configIsPlainObject_(columnDef) ? columnDef : {};
    const value = textOf(src.value);
    if (value === "") return { ok: false };
    const aggPick = configPickEnum_(src, "agg", CONFIG_AGGS_, "sum");
    if (aggPick.invalid) return { ok: false };
    const format = configBuildFormat_(src);
    if (!format.ok) return { ok: false };
    const label = textOf(src.label) || value;
    result.push({ value, agg: aggPick.value, label, format: format.value });
  }
  return { ok: true, value: result };
}

function configSplitColumnList_(text) {
  return text
    .split(/[,、]/)
    .map((v) => v.trim())
    .filter((v) => v !== "");
}

function configBuildTable_(item) {
  const isDetail = textOf(item.rows) === "latest";
  const topPick = configBuildTop_(item, CONFIG_TABLE_TOP_RANGE_, 20);
  if (!topPick.ok) return { ok: false, field: "top" };

  if (isDetail) {
    const columns = Array.isArray(item.columns) ? item.columns.map(textOf).filter((v) => v !== "") : [];
    if (columns.length === 0) return { ok: false, field: "columns" };
    return { ok: true, extra: { rows: "latest", columns, top: topPick.value } };
  }

  const groupBy = textOf(item.groupBy);
  if (groupBy === "") return { ok: false, field: "groupBy" };
  if (!Array.isArray(item.columns) || item.columns.length === 0) return { ok: false, field: "columns" };
  const columnsPick = configBuildTableColumns_(item.columns);
  if (!columnsPick.ok) return { ok: false, field: "columns" };
  const orderPick = configPickEnum_(item, "order", CONFIG_TABLE_ORDERS_, "desc");
  if (orderPick.invalid) return { ok: false, field: "order" };

  return {
    ok: true,
    extra: { groupBy, columns: columnsPick.value, sort: textOf(item.sort), order: orderPick.value, top: topPick.value },
  };
}

const CONFIG_WIDGET_FIELD_TEXT_ = {
  agg: { ja: "agg（集計）を確認してください", en: "aggregation is not valid." },
  value: { ja: "value（値の列）を指定してください", en: "is missing its value column." },
  compare: { ja: "compare（比較）を確認してください", en: "compare option is not valid." },
  goodWhen: { ja: "goodWhen（良し悪しの向き）を確認してください", en: "goodWhen option is not valid." },
  sparkline: { ja: "sparkline（推移の表示）を確認してください", en: "sparkline option is not valid." },
  bucket: { ja: "bucket（刻み）を確認してください", en: "bucket option is not valid." },
  dateColumn: { ja: "dateColumn（日付の列）を指定してください", en: "is missing its date column." },
  category: { ja: "category（区分の列）を指定してください", en: "is missing its category column." },
  top: { ja: "top（上位の数）を確認してください", en: "top is not valid." },
  sort: { ja: "sort（並び）を確認してください", en: "sort option is not valid." },
  horizontal: { ja: "horizontal（向き）を確認してください", en: "horizontal option is not valid." },
  groupBy: { ja: "groupBy（区分の列）を指定してください", en: "is missing its groupBy column." },
  columns: { ja: "columns（列）を指定してください", en: "is missing its columns." },
  order: { ja: "order（並び順）を確認してください", en: "order option is not valid." },
  size: { ja: "size（大きさ）を確認してください", en: "size is not valid." },
  sizeSmall: {
    ja: "size は m か l にしてください（折れ線と棒は小さい札では読めません）",
    en: "size must be m or l, because a line or bar chart cannot be read in a small card.",
  },
  format: { ja: "format（書式）を確認してください", en: "format is not valid." },
  dataset: { ja: "dataset（データ）を指定してください", en: "is missing its dataset." },
  type: { ja: "type（種類）を確認してください", en: "type is not valid." },
};

function configFieldFailureText_(field) {
  return CONFIG_WIDGET_FIELD_TEXT_[field] || CONFIG_WIDGET_FIELD_TEXT_.format;
}

/** 1 つの部品を検査する。だめなら { id, type: "error", title, message } を、よければ組み立てた部品を返す */
function configBuildWidget_(item, index, ctx, lang, errors) {
  const position = index + 1;
  const raw = configIsPlainObject_(item) ? item : {};
  const title = textOf(raw.title);
  const id = "w" + position;

  const fail = (jaEn, extraJa, extraEn) => {
    const text = jaEn === "notFoundDataset"
      ? { ja: "dataset「" + extraJa + "」が見つかりません", en: 'dataset "' + extraEn + '" was not found.' }
      : jaEn === "notFoundTargetDataset"
      ? { ja: "target の dataset「" + extraJa + "」が見つかりません", en: 'target dataset "' + extraEn + '" was not found.' }
      : jaEn === "targetMissing"
      ? { ja: "target（目標）を指定してください", en: "is missing its target." }
      : jaEn === "targetInvalid"
      ? { ja: "target（目標）を確認してください", en: "target is not valid." }
      : configFieldFailureText_(jaEn);
    const message = configWidgetError_(lang, position, title, text.ja, text.en);
    errors.push(message);
    return { id, type: "error", title, message };
  };

  const typePick = configPickEnum_(raw, "type", CONFIG_WIDGET_TYPES_, "");
  if (typePick.value === "") return fail("type");

  const datasetName = textOf(raw.dataset);
  if (datasetName === "") return fail("dataset");
  if (ctx.datasetsBroken) {
    // datasets 自体が使えない形のときは、全体の誤りをすでに 1 件出しているので、
    // ここでは部品を誤りの札にするだけにして、同じ原因の文を errors に重ねない
    const text = { ja: "データセットを確認できないため使えません", en: "cannot be used because datasets could not be checked." };
    const message = configWidgetError_(lang, position, title, text.ja, text.en);
    return { id, type: "error", title, message };
  }
  if (!configDatasetExists_(datasetName, ctx)) return fail("notFoundDataset", datasetName, datasetName);

  let built;
  if (typePick.value === "kpi") built = configBuildKpi_(raw, ctx);
  else if (typePick.value === "line") built = configBuildLine_(raw, ctx);
  else if (typePick.value === "bar") built = configBuildBar_(raw);
  else if (typePick.value === "meter") built = configBuildMeter_(raw, ctx);
  else built = configBuildTable_(raw);

  if (!built.ok) {
    if (built.reason === "missing") return fail("targetMissing");
    if (built.reason === "notFound") return fail("notFoundTargetDataset", built.dataset, built.dataset);
    if (built.reason === "invalid") return fail("targetInvalid");
    return fail(built.field);
  }

  const tail = configBuildCommonTail_(raw, typePick.value);
  if (!tail.ok) return fail(tail.field);

  return Object.assign({ id, type: typePick.value, title, dataset: datasetName, size: tail.size, format: tail.format, note: tail.note }, built.extra);
}

/**
 * 設定を検査し、そろった形にする。raw がオブジェクトでなければ、空の部品を持つ既定の形と
 * 1 つの全体の誤りを返す。部品ごとの誤りは、その部品を { type: "error" } の札に置き換え、
 * 同じ文を errors にも入れる
 */
function parseConfig(raw) {
  const lang = configErrorLang_(raw);

  if (!configIsPlainObject_(raw)) {
    const config = configDefault_();
    return { config, errors: [configTopError_(lang, "設定を読み取れませんでした", "The configuration could not be read.")] };
  }

  const errors = [];
  const config = configDefault_();
  config.title = textOf(raw.title);

  const langPick = configPickEnum_(raw, "lang", CONFIG_LANGS_, "ja");
  if (langPick.invalid) errors.push(configTopError_(lang, "lang（言語）の値が正しくありません", "lang is not valid."));
  config.lang = langPick.value;

  const themePick = configPickEnum_(raw, "theme", CONFIG_THEMES_, "auto");
  if (themePick.invalid) errors.push(configTopError_(lang, "theme（テーマ）の値が正しくありません", "theme is not valid."));
  config.theme = themePick.value;

  if (raw.cacheMinutes === undefined) {
    config.cacheMinutes = 5;
  } else {
    const minutes = configStrictNumber_(raw.cacheMinutes);
    if (minutes === null || minutes < 0 || minutes > 1440) {
      errors.push(configTopError_(lang, "cacheMinutes（更新の間隔）の値が正しくありません", "cacheMinutes is not valid."));
      config.cacheMinutes = 5;
    } else {
      config.cacheMinutes = minutes;
    }
  }

  const datasetsResult = configBuildDatasets_(raw, lang, errors);
  config.datasets = datasetsResult.datasets;
  const ctx = {
    datasets: datasetsResult.datasets,
    skipExistenceCheck: datasetsResult.skipExistenceCheck,
    datasetsBroken: datasetsResult.broken,
  };

  config.filters = configBuildFilters_(raw, lang, errors);

  if (!Array.isArray(raw.widgets) || raw.widgets.length === 0) {
    errors.push(configTopError_(lang, "部品を 1 つ以上設定してください", "Add at least one widget."));
    config.widgets = [];
  } else {
    config.widgets = raw.widgets.map((item, index) => configBuildWidget_(item, index, ctx, lang, errors));
  }

  return { config, errors };
}

// ---- configFromSheets ---------------------------------------------------

const CONFIG_SHEET_PERIODS_ = {
  今月: "thisMonth",
  先月: "lastMonth",
  直近7日: "last7",
  直近30日: "last30",
  直近90日: "last90",
  今年: "thisYear",
  全期間: "all",
  期間を指定: "custom",
};
const CONFIG_SHEET_LANGS_ = { 日本語: "ja", 英語: "en" };
const CONFIG_SHEET_THEMES_ = { 自動: "auto", 明るい: "light", 暗い: "dark" };
const CONFIG_SHEET_TYPES_ = { 数字: "kpi", 折れ線: "line", 棒: "bar", 目標: "meter", 表: "table" };
const CONFIG_SHEET_AGGS_ = { 合計: "sum", 平均: "avg", 件数: "count", 種類の数: "distinct", 最小: "min", 最大: "max" };
const CONFIG_SHEET_BUCKETS_ = { 自動: "auto", 日: "day", 週: "week", 月: "month", 四半期: "quarter", 年: "year" };
const CONFIG_SHEET_FORMATS_ = { 数値: "number", 円: "yen", ドル: "usd", 割合: "percent", パーセント: "percent" };
const CONFIG_SHEET_SIZES_ = { 小: "s", 中: "m", 大: "l" };
const CONFIG_SHEET_BAR_SORTS_ = { 値: "value", 名前: "label" };
/** 「比べる」（種類が 数字 のときだけ使う）。空欄は前の期間と比べる */
const CONFIG_SHEET_COMPARES_ = { なし: "none", 前の期間: "previous" };
/**
 * 「良し悪し」（種類が 数字 のときだけ使う）。空欄は「上がると良い」。
 * 解約数・返品額・経費のように、下がったほうが良い数のときに「下がると良い」と書く
 */
const CONFIG_SHEET_GOOD_WHENS_ = { 上がると良い: "up", 下がると良い: "down" };
/** 「明細」（種類が 表 のときだけ使う）。空欄はまとめた表、「最新」は新しい順に行をそのまま並べる表 */
const CONFIG_SHEET_TABLE_ROWS_ = { 最新: "latest" };

/**
 * `定義` シートの見出し。並びは問わず、知らない見出しは読み飛ばす（configSheetHeaderIndex_）。
 * 「比べる」「明細」は後から足した列なので、無くてもそれまでどおり読める。
 * - 種類: 数字 / 折れ線 / 棒 / 目標 / 表
 * - 集計: 合計 / 平均 / 件数 / 種類の数 / 最小 / 最大
 * - 刻み: 自動 / 日 / 週 / 月 / 四半期 / 年
 * - 書式: 数値 / 円 / ドル / 割合（表のときは「値の列」と同じ並びで、列ごとの書式）
 * - 目標: 数、または「シート名!列名」「シート名!列名!月の列」
 * - 大きさ: 小 / 中 / 大
 * - 並び: 棒は 値 / 名前、表は並べ替えに使う列の見出し
 * - 比べる: なし / 前の期間
 * - 良し悪し: 上がると良い / 下がると良い
 * - 明細: 最新
 */
const CONFIG_DEFINITION_COLUMNS_ = [
  "種類",
  "題",
  "データ",
  "値の列",
  "集計",
  "区分の列",
  "分ける列",
  "日付の列",
  "刻み",
  "書式",
  "目標",
  "大きさ",
  "上位",
  "並び",
  "比べる",
  "良し悪し",
  "明細",
];

/** 見出し行から、知っている列名の位置を調べる（見出しの並びは問わない。知らない列は無視する） */
function configSheetHeaderIndex_(headerRow, names) {
  const row = Array.isArray(headerRow) ? headerRow : [];
  const index = {};
  for (const name of names) {
    const at = row.findIndex((cell) => textOf(cell) === name);
    if (at !== -1) index[name] = at;
  }
  return index;
}

function configSheetCell_(row, index, name) {
  const at = index[name];
  return at === undefined ? "" : textOf(row[at]);
}

/** 日本語・英語どちらでも受ける、辞書引きの読み替え（辞書に無ければそのまま返し、parseConfig に判断させる） */
function configSheetMap_(text, dict) {
  if (text === "") return undefined;
  return Object.prototype.hasOwnProperty.call(dict, text) ? dict[text] : text;
}

/**
 * `設定` の日付のマスを "YYYY-MM-DD" にする。日付として入力されたマスは Date で届くので、
 * まず日付として読み、読めなければ書かれた文字をそのまま渡す（誤りの判断は parseConfig に任せる）
 */
function configSheetDate_(cell) {
  const key = toDateKey(cell);
  return key !== "" ? key : textOf(cell);
}

/** 行がすべて空文字か */
function configSheetRowIsBlank_(cells) {
  return cells.every((cell) => cell === "");
}

/**
 * "目標" の 1 マスを、固定の数か目標の参照にする。
 * 参照は「シート名!列名」、月の列の名前が「月」でなければ「シート名!列名!月の列」と書く
 */
function configSheetParseTarget_(text) {
  if (text === "") return undefined;
  const asNumber = parseNumber(text);
  if (asNumber !== null) return asNumber;
  const parts = text.split("!").map((part) => part.trim());
  // 読めない形はそのまま渡し、parseConfig に誤りとして扱わせる
  if (parts.length < 2 || parts.length > 3 || parts.some((part) => part === "")) return text;
  return { dataset: parts[0], value: parts[1], agg: "sum", matchMonth: parts.length === 3 ? parts[2] : "月" };
}

/** 表の「値の列」の 1 つ。「列名」か「列名=見出し」（見出しを省いたら列名をそのまま見出しにする） */
function configSheetColumnAlias_(text) {
  const at = text.indexOf("=");
  if (at === -1) return { value: text, label: text };
  const value = text.slice(0, at).trim();
  const label = text.slice(at + 1).trim();
  return { value, label: label === "" ? value : label };
}

/** 表の「値の列」から、列ごとの定義を組み立てる（書式は「書式」の同じ並びの値） */
function configSheetTableColumns_(valueText, formatText, agg) {
  const formats = configSplitColumnList_(formatText).map((text) => configSheetMap_(text, CONFIG_SHEET_FORMATS_));
  return configSplitColumnList_(valueText).map((entry, at) => {
    const alias = configSheetColumnAlias_(entry);
    const column = { value: alias.value, agg: agg || "sum", label: alias.label };
    if (formats[at] !== undefined) column.format = formats[at];
    return column;
  });
}

/**
 * `設定`・`定義` シート（見出し行を含む 2 次元配列）を、parseConfig に渡せる raw の形にする。
 * 検査はしない（parseConfig の 1 か所だけで行う）
 */
function configFromSheets(settingsRows, definitionRows) {
  const raw = { source: "sheets", filters: {}, datasets: {}, widgets: [] };

  const settings = Array.isArray(settingsRows) ? settingsRows.slice(1) : [];
  for (const row of settings) {
    const cells = Array.isArray(row) ? row : [];
    const item = textOf(cells[0]);
    const value = textOf(cells[1]);
    if (item === "") continue;
    if (item === "題名") raw.title = value;
    else if (item === "言語") raw.lang = configSheetMap_(value, CONFIG_SHEET_LANGS_);
    else if (item === "テーマ") raw.theme = configSheetMap_(value, CONFIG_SHEET_THEMES_);
    else if (item === "期間") raw.filters.period = configSheetMap_(value, CONFIG_SHEET_PERIODS_);
    else if (item === "開始日") raw.filters.from = configSheetDate_(cells[1]);
    else if (item === "終了日") raw.filters.to = configSheetDate_(cells[1]);
    else if (item === "絞り込みの列") raw.filters.dimensions = configSplitColumnList_(value);
  }

  const definitionGrid = Array.isArray(definitionRows) ? definitionRows : [];
  const headerRow = definitionGrid[0];
  const index = configSheetHeaderIndex_(headerRow, CONFIG_DEFINITION_COLUMNS_);
  const datasetDateColumns = {};

  const widgetRows = [];
  for (let r = 1; r < definitionGrid.length; r += 1) {
    const row = Array.isArray(definitionGrid[r]) ? definitionGrid[r] : [];
    const cells = {};
    for (const name of CONFIG_DEFINITION_COLUMNS_) cells[name] = configSheetCell_(row, index, name);
    if (configSheetRowIsBlank_(Object.values(cells))) continue;

    const datasetName = cells["データ"];
    if (datasetName !== "" && cells["日付の列"] !== "" && configOwn_(datasetDateColumns, datasetName) === undefined) {
      configSetOwn_(datasetDateColumns, datasetName, cells["日付の列"]);
    }
    widgetRows.push(cells);
  }

  // データセット名はシートの見出しやセルの値（利用者が自由に書ける文字）なので、
  // "__proto__" のような名前が来ても入れ物のプロトタイプを書き換えないよう configSetOwn_ を使う。
  // 使える名前かどうかの判断は、この先の parseConfig の 1 か所だけで行う
  for (const key of Object.keys(datasetDateColumns)) {
    configSetOwn_(raw.datasets, key, { url: "", dateColumn: configOwn_(datasetDateColumns, key) });
  }
  for (const cells of widgetRows) {
    const datasetName = cells["データ"];
    if (datasetName !== "" && configOwn_(raw.datasets, datasetName) === undefined) {
      configSetOwn_(raw.datasets, datasetName, { url: "", dateColumn: "" });
    }
  }

  for (const cells of widgetRows) {
    const type = configSheetMap_(cells["種類"], CONFIG_SHEET_TYPES_);
    const widget = { type, title: cells["題"], dataset: cells["データ"] };

    const agg = configSheetMap_(cells["集計"], CONFIG_SHEET_AGGS_);
    if (agg !== undefined && type !== "table") widget.agg = agg; // 表は列ごとに agg を持つので、部品自体には要らない

    if (type === "table") {
      const rows = configSheetMap_(cells["明細"], CONFIG_SHEET_TABLE_ROWS_);
      if (rows !== undefined) widget.rows = rows;
      if (cells["値の列"] !== "") {
        // 明細の表は行をそのまま並べるので、列は名前だけ（まとめる表は列ごとに集計・見出し・書式を持つ）
        widget.columns =
          widget.rows === "latest"
            ? configSplitColumnList_(cells["値の列"]).map((entry) => configSheetColumnAlias_(entry).value)
            : configSheetTableColumns_(cells["値の列"], cells["書式"], agg);
      }
      if (cells["区分の列"] !== "") widget.groupBy = cells["区分の列"];
      if (cells["並び"] !== "" && widget.rows !== "latest") widget.sort = cells["並び"];
    } else {
      if (cells["値の列"] !== "") widget.value = cells["値の列"];
      if (cells["区分の列"] !== "" && type === "bar") widget.category = cells["区分の列"];
      if (cells["並び"] !== "" && type === "bar") widget.sort = configSheetMap_(cells["並び"], CONFIG_SHEET_BAR_SORTS_);
      const format = configSheetMap_(cells["書式"], CONFIG_SHEET_FORMATS_);
      if (format !== undefined) widget.format = format;
      if (type === "kpi") {
        const compare = configSheetMap_(cells["比べる"], CONFIG_SHEET_COMPARES_);
        if (compare !== undefined) widget.compare = compare;
        const goodWhen = configSheetMap_(cells["良し悪し"], CONFIG_SHEET_GOOD_WHENS_);
        if (goodWhen !== undefined) widget.goodWhen = goodWhen;
      }
    }

    if (cells["分ける列"] !== "") widget.splitBy = cells["分ける列"];
    if (cells["日付の列"] !== "") widget.dateColumn = cells["日付の列"];
    const bucket = configSheetMap_(cells["刻み"], CONFIG_SHEET_BUCKETS_);
    if (bucket !== undefined) widget.bucket = bucket;
    const target = configSheetParseTarget_(cells["目標"]);
    if (target !== undefined) {
      widget.target = target;
      // 目標の参照先（例: "targets!目標額"）のシートは、どの部品も データ に使っていなくても
      // データセットとして登録しておく（存在の確認はサーバーが読み込み時に行う）
      if (configIsPlainObject_(target) && target.dataset && configOwn_(raw.datasets, target.dataset) === undefined) {
        configSetOwn_(raw.datasets, target.dataset, { url: "", dateColumn: "" });
      }
    }
    const size = configSheetMap_(cells["大きさ"], CONFIG_SHEET_SIZES_);
    if (size !== undefined) widget.size = size;
    if (cells["上位"] !== "") {
      const top = parseNumber(cells["上位"]);
      widget.top = top === null ? cells["上位"] : top;
    }

    raw.widgets.push(widget);
  }

  return raw;
}

// ---- configSheetNotes ----------------------------------------------------

/** `設定` シートの「言語」から、ご参考の文の言語を決める（無ければ日本語） */
function configSheetNotesLang_(settingsRows) {
  const settings = Array.isArray(settingsRows) ? settingsRows.slice(1) : [];
  for (const row of settings) {
    const cells = Array.isArray(row) ? row : [];
    if (textOf(cells[0]) === "言語") return configSheetMap_(textOf(cells[1]), CONFIG_SHEET_LANGS_) === "en" ? "en" : "ja";
  }
  return "ja";
}

/**
 * `設定`・`定義` シートだけで気づける、誤りではないけれど添えておきたい一言を集める（純粋な検査）。
 * いまのところは 1 つだけ: 明細（最新の行をそのまま並べる表）に並びを書いても、使われずに無視される。
 * parseConfig の誤り（errors）とは別の並びで返し、menu_check がそのまま「ご参考」として添える
 */
function configSheetNotes(settingsRows, definitionRows) {
  const lang = configSheetNotesLang_(settingsRows);
  const notes = [];

  const definitionGrid = Array.isArray(definitionRows) ? definitionRows : [];
  const headerRow = definitionGrid[0];
  const index = configSheetHeaderIndex_(headerRow, CONFIG_DEFINITION_COLUMNS_);

  for (let r = 1; r < definitionGrid.length; r += 1) {
    const row = Array.isArray(definitionGrid[r]) ? definitionGrid[r] : [];
    const cells = {};
    for (const name of CONFIG_DEFINITION_COLUMNS_) cells[name] = configSheetCell_(row, index, name);
    if (configSheetRowIsBlank_(Object.values(cells))) continue;

    const type = configSheetMap_(cells["種類"], CONFIG_SHEET_TYPES_);
    const rows = configSheetMap_(cells["明細"], CONFIG_SHEET_TABLE_ROWS_);
    if (type !== "table" || rows !== "latest" || cells["並び"] === "") continue;

    const title = cells["題"];
    notes.push(
      lang === "en"
        ? 'The table "' + title + '" shows the latest rows as they are, so "Sort" is not used.'
        : "「" + title + "」は最新の明細を出す表なので、「並び」は使われません。"
    );
  }

  return notes;
}

// ===== filter.js =====
/**
 * 期間・区分の絞り込みまわりの純粋な道具。設定（config.filters）と画面の状態を行き来させる。
 * URL のハッシュとの往復（encodeFilters / decodeFilters）もここに置く
 */


/**
 * URL のハッシュの鍵に付ける頭の既定値。
 * 置いたページ自身の目印（#pricing）や、同じページのもう 1 つのダッシュボードと
 * 取り違えないよう、鍵はかならずこの頭と "." から始める
 */
const FILTER_HASH_PREFIX_ = "db";

/** 頭の指定を受け取る（空・文字でないものは既定の頭にする） */
function filterPrefix_(prefix) {
  return typeof prefix === "string" && prefix !== "" ? prefix : FILTER_HASH_PREFIX_;
}

/**
 * 画面の絞り込みの初期状態を作る。config.filters.dimensions（列名の配列）は、値が空文字の
 * 絞り込みオブジェクトにする。period が custom のときは設定の from/to をそのまま使い、
 * それ以外のときは periodRange(period, today) で、いまの範囲を from/to の初期値として持たせる
 * （custom に切り替えたときに、それまでの期間の日付が入り口として入っているように）
 */
function initialFilters(config, today) {
  const source = config && config.filters ? config.filters : {};
  const period = source.period || "thisMonth";

  let from = "";
  let to = "";
  if (period === "custom") {
    from = source.from || "";
    to = source.to || "";
  } else {
    const range = periodRange(period, today);
    from = range.from;
    to = range.to;
  }

  // 列名がそのままキーになるので、__proto__ のような特別な名前の列でも自分のキーとして
  // 持てるよう、プロトタイプの無いオブジェクトに組み立てる
  const dimensions = Object.create(null);
  const columns = Array.isArray(source.dimensions) ? source.dimensions : [];
  for (const column of columns) dimensions[column] = "";

  return { period, from, to, dimensions };
}

/**
 * いま選んでいる絞り込みから、実際に使う日付の範囲を決める。
 * custom は from/to をそのまま返す（どちらかが空でも、その側は無しとして扱う＝片側だけの指定を許す）。
 * それ以外のプリセットは periodRange に任せる
 */
function resolveRange(filters, today) {
  const period = filters ? filters.period : "";
  if (period === "custom") {
    return { from: (filters && filters.from) || "", to: (filters && filters.to) || "" };
  }
  return periodRange(period, today);
}

/** 日付キーが range に収まるか。range の両端が空（絞り込みなし）なら、値を見ずに常に通す */
function filterInRange_(dateKey, range) {
  const from = range && range.from ? range.from : "";
  const to = range && range.to ? range.to : "";
  if (from === "" && to === "") return true;
  if (typeof dateKey !== "string" || dateKey === "") return false;
  if (from !== "" && dateKey < from) return false;
  if (to !== "" && dateKey > to) return false;
  return true;
}

/**
 * 行が dimensions（{ 列名: 値 }）に一致するか。値が空文字の列は見ない。複数の列は AND。
 * 行にその列が無いときは、空文字でない絞り込みには一致しない
 */
function filterMatchesDimensions_(row, dimensions) {
  for (const column of Object.keys(dimensions)) {
    const want = dimensions[column];
    if (want === undefined || want === null || want === "") continue;
    if (!row || row[column] !== want) return false;
  }
  return true;
}

/**
 * rows を期間・区分で絞り込む。dateColumn が空文字のデータセットは期間を無視する。
 * 期間つき（range の片方でも指定あり）のときは、日付が null の行を外す
 */
function applyFilters(rows, options) {
  const opts = options || {};
  const dateColumn = opts.dateColumn || "";
  const range = opts.range || { from: "", to: "" };
  const dimensions = opts.dimensions || {};
  const list = Array.isArray(rows) ? rows : [];

  return list.filter((row) => {
    if (dateColumn !== "" && !filterInRange_(row ? row[dateColumn] : null, range)) return false;
    return filterMatchesDimensions_(row, dimensions);
  });
}

/** column の値の一覧を、全データから名前順（単純比較）で作る。空・null は外し、max を超えた分は切る */
function dimensionOptions(rows, column, max = 200) {
  const list = Array.isArray(rows) ? rows : [];
  const seen = new Set();
  for (const row of list) {
    const value = row ? row[column] : undefined;
    if (value === null || value === undefined || value === "") continue;
    seen.add(String(value));
  }
  return Array.from(seen)
    .sort()
    .slice(0, max);
}

/**
 * 絞り込みを URL のハッシュの形にする（先頭に # は付けない）。
 * 鍵はすべて prefix（既定は "db"）と "." から始める。
 * 例: "db.p=last30&db.d.チャネル=EC"。custom のときは from/to を足す（指定した側だけ）。
 * 区分の絞り込みは、値が空文字の列を省く。列名・値はどちらも encodeURIComponent する
 */
function encodeFilters(filters, prefix) {
  const source = filters || {};
  const head = filterPrefix_(prefix) + ".";
  const period = source.period || "";
  const parts = [head + "p=" + encodeURIComponent(period)];

  if (period === "custom") {
    if (source.from) parts.push(head + "from=" + encodeURIComponent(source.from));
    if (source.to) parts.push(head + "to=" + encodeURIComponent(source.to));
  }

  const dimensions = source.dimensions || {};
  for (const column of Object.keys(dimensions)) {
    const value = dimensions[column];
    if (value === undefined || value === null || value === "") continue;
    parts.push(head + "d." + encodeURIComponent(column) + "=" + encodeURIComponent(value));
  }

  return parts.join("&");
}

/** rawKey=rawValue の 1 組を安全に decodeURIComponent する。壊れた %encoding は null */
function filterDecodePair_(pair) {
  const eq = pair.indexOf("=");
  const rawKey = eq === -1 ? pair : pair.slice(0, eq);
  const rawValue = eq === -1 ? "" : pair.slice(eq + 1);
  try {
    return { key: decodeURIComponent(rawKey), value: decodeURIComponent(rawValue) };
  } catch {
    return null;
  }
}

/**
 * URL のハッシュ（先頭に # が付いていてもいなくてもよい）を、絞り込みの一部（partial）にする。
 * 読むのは prefix（既定は "db"）と "." から始まる鍵だけで、ほかの鍵は何も見ない
 * （ページ自身の目印や、同じページのもう 1 つのダッシュボードの鍵をそのまま置いておくため）。
 *
 * 知らない preset・知らない区分の列（config.filters.dimensions に無い列）・日付として読めない
 * from/to・壊れた %encoding は、それぞれその 1 項目だけを捨てる（例外は投げない）
 */
function decodeFilters(hash, config, prefix) {
  const text = typeof hash === "string" ? hash : "";
  const body = text.startsWith("#") ? text.slice(1) : text;
  const head = filterPrefix_(prefix) + ".";
  const allowedDimensions = config && config.filters && Array.isArray(config.filters.dimensions) ? config.filters.dimensions : [];

  const result = {};
  // ここも列名がそのままキーになるので、initialFilters と同じくプロトタイプの無いオブジェクトにする
  const dimensions = Object.create(null);
  let hasDimensions = false;

  if (body === "") return result;

  for (const pair of body.split("&")) {
    if (pair === "") continue;
    const decoded = filterDecodePair_(pair);
    if (!decoded || !decoded.key.startsWith(head)) continue;
    const key = decoded.key.slice(head.length);
    const value = decoded.value;

    if (key === "p") {
      // 知らない期間の名前は、その 1 項目だけを捨てる（並びは設定の検査と同じ 1 か所から取る）
      if (CONFIG_PERIODS_.indexOf(value) !== -1) result.period = value;
    } else if (key === "from") {
      if (isDateKey(value)) result.from = value;
    } else if (key === "to") {
      if (isDateKey(value)) result.to = value;
    } else if (key.startsWith("d.")) {
      const column = key.slice(2);
      if (allowedDimensions.indexOf(column) !== -1) {
        dimensions[column] = value;
        hasDimensions = true;
      }
    }
  }

  if (hasDimensions) result.dimensions = dimensions;
  return result;
}

// ===== aggregate.js =====
/**
 * 集計まわりの純粋な道具。sum・avg・count・distinct・min・max、区分ごとのグループ分け、
 * 上位 N と「その他」、日付の刻みごとの推移、前の期間との比較を行う。
 * 数の値は JS の number か null（null は「読めなかった値」）としてここに来る
 */


/** value が数として使える値か（null・undefined・NaN・±Infinity は使えない） */
function aggregateIsNumber_(value) {
  return typeof value === "number" && Number.isFinite(value);
}

/**
 * rows の value 列を agg で集計する。
 * count は行数そのもの（値は見ない）。distinct は空（null・undefined・前後の空白を落として
 * 空文字になるものも含む）をのぞいた種類の数。数値と文字列表現が同じ値（5 と "5"）は 1 つに数える。
 * sum・avg・min・max は数でない値（null 等）をのぞき、その件数を skipped で返す。
 * 行が 0 件のとき sum・count・distinct は 0、avg・min・max は null
 */
function aggregate(rows, value, agg) {
  const list = Array.isArray(rows) ? rows : [];

  if (agg === "count") return { value: list.length, skipped: 0 };

  if (agg === "distinct") {
    // 空（null・undefined・前後の空白を落として空文字になるもの）は数えない。
    // 文字列表現で数えるので、5 と "5" のように型だけ違う値は 1 つにまとまる
    const seen = new Set();
    for (const row of list) {
      const v = row ? row[value] : undefined;
      const key = textOf(v);
      if (key === "") continue;
      seen.add(key);
    }
    return { value: seen.size, skipped: 0 };
  }

  const valid = [];
  let skipped = 0;
  for (const row of list) {
    const v = row ? row[value] : undefined;
    if (aggregateIsNumber_(v)) {
      valid.push(v);
    } else {
      skipped += 1;
    }
  }

  if (agg === "sum") return { value: valid.reduce((a, b) => a + b, 0), skipped };
  if (agg === "avg") return { value: valid.length ? valid.reduce((a, b) => a + b, 0) / valid.length : null, skipped };
  if (agg === "min") return { value: valid.length ? Math.min(...valid) : null, skipped };
  if (agg === "max") return { value: valid.length ? Math.max(...valid) : null, skipped };
  return { value: null, skipped: 0 };
}

/**
 * rows を column の値ごとに分ける（先に出てきた値の順を保つ Map）。
 * 値が null・undefined・空文字のときは、呼び出し側が渡した blankLabel にまとめる
 * （画面の言葉は呼び出し側が t(lang, ...) で用意する。ここでは文字を決め打ちしない）
 */
function groupBy(rows, column, blankLabel) {
  const map = new Map();
  const list = Array.isArray(rows) ? rows : [];
  for (const row of list) {
    const raw = row ? row[column] : undefined;
    const key = raw === null || raw === undefined || raw === "" ? blankLabel : String(raw);
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(row);
  }
  return map;
}

/**
 * { key, value } の並びを value の大きい順、同じなら key の単純比較（ロケールに寄らない）で
 * 並べるための比較関数。topN のほか、区分ごとの色決めの並び替えでも使う共通の道具
 */
function compareEntriesDesc(a, b) {
  const av = aggregateIsNumber_(a.value) ? a.value : null;
  const bv = aggregateIsNumber_(b.value) ? b.value : null;
  if (av === null && bv === null) return a.key < b.key ? -1 : a.key > b.key ? 1 : 0;
  if (av === null) return 1;
  if (bv === null) return -1;
  if (av !== bv) return bv - av;
  return a.key < b.key ? -1 : a.key > b.key ? 1 : 0;
}

/**
 * { key, value } の並びを value の大きい順（同じなら key 順）に並べ、上位 n 件にする。
 * n を超えた分は、sum・count のときだけ 1 つの otherLabel（{ isOther: true }）に足し合わせて
 * 最後に付ける（その値がほかより大きくても最後）。avg・distinct・min・max は足し合わせられない
 * ので、超えた分は切り捨てるだけで other は false のまま。
 * 入力の key がすでに otherLabel と同じでも、特別扱いはしない
 */
function topN(entries, n, otherLabel, agg) {
  const sorted = (Array.isArray(entries) ? entries.slice() : []).sort(compareEntriesDesc);
  if (sorted.length <= n) return { entries: sorted, other: false };

  const kept = sorted.slice(0, n);
  const overflow = sorted.slice(n);

  if (agg === "sum" || agg === "count") {
    const total = overflow.reduce((acc, entry) => acc + (aggregateIsNumber_(entry.value) ? entry.value : 0), 0);
    kept.push({ key: otherLabel, value: total, isOther: true });
    return { entries: kept, other: true };
  }

  return { entries: kept, other: false };
}

const AGGREGATE_BUCKET_ORDER_ = ["day", "week", "month", "quarter", "year"];

/** 1 つのグラフに並べる刻みの上限 */
const AGGREGATE_BUCKET_MAX_ = 400;

/**
 * 刻みの数が上限を超えないよう、day → week → month → quarter → year の順に粗くする。
 * いちばん粗い year にしても収まらないときは（日付の年を打ち間違えて 9999 年の行が
 * 混ざったときなど）、**新しいほうから上限ぶんだけ**を使い、capped を立てて呼び出し側に知らせる。
 * 数を先に数えてから並びを 1 回だけ作るので、何十万個になる組み合わせでも軽い
 */
function aggregateCoarsenBucket_(bucket, from, to) {
  let current = bucket;
  while (bucketCountBetween(from, to, current) > AGGREGATE_BUCKET_MAX_) {
    const at = AGGREGATE_BUCKET_ORDER_.indexOf(current);
    if (at === -1 || at === AGGREGATE_BUCKET_ORDER_.length - 1) break;
    current = AGGREGATE_BUCKET_ORDER_[at + 1];
  }
  const all = bucketsBetween(from, to, current);
  if (all.length <= AGGREGATE_BUCKET_MAX_) return { bucket: current, buckets: all, capped: false };
  return { bucket: current, buckets: all.slice(all.length - AGGREGATE_BUCKET_MAX_), capped: true };
}

/** rows の dateColumn から、日付キーの最小・最大を求める（読めない値は無視）。無ければ "" */
function aggregateDateSpan_(rows, dateColumn) {
  let min = "";
  let max = "";
  for (const row of rows) {
    const key = row ? row[dateColumn] : null;
    if (!isDateKey(key)) continue;
    if (min === "" || key < min) min = key;
    if (max === "" || key > max) max = key;
  }
  return { min, max };
}

/**
 * rows を刻み（bucket）ごとに value を agg で集計した推移にする。
 * range の from/to が空（開いている）ときは、rows にある日付の最小・最大を範囲にする
 * （それでもデータが無ければ { buckets: [], values: [] }）。
 * bucket が "auto" なら autoBucket(from, to) で決め、刻みの数が上限を超えるときは粗くする。
 * いちばん粗くしても収まらないときは、新しいほうから上限ぶんだけを使い capped: true を返す。
 * 値の無い刻みは、sum・count・distinct は 0、avg・min・max は null になる（aggregate の既定と同じ）
 */
function timeSeries(rows, options) {
  const opts = options || {};
  const dateColumn = opts.dateColumn;
  const value = opts.value;
  const agg = opts.agg;
  const list = Array.isArray(rows) ? rows : [];
  const rangeIn = opts.range || { from: "", to: "" };

  let from = rangeIn.from || "";
  let to = rangeIn.to || "";
  if (from === "" || to === "") {
    const span = aggregateDateSpan_(list, dateColumn);
    if (span.min === "") return { buckets: [], values: [], capped: false };
    if (from === "") from = span.min;
    if (to === "") to = span.max;
  }

  const startBucket = opts.bucket === "auto" ? autoBucket(from, to) : opts.bucket;
  const resolved = aggregateCoarsenBucket_(startBucket, from, to);

  const grouped = new Map();
  for (const row of list) {
    const dateValue = row ? row[dateColumn] : null;
    if (!isDateKey(dateValue) || dateValue < from || dateValue > to) continue;
    const key = bucketKey(dateValue, resolved.bucket);
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key).push(row);
  }

  const values = resolved.buckets.map((key) => aggregate(grouped.get(key) || [], value, agg).value);

  return { bucket: resolved.bucket, buckets: resolved.buckets, values, capped: resolved.capped };
}

/**
 * いまの値と前の値を比べる。どちらかが null なら比べようがないので null。
 * ratio は delta を前の値の絶対値で割ったもの。前の値が 0 のときは割れないので ratio は null
 * （delta 自体は返す）
 */
function compareValue(current, previous) {
  if (current === null || previous === null) return null;
  const delta = current - previous;
  const ratio = previous === 0 ? null : delta / Math.abs(previous);
  return { delta, ratio };
}

// ===== colors.js =====
/**
 * 区分ごとの色（1〜8 の番号。0 は灰の「その他」）を、いつ見ても変わらないように決める道具。
 * 番号は CSS の --db-series-1〜8 に対応させるのは画面側の仕事で、ここでは番号だけを決める
 */


/**
 * column の値ごとに、allRows（絞り込む前の全データ）で value を agg 集計し、大きい順（同じなら
 * 名前順）に並べて、上位 max 件に 1…max を振る。それ以外は 0（灰の「その他」）。
 * blankLabel（既定 ""）は groupBy と同じ決まりで、空・null の値をまとめるときの札。
 * 絞り込んだ後の rows ではなく、常に全データから決めるので、絞り込みで番号は変わらない
 */
function assignSeriesColors(allRows, column, value, agg, max = 8, blankLabel = "") {
  const groups = groupBy(allRows, column, blankLabel);
  const entries = [];
  for (const [key, rows] of groups) {
    entries.push({ key, value: aggregate(rows, value, agg).value });
  }
  entries.sort(compareEntriesDesc);

  const colors = new Map();
  entries.forEach((entry, index) => {
    colors.set(entry.key, index < max ? index + 1 : 0);
  });
  return colors;
}

// ===== model.js =====
/**
 * 設定・データ・絞り込みから、画面にそのまま描ける形（model）を組み立てる 1 か所。
 * 数・札・目盛り・色の番号・凡例の有無・「表で見る」の中身まで、迷いの残らないところまでここで決める。
 * 描く側は形を選ぶだけで、数の計算も書式づくりも行わない。
 * ここは純粋な計算だけを行う（「今日」は today "YYYY-MM-DD" で受け取る）
 */


/** 折れ線の系列は 4 本まで（超えたら上位 3 + その他） */
const MODEL_LINE_SERIES_MAX_ = 4;
/** 積み上げの面は 6 つまで（超えたら上位 5 + その他） */
const MODEL_BAR_SEGMENT_MAX_ = 6;
/** 横棒の auto: 区分がこれを超えたら横にする */
const MODEL_BAR_WIDE_COUNT_ = 8;
/** 横棒の auto: 区分名 1 つに要る幅（名前の幅 + 両どなりとのすき間） */
const MODEL_LABEL_GAP_ = 12;
/** 横棒の auto: 縦に並べた区分名が収まる、図の横幅の目安 */
const MODEL_LABEL_ROOM_ = 560;
/** 区分の色は 8 個まで（9 個目は作らず、灰の 0 にまとめる） */
const MODEL_COLOR_MAX_ = 8;

/** 期間の名前ごとの「前の期間」の札。ここに無い期間（先月・期間の指定）は compare.generic */
const MODEL_COMPARE_KEYS_ = {
  thisMonth: "compare.lastMonth",
  last7: "compare.last7",
  last30: "compare.last30",
  last90: "compare.last90",
  thisYear: "compare.thisYear",
};

/** 名前をキーにした入れ物から、自身が持つ項目だけを取り出す（プロトタイプ越しの読み取りを防ぐ） */
function modelOwn_(box, name) {
  if (box === null || box === undefined || typeof box !== "object" || name === "") return undefined;
  return Object.prototype.hasOwnProperty.call(box, name) ? box[name] : undefined;
}

/** KPI の札・目標の札・棒の合計は、大きい数を縮める */
function modelShort_(value, format, lang) {
  return formatNumber(value, format, lang, { compact: true });
}

/** 表・吹き出し・面の値は縮めない */
function modelFull_(value, format, lang) {
  return formatNumber(value, format, lang);
}

/** CSV に入れる数。通貨の記号も桁区切りも付けない（表計算ソフトが数として読み戻せるように） */
function modelPlain_(value, format) {
  if (typeof value !== "number" || !Number.isFinite(value)) return "";
  const fmt = format !== null && typeof format === "object" ? format : { type: format };
  let decimals = fmt.type === "percent" ? 1 : 0;
  if (fmt.type === "custom" && Number.isFinite(fmt.decimals)) decimals = fmt.decimals;
  return value.toFixed(decimals);
}

/**
 * どの種類にも付く項目。描く側はこれを見て枠を作る。
 * note は設定に書かれた一言、limitNote は上限に当たったことをこちらから添える一言
 */
function modelBase_(widget, extra) {
  const base = {
    id: widget.id,
    type: widget.type,
    title: widget.title,
    size: widget.size,
    format: widget.format,
    note: widget.note || "",
    limitNote: "",
  };
  return Object.assign(base, extra);
}

/** 部品 1 つを誤りの札にする */
function modelErrorOf_(widget, message) {
  return { id: widget.id, type: "error", title: widget.title, message };
}

/** 系列が 1 本のときの札。題が空なら値の列の名前、それも空なら集計の名前を使う */
function modelSingleLabel_(widget, lang) {
  if (widget.title !== "") return widget.title;
  if (textOf(widget.value) !== "") return widget.value;
  return t(lang, "agg." + widget.agg);
}

/** そのデータセットが 20,000 行で切られていたら、画面の下に出す知らせの目印を立てる */
function modelMarkTruncated_(dataset, ctx) {
  if (dataset && dataset.truncated === true) ctx.truncated = true;
}

/** 読める数だけの最小・最大（seed から続けて求められる。読める数が 1 つも無ければ min は null） */
function modelExtent_(values, seed) {
  let min = seed ? seed.min : null;
  let max = seed ? seed.max : null;
  for (const value of values) {
    if (typeof value !== "number" || !Number.isFinite(value)) continue;
    if (min === null || value < min) min = value;
    if (max === null || value > max) max = value;
  }
  return { min, max };
}

/**
 * そのデータセットに効く区分の絞り込みだけを取り出す。データセットに無い列の絞り込みは
 * 見ない（例: 目標のデータに「チャネル」の列が無くても、チャネルの絞り込みで空にならない）
 */
function modelDimensionsFor_(dataset, ctx) {
  const cached = ctx.dimensionCache.get(dataset);
  if (cached) return cached;
  const known = new Set(Array.isArray(dataset.columns) ? dataset.columns : []);
  const source = ctx.filters && ctx.filters.dimensions ? ctx.filters.dimensions : {};
  const picked = Object.create(null);
  for (const column of Object.keys(source)) {
    if (known.has(column)) picked[column] = source[column];
  }
  ctx.dimensionCache.set(dataset, picked);
  return picked;
}

/** 設定に書かれた、そのデータセットの日付の列（無ければ ""） */
function modelDateColumn_(ctx, name) {
  const entry = modelOwn_(ctx.config.datasets, name);
  return entry ? textOf(entry.dateColumn) : "";
}

/** 部品が使う行（期間と区分で絞り込んだあと） */
function modelRows_(dataset, name, ctx, range) {
  return applyFilters(dataset.rows, { dateColumn: modelDateColumn_(ctx, name), range, dimensions: modelDimensionsFor_(dataset, ctx) });
}

// ---- 列の関門 -------------------------------------------------------------

/**
 * 部品が名ざしする列を、確かめる順に並べる。件数を数えるだけのときの値の列のように、
 * 読まない列は入れない。データセットの日付の列（期間の絞り込みに使う）は、設定されていれば
 * 部品の種類によらずいちばん先に確かめる。無いままだと絞り込みが全部の行を静かに落としてしまうため
 */
function modelNamedColumns_(widget, ctx) {
  const names = [modelDateColumn_(ctx, widget.dataset), widget.agg === "count" ? "" : widget.value];
  if (widget.type === "line") names.push(widget.splitBy, widget.dateColumn);
  if (widget.type === "bar") names.push(widget.category, widget.splitBy);
  if (widget.type === "table" && widget.rows === "latest") return names.concat(widget.columns);
  if (widget.type === "table") return names.concat(widget.groupBy, widget.columns.map((column) => (column.agg === "count" ? "" : column.value)));
  return names;
}

/**
 * names のうち、そのデータセットに無い列を先頭から探す（すべてあれば ""）。
 * 列の一覧を持たないデータセットは確かめようがないので、そのまま通す
 */
function modelMissingColumn_(dataset, names) {
  if (!Array.isArray(dataset.columns) || dataset.columns.length === 0) return "";
  const known = new Set(dataset.columns);
  for (const name of names) {
    if (textOf(name) !== "" && !known.has(name)) return name;
  }
  return "";
}

/** 列が見つからないことを知らせる文（データの名前と列の名前を添える） */
function modelColumnMissing_(ctx, datasetName, column) {
  return t(ctx.lang, "error.columnMissing", { dataset: datasetName, column });
}

/**
 * 分ける列の値ごとにまとめ、大きい順に並べて上限に収める（折れ線の系列と棒の面で同じ手順を使う）。
 * 合計・件数は足し合わせられるので、上限 - 1 件を残して残りを「その他」にまとめる。
 * 平均・種類の数・最小・最大は足し合わせられないので、上限までで切る（「その他」は作らない）。
 * 色は絞り込む前の全データの並びで決めるので、絞り込んでも番号は変わらない
 */
function modelSplitGroups_(widget, ctx, dataset, rows, max) {
  const blank = t(ctx.lang, "label.blank");
  const groups = groupBy(rows, widget.splitBy, blank);
  const entries = [];
  for (const [key, part] of groups) {
    entries.push({ key, value: aggregate(part, widget.value, widget.agg).value, rows: part });
  }
  entries.sort(compareEntriesDesc);

  const other = entries.length > max && (widget.agg === "sum" || widget.agg === "count");
  const keep = other ? max - 1 : max;
  return {
    kept: entries.slice(0, keep),
    rest: entries.slice(keep),
    other,
    blank,
    colors: assignSeriesColors(dataset.rows, widget.splitBy, widget.value, widget.agg, MODEL_COLOR_MAX_, blank),
  };
}

// ---- kpi ------------------------------------------------------------------

/**
 * 前の期間との差。割合が出せないとき（前が 0）は、差そのものを符号つきで出す。
 * text は札に載せる縮めた文字、textFull は表に入れる縮めない文字（割合のときはどちらも同じ）
 */
function modelDelta_(compared, widget, lang, period) {
  const direction = compared.delta > 0 ? "up" : compared.delta < 0 ? "down" : "flat";
  const sign = direction === "up" ? "+" : direction === "down" ? "-" : "";
  const gap = Math.abs(compared.delta);
  const ratioText = compared.ratio === null ? "" : sign + formatNumber(Math.abs(compared.ratio * 100), "percent", lang, { decimals: 1 });
  const known = Object.prototype.hasOwnProperty.call(MODEL_COMPARE_KEYS_, period);
  return {
    text: ratioText || sign + modelShort_(gap, widget.format, lang),
    textFull: ratioText || sign + modelFull_(gap, widget.format, lang),
    direction,
    good: direction === "flat" ? null : (direction === "up") === (widget.goodWhen === "up"),
    label: t(lang, known ? MODEL_COMPARE_KEYS_[period] : "compare.generic"),
  };
}

/** KPI の小さな折れ線。刻みが 2 つに満たないとき・読める値が 1 つも無いときは作らない */
function modelSpark_(widget, ctx, rows, dateColumn) {
  if (widget.sparkline !== true || dateColumn === "") return null;
  const made = timeSeries(rows, { dateColumn, value: widget.value, agg: widget.agg, range: ctx.range, bucket: "auto" });
  if (made.buckets.length < 2) return null;
  const extent = modelExtent_(made.values);
  return extent.min === null ? null : { values: made.values, min: extent.min, max: extent.max };
}

function modelKpi_(widget, ctx, dataset, rows) {
  const lang = ctx.lang;
  const main = aggregate(rows, widget.value, widget.agg);
  const dateColumn = modelDateColumn_(ctx, widget.dataset);

  let delta = null;
  let previousText = "—";
  const comparable = widget.compare === "previous" && dateColumn !== "" && ctx.previous.from !== "" && ctx.previous.to !== "";
  if (comparable) {
    // 前の期間に行が 1 つも無いときは、比べる相手がないので差を出さない（0 と比べない）
    const beforeRows = modelRows_(dataset, widget.dataset, ctx, ctx.previous);
    if (beforeRows.length > 0) {
      const before = aggregate(beforeRows, widget.value, widget.agg);
      previousText = modelFull_(before.value, widget.format, lang);
      const compared = compareValue(main.value, before.value);
      if (compared) delta = modelDelta_(compared, widget, lang, ctx.filters ? ctx.filters.period : "");
    }
  }

  const valueFull = modelFull_(main.value, widget.format, lang);
  return modelBase_(widget, {
    valueText: modelShort_(main.value, widget.format, lang),
    valueFull,
    delta,
    spark: modelSpark_(widget, ctx, rows, dateColumn),
    skipped: main.skipped,
    table: {
      head: [t(lang, "table.item"), t(lang, "table.value"), t(lang, "table.previous"), t(lang, "table.delta")],
      // 表は縮めない書式でそろえる（札の +¥3.3万 ではなく +¥33,000 を入れる）
      rows: [[widget.title, valueFull, previousText, delta ? delta.textFull : "—"]],
    },
  });
}

// ---- line -----------------------------------------------------------------

/** 期間の片側が開いているときは、行にある日付の端を使って刻みの範囲を決める */
function modelSpan_(rows, dateColumn, range) {
  const from = range.from || "";
  const to = range.to || "";
  if (from !== "" && to !== "") return { from, to };
  let min = "";
  let max = "";
  for (const row of rows) {
    const key = row ? row[dateColumn] : null;
    if (!isDateKey(key)) continue;
    if (min === "" || key < min) min = key;
    if (max === "" || key > max) max = key;
  }
  return min === "" ? null : { from: from || min, to: to || max };
}

/** rows の dateColumn にある、いちばん新しい日付キー（読める日付が無ければ ""） */
function modelLatestDateKey_(rows, dateColumn) {
  if (dateColumn === "") return "";
  let latest = "";
  for (const row of rows) {
    const key = row ? row[dateColumn] : null;
    if (!isDateKey(key)) continue;
    if (latest === "" || key > latest) latest = key;
  }
  return latest;
}

/** 並びの最後にある、読める値（端のラベルはここに置く） */
function modelLastValue_(values) {
  for (let i = values.length - 1; i >= 0; i -= 1) {
    if (typeof values[i] === "number" && Number.isFinite(values[i])) return values[i];
  }
  return null;
}

/** 折れ線の系列（key・札・色・元の行）を、上限 4 本に収めて決める */
function modelLineSeries_(widget, ctx, dataset, rows) {
  if (widget.splitBy === "") {
    const label = modelSingleLabel_(widget, ctx.lang);
    return [{ key: label, label, color: 1, rows }];
  }

  const split = modelSplitGroups_(widget, ctx, dataset, rows, MODEL_LINE_SERIES_MAX_);
  const series = split.kept.map((entry) => ({ key: entry.key, label: entry.key, color: split.colors.get(entry.key) || 0, rows: entry.rows }));
  if (split.other) {
    const rest = [];
    for (const entry of split.rest) {
      for (const row of entry.rows) rest.push(row);
    }
    const label = t(ctx.lang, "label.other");
    series.push({ key: label, label, color: 0, rows: rest });
  }
  return series;
}

/**
 * 折れ線の目盛り。値がすべて同じ（平らな線）のときは、そのままだと上下の幅が 0 になり
 * niceTicks が [0, 1] を返して線が図の外へ出てしまうので、0 まで伸ばした範囲で作る。
 * 上が 0 の（すべて 0 以下の）範囲も、棒と同じく正負をひっくり返して作ってから裏返す
 */
function modelLineTicks_(min, max) {
  const flat = min === max;
  return modelBarTicks_(flat ? Math.min(0, min) : min, flat ? Math.max(0, max) : max);
}

/** 描くものが無い折れ線（誤りではなく「データがありません」を出してもらう。表の見出しは持たせる） */
function modelLineEmpty_(widget, lang, skipped) {
  const table = { head: [widget.dateColumn, modelSingleLabel_(widget, lang)], rows: [] };
  return { empty: true, series: [], buckets: [], ticks: [0, 1], yMax: 1, legend: false, area: false, skipped, table };
}

function modelLine_(widget, ctx, dataset, rows) {
  const lang = ctx.lang;
  const skipped = aggregate(rows, widget.value, widget.agg).skipped;
  const span = rows.length === 0 ? null : modelSpan_(rows, widget.dateColumn, ctx.range);
  const defs = span === null ? [] : modelLineSeries_(widget, ctx, dataset, rows);
  if (defs.length === 0) return modelBase_(widget, modelLineEmpty_(widget, lang, skipped));

  // 刻みの並びと単位は系列ごとに決めず、同じ範囲から部品ぜんたいで 1 回だけ決めて全系列にそろえる
  const options = { dateColumn: widget.dateColumn, value: widget.value, agg: widget.agg, range: span, bucket: widget.bucket };
  const axis = timeSeries(rows, options);
  const series = defs.map((def) => {
    const made = timeSeries(def.rows, options);
    return { key: def.key, label: def.label, color: def.color, values: made.values, lastLabel: "" };
  });

  let extent = { min: null, max: null };
  for (const line of series) {
    extent = modelExtent_(line.values, extent);
    line.lastLabel = modelShort_(modelLastValue_(line.values), widget.format, lang);
  }
  if (extent.min === null) return modelBase_(widget, modelLineEmpty_(widget, lang, skipped));

  const ticks = modelLineTicks_(extent.min, extent.max);
  // buckets[].key は、描くときには使わないが、model を読んで独自の図を作る買い手のために残してある
  const buckets = axis.buckets.map((key) => ({ key, label: bucketLabel(key, axis.bucket, lang) }));
  return modelBase_(widget, {
    empty: false,
    series,
    buckets,
    ticks,
    yMax: ticks[ticks.length - 1],
    // 刻みが上限を超えて、新しいほうだけを出したときは、そのことを札の下に添える
    limitNote: axis.capped === true ? t(lang, "state.bucketCapped", { count: AGGREGATE_BUCKET_MAX_ }) : "",
    legend: series.length >= 2,
    area: series.length === 1,
    skipped,
    table: {
      head: [widget.dateColumn].concat(series.map((line) => line.label)),
      rows: buckets.map((bucket, index) => [bucket.label].concat(series.map((line) => modelFull_(line.values[index], widget.format, lang)))),
    },
  });
}

// ---- bar ------------------------------------------------------------------
//
// 棒は 0 の線から両側へ積む（縦棒は正が上・負が下、横棒は正が右・負が左）。面の値は符号の
// ついたまま持ち、区分ごとに正の面の和 posTotal と負の面の和 negTotal を添える。軸はいちばん
// 大きい posTotal といちばん小さい negTotal を覆い、min（負が無ければ 0）と max で両端を示す。
// 並べ替えと「その他」へのまとめ、吹き出しの札は、正味の合計 total で決める

/** 積み上げの面の並び（どの区分でも同じ順・同じ色にするので、先に全体で決める） */
function modelBarPlan_(widget, ctx, dataset, rows) {
  if (widget.splitBy === "") return null;
  const split = modelSplitGroups_(widget, ctx, dataset, rows, MODEL_BAR_SEGMENT_MAX_);
  const keys = split.kept.map((entry) => entry.key);
  return { keys, keySet: new Set(keys), other: split.other, blank: split.blank, colors: split.colors };
}

/** 区分 1 つぶんの面。分ける列が無ければ、棒まるごとが 1 つの面（色は 1。「その他」だけ灰の 0） */
function modelBarSegments_(widget, ctx, entry, plan) {
  const lang = ctx.lang;
  if (plan === null) {
    const color = entry.isOther === true ? 0 : 1;
    return [{ key: entry.key, label: entry.key, color, value: entry.value, valueText: modelFull_(entry.value, widget.format, lang) }];
  }

  const groups = groupBy(entry.rows || [], widget.splitBy, plan.blank);
  const segments = plan.keys.map((key) => {
    const value = aggregate(groups.get(key) || [], widget.value, widget.agg).value;
    return { key, label: key, color: plan.colors.get(key) || 0, value, valueText: modelFull_(value, widget.format, lang) };
  });
  if (plan.other) {
    const rest = [];
    for (const [key, part] of groups) {
      if (plan.keySet.has(key)) continue;
      for (const row of part) rest.push(row);
    }
    const label = t(lang, "label.other");
    const value = aggregate(rest, widget.value, widget.agg).value;
    segments.push({ key: label, label, color: 0, value, valueText: modelFull_(value, widget.format, lang) });
  }
  return segments;
}

/** 0 の線から上（右）へ積む面の和と、下（左）へ積む面の和 */
function modelBarTotals_(segments) {
  let posTotal = 0;
  let negTotal = 0;
  for (const segment of segments) {
    if (typeof segment.value !== "number" || !Number.isFinite(segment.value)) continue;
    if (segment.value > 0) posTotal += segment.value;
    else negTotal += segment.value;
  }
  return { posTotal, negTotal };
}

/**
 * 棒の目盛り。負の側があれば 0 をまたぐ範囲にする。すべてが負のとき（正の側が 0）は、
 * niceTicks が上端 0 の範囲を [0, 1] にしてしまうので、正負をひっくり返して作ってから裏返す
 */
function modelBarTicks_(minNeg, maxPos) {
  // 0 - value で引くのは、0 を裏返したときに -0 を作らないため
  if (minNeg < 0 && maxPos <= 0) return niceTicks(0, -minNeg).map((value) => 0 - value).reverse();
  return niceTicks(minNeg, maxPos);
}

/**
 * 横棒にするか。設定の true / false が auto に勝つ。
 * auto のときは、区分の数と「区分名を縦に並べたときに要る幅」で決める。
 * 字数ではなく幅で見るので、半角ばかりの名前が早々に横へ回ることがない
 * （見積もりは描く側と同じ estimateTextWidth を使う）
 */
function modelBarHorizontal_(widget, categories) {
  if (widget.horizontal === true || widget.horizontal === false) return widget.horizontal;
  if (categories.length > MODEL_BAR_WIDE_COUNT_) return true;
  let widest = 0;
  for (const category of categories) widest = Math.max(widest, estimateTextWidth(category.label));
  return categories.length * (widest + MODEL_LABEL_GAP_) > MODEL_LABEL_ROOM_;
}

function modelBar_(widget, ctx, dataset, rows) {
  const lang = ctx.lang;
  const blank = t(lang, "label.blank");
  const groups = groupBy(rows, widget.category, blank);

  const entries = [];
  for (const [key, part] of groups) {
    entries.push({ key, value: aggregate(part, widget.value, widget.agg).value, rows: part });
  }
  const cut = topN(entries, widget.top, t(lang, "label.other"), widget.agg);
  if (cut.other) {
    // 「その他」の棒には、上位から外れた区分の行をまとめて持たせる（積み上げの面を作るため）
    const kept = new Set(cut.entries.filter((entry) => entry.isOther !== true).map((entry) => entry.key));
    const rest = [];
    for (const [key, part] of groups) {
      if (kept.has(key)) continue;
      for (const row of part) rest.push(row);
    }
    cut.entries[cut.entries.length - 1].rows = rest;
  }
  if (widget.sort === "label") {
    // 名前の並びでも「その他」はいつも最後
    cut.entries.sort((a, b) => {
      if (a.isOther === true || b.isOther === true) return (a.isOther === true ? 1 : 0) - (b.isOther === true ? 1 : 0);
      return a.key < b.key ? -1 : a.key > b.key ? 1 : 0;
    });
  }

  const plan = modelBarPlan_(widget, ctx, dataset, rows);
  let maxPos = 0;
  let minNeg = 0;
  const categories = cut.entries.map((entry) => {
    const segments = modelBarSegments_(widget, ctx, entry, plan);
    const { posTotal, negTotal } = modelBarTotals_(segments);
    if (posTotal > maxPos) maxPos = posTotal;
    if (negTotal < minNeg) minNeg = negTotal;
    const totalText = modelShort_(entry.value, widget.format, lang);
    // key は label と同じ値だが、描くときには使わない（model を読む買い手のための目印として残してある）
    return { key: entry.key, label: entry.key, total: entry.value, totalText, posTotal, negTotal, segments };
  });
  const ticks = modelBarTicks_(minNeg, maxPos);

  // 凡例は分ける列があって、色が 2 つ以上あるときだけ（大きさだけを見せる棒は 1 系列なので出さない）
  const colorsInPlay = new Set();
  if (plan !== null && categories.length > 0) {
    for (const segment of categories[0].segments) colorsInPlay.add(segment.color);
  }
  const headLabels = plan === null ? [modelSingleLabel_(widget, lang)] : categories.length > 0 ? categories[0].segments.map((segment) => segment.label) : [];

  return modelBase_(widget, {
    empty: categories.length === 0,
    horizontal: modelBarHorizontal_(widget, categories),
    categories,
    ticks,
    min: ticks[0],
    max: ticks[ticks.length - 1],
    legend: colorsInPlay.size >= 2,
    skipped: aggregate(rows, widget.value, widget.agg).skipped,
    table: {
      head: [widget.category].concat(headLabels),
      rows: categories.map((category) =>
        plan === null
          ? [category.label, modelFull_(category.total, widget.format, lang)]
          : [category.label].concat(category.segments.map((segment) => segment.valueText))
      ),
    },
  });
}

// ---- meter ----------------------------------------------------------------

/** 目標の行の「月」のセルを "YYYY-MM" にする。YYYY-MM・日付・YYYY/M・YYYY年M月 を読む */
function modelMonthOf_(cell) {
  const key = toDateKey(cell);
  if (key !== "") return monthOf(key);
  const text = toHalfWidth(textOf(cell)).trim();
  const matched = text.match(/^(\d{4})[-/年.](\d{1,2})月?$/);
  if (!matched) return "";
  const month = Number(matched[2]);
  if (month < 1 || month > 12) return "";
  return matched[1] + "-" + pad2(month);
}

/**
 * 目標を探す月を決める。期間の終わり（range.to）が決まっていればその月。
 * 「全期間」のように終わりが開いているときは、絞り込んだあとのデータのいちばん新しい
 * 日付の月を使う（固定の日付の見本でも、その月の目標が出るように）。
 * 日付の列が無い・読める日付が 1 つも無いときだけ today の月にする
 */
function modelTargetDay_(widget, ctx, rows) {
  if (ctx.range.to !== "") return ctx.range.to;
  const latest = modelLatestDateKey_(rows, modelDateColumn_(ctx, widget.dataset));
  return latest !== "" ? latest : ctx.today;
}

/**
 * 目標の数を決める。数の設定はそのまま、データを指した設定は「その月」の行から集める。
 * actualRows は実績の側の（絞り込んだあとの）行で、目標を探す月を決めるためだけに使う。
 * 月から引いた目標には、その月（month は "YYYY-MM"、monthLabel は画面に出す札）を添える
 */
function modelTarget_(widget, ctx, actualRows) {
  const target = widget.target;
  if (typeof target === "number") return { value: target, month: "", monthLabel: "" };

  const dataset = modelOwn_(ctx.datasets, target.dataset);
  if (!dataset) return { message: t(ctx.lang, "error.datasetMissing", { name: target.dataset }) };
  modelMarkTruncated_(dataset, ctx);
  // 目標のデータの日付の列も、設定されていれば他の列より先に確かめる（絞り込みには使わないが、部品の種類と決まりをそろえる）
  const missing = modelMissingColumn_(dataset, [modelDateColumn_(ctx, target.dataset), target.agg === "count" ? "" : target.value, target.matchMonth]);
  if (missing !== "") return { message: modelColumnMissing_(ctx, target.dataset, missing) };

  const day = modelTargetDay_(widget, ctx, actualRows);
  const month = isDateKey(day) ? monthOf(day) : "";
  const monthText = month === "" ? textOf(day) : bucketLabel(month, "month", ctx.lang);
  // 目標のデータには期間の絞り込みをかけない（月の一致で 1 行を選ぶため）
  const rows = applyFilters(dataset.rows, { dateColumn: "", range: { from: "", to: "" }, dimensions: modelDimensionsFor_(dataset, ctx) });
  const matched = [];
  for (const row of rows) {
    if (modelMonthOf_(row ? row[target.matchMonth] : null) === month) matched.push(row);
  }
  if (month === "" || matched.length === 0) return { message: t(ctx.lang, "error.goalMissing", { month: monthText }) };
  return { value: aggregate(matched, target.value, target.agg).value, month, monthLabel: monthText };
}

/**
 * 月から引いた目標は、その月の行とだけ比べる（「全期間」で半年ぶんの売上を、
 * ひと月の目標にぶつけないため）。日付の列が無いデータは月で分けようがないので、
 * 絞り込んだ行をそのまま使い、月の札も出さない
 */
function modelMeterMonth_(widget, ctx, rows, target) {
  const dateColumn = modelDateColumn_(ctx, widget.dataset);
  if (target.month === "" || dateColumn === "") return { rows, label: "" };
  const inMonth = rows.filter((row) => {
    const key = row ? row[dateColumn] : null;
    return isDateKey(key) && monthOf(key) === target.month;
  });
  return { rows: inMonth, label: target.monthLabel };
}

function modelMeter_(widget, ctx, rows) {
  const lang = ctx.lang;
  const target = modelTarget_(widget, ctx, rows);
  if (target.message) return modelErrorOf_(widget, target.message);
  if (typeof target.value !== "number" || !Number.isFinite(target.value) || target.value <= 0) {
    return modelErrorOf_(widget, t(lang, "error.goalNotPositive"));
  }

  const month = modelMeterMonth_(widget, ctx, rows, target);
  const main = aggregate(month.rows, widget.value, widget.agg);
  const ratio = (main.value === null ? 0 : main.value) / target.value;
  const ratioText = formatNumber(ratio * 100, "percent", lang, { decimals: 0 });
  const valueFull = modelFull_(main.value, widget.format, lang);
  const targetFull = modelFull_(target.value, widget.format, lang);
  return modelBase_(widget, {
    valueText: modelShort_(main.value, widget.format, lang),
    valueFull,
    targetText: modelShort_(target.value, widget.format, lang),
    targetFull,
    ratio,
    ratioText,
    achieved: ratio >= 1,
    skipped: main.skipped,
    // 月から引いた目標のときだけ、どの月の数字なのかを添える（数の目標は期間ぜんたい）
    monthLabel: month.label,
    table: {
      head: [t(lang, "table.item"), t(lang, "table.value")],
      rows: (month.label === "" ? [] : [[t(lang, "label.targetMonth"), month.label]]).concat([
        [t(lang, "label.actual"), valueFull],
        [t(lang, "label.goal"), targetFull],
        [t(lang, "label.progress"), ratioText],
      ]),
    },
  });
}

// ---- table ----------------------------------------------------------------

/** 並べ替えに使う列。設定の sort は列の札で指す。見つからなければ 1 つめの集計の列 */
function modelSortIndex_(widget, head) {
  const sort = textOf(widget.sort);
  if (sort !== "") {
    for (let i = 0; i < head.length; i += 1) {
      if (head[i].label === sort) return i;
    }
  }
  return head.length > 1 ? 1 : 0;
}

/**
 * at 列で並べ替える。空（null・空文字）はいつも最後、同じ値のときは元の並びのまま。
 * 比べ方は compareCells の 1 か所だけにあり、画面の並べ替え（render-table.js）と同じ
 */
function modelSortRows_(body, at, order) {
  body.sort((a, b) => compareCells(a[at].value, b[at].value, order));
}

/** 表の model（区分ごとの表と明細の表で、同じ組み立てを使う）。plainOf は CSV の 1 マスを作る */
function modelTableOf_(widget, head, body, skipped, plainOf) {
  const labels = head.map((column) => column.label);
  return modelBase_(widget, {
    empty: body.length === 0,
    head,
    rows: body,
    // 描くときには使わないが、model を読んで独自の表を作る買い手のために残してある目印
    sortable: true,
    csv: [labels].concat(body.map((cells) => cells.map(plainOf))),
    skipped,
    table: { head: labels, rows: body.map((cells) => cells.map((cell) => cell.text)) },
  });
}

/** 区分ごとにまとめた表 */
function modelTableGrouped_(widget, ctx, rows) {
  const lang = ctx.lang;
  const head = [{ label: widget.groupBy, numeric: false }].concat(widget.columns.map((column) => ({ label: column.label, numeric: true })));
  const groups = groupBy(rows, widget.groupBy, t(lang, "label.blank"));

  const body = [];
  for (const [key, part] of groups) {
    const cells = [{ text: key, value: key }];
    for (const column of widget.columns) {
      const value = aggregate(part, column.value, column.agg).value;
      cells.push({ text: modelFull_(value, column.format, lang), value });
    }
    body.push(cells);
  }
  modelSortRows_(body, modelSortIndex_(widget, head), widget.order);

  // のぞいた値の数は、集計するすべての列ぶんを足す（列ごとに数として読めない値を外すため）
  let skipped = 0;
  for (const column of widget.columns) skipped += aggregate(rows, column.value, column.agg).skipped;

  const plainOf = (cell, index) => (index === 0 ? cell.text : modelPlain_(cell.value, widget.columns[index - 1].format));
  return modelTableOf_(widget, head, body.slice(0, widget.top), skipped, plainOf);
}

/** 明細のセル 1 つ。数は桁区切りだけ、日付は日付キーのまま、それ以外は文字のまま */
function modelDetailCell_(row, column, types, lang) {
  const raw = row ? row[column] : undefined;
  if (modelOwn_(types, column) === "number") {
    const value = typeof raw === "number" && Number.isFinite(raw) ? raw : null;
    return { text: modelFull_(value, "number", lang), value };
  }
  const text = textOf(raw);
  return { text, value: text };
}

/** 新しい順の明細の表 */
function modelTableLatest_(widget, ctx, dataset, rows) {
  const lang = ctx.lang;
  const types = dataset.types || {};
  const dateColumn = modelDateColumn_(ctx, widget.dataset);
  const head = widget.columns.map((column) => ({ label: column, numeric: modelOwn_(types, column) === "number" }));

  const sorted = rows.slice();
  if (dateColumn !== "") {
    sorted.sort((a, b) => {
      const av = a ? a[dateColumn] : null;
      const bv = b ? b[dateColumn] : null;
      const aEmpty = !isDateKey(av);
      const bEmpty = !isDateKey(bv);
      if (aEmpty || bEmpty) return aEmpty && bEmpty ? 0 : aEmpty ? 1 : -1;
      return av < bv ? 1 : av > bv ? -1 : 0;
    });
  }
  const body = sorted.slice(0, widget.top).map((row) => widget.columns.map((column) => modelDetailCell_(row, column, types, lang)));

  const plainOf = (cell, index) => (head[index].numeric ? modelPlain_(cell.value, "number") : cell.text);
  return modelTableOf_(widget, head, body, 0, plainOf);
}

// ---- 組み立て -------------------------------------------------------------

function modelWidget_(widget, ctx) {
  // 設定の誤りの札（config.js が作ったもの）はそのまま通す
  if (!widget || widget.type === "error") return widget;

  const dataset = modelOwn_(ctx.datasets, widget.dataset);
  if (!dataset) return modelErrorOf_(widget, t(ctx.lang, "error.datasetMissing", { name: widget.dataset }));
  modelMarkTruncated_(dataset, ctx);

  // 列の書き間違いは、そのままだと「それらしいグラフ」になって気づけないので、描く前にここで止める
  const missing = modelMissingColumn_(dataset, modelNamedColumns_(widget, ctx));
  if (missing !== "") return modelErrorOf_(widget, modelColumnMissing_(ctx, widget.dataset, missing));

  const rows = modelRows_(dataset, widget.dataset, ctx, ctx.range);
  if (widget.type === "kpi") return modelKpi_(widget, ctx, dataset, rows);
  if (widget.type === "line") return modelLine_(widget, ctx, dataset, rows);
  if (widget.type === "bar") return modelBar_(widget, ctx, dataset, rows);
  if (widget.type === "meter") return modelMeter_(widget, ctx, rows);
  return widget.rows === "latest" ? modelTableLatest_(widget, ctx, dataset, rows) : modelTableGrouped_(widget, ctx, rows);
}

/**
 * そろった設定（parseConfig の config）・データセット・絞り込み・today・言語から、
 * 画面に描く形をひととおり作る。datasets は { 名前: { columns, rows（型をそろえた行）, types, truncated } }。
 * 戻り値は { title, range, previous, widgets, notes }
 */
function buildDashboard(input) {
  const options = input && typeof input === "object" ? input : {};
  const config = options.config && typeof options.config === "object" ? options.config : {};
  const lang = options.lang === "en" || options.lang === "ja" ? options.lang : config.lang === "en" ? "en" : "ja";
  const today = textOf(options.today);
  const filters = options.filters && typeof options.filters === "object" ? options.filters : { period: "all", dimensions: {} };
  const range = resolveRange(filters, today);

  const datasets = options.datasets && typeof options.datasets === "object" ? options.datasets : {};
  const previous = previousRange(range);
  // dimensionCache は、同じデータセットに効く絞り込みを部品ごとに作り直さないための覚え書き
  const ctx = { config: { datasets: config.datasets || {} }, datasets, filters, range, previous, today, lang, truncated: false, dimensionCache: new Map() };

  const widgets = (Array.isArray(config.widgets) ? config.widgets : []).map((widget) => modelWidget_(widget, ctx));
  const notes = [];
  if (ctx.truncated) notes.push(t(lang, "state.truncated"));

  return { title: textOf(config.title), range, previous: ctx.previous, widgets, notes };
}

// ===== samples.js =====
/**
 * しおかぜ珈琲店（架空の店・みなと市）の見本データを、today から決まった式だけで作る 1 か所。
 * 乱数は使わず、日付・行番号から作る線形合同法（LCG）だけで揺らぎを作る。
 * 同じ today なら何度呼んでも同じ出力になり、today が違えば違う（けれど同じ形の）出力になる。
 * ここは純粋な計算だけを行う（「今日」は today "YYYY-MM-DD" で受け取る）
 *
 * 金額はどの行も必ず「数量 × その商品の決まった単価」（SAMPLE_PRODUCTS）で、あとから金額に
 * 縮尺を掛けたりはしない。月ごとの売上のねらい（samplesMonthTarget_）に近づけるのは、
 * その月に何が・どれだけ売れたか（行数・数量）を動かすことだけで行う
 */


/** 見本の売上は today から遡って何日ぶんか（today を含む） */
const SAMPLES_SPAN_DAYS_ = 180;
/** 1 日あたりの行数の範囲 */
const SAMPLES_ROWS_PER_DAY_ = [3, 9];
/** 卸（大口）は 1 か月に 3〜4 件（乱数の日ではなく、月ごとに決まった日にする）。そのときの数量の範囲 */
const SAMPLES_WHOLESALE_ORDERS_PER_MONTH_RANGE_ = [3, 4];
const SAMPLES_WHOLESALE_QTY_RANGE_ = [10, 40];
/** EC は月を追って伸びる（月あたりの伸び率） */
const SAMPLES_ONLINE_GROWTH_PER_MONTH_ = 1.06;
/** 週末は店頭の数量が増える */
const SAMPLES_WEEKEND_STORE_MULTIPLIER_ = 1.4;
const SAMPLES_GIFT_BOOST_MULTIPLIER_ = 1.5;
const SAMPLES_GIFT_WEIGHT_BOOST_ = 3;
/** 数量は、この額から月を追ってゆるやかに伸びる月間売上になるよう調整する（金額そのものは動かさない） */
const SAMPLES_MONTH_BASE_REVENUE_ = 1200000;
const SAMPLES_MONTH_GROWTH_PER_MONTH_ = 1.06;
/** 12 月（ギフトの山）だけ、月ごとの伸びに重ねて掛ける割り増し */
const SAMPLES_DECEMBER_LIFT_MULTIPLIER_ = 1.2;
/** 目標額は、月ごとの売上のねらい額にこれを掛ける（達成率が 100% ぴったりにならないように） */
const SAMPLES_TARGET_MARGIN_ = 1.05;
/** 数量の調整（demand）で動かしてよい倍率の範囲。行の姿（少量ずつ）を保つための歯止め */
const SAMPLES_DEMAND_RANGE_ = [0.6, 2.6];
/** 1 行の数量の上限（正の整数） */
const SAMPLES_QTY_MAX_ = 60;

/** チャネル（ja / en） */
const SAMPLES_CHANNELS_ = {
  store: { ja: "店頭", en: "Store" },
  online: { ja: "EC", en: "Online" },
  wholesale: { ja: "卸", en: "Wholesale" },
};

/** カテゴリ（キー・ja / en・重み・数量のふつうの範囲）。商品は SAMPLE_PRODUCTS の category で結びつける */
const SAMPLES_CATEGORY_DEFS_ = [
  { key: "coffee", ja: "コーヒー豆", en: "Coffee beans", weight: 0.38, qty: [1, 3] },
  { key: "drip", ja: "ドリップバッグ", en: "Drip bags", weight: 0.24, qty: [1, 4] },
  { key: "equipment", ja: "器具", en: "Equipment", weight: 0.1, qty: [1, 2] },
  { key: "baked", ja: "焼き菓子", en: "Baked goods", weight: 0.24, qty: [1, 5] },
  { key: "gift", ja: "ギフト", en: "Gifts", weight: 0.04, qty: [1, 2] },
];
const SAMPLES_GIFT_CATEGORY_KEY_ = "gift";

/**
 * 見本の商品と、その決まった単価（円・10 円刻み・300〜12,000 円）。金額はどの行でも
 * 「数量 × ここにある単価」で決まり、これ以外の場所で金額を作らない・動かさない。
 * key は行の商品を指す内部の名前、category は SAMPLES_CATEGORY_DEFS_ の key
 */
const SAMPLE_PRODUCTS = [
  { key: "blend", ja: "しおかぜブレンド", en: "Shiokaze Blend", category: "coffee", price: 2000 },
  { key: "kilimanjaro", ja: "深煎り キリマンジャロ", en: "Dark Roast Kilimanjaro", category: "coffee", price: 2200 },
  { key: "ethiopia", ja: "浅煎り エチオピア", en: "Light Roast Ethiopia", category: "coffee", price: 2400 },
  { key: "subscription", ja: "珈琲豆 定期便セット", en: "Coffee Bean Subscription Set", category: "coffee", price: 3800 },
  { key: "morningDrip", ja: "朝のドリップバッグ 10 袋", en: "Morning Drip Bags (10-pack)", category: "drip", price: 1600 },
  { key: "eveningDrip", ja: "夜のドリップバッグ 10 袋", en: "Evening Drip Bags (10-pack)", category: "drip", price: 1600 },
  { key: "dripAssortment", ja: "ドリップバッグ 詰め合わせ 20 袋", en: "Drip Bag Assortment (20-pack)", category: "drip", price: 3000 },
  { key: "kettle", ja: "ハンドドリップ ケトル", en: "Hand Drip Kettle", category: "equipment", price: 6500 },
  { key: "grinder", ja: "コーヒーミル", en: "Coffee Grinder", category: "equipment", price: 11800 },
  { key: "dripperSet", ja: "ドリッパー・サーバー セット", en: "Dripper & Server Set", category: "equipment", price: 4200 },
  { key: "cookies", ja: "珈琲に合うクッキー", en: "Coffee Cookies", category: "baked", price: 500 },
  { key: "madeleine", ja: "珈琲マドレーヌ", en: "Coffee Madeleine", category: "baked", price: 450 },
  { key: "bakedAssortment", ja: "焼き菓子 詰め合わせ", en: "Baked Goods Assortment", category: "baked", price: 1200 },
  { key: "giftAssortment", ja: "しおかぜギフト 詰め合わせ", en: "Shiokaze Gift Assortment", category: "gift", price: 3800 },
  { key: "giftSet", ja: "珈琲とお菓子の贈り物セット", en: "Coffee & Sweets Gift Set", category: "gift", price: 5200 },
];

/** カテゴリの並び（SAMPLES_CATEGORY_DEFS_ の順）に、そのカテゴリの商品を添えたもの */
const SAMPLES_CATEGORIES_ = SAMPLES_CATEGORY_DEFS_.map((def) => ({
  ...def,
  products: SAMPLE_PRODUCTS.filter((product) => product.category === def.key),
}));
const SAMPLES_GIFT_CATEGORY_INDEX_ = SAMPLES_CATEGORIES_.findIndex((category) => category.key === SAMPLES_GIFT_CATEGORY_KEY_);
/** 卸（大口）が買うのは、まとめ買いしやすいコーヒー豆・ドリップバッグだけ */
const SAMPLES_WHOLESALE_CATEGORY_WEIGHTS_ = [
  { index: 0, weight: 0.6 },
  { index: 1, weight: 0.4 },
];

// ---- 乱数の代わり（線形合同法） --------------------------------------------

/** 文字を 32 ビットの数にする（FNV-1a）。tag ごとに違う、決まった種を作るためだけに使う */
function samplesHash32_(text) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** 32 ビットの線形合同法を 1 歩進める（Numerical Recipes の定数。Math.imul で桁あふれを 32 ビットに保つ） */
function samplesLcgStep_(state) {
  return (Math.imul(state, 1664525) + 1013904223) >>> 0;
}

/** tag から、決まった [0, 1) の乱数もどきを 1 つ作る */
function samplesRandom_(tag) {
  return samplesLcgStep_(samplesHash32_(tag)) / 4294967296;
}

/** tag から、決まった [0, 1) の乱数もどきを count 個作る（同じ行で複数の選択に使う） */
function samplesRandomSeq_(tag, count) {
  let state = samplesHash32_(tag);
  const values = [];
  for (let i = 0; i < count; i += 1) {
    state = samplesLcgStep_(state);
    values.push(state / 4294967296);
  }
  return values;
}

/** rand（[0,1)）と重みの並びから、選ばれた位置（0 始まり）を決める */
function samplesWeightedIndex_(rand, weights) {
  const total = weights.reduce((sum, w) => sum + w, 0);
  let at = rand * total;
  for (let i = 0; i < weights.length; i += 1) {
    at -= weights[i];
    if (at <= 0) return i;
  }
  return weights.length - 1;
}

/** rand から、0〜length-1 のどれかを一様に選ぶ */
function samplesPickIndex_(rand, length) {
  return Math.min(length - 1, Math.floor(rand * length));
}

/** rand から、min〜max（両端を含む）の整数を一様に選ぶ */
function samplesIntInRange_(rand, min, max) {
  return min + Math.floor(rand * (max - min + 1));
}

/** 値を [min, max] に収める */
function samplesClamp_(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

// ---- 形の決まり（週末・伸び・ギフトの山） -----------------------------------

/** 土日か */
function samplesIsWeekend_(dateKey) {
  const day = weekdayOf(dateKey);
  return day === 0 || day === 6;
}

/** 12 月、またはその 1 週間前（11 月の最後の週）はギフトが増える */
function samplesGiftBoostActive_(dateKey) {
  return monthOf(dateKey).endsWith("-12") || monthOf(addDays(dateKey, 7)).endsWith("-12");
}

/** fromMonth（"YYYY-MM"）から数えて、month が何か月先か（0 始まり） */
function samplesMonthIndex_(fromMonth, month) {
  const fromYear = Number(fromMonth.slice(0, 4));
  const fromMon = Number(fromMonth.slice(5, 7));
  const year = Number(month.slice(0, 4));
  const mon = Number(month.slice(5, 7));
  return (year - fromYear) * 12 + (mon - fromMon);
}

/** "YYYY-MM" の月の日数（31 日先に進めれば必ず翌月に入ることを使って求める） */
function samplesDaysInMonth_(month) {
  const start = month + "-01";
  const nextMonthStart = monthOf(addDays(start, 31)) + "-01";
  return diffDays(start, nextMonthStart);
}

/**
 * その月の、まるまる 1 か月ぶんの月間売上のねらい額。span の最初の月（fromMonth）を 0 か月目として
 * 数え、月を追ってゆるやかに伸びる形にし、12 月だけギフトの山ぶんを割り増す。
 * 見本の売上（samplesBuildSales_、数量の調整のねらいに使う）と目標の見積もり（samplesBuildTargets_）は
 * 同じこの額を使う
 */
function samplesMonthTarget_(fromMonth, month) {
  const index = samplesMonthIndex_(fromMonth, month);
  const growth = Math.pow(SAMPLES_MONTH_GROWTH_PER_MONTH_, index);
  const lift = month.endsWith("-12") ? SAMPLES_DECEMBER_LIFT_MULTIPLIER_ : 1;
  return SAMPLES_MONTH_BASE_REVENUE_ * growth * lift;
}

/**
 * その月に立つ、卸（大口）の注文の日（1 始まりの日）。乱数の日ではなく、月を等分した区画に
 * 1 件ずつ置くことで、日はばらけながらも件数は毎月 3〜4 件にそろえる
 */
function samplesWholesaleDaysOfMonth_(month) {
  const daysInMonth = samplesDaysInMonth_(month);
  const count = samplesRandom_(month + "|wholesale-count") < 0.5 ? SAMPLES_WHOLESALE_ORDERS_PER_MONTH_RANGE_[0] : SAMPLES_WHOLESALE_ORDERS_PER_MONTH_RANGE_[1];
  const segment = daysInMonth / count;
  const days = new Set();
  for (let i = 0; i < count; i += 1) {
    const rand = samplesRandom_(month + "|wholesale-day-" + i);
    const start = Math.floor(i * segment);
    const end = Math.floor((i + 1) * segment) - 1;
    days.add(start + samplesIntInRange_(rand, 0, Math.max(0, end - start)) + 1);
  }
  return days;
}

// ---- 1 日ぶんの行を決める（言語に依らない「行の計画」を作ってから、あとで訳す） --------

/**
 * その日の、通常（店頭・EC）の行 1 つぶんの計画。qtyFloat は数量のねらい（まだ整数に丸めていない）で、
 * このあと月ごとの demand（samplesBuildSales_ が決める）を掛けてから、行にする直前に 1 回だけ丸める
 */
function samplesPlanNormalRow_(dateKey, rowIndex, ctx) {
  const [channelRand, categoryRand, productRand, qtyRand] = samplesRandomSeq_(dateKey + "|" + rowIndex, 4);

  const isWeekend = samplesIsWeekend_(dateKey);
  const storeProb = isWeekend ? 0.65 : 0.42;
  const channelKey = channelRand < storeProb ? "store" : "online";

  const weights = SAMPLES_CATEGORIES_.map((category, index) =>
    ctx.giftBoost && index === SAMPLES_GIFT_CATEGORY_INDEX_ ? category.weight * SAMPLES_GIFT_WEIGHT_BOOST_ : category.weight
  );
  const categoryIndex = samplesWeightedIndex_(categoryRand, weights);
  const category = SAMPLES_CATEGORIES_[categoryIndex];
  const productIndex = samplesPickIndex_(productRand, category.products.length);

  const qtyBase = samplesIntInRange_(qtyRand, category.qty[0], category.qty[1]);
  let multiplier = 1;
  if (channelKey === "store" && isWeekend) multiplier *= SAMPLES_WEEKEND_STORE_MULTIPLIER_;
  if (channelKey === "online") multiplier *= ctx.onlineGrowth;
  if (categoryIndex === SAMPLES_GIFT_CATEGORY_INDEX_ && ctx.giftBoost) multiplier *= SAMPLES_GIFT_BOOST_MULTIPLIER_;

  return { channelKey, categoryIndex, productIndex, qtyFloat: qtyBase * multiplier };
}

/** 大口（卸）の行 1 つぶんの計画。まとめ買いなので数量が大きい */
function samplesPlanWholesaleRow_(dateKey) {
  const [categoryRand, qtyRand, productRand] = samplesRandomSeq_(dateKey + "|wholesale-detail", 3);
  const pick = samplesWeightedIndex_(
    categoryRand,
    SAMPLES_WHOLESALE_CATEGORY_WEIGHTS_.map((w) => w.weight)
  );
  const categoryIndex = SAMPLES_WHOLESALE_CATEGORY_WEIGHTS_[pick].index;
  const category = SAMPLES_CATEGORIES_[categoryIndex];
  const productIndex = samplesPickIndex_(productRand, category.products.length);
  const qtyFloat = samplesIntInRange_(qtyRand, SAMPLES_WHOLESALE_QTY_RANGE_[0], SAMPLES_WHOLESALE_QTY_RANGE_[1]);
  return { channelKey: "wholesale", categoryIndex, productIndex, qtyFloat };
}

/** その日ぶんの行の計画（3〜9 件。月に 3〜4 日だけ、そのうち 1 件が卸の大口になる） */
function samplesDayPlans_(dateKey, fromMonth) {
  const countRand = samplesRandom_(dateKey + "|count");
  const rowCount = samplesIntInRange_(countRand, SAMPLES_ROWS_PER_DAY_[0], SAMPLES_ROWS_PER_DAY_[1]);
  const dayOfMonth = Number(dateKey.slice(8, 10));
  const hasWholesale = samplesWholesaleDaysOfMonth_(monthOf(dateKey)).has(dayOfMonth);

  const ctx = {
    giftBoost: samplesGiftBoostActive_(dateKey),
    onlineGrowth: Math.pow(SAMPLES_ONLINE_GROWTH_PER_MONTH_, samplesMonthIndex_(fromMonth, monthOf(dateKey))),
  };

  const normalCount = hasWholesale ? rowCount - 1 : rowCount;
  const plans = [];
  for (let i = 0; i < normalCount; i += 1) plans.push(samplesPlanNormalRow_(dateKey, i, ctx));
  if (hasWholesale) plans.push(samplesPlanWholesaleRow_(dateKey));
  return plans;
}

/** その計画 1 つぶんの、単価に掛ける前の「数量のねらい」に単価を掛けただけの、生の（demand を掛ける前の）額 */
function samplesPlanRawAmount_(plan) {
  const category = SAMPLES_CATEGORIES_[plan.categoryIndex];
  const product = category.products[plan.productIndex];
  return plan.qtyFloat * product.price;
}

/**
 * 行の計画と、すでに決まった数量（qty）を、言語ごとの 1 行（日付・チャネル・カテゴリ・商品・数量・金額）
 * にする。金額はその数量と商品の決まった単価の積そのもの（数量 × 単価）で、これ以外の縮尺は一切掛けない
 */
function samplesLocalizeRow_(plan, dateKey, isEn, qty) {
  const category = SAMPLES_CATEGORIES_[plan.categoryIndex];
  const product = category.products[plan.productIndex];
  const channel = SAMPLES_CHANNELS_[plan.channelKey];
  const amount = qty * product.price;
  return [dateKey, isEn ? channel.en : channel.ja, isEn ? category.en : category.ja, isEn ? product.en : product.ja, qty, amount];
}

/**
 * 見本の売上（見出し行を含む行列）。
 * (1) まず日ごとの計画（チャネル・カテゴリ・商品・数量のねらい＝qtyFloat）を揺らぎのある式のまま作り、
 *     月ごとに「demand を掛ける前の生の額」の合計を出す。
 * (2) その月に立つはずの額（samplesMonthTarget_、span に無い日数ぶんは按分）との比で月ごとの
 *     demand（数量の調整倍率）を決め、各行の数量を「qtyFloat × demand」を整数に丸めたものにする
 *     （1〜SAMPLES_QTY_MAX_ に収める）。
 * (3) 整数に丸めた分だけ月間の実額が月のねらいから少しだけずれるので、その月にある卸（大口）の
 *     行の数量を、ねらいとの差ぶんだけ動かして埋め合わせる（大口の行は数量の範囲が広く、1 個の
 *     増減が金額に効くので、ここで動かしても「まとめ買い」の見た目を崩さない）。
 * どの段階でも、行の金額は必ず「その行の数量 × 商品の決まった単価」のまま
 */
function samplesBuildSales_(today, isEn) {
  const from = addDays(today, -(SAMPLES_SPAN_DAYS_ - 1));
  const fromMonth = monthOf(from);

  const days = [];
  const daysPresentByMonth = new Map();
  const rawTotalByMonth = new Map();
  for (let i = 0; i < SAMPLES_SPAN_DAYS_; i += 1) {
    const dateKey = addDays(from, i);
    const month = monthOf(dateKey);
    const plans = samplesDayPlans_(dateKey, fromMonth);
    days.push({ dateKey, month, plans });
    daysPresentByMonth.set(month, (daysPresentByMonth.get(month) || 0) + 1);
    let rawTotal = rawTotalByMonth.get(month) || 0;
    for (const plan of plans) rawTotal += samplesPlanRawAmount_(plan);
    rawTotalByMonth.set(month, rawTotal);
  }

  const targetByMonth = new Map();
  const demandByMonth = new Map();
  for (const [month, daysPresent] of daysPresentByMonth) {
    const proratedTarget = samplesMonthTarget_(fromMonth, month) * (daysPresent / samplesDaysInMonth_(month));
    targetByMonth.set(month, proratedTarget);
    const rawTotal = rawTotalByMonth.get(month);
    const demand = rawTotal > 0 ? proratedTarget / rawTotal : 1;
    demandByMonth.set(month, samplesClamp_(demand, SAMPLES_DEMAND_RANGE_[0], SAMPLES_DEMAND_RANGE_[1]));
  }

  // demand を掛けて丸めた数量（plan ごと）と、月ごとの実額・卸の行の一覧を作る
  const qtyByPlan = new Map();
  const actualTotalByMonth = new Map();
  const wholesalePlansByMonth = new Map();
  for (const day of days) {
    const demand = demandByMonth.get(day.month);
    for (const plan of day.plans) {
      const product = SAMPLES_CATEGORIES_[plan.categoryIndex].products[plan.productIndex];
      const qty = samplesClamp_(Math.round(plan.qtyFloat * demand), 1, SAMPLES_QTY_MAX_);
      qtyByPlan.set(plan, qty);
      actualTotalByMonth.set(day.month, (actualTotalByMonth.get(day.month) || 0) + qty * product.price);
      if (plan.channelKey === "wholesale") {
        const list = wholesalePlansByMonth.get(day.month) || [];
        list.push(plan);
        wholesalePlansByMonth.set(day.month, list);
      }
    }
  }

  // 丸めで生まれた月ごとの差ぶんを、その月の卸（大口）の行の数量で埋め合わせる
  for (const [month, wholesalePlans] of wholesalePlansByMonth) {
    let gap = targetByMonth.get(month) - actualTotalByMonth.get(month);
    for (const plan of wholesalePlans) {
      if (gap === 0) break;
      const product = SAMPLES_CATEGORIES_[plan.categoryIndex].products[plan.productIndex];
      const currentQty = qtyByPlan.get(plan);
      const newQty = samplesClamp_(currentQty + Math.round(gap / product.price), 1, SAMPLES_QTY_MAX_);
      gap -= (newQty - currentQty) * product.price;
      qtyByPlan.set(plan, newQty);
    }
  }

  const header = isEn ? ["Date", "Channel", "Category", "Product", "Qty", "Amount"] : ["日付", "チャネル", "カテゴリ", "商品", "数量", "金額"];
  const rows = [header];
  for (const day of days) {
    for (const plan of day.plans) rows.push(samplesLocalizeRow_(plan, day.dateKey, isEn, qtyByPlan.get(plan)));
  }
  return rows;
}

// ---- 目標（月ごとのねらい額 × 余白） ----------------------------------------

/** 見本の目標（見出し行を含む行列）。span にかかるすべての月に 1 行ずつ。売上と同じ samplesMonthTarget_ を使う */
function samplesBuildTargets_(today, isEn) {
  const from = addDays(today, -(SAMPLES_SPAN_DAYS_ - 1));
  const fromMonth = monthOf(from);
  const months = new Set(bucketsBetween(from, today, "month"));
  months.add(monthOf(today)); // today の月は必ず入れる（決まりの通り、念のため）

  const header = isEn ? ["Month", "Target"] : ["月", "目標額"];
  const rows = [header];
  for (const month of Array.from(months).sort()) {
    const expected = samplesMonthTarget_(fromMonth, month) * SAMPLES_TARGET_MARGIN_;
    const target = Math.round(expected / 10000) * 10000; // 万円単位の、きりのよい目標額にする
    rows.push([month, target]);
  }
  return rows;
}

// ---- 設定（そのまま dashboard.config.json になる） ---------------------------

/** そろった列の名前（ja / en） */
function samplesColumns_(isEn) {
  return isEn
    ? { date: "Date", channel: "Channel", category: "Category", product: "Product", qty: "Qty", amount: "Amount", month: "Month", target: "Target" }
    : { date: "日付", channel: "チャネル", category: "カテゴリ", product: "商品", qty: "数量", amount: "金額", month: "月", target: "目標額" };
}

/** 見本のダッシュボードの題名 */
function samplesTitle_(isEn) {
  return isEn ? "Shiokaze Coffee — Sales dashboard" : "しおかぜ珈琲店 売上ダッシュボード";
}

/** 見本の部品の題（JSON の見本とシートの見本で同じ文を使う） */
function samplesWidgetTitles_(isEn) {
  return isEn
    ? {
        sales: "Sales",
        orders: "Orders",
        average: "Average order value",
        varieties: "Product varieties sold",
        trend: "Sales trend",
        byCategory: "Sales by category",
        goal: "This month's goal",
        channelCategory: "Channel × category",
        byProduct: "By product",
        recent: "Recent orders",
      }
    : {
        sales: "売上",
        orders: "注文数",
        average: "平均の注文額",
        varieties: "売れた商品の種類",
        trend: "売上の推移",
        byCategory: "カテゴリ別の売上",
        goal: "今月の目標",
        channelCategory: "チャネル別 × カテゴリ",
        byProduct: "商品別",
        recent: "最近の注文",
      };
}

/** 見本のダッシュボードの設定（raw のまま。parseConfig を通す前の形） */
function samplesConfig_(isEn) {
  const col = samplesColumns_(isEn);
  const title = samplesTitle_(isEn);
  const name = samplesWidgetTitles_(isEn);

  return {
    title,
    lang: isEn ? "en" : "ja",
    theme: "auto",
    datasets: {
      sales: { url: "./sales.csv", dateColumn: col.date },
      targets: { url: "./targets.csv" },
    },
    filters: { period: "thisMonth", dimensions: [col.channel, col.category] },
    widgets: [
      {
        type: "kpi",
        title: name.sales,
        dataset: "sales",
        value: col.amount,
        agg: "sum",
        format: "yen",
        compare: "previous",
        size: "s",
      },
      { type: "kpi", title: name.orders, dataset: "sales", agg: "count", format: "number", size: "s" },
      {
        type: "kpi",
        title: name.average,
        dataset: "sales",
        value: col.amount,
        agg: "avg",
        format: "yen",
        size: "s",
      },
      {
        type: "kpi",
        title: name.varieties,
        dataset: "sales",
        value: col.product,
        agg: "distinct",
        compare: "none",
        format: "number",
        size: "s",
      },
      {
        type: "line",
        title: name.trend,
        dataset: "sales",
        value: col.amount,
        agg: "sum",
        splitBy: col.channel,
        format: "yen",
        size: "l",
      },
      {
        type: "bar",
        title: name.byCategory,
        dataset: "sales",
        category: col.category,
        value: col.amount,
        agg: "sum",
        format: "yen",
        size: "m",
      },
      {
        type: "meter",
        title: name.goal,
        dataset: "sales",
        value: col.amount,
        agg: "sum",
        target: { dataset: "targets", value: col.target, matchMonth: col.month },
        format: "yen",
        size: "m",
      },
      {
        type: "bar",
        title: name.channelCategory,
        dataset: "sales",
        category: col.channel,
        splitBy: col.category,
        value: col.amount,
        agg: "sum",
        format: "yen",
        size: "m",
      },
      {
        type: "table",
        title: name.byProduct,
        dataset: "sales",
        groupBy: col.product,
        columns: [
          { value: col.qty, agg: "sum", label: col.qty },
          { value: col.amount, agg: "sum", label: name.sales, format: "yen" },
        ],
        sort: name.sales,
        top: 10,
        size: "m",
      },
      {
        type: "table",
        title: name.recent,
        dataset: "sales",
        rows: "latest",
        columns: [col.date, col.channel, col.product, col.qty, col.amount],
        top: 8,
        size: "l",
      },
    ],
  };
}

/**
 * しおかぜ珈琲店の見本データを、today（"YYYY-MM-DD"）と lang（既定 "ja"）から決まった式で作る。
 * 同じ today なら同じ出力、today が違えば違う（同じ形の）出力になる。
 * 戻り値の config はそのまま parseConfig に渡せる raw、datasets は見出し行を含む行列（string[][]）
 */
function sampleData(today, lang = "ja") {
  const isEn = lang === "en";
  return {
    config: samplesConfig_(isEn),
    datasets: {
      sales: samplesBuildSales_(today, isEn),
      targets: samplesBuildTargets_(today, isEn),
    },
  };
}

// ---- 設定・定義のシートの形の見本（スプレッドシート版） -----------------------

/** データのシートの名前 */
function samplesSheetNames_(isEn) {
  return isEn ? { sales: "Sales", targets: "Targets" } : { sales: "売上", targets: "目標" };
}

/** 1 つのマスに列の名前を並べるときの区切り */
function samplesListSeparator_(isEn) {
  return isEn ? ", " : "、";
}

/** 見出しの名前で書いた 1 行を、`定義` シートの列の並びにそろえる */
function samplesDefinitionRow_(cells) {
  return CONFIG_DEFINITION_COLUMNS_.map((name) => (cells[name] === undefined ? "" : cells[name]));
}

/**
 * `設定`・`定義` シートの見本（見出し行つきの行列）。JSON の見本（samplesConfig_）と
 * 同じダッシュボードを、シートの言葉で書いたもの
 */
function samplesSheetConfig_(isEn) {
  const col = samplesColumns_(isEn);
  const name = samplesWidgetTitles_(isEn);
  const sheet = samplesSheetNames_(isEn);
  const sep = samplesListSeparator_(isEn);
  // 目標は「シート名!列名」。月の列の名前が「月」でなければ、3 つめに月の列を書く
  const target = sheet.targets + "!" + col.target + (col.month === "月" ? "" : "!" + col.month);

  const settings = [
    ["項目", "値"],
    ["題名", samplesTitle_(isEn)],
    ["言語", isEn ? "英語" : "日本語"],
    ["テーマ", "自動"],
    ["期間", "今月"],
    ["絞り込みの列", col.channel + sep + col.category],
  ];

  const definitions = [
    CONFIG_DEFINITION_COLUMNS_.slice(),
    samplesDefinitionRow_({
      種類: "数字",
      題: name.sales,
      データ: sheet.sales,
      値の列: col.amount,
      集計: "合計",
      書式: "円",
      大きさ: "小",
      比べる: "前の期間",
      // 解約数・返品額のように「下がると良い」数のときは、ここを 下がると良い にする
      良し悪し: "上がると良い",
    }),
    samplesDefinitionRow_({ 種類: "数字", 題: name.orders, データ: sheet.sales, 集計: "件数", 書式: "数値", 大きさ: "小" }),
    samplesDefinitionRow_({ 種類: "数字", 題: name.average, データ: sheet.sales, 値の列: col.amount, 集計: "平均", 書式: "円", 大きさ: "小" }),
    samplesDefinitionRow_({ 種類: "数字", 題: name.varieties, データ: sheet.sales, 値の列: col.product, 集計: "種類の数", 書式: "数値", 大きさ: "小", 比べる: "なし" }),
    samplesDefinitionRow_({
      種類: "折れ線",
      題: name.trend,
      データ: sheet.sales,
      値の列: col.amount,
      集計: "合計",
      分ける列: col.channel,
      日付の列: col.date,
      刻み: "自動",
      書式: "円",
      大きさ: "大",
    }),
    samplesDefinitionRow_({ 種類: "棒", 題: name.byCategory, データ: sheet.sales, 値の列: col.amount, 集計: "合計", 区分の列: col.category, 書式: "円", 大きさ: "中" }),
    samplesDefinitionRow_({ 種類: "目標", 題: name.goal, データ: sheet.sales, 値の列: col.amount, 集計: "合計", 書式: "円", 目標: target, 大きさ: "中" }),
    samplesDefinitionRow_({
      種類: "棒",
      題: name.channelCategory,
      データ: sheet.sales,
      値の列: col.amount,
      集計: "合計",
      区分の列: col.channel,
      分ける列: col.category,
      書式: "円",
      大きさ: "中",
    }),
    samplesDefinitionRow_({
      種類: "表",
      題: name.byProduct,
      データ: sheet.sales,
      // 「列名=見出し」で見出しを付け、「書式」は同じ並びで列ごとに効かせる
      値の列: col.qty + sep + col.amount + "=" + name.sales,
      集計: "合計",
      区分の列: col.product,
      書式: "数値" + sep + "円",
      大きさ: "中",
      上位: "10",
      並び: name.sales,
    }),
    samplesDefinitionRow_({
      種類: "表",
      題: name.recent,
      データ: sheet.sales,
      値の列: [col.date, col.channel, col.product, col.qty, col.amount].join(sep),
      大きさ: "大",
      上位: "8",
      明細: "最新",
    }),
  ];

  return { settings, definitions };
}

/**
 * しおかぜ珈琲店の見本を、スプレッドシートに書く形で作る。
 * settings は `設定` シート、definitions は `定義` シート、data はデータのシート
 * （`売上`・`目標`、英語なら `Sales`・`Targets`）の、どれも見出し行つきの行列。
 * 同じ today・lang なら何度呼んでも同じ出力になる
 */
function sampleSheets(today, lang = "ja") {
  const isEn = lang === "en";
  const sheet = samplesSheetNames_(isEn);
  const { settings, definitions } = samplesSheetConfig_(isEn);
  const data = {};
  data[sheet.sales] = samplesBuildSales_(today, isEn);
  data[sheet.targets] = samplesBuildTargets_(today, isEn);
  return { settings, definitions, data };
}

// ===== state.js =====
/**
 * 画面の状態（読み込みの具合・絞り込み・「表で見る」・並べ替え）と、操作から次の状態を作る 1 か所。
 * ここは純粋な計算だけを行う。状態を書き換えず、変わるときだけ新しい状態を作って返す
 * （変わらないときは同じ状態をそのまま返すので、描き直しが要るかを「同じものか」で見分けられる）。
 */


/**
 * 期間の選び方の並び（絞り込みの select もこの順で出す）。custom はいつも最後。
 * 設定の検査と同じ 1 つの並びを使う（別々に持つと、足したときに片方だけ古くなるため）
 */
const PERIOD_PRESETS = CONFIG_PERIODS_;

/** 並べ替えの巡り。同じ列を押すたびに 大きい順 → 小さい順 → 並べ替えなし に戻る */
const STATE_SORT_NEXT_ = { desc: "asc", asc: "" };

/**
 * 名前をキーにした入れ物を写して、1 項目だけ入れ替える。列名は利用者が自由に書ける文字なので、
 * "__proto__" のような名前でも入れ物自体の素性を書き換えないよう、プロトタイプの無い入れ物に組む
 */
function stateSetOwn_(box, name, value) {
  const copy = Object.create(null);
  const source = box && typeof box === "object" ? box : {};
  for (const key of Object.keys(source)) copy[key] = source[key];
  if (name !== undefined) Object.defineProperty(copy, name, { value, writable: true, enumerable: true, configurable: true });
  return copy;
}

/** 区分の絞り込みが 2 つとも同じ中身か */
function stateSameDimensions_(a, b) {
  const left = a && typeof a === "object" ? a : {};
  const right = b && typeof b === "object" ? b : {};
  const keys = Object.keys(left);
  if (keys.length !== Object.keys(right).length) return false;
  for (const key of keys) {
    if (!hasOwn(right, key) || left[key] !== right[key]) return false;
  }
  return true;
}

/** 絞り込みが 2 つとも同じ中身か（描く側が「戻す」を出すかの判断にも使う） */
function filtersDiffer(a, b) {
  const left = a && typeof a === "object" ? a : {};
  const right = b && typeof b === "object" ? b : {};
  if (left.period !== right.period) return true;
  if (left.from !== right.from || left.to !== right.to) return true;
  return !stateSameDimensions_(left.dimensions, right.dimensions);
}

/** 項目がどれか変わるときだけ、新しい状態を作る */
function stateWith_(state, patch) {
  for (const key of Object.keys(patch)) {
    if (state[key] !== patch[key]) return Object.assign({}, state, patch);
  }
  return state;
}

/** 絞り込みを差し替える（中身が同じなら、元の状態をそのまま返す） */
function stateWithFilters_(state, filters) {
  if (!filtersDiffer(state.filters, filters)) return state;
  return Object.assign({}, state, { filters });
}

/**
 * 設定と today（"YYYY-MM-DD"）から、画面の最初の状態を作る。
 * initial は「戻す」で帰る先。絞り込みが最初と違うかを描く側が見分けるためにも持たせる
 */
function initialState(config, today) {
  const filters = initialFilters(config, today);
  return { status: "loading", filters, initial: filters, tableView: {}, sort: {}, message: "" };
}

function stateSetPeriod_(state, action) {
  const period = textOf(action.period);
  if (PERIOD_PRESETS.indexOf(period) === -1) return state;
  return stateWithFilters_(state, Object.assign({}, state.filters, { period }));
}

function stateSetRange_(state, action) {
  const from = textOf(action.from);
  const to = textOf(action.to);
  return stateWithFilters_(state, Object.assign({}, state.filters, { period: "custom", from, to }));
}

function stateSetDimension_(state, action) {
  const column = textOf(action.column);
  // 設定に書かれた列だけを受け取る（知らない列は静かに見送る）
  if (!hasOwn(state.filters.dimensions, column)) return state;
  const dimensions = stateSetOwn_(state.filters.dimensions, column, textOf(action.value));
  return stateWithFilters_(state, Object.assign({}, state.filters, { dimensions }));
}

function stateToggleTable_(state, action) {
  const id = textOf(action.widget);
  if (id === "") return state;
  const showing = hasOwn(state.tableView, id) && state.tableView[id] === true;
  const tableView = stateSetOwn_(state.tableView, id, !showing);
  return Object.assign({}, state, { tableView });
}

function stateSort_(state, action) {
  const id = textOf(action.widget);
  const column = Number(action.column);
  if (id === "" || !Number.isInteger(column) || column < 0) return state;

  const current = hasOwn(state.sort, id) ? state.sort[id] : null;
  const order = current && current.column === column ? STATE_SORT_NEXT_[current.order] || "" : "desc";
  if (order === "") {
    // 3 回目で並べ替えをやめる。元の並び（model が決めた順）に戻す
    const sort = stateSetOwn_(state.sort, undefined, undefined);
    delete sort[id];
    return Object.assign({}, state, { sort });
  }
  return Object.assign({}, state, { sort: stateSetOwn_(state.sort, id, { column, order }) });
}

function stateReset_(state) {
  const cleared = stateWithFilters_(state, state.initial);
  const sameTable = Object.keys(state.tableView).length === 0;
  const sameSort = Object.keys(state.sort).length === 0;
  if (cleared === state && sameTable && sameSort) return state;
  return Object.assign({}, cleared, { filters: state.initial, tableView: {}, sort: {} });
}

/**
 * 操作（action）から次の状態を作る。知らない操作・形の無い操作は、元の状態をそのまま返す。
 * action は { type, … } の形で、type ごとに使う項目が違う
 * （set-period は period、set-range は from/to、set-dimension は column/value、
 * toggle-table は widget、sort は widget/column、failed は message）
 */
function reduce(state, action) {
  if (!state || typeof state !== "object") return state;
  const type = action && typeof action === "object" ? textOf(action.type) : "";

  if (type === "loaded") return stateWith_(state, { status: "ready", message: "" });
  if (type === "failed") return stateWith_(state, { status: "error", message: textOf(action.message) });
  if (type === "set-period") return stateSetPeriod_(state, action);
  if (type === "set-range") return stateSetRange_(state, action);
  if (type === "set-dimension") return stateSetDimension_(state, action);
  if (type === "toggle-table") return stateToggleTable_(state, action);
  if (type === "sort") return stateSort_(state, action);
  if (type === "reset") return stateReset_(state);
  return state;
}

// ===== svg.js =====
/**
 * グラフの形を作る小道具。座標の移し替え・線と面の道すじ・角丸の棒・印に添える目じるし。
 * 文字列を組み立てるだけで、画面には触れない（ここも純粋な計算だけを行う）。
 * 字の幅の見積もりは model と分け合うので、src/core/text.js の estimateTextWidth を使う。
 */


/** 道すじの数は小数 2 桁まで（長い小数で道すじが読みにくくならないように） */
function svgNum_(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return "0";
  return String(Math.round(num * 100) / 100);
}

/**
 * 値の範囲 domain を、描く範囲 range に移す関数を作る。
 * domain の幅が 0（値がすべて同じ）のときは range の始まりに寄せる
 */
function scaleLinear(domain, range) {
  const d0 = Number(domain[0]);
  const d1 = Number(domain[1]);
  const r0 = Number(range[0]);
  const r1 = Number(range[1]);
  const span = d1 - d0;
  if (span === 0) return () => r0;
  return (value) => r0 + ((Number(value) - d0) / span) * (r1 - r0);
}

/** 続いている点のかたまりに切り分ける（読めない値は null で渡し、そこで線を切る） */
function svgRuns_(points) {
  const list = Array.isArray(points) ? points : [];
  const runs = [];
  let run = [];
  for (const point of list) {
    if (point === null || point === undefined) {
      if (run.length > 0) runs.push(run);
      run = [];
      continue;
    }
    run.push(point);
  }
  if (run.length > 0) runs.push(run);
  return runs;
}

/**
 * 折れ線の道すじ。読めない値のところで線を切り、次のかたまりを新しい M から始める
 * （間を勝手につながない）。点が 1 つだけのかたまりは、丸い継ぎ目の点として残す
 */
function linePath(points) {
  const parts = [];
  for (const run of svgRuns_(points)) {
    const steps = run.map((point) => svgNum_(point.x) + " " + svgNum_(point.y));
    // 点が 1 つだけのときも、同じ場所へ L を引いて丸い点として見えるようにする
    if (steps.length === 1) steps.push(steps[0]);
    parts.push("M " + steps[0] + " L " + steps.slice(1).join(" L "));
  }
  return parts.join(" ");
}

/** 1 系列のときに敷く面の道すじ。線の下を baseY（0 の線）まで落として閉じる */
function areaPath(points, baseY) {
  const base = svgNum_(baseY);
  const parts = [];
  for (const run of svgRuns_(points)) {
    const steps = run.map((point) => "L " + svgNum_(point.x) + " " + svgNum_(point.y));
    parts.push("M " + svgNum_(run[0].x) + " " + base + " " + steps.join(" ") + " L " + svgNum_(run[run.length - 1].x) + " " + base + " Z");
  }
  return parts.join(" ");
}

/**
 * 棒 1 本（積み上げの面 1 つ）の道すじ。値の側（side: "top" "bottom" "left" "right"）の
 * 2 つの角だけを radius で丸め、根元は四角のままにする。radius が 0 のときは丸みの命令を書かない。
 * 角丸は棒の半分までに収める（低い棒・細い棒でも形がくずれないように）
 */
function roundedBar(options) {
  const opts = options || {};
  const x = Number(opts.x) || 0;
  const y = Number(opts.y) || 0;
  const width = Number(opts.width) || 0;
  const height = Number(opts.height) || 0;
  const side = opts.side;
  const r = Math.max(0, Math.min(Number(opts.radius) || 0, width / 2, height / 2));

  const x2 = x + width;
  const y2 = y + height;
  const n = svgNum_;
  const arc = (sweep, ax, ay) => "A " + n(r) + " " + n(r) + " 0 0 " + sweep + " " + n(ax) + " " + n(ay);

  if (side === "bottom") {
    if (r === 0) return "M " + n(x) + " " + n(y) + " L " + n(x) + " " + n(y2) + " L " + n(x2) + " " + n(y2) + " L " + n(x2) + " " + n(y) + " Z";
    return (
      "M " + n(x) + " " + n(y) + " L " + n(x) + " " + n(y2 - r) + " " + arc(0, x + r, y2) +
      " L " + n(x2 - r) + " " + n(y2) + " " + arc(0, x2, y2 - r) + " L " + n(x2) + " " + n(y) + " Z"
    );
  }
  if (side === "left") {
    if (r === 0) return "M " + n(x2) + " " + n(y) + " L " + n(x) + " " + n(y) + " L " + n(x) + " " + n(y2) + " L " + n(x2) + " " + n(y2) + " Z";
    return (
      "M " + n(x2) + " " + n(y) + " L " + n(x + r) + " " + n(y) + " " + arc(0, x, y + r) +
      " L " + n(x) + " " + n(y2 - r) + " " + arc(0, x + r, y2) + " L " + n(x2) + " " + n(y2) + " Z"
    );
  }
  if (side === "right") {
    if (r === 0) return "M " + n(x) + " " + n(y) + " L " + n(x2) + " " + n(y) + " L " + n(x2) + " " + n(y2) + " L " + n(x) + " " + n(y2) + " Z";
    return (
      "M " + n(x) + " " + n(y) + " L " + n(x2 - r) + " " + n(y) + " " + arc(1, x2, y + r) +
      " L " + n(x2) + " " + n(y2 - r) + " " + arc(1, x2 - r, y2) + " L " + n(x) + " " + n(y2) + " Z"
    );
  }
  // 既定は上（縦の棒の、正の値の側）
  if (r === 0) return "M " + n(x) + " " + n(y2) + " L " + n(x) + " " + n(y) + " L " + n(x2) + " " + n(y) + " L " + n(x2) + " " + n(y2) + " Z";
  return (
    "M " + n(x) + " " + n(y2) + " L " + n(x) + " " + n(y + r) + " " + arc(1, x + r, y) +
    " L " + n(x2 - r) + " " + n(y) + " " + arc(1, x2, y + r) + " L " + n(x2) + " " + n(y2) + " Z"
  );
}

/** 吹き出しの中身を読み上げ用の 1 行にする（見える値と同じことを、字だけで伝える） */
function svgTipSpeech_(tip, lang) {
  const separator = lang === "en" ? ", " : "、";
  const parts = tip.title === "" ? [] : [tip.title];
  for (const row of tip.rows) parts.push(row.label === "" ? row.value : row.label + " " + row.value);
  return parts.join(separator);
}

/**
 * 図の中の印（棒・折れ線の帯・目標の帯）に添える目じるし。吹き出しの中身（JSON）と、
 * キーボードの focus、読み上げ用の同じ中身を 1 組で付ける。
 * 使うのは図の印だけにする。表の行に付けると、行が 1 つの図として読まれてしまい、
 * マスと列の組み合わせを読み上げでたどれなくなるため。
 * tip は { title, rows: [{ label, value, color }] }（color は系列の番号、無ければ null）
 */
function tipAttrs(tip, lang) {
  const safe = { title: tip && tip.title ? String(tip.title) : "", rows: tip && Array.isArray(tip.rows) ? tip.rows : [] };
  const rows = safe.rows.map((row) => ({
    label: String(row.label === null || row.label === undefined ? "" : row.label),
    value: String(row.value === null || row.value === undefined ? "" : row.value),
    color: Number.isInteger(row.color) ? row.color : null,
  }));
  const payload = JSON.stringify({ title: safe.title, rows });
  return ' data-tip="' + escapeAttr(payload) + '" tabindex="0" role="img" aria-label="' + escapeAttr(svgTipSpeech_({ title: safe.title, rows }, lang)) + '"';
}

// ===== render.js =====
/**
 * 画面ぜんたいの組み立て。枠・題・絞り込みの行・部品の格子・注記までを 1 つの文字列にする。
 * 数の計算も書式づくりもここでは行わず、model と state が決めたものを置くだけ。
 * 画面には触れない（差し込みと操作は別のところで行う）。
 */


/** 設定の誤りの文に付く前置き。札に出すときは外す（一覧では残す） */
const RENDER_ERROR_PREFIX_ = "dashboard: ";

/** 描ける部品の種類。これ以外は設定を見直す札にする */
const RENDER_WIDGET_TYPES_ = ["kpi", "line", "bar", "meter", "table"];

/** 部品の大きさ（知らない値は真ん中の m にする） */
function renderSize_(model) {
  return model && (model.size === "s" || model.size === "l") ? model.size : "m";
}

/** その部品が「表で見る」に切り替わっているか */
function renderShowsTable_(state, id) {
  const shown = state && state.tableView;
  return hasOwn(shown, id) && shown[id] === true;
}

function renderLang_(view) {
  if (view.lang === "en" || view.lang === "ja") return view.lang;
  return view.config && view.config.lang === "en" ? "en" : "ja";
}

/** 読み込み中・出せないときの知らせ（読み上げにもその場で伝わるようにする） */
function renderStatus_(text) {
  return '<div class="db-status" role="status">' + escapeHtml(text) + "</div>";
}

/** 読み込み中の知らせ */
function renderLoading(lang) {
  return renderStatus_(t(lang, "state.loading"));
}

/** 設定の誤りの一覧。数を添えて畳んでおき、開くと 1 件ずつ読める */
function renderErrorList_(errors, lang) {
  const list = (Array.isArray(errors) ? errors : []).filter((message) => textOf(message) !== "");
  if (list.length === 0) return "";
  const items = list.map((message) => "<li>" + escapeHtml(message) + "</li>").join("");
  return (
    '<details class="db-errors"><summary>' + escapeHtml(t(lang, "state.configIssues", { count: list.length })) +
    "</summary><ul>" + items + "</ul></details>"
  );
}

// ---- 絞り込みの行 ---------------------------------------------------------

function renderOption_(value, label, selected) {
  return '<option value="' + escapeAttr(value) + '"' + (selected ? " selected" : "") + ">" + escapeHtml(label) + "</option>";
}

function renderField_(label, control) {
  return '<label class="db-field"><span class="db-field-label">' + escapeHtml(label) + "</span>" + control + "</label>";
}

function renderDateField_(name, value, lang) {
  return renderField_(
    t(lang, name === "from" ? "filter.from" : "filter.to"),
    '<input class="db-date" type="date" name="' + name + '" data-action="set-range" value="' + escapeAttr(value) + '" />'
  );
}

/** 区分の絞り込み 1 つ。先頭はいつも「すべて」（値は空文字） */
function renderDimensionField_(column, current, values, lang) {
  const options = [renderOption_("", t(lang, "filter.allValues"), current === "")];
  for (const value of values) options.push(renderOption_(value, value, value === current));
  return renderField_(
    column,
    '<select class="db-select" name="dim" data-column="' + escapeAttr(column) + '" data-action="set-dimension">' + options.join("") + "</select>"
  );
}

/**
 * 画面の上の 1 行。期間の select、「期間を指定」のときだけ日付 2 つ、設定に書いた区分の select、
 * そして最初と違うときだけ「戻す」。絞り込みは下のすべての部品に同時に効く
 */
function renderFilters(view) {
  const lang = renderLang_(view);
  const state = view.state || {};
  const filters = state.filters || {};
  const options = view.options || {};
  const parts = [];

  const periods = PERIOD_PRESETS.map((preset) => renderOption_(preset, t(lang, "filter.period." + preset), filters.period === preset));
  parts.push(
    renderField_(t(lang, "filter.period"), '<select class="db-select" name="period" data-action="set-period">' + periods.join("") + "</select>")
  );

  if (filters.period === "custom") {
    parts.push(renderDateField_("from", textOf(filters.from), lang));
    parts.push(renderDateField_("to", textOf(filters.to), lang));
  }

  for (const column of Object.keys(filters.dimensions || {})) {
    const values = hasOwn(options, column) ? options[column] : null;
    const current = hasOwn(filters.dimensions, column) ? filters.dimensions[column] : "";
    parts.push(renderDimensionField_(column, textOf(current), Array.isArray(values) ? values : [], lang));
  }

  if (filtersDiffer(filters, state.initial)) {
    parts.push('<button type="button" class="db-reset" data-action="reset">' + escapeHtml(t(lang, "filter.reset")) + "</button>");
  }

  return '<form class="db-filters" autocomplete="off">' + parts.join("") + "</form>";
}

// ---- 部品 -----------------------------------------------------------------

/** 部品の下に添える注記（設定に書いた文、上限に当たった知らせ、数として読めなかった値の数） */
function renderNotes_(model, lang) {
  const notes = [];
  if (textOf(model.note) !== "") notes.push(model.note);
  if (textOf(model.limitNote) !== "") notes.push(model.limitNote);
  if (Number.isFinite(model.skipped) && model.skipped > 0) {
    notes.push(t(lang, "state.skippedValues", { count: formatNumber(model.skipped, "number", lang) }));
  }
  return notes.map((note) => '<p class="db-card-note">' + escapeHtml(note) + "</p>").join("");
}

/** 題の右に置く押しボタン。表の部品は CSV、それ以外は「表で見る」の切り替え */
function renderCardAction_(model, showingTable, lang) {
  if (model.type === "table") return renderCsvButton(model.id, lang);
  return (
    '<button type="button" class="db-toggle" data-action="toggle-table" data-widget="' + escapeAttr(model.id) +
    '" aria-pressed="' + (showingTable ? "true" : "false") + '">' +
    escapeHtml(t(lang, showingTable ? "widget.showChart" : "widget.showTable")) + "</button>"
  );
}

/**
 * 部品 1 つの枠（題・押しボタン・中身・注記）。inner はすでに組み立てた中身の文字列。
 * lang は押しボタンと注記の文に使う（既定は ja）
 */
function renderWidgetFrame(model, inner, state, lang) {
  const tongue = lang === "en" ? "en" : "ja";
  const id = escapeAttr(model.id);
  const showingTable = renderShowsTable_(state, model.id);
  return (
    '<section class="db-card db-size-' + renderSize_(model) + '" data-widget="' + id + '" aria-labelledby="' + id + '-title">' +
    '<div class="db-card-head"><h2 id="' + id + '-title" class="db-card-title">' + escapeHtml(model.title) + "</h2>" +
    renderCardAction_(model, showingTable, tongue) + "</div>" +
    '<div class="db-card-body">' + inner + "</div>" +
    renderNotes_(model, tongue) +
    "</section>"
  );
}

/**
 * 設定や列の行き違いを知らせる札。前置きは一覧のためのものなので、札では外す。
 * 大きさは部品の設定どおりにして、格子の並びが崩れないようにする
 */
function renderError(model, lang) {
  const tongue = lang === "en" ? "en" : "ja";
  const id = escapeAttr(model.id);
  const title = textOf(model.title) || t(tongue, "state.checkConfig");
  const message = textOf(model.message);
  const shown = message.startsWith(RENDER_ERROR_PREFIX_) ? message.slice(RENDER_ERROR_PREFIX_.length) : message;
  return (
    '<section class="db-card db-size-' + renderSize_(model) + '" data-widget="' + id + '" aria-labelledby="' + id + '-title">' +
    '<div class="db-card-head"><h2 id="' + id + '-title" class="db-card-title">' + escapeHtml(title) + "</h2></div>" +
    '<div class="db-card-body"><p class="db-error">' + escapeHtml(shown || t(tongue, "state.checkConfig")) + "</p></div>" +
    "</section>"
  );
}

/** 部品の中身。「表で見る」が入っているときは、グラフの代わりに同じ値の表を出す */
function renderWidgetBody_(model, state, lang) {
  if (model.type === "table") return renderTable(model, state, lang);
  if (renderShowsTable_(state, model.id)) return renderDataTable(model, state, lang);
  if (model.type === "kpi") return renderKpi(model, state, lang);
  if (model.type === "line") return renderLine(model, state, lang);
  if (model.type === "bar") return renderBar(model, state, lang);
  return renderMeter(model, state, lang);
}

function renderWidget_(model, state, lang) {
  if (!model || typeof model !== "object") return "";
  // 知らない種類を目標の帯として描くと、それらしい形に見えて間違いに気づけないので、札にして知らせる
  if (model.type === "error" || RENDER_WIDGET_TYPES_.indexOf(model.type) === -1) return renderError(model, lang);
  return renderWidgetFrame(model, renderWidgetBody_(model, state, lang), state, lang);
}

// ---- ダッシュボード -------------------------------------------------------

/**
 * 画面ぜんたい。view は { config, model, state, options, lang, errors }。
 * options は区分の絞り込みの選び方（{ 列の名前: 値の並び }）、errors は設定の誤りの文の並び。
 * 読み込み中・出せないときは、知らせだけを枠の中に置く
 */
function renderDashboard(view) {
  const source = view && typeof view === "object" ? view : {};
  const config = source.config || {};
  const model = source.model || {};
  const state = source.state || {};
  const lang = renderLang_(source);
  const theme = config.theme === "light" || config.theme === "dark" ? config.theme : "auto";

  const parts = [];
  const title = textOf(model.title) || textOf(config.title);
  if (title !== "") parts.push('<h1 class="db-title">' + escapeHtml(title) + "</h1>");

  if (state.status === "loading") {
    parts.push(renderLoading(lang));
  } else if (state.status === "error") {
    parts.push(renderStatus_(textOf(state.message) || t(lang, "state.unavailable")));
  } else {
    parts.push(renderErrorList_(source.errors, lang));
    parts.push(renderFilters(source));
    const widgets = (Array.isArray(model.widgets) ? model.widgets : []).map((widget) => renderWidget_(widget, state, lang));
    parts.push('<div class="db-grid">' + widgets.join("") + "</div>");
    for (const note of Array.isArray(model.notes) ? model.notes : []) {
      parts.push('<p class="db-note">' + escapeHtml(note) + "</p>");
    }
  }

  return '<div class="db" data-db-theme="' + theme + '" lang="' + lang + '">' + parts.join("") + "</div>";
}

// ===== render-charts.js =====
/**
 * model（組み立て済みの形）を、そのまま画面に出せる文字列にする。KPI・折れ線・棒・目標の 4 つ。
 * 値の計算も書式づくりもここでは行わず、model が決めたものを置くだけ。
 * 画面には触れず、文字列を作って返すだけにしてある（差し込みと操作は別のところで行う）。
 * どれも (model, state, lang) の同じ形で呼べるようにしてある（state を見るのは表だけ）。
 */


/** 折れ線・縦棒の枠。幅は置かれた場所に合わせて伸び縮みさせる（横棒だけは高さが区分の数で伸びる） */
const CHART_WIDTH_ = 640;
const CHART_HEIGHT_ = 280;
/**
 * 札の場所どりを見積もるときの字の大きさ。図は置かれた場所の幅に合わせて伸び縮みし、
 * 狭い画面では札の字を少し大きくする（style.css）ので、余白は広めにとっておく
 * （広くとりすぎても札が切れることはないが、狭いと切れてしまうため）
 */
const CHART_FONT_ = 15;
/** 棒の太さ・値の側の角丸・隣り合う面のすき間 */
const CHART_BAR_MAX_ = 24;
const CHART_BAR_RADIUS_ = 4;
const CHART_BAR_GAP_ = 2;
/** 横に並ぶ札は多くても 8 つ（両端は必ず出す） */
const CHART_X_LABEL_MAX_ = 8;
/** 図の内がわに、いつもとっておく余白 */
const CHART_PAD_ = 12;
/** 図の下の端と、いちばん下の札の基準線とのすき間 */
const CHART_EDGE_ = 8;
/** 札 1 行ぶんの高さ（札を置く行を数えるときの目安） */
const CHART_TEXT_ROW_ = 16;
/** 札と札・札と棒のあいだに、必ず残すすき間 */
const CHART_CLEAR_ = 4;
/** 目盛りの札と、図の本体とのすき間 */
const CHART_TICK_GAP_ = 10;
/** 直接ラベルの基準線を、点や棒の先端からどれだけ離すか（下に出すとき・横に出すとき） */
const CHART_MARK_GAP_ = 14;
/** 直接ラベルを、棒の先端より上に置くときの持ち上げ */
const CHART_MARK_LIFT_ = 6;
/** 直接ラベルと、印そのもののあいだのすき間 */
const CHART_MARK_OFFSET_ = 8;
/** 直接ラベルどうしが重ならないと見なせる、たての隔たり（折れ線の端の札） */
const CHART_LABEL_GAP_ = 14;
/** 隣り合う先端の札が、これより近づくなら札を絞る */
const CHART_LABEL_NEAR_ = 6;
/** 区分名を「…」で短くするとき、必ず残す字の数（全角に直したときの目安） */
const CHART_LABEL_MIN_ = 4;
/** 横棒 1 本ぶんの高さ（区分が増えると、図の縦もこの分だけ伸びる） */
const CHART_ROW_PITCH_ = 28;
/** 横棒の上の余白 */
const CHART_ROW_TOP_ = 10;
/** 区分名を置く左の余白の上限 */
const CHART_LEFT_MAX_ = 210;
/** 先端の札のために空ける、右の余白の上限（棒・折れ線） */
const CHART_BAR_RIGHT_MAX_ = 150;
const CHART_LINE_RIGHT_MAX_ = 170;
/** KPI の小さな折れ線 */
const CHART_SPARK_WIDTH_ = 160;
const CHART_SPARK_HEIGHT_ = 40;

/** 図の中の数は小数 2 桁まで */
function chartNum_(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return "0";
  return String(Math.round(num * 100) / 100);
}

function chartIsNumber_(value) {
  return typeof value === "number" && Number.isFinite(value);
}

/** 図の中の 1 行の文字（文字は系列の色を着けず、--db-text* の色のままにする） */
function chartText_(className, x, y, anchor, text) {
  return (
    '<text class="' + className + '" x="' + chartNum_(x) + '" y="' + chartNum_(y) + '" text-anchor="' + anchor + '">' +
    escapeHtml(text) +
    "</text>"
  );
}

/** 目盛りの数を、部品の書式のまま短く読める札にする */
function chartTickText_(value, format, lang) {
  return formatNumber(value, format, lang, { compact: true });
}

/** 「…」で短くした名前を置くのに、最低限これだけの幅は要る（全角 4 字 + 「…」） */
function chartLabelFloor_() {
  return CHART_LABEL_MIN_ * CHART_FONT_ + estimateTextWidth("…", CHART_FONT_);
}

/**
 * 決まった幅に収まるところまで、名前を字の幅で短くする（そのまま収まるなら短くしない）。
 * 字数ではなく幅で切るので、半角の名前が全角の倍も削られることはない。
 * 全角 4 字 + 「…」も置けない狭さのときは "" を返し、呼ぶ側が間引きに切り替える
 * （見分けのつかない切れ端ばかりを並べないため。元の名前は吹き出しと「表で見る」に残る）
 */
function chartFitLabel_(text, width) {
  const whole = String(text === null || text === undefined ? "" : text);
  if (estimateTextWidth(whole, CHART_FONT_) <= width) return whole;
  if (width < chartLabelFloor_()) return "";
  const chars = Array.from(whole);
  for (let keep = chars.length - 1; keep >= 1; keep -= 1) {
    const candidate = chars.slice(0, keep).join("") + "…";
    if (estimateTextWidth(candidate, CHART_FONT_) <= width) return candidate;
  }
  return "";
}

/**
 * count 個の札のうち、どれを出すかを決める（多くても limit 個、両端は必ず出す）。
 * 最後の 1 つだけが近づきすぎるときは、その手前を落として重なりを防ぐ
 */
function chartThin_(count, limit) {
  if (count <= 0) return [];
  if (count === 1) return [0];
  const keep = Math.max(2, Math.min(limit, count));
  const step = Math.ceil((count - 1) / (keep - 1));
  const picked = [];
  for (let i = 0; i < count - 1; i += step) picked.push(i);
  // 最後の札との間が、ほかの間の 3/4 に満たないときは手前を落とす（半分ちょうどでも文字が重なるため）
  if (picked.length > 1 && count - 1 - picked[picked.length - 1] < step * 0.75) picked.pop();
  picked.push(count - 1);
  return picked;
}

/** 幅いっぱいに並べたとき、重ならずに置ける札の数 */
function chartLabelRoom_(labels, span) {
  let widest = 0;
  for (const label of labels) widest = Math.max(widest, estimateTextWidth(label, CHART_FONT_));
  const room = Math.floor(span / (widest + CHART_MARK_OFFSET_));
  return Math.max(2, Math.min(CHART_X_LABEL_MAX_, room));
}

/** データが無いときの、やわらかいお知らせ（軸は描かない） */
function renderEmptyNote(lang) {
  return '<p class="db-empty">' + escapeHtml(t(lang, "state.noData")) + "</p>";
}

/** 凡例（2 系列以上のときだけ出す）。鍵は印と同じ形にする（折れ線は短い線、棒は四角） */
function chartLegend_(items, shape) {
  const parts = items.map(
    (item) =>
      '<li class="db-legend-item"><span class="db-legend-swatch db-legend-' + shape + " db-s" + item.color + '" aria-hidden="true"></span>' +
      '<span class="db-legend-label">' + escapeHtml(item.label) + "</span></li>"
  );
  return '<ul class="db-legend">' + parts.join("") + "</ul>";
}

/**
 * 図ぜんたいの包み。svg の下に凡例を置く。
 * height は横棒だけが使う（区分が増えると縦に伸びる）。渡さなければ決まった高さ
 */
function chartFrame_(title, body, legend, height) {
  const tall = Number.isFinite(height) ? height : CHART_HEIGHT_;
  return (
    '<div class="db-chart"><svg class="db-chart-svg" viewBox="0 0 ' + CHART_WIDTH_ + " " + chartNum_(tall) +
    '" width="100%" preserveAspectRatio="xMidYMid meet" role="group"><title>' +
    escapeHtml(title) + "</title>" + body + "</svg>" + legend + "</div>"
  );
}

/**
 * 目盛り線と、その札。0 の線は少しだけ濃くする（0 をまたぐグラフで、行き来が読めるように）。
 * 縦のグラフは横線を引いて左に札を置き、横のグラフは縦線を引いて下に札を置く
 */
function chartGrid_(ticks, scale, box, vertical, format, lang, thinned) {
  const parts = [];
  const labels = ticks.map((tick) => chartTickText_(tick, format, lang));
  const show = thinned === true ? chartThin_(ticks.length, chartLabelRoom_(labels, box.right - box.left)) : null;
  ticks.forEach((tick, index) => {
    const at = chartNum_(scale(tick));
    const zero = tick === 0 ? "db-axis-zero" : "db-grid-line";
    if (vertical) {
      parts.push('<line class="' + zero + '" x1="' + chartNum_(box.left) + '" y1="' + at + '" x2="' + chartNum_(box.right) + '" y2="' + at + '" />');
      parts.push(chartText_("db-y-label", box.left - CHART_MARK_OFFSET_, scale(tick) + CHART_CLEAR_, "end", labels[index]));
    } else {
      parts.push('<line class="' + zero + '" x1="' + at + '" y1="' + chartNum_(box.top) + '" x2="' + at + '" y2="' + chartNum_(box.bottom) + '" />');
      if (show === null || show.indexOf(index) !== -1) {
        parts.push(chartText_("db-x-label", scale(tick), box.bottom + CHART_TEXT_ROW_, "middle", labels[index]));
      }
    }
  });
  return parts.join("");
}

// ---- kpi ------------------------------------------------------------------

/** 差の向きを表す印。色だけに頼らず、記号と符号でも分かるようにする */
const CHART_DELTA_MARKS_ = { up: "▲", down: "▼", flat: "—" };

function chartKpiDelta_(delta) {
  // 比べる相手が無いときは、札そのものを置かない（意味を持たない「—」を残さない）
  if (delta === null || delta === undefined) return "";
  const tone = delta.good === true ? "db-delta-good" : delta.good === false ? "db-delta-bad" : "db-delta-flat";
  const mark = CHART_DELTA_MARKS_[delta.direction] || "—";
  return (
    '<p class="db-kpi-delta ' + tone + '"><span class="db-delta-mark">' + escapeHtml(mark + " " + delta.text) + "</span>" +
    '<span class="db-delta-label">' + escapeHtml(delta.label) + "</span></p>"
  );
}

/** KPI の小さな折れ線。軸も札も持たない飾りなので、読み上げからは外す */
function chartSpark_(spark) {
  if (!spark || !Array.isArray(spark.values) || spark.values.length < 2) return "";
  const pad = 5;
  // 値がすべて同じときは、上下の幅を少し広げて真ん中に引く（下端に貼りつかせない）
  const flat = spark.min === spark.max;
  const x = scaleLinear([0, spark.values.length - 1], [pad, CHART_SPARK_WIDTH_ - pad]);
  const y = scaleLinear(flat ? [spark.min - 1, spark.max + 1] : [spark.min, spark.max], [CHART_SPARK_HEIGHT_ - pad, pad]);
  const points = spark.values.map((value, index) => (chartIsNumber_(value) ? { x: x(index), y: y(value) } : null));

  let last = null;
  for (let i = points.length - 1; i >= 0; i -= 1) {
    if (points[i] !== null) {
      last = points[i];
      break;
    }
  }
  const dot =
    last === null
      ? ""
      : '<circle class="db-spark-point" cx="' + chartNum_(last.x) + '" cy="' + chartNum_(last.y) +
        '" r="3" fill="var(--db-accent)" stroke="var(--db-card)" stroke-width="2" />';
  return (
    '<svg class="db-spark" viewBox="0 0 ' + CHART_SPARK_WIDTH_ + " " + CHART_SPARK_HEIGHT_ +
    '" width="100%" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false">' +
    '<path class="db-spark-line db-s0" d="' + linePath(points) + '" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" />' +
    dot + "</svg>"
  );
}

/** 1 つの数と、前の期間との差と、小さな折れ線 */
function renderKpi(model, state, lang) {
  const rows = [{ label: t(lang, "table.value"), value: model.valueFull, color: null }];
  if (model.delta) rows.push({ label: model.delta.label, value: model.delta.textFull, color: null });
  const tip = tipAttrs({ title: model.title, rows }, lang);
  return (
    '<div class="db-kpi">' +
    // 縮めない数は吹き出しが持つので、ここに素の title は付けない（2 つの吹き出しが重なって出てしまう）
    '<p class="db-kpi-value"' + tip + ">" + escapeHtml(model.valueText) + "</p>" +
    chartKpiDelta_(model.delta) +
    chartSpark_(model.spark) +
    "</div>"
  );
}

// ---- line -----------------------------------------------------------------

/**
 * 折れ線の余白。目盛りの札・両端の刻みの札・端の直接ラベルが、どれも切れない幅をとる。
 * 刻みの札は図の下の 1 行（labelY）に置くので、その 1 行ぶんを下に空けておく
 */
function chartLineBox_(model, lang) {
  const tickLabels = model.ticks.map((tick) => chartTickText_(tick, model.format, lang));
  let left = CHART_PAD_;
  for (const label of tickLabels) left = Math.max(left, estimateTextWidth(label, CHART_FONT_) + CHART_TICK_GAP_);

  const bucketLabels = model.buckets.map((bucket) => bucket.label);
  const first = bucketLabels.length > 0 ? estimateTextWidth(bucketLabels[0], CHART_FONT_) / 2 + CHART_CLEAR_ : 0;
  const last = bucketLabels.length > 0 ? estimateTextWidth(bucketLabels[bucketLabels.length - 1], CHART_FONT_) / 2 + CHART_CLEAR_ : 0;
  left = Math.max(left, first);

  let right = Math.max(CHART_PAD_, last);
  for (const line of model.series) right = Math.max(right, estimateTextWidth(line.lastLabel, CHART_FONT_) + CHART_MARK_GAP_);
  right = Math.min(right, CHART_LINE_RIGHT_MAX_);

  const labelY = CHART_HEIGHT_ - CHART_EDGE_;
  return { left, right: CHART_WIDTH_ - right, top: CHART_TEXT_ROW_, bottom: labelY - CHART_TEXT_ROW_ - CHART_CLEAR_, labelY };
}

/** 直接ラベルは端だけに置く。重なるときは高い方だけを残す（見分けは凡例が受け持つ） */
function chartLineLabels_(marks) {
  const sorted = marks.slice().sort((a, b) => a.y - b.y);
  const kept = [];
  for (const mark of sorted) {
    if (kept.length > 0 && mark.y - kept[kept.length - 1].y < CHART_LABEL_GAP_) continue;
    kept.push(mark);
  }
  return kept;
}

/** 刻み 1 つぶんの当たり判定の帯。その刻みの全系列を 1 つの吹き出しに出す */
function chartLineBands_(model, box, xAt, band, lang) {
  return model.buckets
    .map((bucket, index) => {
      const center = xAt(index);
      const from = Math.max(box.left, center - band / 2);
      const to = Math.min(box.right, center + band / 2);
      const rows = model.series.map((line) => ({
        label: line.label,
        value: formatNumber(line.values[index], model.format, lang),
        color: line.color,
      }));
      return (
        '<rect class="db-hit" x="' + chartNum_(from) + '" y="' + chartNum_(box.top) + '" width="' + chartNum_(to - from) +
        '" height="' + chartNum_(box.bottom - box.top) + '" data-bucket="' + index + '" data-x="' + chartNum_(center) + '"' +
        tipAttrs({ title: bucket.label, rows }, lang) + " />"
      );
    })
    .join("");
}

/** 時間の推移。系列は model が 4 本までに収めてある */
function renderLine(model, state, lang) {
  if (model.empty === true || model.buckets.length === 0 || model.series.length === 0) return renderEmptyNote(lang);

  const box = chartLineBox_(model, lang);
  const count = model.buckets.length;
  const y = scaleLinear([model.ticks[0], model.yMax], [box.bottom, box.top]);
  const xAt = (index) => (count === 1 ? (box.left + box.right) / 2 : box.left + (index * (box.right - box.left)) / (count - 1));
  const band = count === 1 ? box.right - box.left : (box.right - box.left) / (count - 1);
  const baseY = clamp(y(0), box.top, box.bottom);

  const parts = [chartGrid_(model.ticks, y, box, true, model.format, lang)];

  const labels = model.buckets.map((bucket) => bucket.label);
  for (const index of chartThin_(count, chartLabelRoom_(labels, box.right - box.left))) {
    parts.push(chartText_("db-x-label", xAt(index), box.labelY, "middle", labels[index]));
  }

  const marks = [];
  for (const line of model.series) {
    const points = line.values.map((value, index) => (chartIsNumber_(value) ? { x: xAt(index), y: y(value) } : null));
    if (model.area === true) {
      parts.push('<path class="db-area db-s' + line.color + '" d="' + areaPath(points, baseY) + '" fill="currentColor" fill-opacity="0.1" />');
    }
    parts.push(
      '<path class="db-line db-s' + line.color + '" d="' + linePath(points) +
        '" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" />'
    );
    for (let i = points.length - 1; i >= 0; i -= 1) {
      if (points[i] === null) continue;
      marks.push({ x: points[i].x, y: points[i].y, color: line.color, text: line.lastLabel });
      break;
    }
  }

  for (const mark of marks) {
    parts.push(
      '<circle class="db-point db-s' + mark.color + '" cx="' + chartNum_(mark.x) + '" cy="' + chartNum_(mark.y) +
        '" r="4" fill="currentColor" stroke="var(--db-card)" stroke-width="2" />'
    );
  }
  for (const mark of chartLineLabels_(marks)) {
    parts.push(chartText_("db-mark-label", mark.x + CHART_MARK_OFFSET_, mark.y + CHART_CLEAR_, "start", mark.text));
  }

  parts.push(
    '<line class="db-crosshair" x1="' + chartNum_(box.left) + '" y1="' + chartNum_(box.top) + '" x2="' + chartNum_(box.left) +
      '" y2="' + chartNum_(box.bottom) + '" visibility="hidden" />'
  );
  parts.push(chartLineBands_(model, box, xAt, band, lang));

  const legend = model.legend === true ? chartLegend_(model.series.map((line) => ({ label: line.label, color: line.color })), "line") : "";
  return chartFrame_(model.title, parts.join(""), legend);
}

// ---- bar ------------------------------------------------------------------

/** 0 の線から上（右）へ積む面と、下（左）へ積む面に分ける */
function chartBarStacks_(category) {
  const positive = [];
  const negative = [];
  for (const segment of category.segments) {
    if (!chartIsNumber_(segment.value) || segment.value === 0) continue;
    (segment.value > 0 ? positive : negative).push(segment);
  }
  return { positive, negative };
}

/**
 * 棒の余白と、図の高さ。目盛りの札・区分名・先端の札が、どれも切れない幅をとる。
 *
 * 横棒は区分が増えるほど縦に伸ばす（1 区分あたり 28px）。詰め込むと棒も区分名も
 * つぶれてしまうため。縦棒は 640×280 のまま。
 * 縦棒で負の側があるときは、先端の札が 0 の線より下に出るので、区分名の行とぶつからないよう
 * 1 行ぶん余分に空けておく（区分名はいつも図の下の 1 行 labelY に置く）
 */
function chartBarBox_(model, lang) {
  const tickLabels = model.ticks.map((tick) => chartTickText_(tick, model.format, lang));

  if (model.horizontal === true) {
    const count = Math.max(1, model.categories.length);
    const height = Math.max(CHART_HEIGHT_, CHART_ROW_TOP_ + CHART_TEXT_ROW_ + CHART_PAD_ + count * CHART_ROW_PITCH_);
    let left = CHART_PAD_;
    let right = CHART_PAD_;
    for (const category of model.categories) {
      left = Math.max(left, estimateTextWidth(category.label, CHART_FONT_) + CHART_TICK_GAP_);
      right = Math.max(right, estimateTextWidth(category.totalText, CHART_FONT_) + CHART_MARK_GAP_);
    }
    const half = tickLabels.length > 0 ? estimateTextWidth(tickLabels[tickLabels.length - 1], CHART_FONT_) / 2 + CHART_CLEAR_ : 0;
    return {
      left: Math.min(left, CHART_LEFT_MAX_),
      right: CHART_WIDTH_ - Math.min(Math.max(right, half), CHART_BAR_RIGHT_MAX_),
      top: CHART_ROW_TOP_,
      bottom: height - CHART_TEXT_ROW_ - CHART_PAD_,
      labelY: height - CHART_EDGE_,
      height,
    };
  }

  let left = CHART_PAD_;
  for (const label of tickLabels) left = Math.max(left, estimateTextWidth(label, CHART_FONT_) + CHART_TICK_GAP_);
  const labelY = CHART_HEIGHT_ - CHART_EDGE_;
  const belowZero = model.min < 0 ? CHART_TEXT_ROW_ + CHART_CLEAR_ : 0;
  return {
    left,
    right: CHART_WIDTH_ - CHART_PAD_,
    top: CHART_TEXT_ROW_ + CHART_CLEAR_,
    bottom: labelY - CHART_TEXT_ROW_ - CHART_CLEAR_ - belowZero,
    labelY,
    height: CHART_HEIGHT_,
  };
}

/**
 * 面を 1 つ描く。値の側だけを丸め、根元は四角のまま。内側の面は値の側を 2px 削って、
 * 隣り合う面のあいだに地色のすき間を作る（枠線では区切らない）
 */
function chartBarSegment_(segment, geometry) {
  const outer = geometry.outer;
  const radius = outer ? CHART_BAR_RADIUS_ : 0;
  const gap = outer ? 0 : CHART_BAR_GAP_;

  if (geometry.horizontal) {
    const length = geometry.toward > 0 ? geometry.to - gap - geometry.from : geometry.from - (geometry.to + gap);
    if (length <= 0.5) return "";
    const x = geometry.toward > 0 ? geometry.from : geometry.to + gap;
    const d = roundedBar({ x, y: geometry.center - geometry.thickness / 2, width: length, height: geometry.thickness, radius, side: geometry.toward > 0 ? "right" : "left" });
    return '<path class="db-bar db-s' + segment.color + '" d="' + d + '" fill="currentColor" />';
  }

  const length = geometry.toward > 0 ? geometry.from - (geometry.to + gap) : geometry.to - gap - geometry.from;
  if (length <= 0.5) return "";
  const y = geometry.toward > 0 ? geometry.to + gap : geometry.from;
  const d = roundedBar({ x: geometry.center - geometry.thickness / 2, y, width: geometry.thickness, height: length, radius, side: geometry.toward > 0 ? "top" : "bottom" });
  return '<path class="db-bar db-s' + segment.color + '" d="' + d + '" fill="currentColor" />';
}

/** 区分 1 つぶんの面をすべて描く（正の側を根元から外へ、そのあと負の側） */
function chartBarStack_(category, scale, center, thickness, horizontal) {
  const { positive, negative } = chartBarStacks_(category);
  const parts = [];
  for (const [segments, toward] of [[positive, 1], [negative, -1]]) {
    let cumulative = 0;
    segments.forEach((segment, index) => {
      const from = scale(cumulative);
      cumulative += segment.value;
      const to = scale(cumulative);
      parts.push(
        chartBarSegment_(segment, { from, to, center, thickness, horizontal, toward, outer: index === segments.length - 1 })
      );
    });
  }
  return parts.join("");
}

/**
 * 先端の札を置く値（正味の符号の側の、積み上げの先）。
 * 正と負の面が混ざる区分は null にして札を置かない。どちらの先端に置いても、
 * 見た目の高さと数が食い違って「合計」に読めないため（正味・内わけは吹き出しと表が受け持つ）
 */
function chartBarEnd_(category) {
  if (category.posTotal > 0 && category.negTotal < 0) return null;
  const total = chartIsNumber_(category.total) ? category.total : 0;
  const end = total < 0 ? category.negTotal : category.posTotal;
  return chartIsNumber_(end) && end !== 0 ? end : null;
}

/** 先端の札（合計）。収まるときだけ棒の外に出し、収まらないときは置かない（切らない） */
function chartBarTotal_(category, scale, center, horizontal) {
  const end = chartBarEnd_(category);
  if (end === null) return "";
  const width = estimateTextWidth(category.totalText, CHART_FONT_);
  const at = scale(end);

  if (horizontal) {
    if (end < 0) {
      const x = at - CHART_MARK_OFFSET_;
      return x - width < CHART_CLEAR_ ? "" : chartText_("db-mark-label", x, center + CHART_CLEAR_, "end", category.totalText);
    }
    const x = at + CHART_MARK_OFFSET_;
    return x + width > CHART_WIDTH_ - CHART_CLEAR_ ? "" : chartText_("db-mark-label", x, center + CHART_CLEAR_, "start", category.totalText);
  }

  if (center - width / 2 < CHART_CLEAR_ || center + width / 2 > CHART_WIDTH_ - CHART_CLEAR_) return "";
  // 下に出す札の場所は chartBarBox_ が先に空けてあるので、ここでは高さを気にしなくてよい
  if (end < 0) return chartText_("db-mark-label", center, at + CHART_MARK_GAP_, "middle", category.totalText);
  const y = at - CHART_MARK_LIFT_;
  return y < CHART_PAD_ ? "" : chartText_("db-mark-label", center, y, "middle", category.totalText);
}

/**
 * 先端の札を出す区分を決める。隣り合う札が近づきすぎると、どの棒の数か分からなくなるので、
 * 近すぎる組が 1 つでもあれば、いちばん大きい正の合計と、いちばん小さい負の合計だけを残す
 * （残りの数は吹き出しと「表で見る」で読める）。gapOf は隣り合う 2 つの札のすき間を返す
 */
function chartBarLabelKeep_(categories, marks, gapOf) {
  const keep = new Set();
  let crowded = false;
  for (let i = 1; i < marks.length; i += 1) {
    if (gapOf(marks[i - 1], marks[i]) < CHART_LABEL_NEAR_) {
      crowded = true;
      break;
    }
  }
  if (!crowded) {
    for (const mark of marks) keep.add(mark.index);
    return keep;
  }

  let highest = null;
  let lowest = null;
  for (const mark of marks) {
    const total = categories[mark.index].total;
    if (!chartIsNumber_(total)) continue;
    if (total > 0 && (highest === null || total > categories[highest].total)) highest = mark.index;
    if (total < 0 && (lowest === null || total < categories[lowest].total)) lowest = mark.index;
  }
  if (highest !== null) keep.add(highest);
  if (lowest !== null) keep.add(lowest);
  return keep;
}

/**
 * 区分 1 つぶんの吹き出し。面をすべて並べ、積み上げのときは正味の合計も添える。
 * 0 をまたぐ区分（正と負の面が混ざる区分）は先端の札を持たないので、
 * 正味の合計をここと「表で見る」で必ず読めるようにしておく
 */
function chartBarTip_(category, lang) {
  const rows = category.segments.map((segment) => ({ label: segment.label, value: segment.valueText, color: segment.color }));
  if (category.segments.length > 1) rows.push({ label: t(lang, "label.total"), value: category.totalText, color: null });
  return tipAttrs({ title: category.label, rows }, lang);
}

/**
 * 縦棒の区分名。帯に収まるところまで幅で短くし（全角 4 字 + 「…」は必ず残す）、
 * それも置けないときや、短くした名前が互いに同じ形になってしまうときは、
 * 1 つ飛ばし・2 つ飛ばしと間引いて場所を広げる。
 * 「みなと市中…」ばかりを並べるより、間引いて読める名前を残すほうが分かりやすい
 * （どの棒の値も、吹き出しと「表で見る」では名前つきで読める）
 */
function chartBarNames_(labels, band) {
  const count = labels.length;
  for (let step = 1; step <= count; step += 1) {
    const room = band * step - CHART_CLEAR_;
    const picked = [];
    const seen = new Set();
    let placed = true;
    for (let index = 0; index < count; index += step) {
      const text = chartFitLabel_(labels[index], room);
      if (text === "" || seen.has(text)) {
        placed = false;
        break;
      }
      seen.add(text);
      picked.push({ index, text });
    }
    if (placed) return picked;
  }
  return [];
}

/** 区分ごとの大きさ。横棒のときは区分名を左に、縦棒のときは下に置く */
function renderBar(model, state, lang) {
  if (model.empty === true || model.categories.length === 0) return renderEmptyNote(lang);

  const horizontal = model.horizontal === true;
  const box = chartBarBox_(model, lang);
  const count = model.categories.length;
  const along = horizontal ? box.bottom - box.top : box.right - box.left;
  const band = along / count;
  const thickness = Math.max(2, Math.min(CHART_BAR_MAX_, band - CHART_BAR_GAP_));
  const scale = horizontal
    ? scaleLinear([model.min, model.max], [box.left, box.right])
    : scaleLinear([model.min, model.max], [box.bottom, box.top]);
  const centerAt = (index) => (horizontal ? box.top : box.left) + band * (index + 0.5);

  const parts = [chartGrid_(model.ticks, scale, box, !horizontal, model.format, lang, horizontal)];

  // 区分名は、どの棒がどれか分かるように全部に付ける。収まらない名前は幅で短くし、
  // それでも置けないほど込み合うときだけ間引く（元の名前は吹き出しと「表で見る」に残る）
  const names = model.categories.map((category) => category.label);
  if (horizontal) {
    names.forEach((name, index) => {
      const text = chartFitLabel_(name, box.left - CHART_TICK_GAP_);
      if (text !== "") parts.push(chartText_("db-y-label", box.left - CHART_MARK_OFFSET_, centerAt(index) + CHART_CLEAR_, "end", text));
    });
  } else {
    for (const name of chartBarNames_(names, band)) {
      parts.push(chartText_("db-x-label", centerAt(name.index), box.labelY, "middle", name.text));
    }
  }

  model.categories.forEach((category, index) => {
    parts.push(chartBarStack_(category, scale, centerAt(index), thickness, horizontal));
  });

  // 先端の札は、隣どうしが近づきすぎないところまで
  const marks = [];
  model.categories.forEach((category, index) => {
    if (chartBarEnd_(category) === null) return;
    marks.push({ index, center: centerAt(index), width: estimateTextWidth(category.totalText, CHART_FONT_) });
  });
  const keep = chartBarLabelKeep_(
    model.categories,
    marks,
    horizontal
      ? (a, b) => b.center - a.center - CHART_TEXT_ROW_
      : (a, b) => b.center - b.width / 2 - (a.center + a.width / 2)
  );
  model.categories.forEach((category, index) => {
    if (keep.has(index)) parts.push(chartBarTotal_(category, scale, centerAt(index), horizontal));
  });

  // 当たり判定は見た目より広く、帯の幅いっぱいにとる
  model.categories.forEach((category, index) => {
    const start = (horizontal ? box.top : box.left) + band * index;
    const rect = horizontal
      ? 'x="' + chartNum_(box.left) + '" y="' + chartNum_(start) + '" width="' + chartNum_(box.right - box.left) + '" height="' + chartNum_(band) + '"'
      : 'x="' + chartNum_(start) + '" y="' + chartNum_(box.top) + '" width="' + chartNum_(band) + '" height="' + chartNum_(box.bottom - box.top) + '"';
    parts.push('<rect class="db-hit" ' + rect + ' data-category="' + index + '"' + chartBarTip_(category, lang) + " />");
  });

  const legendItems = model.categories[0].segments.map((segment) => ({ label: segment.label, color: segment.color }));
  return chartFrame_(model.title, parts.join(""), model.legend === true ? chartLegend_(legendItems, "bar") : "", box.height);
}

// ---- meter ----------------------------------------------------------------

/** 目標に対する進み。帯は同じ色の薄い段で、100% を超えても帯からはみ出させない */
function renderMeter(model, state, lang) {
  const ratio = chartIsNumber_(model.ratio) ? model.ratio : 0;
  const width = chartNum_(clamp(Math.round(ratio * 1000) / 10, 0, 100));
  // 月から引いた目標のときは、どの月の数字なのかを値のとなりと吹き出しに添える
  const monthLabel = model.monthLabel === null || model.monthLabel === undefined ? "" : String(model.monthLabel);
  const month = monthLabel === "" ? "" : '<span class="db-meter-month">' + escapeHtml(monthLabel) + "</span>";
  const rows = (monthLabel === "" ? [] : [{ label: t(lang, "label.targetMonth"), value: monthLabel, color: null }]).concat([
    { label: t(lang, "label.actual"), value: model.valueFull, color: null },
    { label: t(lang, "label.goal"), value: model.targetFull, color: null },
    { label: t(lang, "label.progress"), value: model.ratioText, color: null },
  ]);
  const foot = model.achieved === true
    ? '<span class="db-meter-reached">' + escapeHtml(t(lang, "label.goalReached")) + "</span>"
    : "";

  return (
    '<div class="db-meter">' +
    '<p class="db-meter-head"><span class="db-meter-value">' + escapeHtml(model.valueText) + "</span>" +
    '<span class="db-meter-sep" aria-hidden="true">/</span>' +
    '<span class="db-meter-target">' + escapeHtml(model.targetText) + "</span>" + month + "</p>" +
    '<div class="db-meter-track"' + tipAttrs({ title: model.title, rows }, lang) + '>' +
    '<div class="db-meter-fill" style="width: ' + width + '%"></div></div>' +
    '<p class="db-meter-foot">' + foot + '<span class="db-meter-ratio">' + escapeHtml(model.ratioText) + "</span></p>" +
    "</div>"
  );
}

// ===== render-table.js =====
/**
 * 表の見た目。区分ごとの集計表・明細の表（renderTable）と、どのグラフにも付く
 * 「表で見る」の中身（renderDataTable）の 2 つ。
 * 並べ替えはここで行う（純粋な計算で、元の行は書き換えない）。
 */


/** 並べ替えの向きを、読み上げに伝える言い方にする */
const TABLE_ARIA_SORT_ = { desc: "descending", asc: "ascending" };

/**
 * at 列で並べ替えた、新しい行の並びを作る。比べ方は core の compareCells の 1 か所だけにあり、
 * model が組み立てる表（model.js）と同じ決まり（空はどちらの向きでもいつも最後）になる。
 * 同じ値のときは元の並びのまま（並べ替えても行が入れ替わらない）
 */
function tableSorted_(rows, at, order) {
  const decorated = rows.map((cells, index) => ({ cells, index }));
  decorated.sort((a, b) => {
    const gap = compareCells(a.cells[at] ? a.cells[at].value : null, b.cells[at] ? b.cells[at].value : null, order);
    return gap === 0 ? a.index - b.index : gap;
  });
  return decorated.map((entry) => entry.cells);
}

/**
 * 表の本体を組む。numeric の列は右寄せ・等幅数字にする（桁がそろって比べやすいように）。
 * 行には吹き出しを付けない。マスの値はどれもそのまま見えている文字なので、
 * 添えるものが無いうえ、行を 1 つの図として包むと、読み上げが列と行のつながりを
 * たどれなくなってしまうため
 */
function tableBody_(rows, head) {
  const lines = rows.map((cells) => {
    const tds = cells
      .map((cell, index) => (head[index] && head[index].numeric ? '<td class="db-num">' : "<td>") + escapeHtml(cell.text) + "</td>")
      .join("");
    return '<tr class="db-row">' + tds + "</tr>";
  });
  return "<tbody>" + lines.join("") + "</tbody>";
}

/** 並べ替えの押しボタンつきの見出し。いま並べ替えている列は、向きも読み上げに伝える */
function tableHead_(head, widgetId, sort) {
  const id = escapeAttr(widgetId);
  const cells = head.map((column, index) => {
    const active = sort && sort.column === index;
    const order = active ? TABLE_ARIA_SORT_[sort.order] || "none" : "none";
    const inner = widgetId === ""
      ? escapeHtml(column.label)
      : '<button type="button" class="db-sort" data-action="sort" data-widget="' + id + '" data-column="' + index + '">' +
        escapeHtml(column.label) + "</button>";
    return "<th scope=\"col\"" + (column.numeric ? ' class="db-num"' : "") + ' aria-sort="' + order + '">' + inner + "</th>";
  });
  return "<thead><tr>" + cells.join("") + "</tr></thead>";
}

/**
 * 区分ごとの集計表・明細の表。見出しを押すと並べ替わる（state.sort が向きを持つ）。
 * lang は読み上げの文の区切りに使う
 */
function renderTable(model, state, lang) {
  if (model.empty === true || !Array.isArray(model.rows) || model.rows.length === 0) return renderEmptyNote(lang);

  const sort = (hasOwn(state && state.sort, model.id) ? state.sort[model.id] : null) || null;
  const rows = sort && sort.column >= 0 && sort.column < model.head.length ? tableSorted_(model.rows, sort.column, sort.order) : model.rows;
  return (
    '<div class="db-table-wrap"><table class="db-table">' +
    tableHead_(model.head, model.id, sort) +
    tableBody_(rows, model.head) +
    "</table></div>"
  );
}

/**
 * どのグラフにも付く「表で見る」の中身。model.table（1 列目が刻みや区分の名前、
 * それより後ろが値）を、並べ替えの押しボタンを持たない同じ見た目の表にする。
 * 表を持たない model（誤りの札など）が来ても、落とさずにお知らせを出す
 */
function renderDataTable(model, state, lang) {
  const table = model && model.table ? model.table : null;
  const source = table && Array.isArray(table.head) && Array.isArray(table.rows) ? table : { head: [], rows: [] };
  if (source.rows.length === 0) return renderEmptyNote(lang);

  const head = source.head.map((label, index) => ({ label, numeric: index > 0 }));
  const rows = source.rows.map((cells) => cells.map((text) => ({ text, value: text })));
  return (
    '<div class="db-table-wrap"><table class="db-table">' +
    tableHead_(head, "", null) +
    tableBody_(rows, head) +
    "</table></div>"
  );
}

/** 表の部品に添える、CSV の押しボタン */
function renderCsvButton(widgetId, lang) {
  return (
    '<button type="button" class="db-action" data-action="download-csv" data-widget="' + escapeAttr(widgetId) + '">' +
    escapeHtml(t(lang, "action.downloadCsv")) +
    "</button>"
  );
}

// ===== source-web.js =====
/**
 * 置いたページから設定とデータを取りに行く読み口。設定（JSON）と、データセットごとの
 * CSV / JSON を取りに行き、そのままの中身を返す。検査も集計もここでは行わない。
 *
 * 取りに行ってよい置き場所は、設定の検査と同じ決まり（isAllowedDataUrl）で見分ける
 * （https の URL か、同じ置き場所からの相対の道すじ）。決まりは設定の側の 1 か所にある。
 * 取ってきた中身は cacheMinutes のあいだ、その場かぎりの覚え書き（sessionStorage）に置く。
 * 覚え書きは使えないことがある（人の設定で切ってあるなど）ので、どの出し入れも
 * うまくいかなければ黙って見送り、取りに行くほうで進める。
 */


/** 覚え書きの鍵の頭。ほかの置き物と混ざらないようにする */
const SOURCE_WEB_CACHE_PREFIX_ = "dbkit:";
/** これより大きい中身は覚えない（入れ物があふれて、ほかの覚え書きまで消えてしまうため） */
const SOURCE_WEB_CACHE_MAX_ = 2 * 1024 * 1024;
/** JSON として読む置き場所の見分け */
const SOURCE_WEB_JSON_PATH_ = /\.json$/i;
const SOURCE_WEB_JSON_TYPE_ = /\bjson\b/i;

/** 置き場所と中身の種類から、JSON として読むかを決める（それ以外は CSV） */
function sourceWebIsJson_(url, contentType) {
  if (SOURCE_WEB_JSON_TYPE_.test(contentType)) return true;
  const path = String(url).split("#")[0].split("?")[0];
  return SOURCE_WEB_JSON_PATH_.test(path);
}

/**
 * 覚え書きの鍵。相対の道すじ（./sales.csv）は、置いたページの場所を足して 1 本の URL に伸ばす。
 * 伸ばさずに使うと、/ja/ と /en/ のように別の場所に置いた同じ名前のデータが、
 * 同じ鍵になって取り違えられてしまう。伸ばせないところでは、書かれたままを鍵にする
 */
function sourceWebCacheKey_(env, url) {
  const base = env && env.location ? textOf(env.location.href) : "";
  try {
    return SOURCE_WEB_CACHE_PREFIX_ + new URL(url, base === "" ? undefined : base).href;
  } catch {
    return SOURCE_WEB_CACHE_PREFIX_ + url;
  }
}

/** 覚え書きから、まだ新しい中身を取り出す。使えないとき・古いときは null */
function sourceWebCacheRead_(env, url, minutes) {
  if (!(minutes > 0)) return null;
  try {
    const store = env.sessionStorage;
    if (!store || typeof store.getItem !== "function") return null;
    const saved = store.getItem(sourceWebCacheKey_(env, url));
    if (typeof saved !== "string" || saved === "") return null;
    const entry = JSON.parse(saved);
    if (!entry || typeof entry.body !== "string") return null;
    const at = Number(entry.at);
    const nowMs = env.now().getTime();
    if (!Number.isFinite(at) || nowMs < at || nowMs - at > minutes * 60000) return null;
    return { ok: true, text: entry.body, contentType: textOf(entry.type) };
  } catch {
    return null;
  }
}

/** 取ってきた中身を覚え書きに置く。入れ物が使えないときは、覚えずに進む */
function sourceWebCacheWrite_(env, url, got, minutes) {
  if (!(minutes > 0) || got.text.length > SOURCE_WEB_CACHE_MAX_) return;
  try {
    const store = env.sessionStorage;
    if (!store || typeof store.setItem !== "function") return;
    store.setItem(sourceWebCacheKey_(env, url), JSON.stringify({ at: env.now().getTime(), body: got.text, type: got.contentType }));
  } catch {
    // 覚え書きが使えないときは、次も取りに行けばよいので何もしない
  }
}

/** 1 か所を取りに行く。返事が 200 でなければ ok: false にする */
function sourceWebFetch_(env, url) {
  const get = env && typeof env.fetch === "function" ? env.fetch : null;
  if (!get) return Promise.reject(new Error("dashboard: データを取りに行けません"));
  return Promise.resolve(get(url, { credentials: "same-origin" })).then((response) => {
    if (!response || response.ok !== true) return { ok: false, text: "", contentType: "" };
    const headers = response.headers;
    const contentType = headers && typeof headers.get === "function" ? textOf(headers.get("content-type")) : "";
    return Promise.resolve(response.text()).then((text) => ({ ok: true, text: typeof text === "string" ? text : "", contentType }));
  });
}

/** 覚え書きを見てから取りに行く。fresh のときは覚え書きを読み飛ばす */
function sourceWebRead_(env, url, minutes, fresh) {
  if (fresh !== true) {
    const saved = sourceWebCacheRead_(env, url, minutes);
    if (saved !== null) return Promise.resolve(saved);
  }
  return sourceWebFetch_(env, url).then(
    (got) => {
      if (got.ok) sourceWebCacheWrite_(env, url, got, minutes);
      return got;
    },
    () => ({ ok: false, text: "", contentType: "" })
  );
}

/**
 * 取ってきた中身を行の形にする。JSON は配列（オブジェクトの並びか、見出し行つきの行列）、
 * それ以外は CSV として読む。配列にならない JSON は読めなかったことにする
 */
function sourceWebRows_(got, url) {
  if (!sourceWebIsJson_(url, got.contentType)) return parseCsv(got.text);
  try {
    const parsed = JSON.parse(got.text);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

/** 設定そのものを用意する。オブジェクトならそのまま、文字なら取りに行って JSON として読む */
function sourceWebRawConfig_(env, config, fresh) {
  if (config !== null && typeof config === "object") return Promise.resolve(config);
  const url = textOf(config);
  if (!isAllowedDataUrl(url)) {
    return Promise.reject(new Error("dashboard: 設定の置き場所をご確認ください"));
  }
  return sourceWebRead_(env, url, 0, fresh).then((got) => {
    if (!got.ok) throw new Error("dashboard: 設定を取り込めませんでした");
    return JSON.parse(got.text);
  });
}

/**
 * 取りに行く読み口を作る。options は { config, data, env }。
 * config はそろっていないままの設定（オブジェクト）か、その置き場所（文字）。
 * data に渡した行は取りに行かずにそのまま使う。
 * load() は { config（そのままの設定）, datasets, missing } を返す
 */
function sourceWebCreate_(options) {
  const opts = options && typeof options === "object" ? options : {};
  const env = opts.env && typeof opts.env === "object" ? opts.env : {};
  const inline = opts.data && typeof opts.data === "object" ? opts.data : null;

  return {
    load(loadOptions) {
      const fresh = loadOptions !== null && typeof loadOptions === "object" && loadOptions.fresh === true;
      return sourceWebRawConfig_(env, opts.config, fresh).then((raw) => {
        const parsed = parseConfig(raw);
        const minutes = Number(parsed.config.cacheMinutes);
        const datasets = Object.create(null);
        const missing = [];

        const jobs = Object.keys(parsed.config.datasets).map((name) => {
          if (inline !== null && hasOwn(inline, name)) {
            datasets[name] = inline[name];
            return Promise.resolve();
          }
          const url = textOf(parsed.config.datasets[name].url);
          // 取りに行ってよい置き場所かを、取りに行く直前にここでも必ず確かめる
          // （設定の検査を通らない道すじ── source: "sheets" の設定など──から来た url も止める）。
          // 空の url は「指定なし」なので、同じくここでは取りに行かない
          if (!isAllowedDataUrl(url)) {
            missing.push(name);
            return Promise.resolve();
          }
          return sourceWebRead_(env, url, minutes, fresh).then((got) => {
            const rows = got.ok ? sourceWebRows_(got, url) : null;
            if (rows === null) missing.push(name);
            else datasets[name] = rows;
          });
        });

        return Promise.all(jobs).then(() => ({ config: raw, datasets, missing }));
      });
    },
  };
}

// ===== source-memory.js =====
/**
 * 見本の読み口。ブラウザの中で作った見本データ（しおかぜ珈琲店）をそのまま渡す。
 * 設定に書いてある CSV の置き場所は見に行かない（行はすでに手もとにあるため）。
 * 見本のページと、買う前に動かして確かめてもらうための読み口で、外へは一度も取りに行かない。
 */


/**
 * 見本データを渡す読み口を作る。options は { today: "YYYY-MM-DD", lang: "ja" | "en" }。
 * today が同じなら、何度読んでも同じ中身になる
 */
function sourceMemoryCreate_(options) {
  const opts = options && typeof options === "object" ? options : {};
  const today = textOf(opts.today);
  const lang = opts.lang === "en" ? "en" : "ja";

  return {
    load() {
      const sample = sampleData(today, lang);
      return Promise.resolve({ config: sample.config, datasets: sample.datasets, missing: [] });
    },
  };
}

// ===== main.js =====
/**
 * 画面を組み立てて動かす入口。設定とデータを読み、描く形（model）を組み立て、文字列にして
 * 置き場所に差し込み、操作（絞り込み・表で見る・並べ替え・吹き出し・CSV）をつなぐ。
 *
 * ブラウザの道具（画面・窓・住所・履歴・その場かぎりの覚え書き・取り込み・いまの日）は
 * mainEnv_() の 1 か所だけから受け取る。数の計算も書式づくりもここでは行わず、
 * core と render が決めたものを置くだけにしてある。
 */


/** root に委ねる出来事。どれも root に 1 つずつ付け、destroy() で外す */
const MAIN_EVENTS_ = [
  "change",
  "click",
  "submit",
  "pointerdown",
  "pointermove",
  "pointerup",
  "pointercancel",
  "pointerleave",
  "focusin",
  "focusout",
  "keydown",
];
/** 押して画面が変わる操作。select や日付の入力は click では見ない */
const MAIN_CLICK_ACTIONS_ = ["reset", "toggle-table", "sort", "download-csv"];
/** 指やペンでの操作。マウスと違い、触れているあいだだけ位置が分かる */
const MAIN_TOUCH_POINTERS_ = ["touch", "pen"];
/** 吹き出しを、指や印からどれだけ離して置くか */
const MAIN_TIP_GAP_ = 14;
/** 吹き出しを、画面の端からどれだけ内がわに収めるか */
const MAIN_TIP_EDGE_ = 8;
/** 操作していた要素の手がかりを 1 本の文字にするときの区切り（番号で書く。生の制御文字は置かない） */
const MAIN_FOCUS_SEP_ = "\u001f";
/** URL の # に付ける頭の決まり（買い手が hash: "売上" のように変えられる） */
const MAIN_HASH_PREFIX_ = "db";
/** 頭として受け取ってよい形。ここに外れた指定は既定の頭に戻す */
const MAIN_HASH_PREFIX_PATTERN_ = /^[a-z0-9_-]{1,20}$/;
/** 書き出した CSV の置き場所を手放すまでの間（ミリ秒） */
const MAIN_REVOKE_DELAY_ = 1000;
/**
 * ファイル名に使えない字（入れ替えて落とす）。制御文字は番号で書く。
 * 生の制御文字をそのまま置くと、<script> に差し込んだときに HTML の読み手が
 * 別の字に置き換えてしまい、字の並びが逆さまになって 1 本ぜんたいが動かなくなる
 */
const MAIN_FILE_UNSAFE_ = /[\\/:*?"<>|\x00-\x1f]/g;
/** 見た目の選び方 */
const MAIN_THEMES_ = ["auto", "light", "dark"];

/** テストのときだけ差し替える、ブラウザの道具の置き換え（ふだんは null） */
let mainEnvironment_ = null;

/**
 * 置き場所ごとの、いま生きているダッシュボード。同じ置き場所にもう一度組み立てるときは、
 * 先にいたほうを片づけてから組み立てる（listener が二重に付いて、操作が 2 回効くのを防ぐ）
 */
const MAIN_INSTANCES_ = new WeakMap();

/**
 * ブラウザの道具をひとまとめにして返す。ここだけがブラウザの中身に触れる。
 * 取り出せないもの（覚え書きを切ってある窓など）は null にして、呼ぶ側で見分けられるようにする
 */
function mainEnv_() {
  if (mainEnvironment_ !== null) return mainEnvironment_;

  const win = typeof window === "undefined" ? null : window;
  const doc = typeof document === "undefined" ? null : document;
  let store = null;
  try {
    store = typeof sessionStorage === "undefined" ? null : sessionStorage;
  } catch {
    // 覚え書きを切ってある窓では、触れるだけで断られることがある
    store = null;
  }

  return {
    document: doc,
    window: win,
    location: win ? win.location : null,
    history: win ? win.history : null,
    sessionStorage: store,
    fetch: win && typeof win.fetch === "function" ? (url, init) => win.fetch(url, init) : null,
    console: typeof console === "undefined" ? null : console,
    now: () => new Date(),
  };
}

/**
 * テスト専用の差し込み口。ブラウザの道具の代わりに、確かめやすい偽物を渡す。
 * 製品の動きでは使わない（null を渡すと、もとのブラウザの道具に戻る）
 */
function setEnvironmentForTests(env) {
  mainEnvironment_ = env !== null && typeof env === "object" ? env : null;
}

// ---- 純粋な計算 -------------------------------------------------------------
// ここから下の 6 つは、画面が無くても同じ答えになる計算だけを取り出したもの。
// 束ねるときに export は剥がされるので、配りものの中では、ただの内がわの関数になる

/**
 * 操作していた要素を見分ける手がかりを、属性の値から 1 本の文字にする。
 * data-focus-key が書いてあればそれを、無ければ役目と場所の組み合わせを使う。
 * 役目（data-action）が無い要素には手がかりを作らない（null）
 */
function mainFocusKeyOf_(parts) {
  const source = parts !== null && typeof parts === "object" ? parts : {};
  const action = textOf(source.action);
  if (action === "") return null;
  const given = textOf(source.focus);
  if (given !== "") return given;
  return [action, textOf(source.widget), textOf(source.column), textOf(source.name)].join(MAIN_FOCUS_SEP_);
}

/**
 * 指のところに、いちばん近い帯はどれか（当てはまるものが無ければ -1）。
 * clientX は画面の座標、rect は図の画面での位置と大きさ、viewWidth は viewBox の幅、
 * positions は帯の中心（図の座標）。画面の座標を図の座標に移してから比べる
 */
function mainNearestBandIndex_(clientX, rect, viewWidth, positions) {
  const box = rect !== null && typeof rect === "object" ? rect : null;
  const list = Array.isArray(positions) ? positions : [];
  if (box === null || !(box.width > 0) || !(viewWidth > 0) || list.length === 0) return -1;

  const at = ((clientX - box.left) / box.width) * viewWidth;
  let nearest = -1;
  let gap = Infinity;
  for (let index = 0; index < list.length; index += 1) {
    const x = Number(list[index]);
    if (!Number.isFinite(x)) continue;
    const distance = Math.abs(x - at);
    if (distance >= gap) continue;
    gap = distance;
    nearest = index;
  }
  return nearest;
}

/**
 * 印に添えてある中身（data-tip を読んだもの）から、吹き出しに出す形をそろえる。
 * 行の並びが無いものは吹き出しを出さない（null）。色の鍵は整数のときだけ付ける
 */
function mainTipModel_(parsed) {
  if (parsed === null || typeof parsed !== "object" || !Array.isArray(parsed.rows)) return null;
  const rows = [];
  for (const row of parsed.rows) {
    if (row === null || typeof row !== "object") continue;
    rows.push({
      color: Number.isInteger(row.color) ? row.color : null,
      value: textOf(row.value),
      label: textOf(row.label),
    });
  }
  return { title: textOf(parsed.title), rows };
}

/** 「題-YYYY-MM-DD.csv」。ファイル名に使えない字は落とし、題が無いときは dashboard にする */
function mainFileNameOf_(title, fallback, today) {
  const want = textOf(title) !== "" ? textOf(title) : textOf(fallback);
  const safe = want.replace(MAIN_FILE_UNSAFE_, " ").replace(/\s+/g, " ").trim();
  return (safe === "" ? "dashboard" : safe) + "-" + textOf(today) + ".csv";
}

/**
 * options.hash の指定から、URL の # に付ける頭を決める。
 * false は「# を使わない」（空文字）。文字の指定は小文字の英数字・_・- の 20 字までを受け取り、
 * それ以外の形は既定の頭に戻す。1 つのページに 2 つ置くときは、頭を分ければ取り違えない
 */
function mainHashPrefixOf_(value) {
  if (value === false) return "";
  if (typeof value === "string") return MAIN_HASH_PREFIX_PATTERN_.test(value) ? value : MAIN_HASH_PREFIX_;
  return MAIN_HASH_PREFIX_;
}

/**
 * いまの # に書いてよいか。空のとき、または自分の頭の鍵だけのときだけ書く。
 * ページ自身の目印（#pricing）や、もう 1 つのダッシュボードの鍵が混じっているときは書かない
 * （絞り込みは今までどおり効く。そのページでは URL で配れないだけ）
 */
function mainHashOwned_(hash, prefix) {
  if (textOf(prefix) === "") return false;
  const text = typeof hash === "string" ? hash : "";
  const body = text.startsWith("#") ? text.slice(1) : text;
  if (body === "") return true;

  const head = prefix + ".";
  for (const pair of body.split("&")) {
    if (pair === "") continue;
    const eq = pair.indexOf("=");
    const key = eq === -1 ? pair : pair.slice(0, eq);
    if (!key.startsWith(head)) return false;
  }
  return true;
}

/**
 * 吹き出しを置く場所を決める。答えは、描いた中身の包み（.db）の左上からの見た目の px。
 * 包みが拡大・縮小された中にあっても同じところに出せるよう、画面の座標を包みの倍率で割る。
 * 収まらないときは指の反対がわへ回し、包みの中と、目に見えている画面の中に収める
 */
function mainTipPlacement_(input) {
  const at = input !== null && typeof input === "object" ? input : {};
  const rect = at.rootRect !== null && typeof at.rootRect === "object" ? at.rootRect : { left: 0, top: 0, width: 0, height: 0 };
  const rootWidth = Number(at.rootWidth);
  const rootHeight = Number(at.rootHeight);
  const gap = Number.isFinite(at.gap) ? at.gap : MAIN_TIP_GAP_;
  const edge = Number.isFinite(at.edge) ? at.edge : MAIN_TIP_EDGE_;

  // 包みが縮められていたら、その分だけ座標も縮む。0 で割らないように 1 倍へ逃がす
  const scale = rect.width > 0 && rootWidth > 0 ? rect.width / rootWidth : 1;
  const ratio = scale > 0 && Number.isFinite(scale) ? scale : 1;
  const tipWidth = Number(at.tipWidth) > 0 ? Number(at.tipWidth) / ratio : 0;
  const tipHeight = Number(at.tipHeight) > 0 ? Number(at.tipHeight) / ratio : 0;

  const x = (Number(at.x) - rect.left) / ratio;
  const y = (Number(at.y) - rect.top) / ratio;

  const view = (size, start) => (Number(size) > 0 ? { from: (0 - start) / ratio, to: (Number(size) - start) / ratio } : null);
  const across = view(at.viewWidth, rect.left);
  const down = view(at.viewHeight, rect.top);

  const place = (want, size, limit, window_) => {
    let low = edge;
    let high = Infinity;
    if (Number.isFinite(limit) && limit > 0) high = limit - edge - size;
    if (window_ !== null) {
      low = Math.max(low, window_.from + edge);
      high = Math.min(high, window_.to - edge - size);
    }
    let put = want + gap;
    if (put > high) put = want - gap - size;
    if (put < low) put = low;
    return Math.min(Math.max(put, low), Math.max(low, high));
  };

  return {
    left: Math.round(place(x, tipWidth, rootWidth, across)),
    top: Math.round(place(y, tipHeight, rootHeight, down)),
  };
}

/**
 * 遅れて届いた読み込みを、画面に入れてよいか。
 * あとから始めた読み込みが先に片づいたあとで、先に始めたほうの返事が届くことがある。
 * そのときは古い中身で上書きしないよう、いちばん新しい読み込みの返事だけを受け取る
 */
function mainLoadWins_(token, current, destroyed) {
  return destroyed !== true && Number.isFinite(token) && token === current;
}

// ---- 小さな道具 -------------------------------------------------------------

function mainAttr_(element, name) {
  return element && typeof element.getAttribute === "function" ? element.getAttribute(name) : null;
}

/** その要素か、その先祖のうち、いちばん近い当てはまるもの */
function mainClosest_(target, selector) {
  const element = target && target.nodeType === 1 ? target : target && target.parentNode ? target.parentNode : null;
  return element && typeof element.closest === "function" ? element.closest(selector) : null;
}

/** ブラウザの暦の「今日」を YYYY-MM-DD にする（入口で 1 回だけ読む） */
function mainToday_(env) {
  const now = typeof env.now === "function" ? env.now() : new Date();
  return now.getFullYear() + "-" + pad2(now.getMonth() + 1) + "-" + pad2(now.getDate());
}

/** いま入れてある URL の # */
function mainHash_(ctx) {
  return ctx.env.location ? textOf(ctx.env.location.hash) : "";
}

// ---- データの下ごしらえ -----------------------------------------------------

/** オブジェクトの並びから、出てきた順に列の名前を集める */
function mainColumnsOf_(rows) {
  const columns = [];
  const seen = new Set();
  for (const row of rows) {
    if (!row || typeof row !== "object") continue;
    for (const key of Object.keys(row)) {
      if (seen.has(key)) continue;
      seen.add(key);
      columns.push(key);
    }
  }
  return columns;
}

/**
 * 上限より 1 行だけ多く残して、取り込んだそのままの形（見出し行つきの行列か、オブジェクトの並び）で切る。
 * 型をそろえる前にここで切るので、上限を大きく超えるデータでも、使わない行まで作り直さずに済む。
 * 空の行と、行として読めないものは、ここで落としておく（数えかたを、このあとの変換とそろえるため）
 */
function mainCutRaw_(list, matrix, max) {
  const kept = matrix && list.length > 0 ? [list[0]] : [];
  const head = kept.length;
  for (let i = head; i < list.length; i += 1) {
    const row = list[i];
    const usable = matrix
      ? Array.isArray(row) && !isBlankRow(row)
      : row !== null && typeof row === "object" && !Array.isArray(row);
    if (!usable) continue;
    kept.push(row);
    if (kept.length - head > max) break; // 上限 + 1 行まで（切ったかどうかを、このあと limitRows が見分ける）
  }
  return kept;
}

/**
 * 取り込んだ行を、描く側が使える形にそろえる。
 * 見出し行つきの行列はオブジェクトの並びに直し、列の型を決め、値をその型に合わせる。
 * 行数の上限は、型をそろえる前（行列・配列のまま）で切ってある
 */
function mainDataset_(raw, types) {
  const list = Array.isArray(raw) ? raw : [];
  const matrix = list.length > 0 && Array.isArray(list[0]);
  const cut = mainCutRaw_(list, matrix, TABLE_ROW_LIMIT_);
  const shaped = matrix ? rowsToObjects(cut) : { columns: mainColumnsOf_(cut), rows: cut };

  const kinds = inferTypes(shaped.columns, shaped.rows, types);
  const limited = limitRows(shaped.rows, TABLE_ROW_LIMIT_);
  return { columns: shaped.columns, rows: coerceRows(limited.rows, kinds), types: kinds, truncated: limited.truncated };
}

/**
 * 設定に書かれたデータセットのうち、行が届いたものだけをそろえる（届かないものは部品の札になる）。
 * mount に直に渡した行（inline）は、読み口が持ってきた行より先に使う。
 *
 * 読み口が「このデータは渡せませんでした」と名前で知らせてきたとき（missing）は、
 * たとえ空の行が付いていても、届かなかったものとして扱う
 * （スプレッドシートの読み口は、無いシートをこの形で知らせてくる）。
 *
 * 「このデータは上限で切ってある」と名前で知らせてきたとき（capped）は、
 * こちらで切った行が 1 行も無くても、切られたものとして知らせを出す
 */
function mainBuildDatasets_(config, loaded, inline, missing, capped) {
  const source = loaded !== null && typeof loaded === "object" ? loaded : {};
  const absent = new Set(Array.isArray(missing) ? missing.map((name) => textOf(name)) : []);
  const cut = new Set(Array.isArray(capped) ? capped.map((name) => textOf(name)) : []);
  const datasets = Object.create(null);
  const put = (name, rows) => {
    const made = mainDataset_(rows, config.datasets[name] ? config.datasets[name].types : {});
    if (cut.has(name)) made.truncated = true;
    datasets[name] = made;
  };
  for (const name of Object.keys(config.datasets)) {
    if (inline !== null && hasOwn(inline, name)) {
      put(name, inline[name]);
      continue;
    }
    if (absent.has(name) || !hasOwn(source, name) || source[name] === undefined) continue;
    put(name, source[name]);
  }
  return datasets;
}

/**
 * 区分の絞り込みの選び方。全データの値から作るので、ほかの絞り込みを変えても選べる値は減らない
 * （同じ列が 2 つのデータセットにあるときは、両方の値を合わせる）
 */
function mainDimensionOptions_(config, datasets) {
  const columns = Array.isArray(config.filters.dimensions) ? config.filters.dimensions : [];
  const options = {};
  for (const column of columns) {
    const values = new Set();
    for (const name of Object.keys(datasets)) {
      const dataset = datasets[name];
      if (dataset.columns.indexOf(column) === -1) continue;
      for (const value of dimensionOptions(dataset.rows, column)) values.add(value);
    }
    // 列の名前は設定に書かれた文字なので、"__proto__" のような名前でも
    // 入れ物そのものの素性を書き換えないように入れる
    setOwn(options, column, Array.from(values).sort());
  }
  return options;
}

// ---- 絞り込みの出し入れ -----------------------------------------------------

/**
 * base（設定から作った最初の絞り込み）に、partial（URL の # や、読み直す前の絞り込み）を重ねる。
 * 設定に無い区分の列は受け取らない。空の値は「すべて」に戻す
 */
function mainMergeFilters_(base, partial) {
  const source = partial !== null && typeof partial === "object" ? partial : {};
  const merged = { period: base.period, from: base.from, to: base.to, dimensions: base.dimensions };
  if (typeof source.period === "string" && source.period !== "") merged.period = source.period;
  if (typeof source.from === "string" && source.from !== "") merged.from = source.from;
  if (typeof source.to === "string" && source.to !== "") merged.to = source.to;

  if (source.dimensions) {
    // 列の名前がそのまま鍵になるので、initialFilters と同じくプロトタイプの無い入れ物に組む
    const dimensions = Object.create(null);
    for (const column of Object.keys(base.dimensions)) {
      dimensions[column] = hasOwn(source.dimensions, column) ? textOf(source.dimensions[column]) : "";
    }
    merged.dimensions = dimensions;
  }
  return merged;
}

/**
 * いまの絞り込みを URL の # に映す。最初と同じときは # を消す（何も絞っていない URL を配れるように）。
 * 履歴は積まずに、いま見ている 1 つを書き換える。
 *
 * # にページ自身の目印（#pricing など）やほかのダッシュボードの鍵が入っているときは、
 * こちらからは何も書かない（相手の目印を消さないため）。絞り込みそのものは今までどおり効く。
 * 書けないところでも画面が止まらないよう、書き換えの失敗はすべてここで受け止める
 */
function mainSyncHash_(ctx) {
  const prefix = ctx.hashPrefix;
  const location = ctx.env.location;
  if (prefix === "" || !location) return;
  if (!mainHashOwned_(mainHash_(ctx), prefix)) return;

  const history = ctx.env.history;
  const same = !filtersDiffer(ctx.state.filters, ctx.state.initial);
  const query = same ? "" : encodeFilters(ctx.state.filters, prefix);
  try {
    if (history && typeof history.replaceState === "function") {
      history.replaceState(null, "", same ? textOf(location.pathname) + textOf(location.search) : "#" + query);
      return;
    }
    // 入れ子の窓など、履歴を書き換えられないところでは # だけを入れ替える
    location.hash = query;
  } catch {
    try {
      location.hash = query;
    } catch {
      // 書けないページでは、絞り込みを URL で配れないだけにする（画面の操作は止めない）
    }
  }
}

// ---- 描き直し ---------------------------------------------------------------

function mainView_(ctx) {
  return { config: ctx.config, model: ctx.model, state: ctx.state, options: ctx.options, lang: ctx.lang, errors: ctx.errors };
}

/** 置き場所に、言語と見た目の選び方を持たせる（買い手が外から色を上書きできるように） */
function mainRootAttrs_(ctx) {
  const root = ctx.root;
  if (typeof root.setAttribute !== "function") return;
  root.setAttribute("data-db-theme", MAIN_THEMES_.indexOf(ctx.config.theme) === -1 ? "auto" : ctx.config.theme);
  root.setAttribute("lang", ctx.lang);
}

/**
 * 操作していた要素を見分ける手がかり。描き直すと要素は作り直されるので、
 * 役目（data-action）と、どの部品・どの列・どの入力かで同じ場所を探し当てる
 */
function mainFocusKey_(element) {
  if (element === null || element === undefined) return null;
  return mainFocusKeyOf_({
    action: mainAttr_(element, "data-action"),
    focus: mainAttr_(element, "data-focus-key"),
    widget: mainAttr_(element, "data-widget"),
    column: mainAttr_(element, "data-column"),
    name: mainAttr_(element, "name"),
  });
}

/** いま操作している要素（置き場所の中にあるときだけ） */
function mainActive_(ctx) {
  const doc = ctx.env.document;
  const element = doc ? doc.activeElement : null;
  if (!element) return null;
  return typeof ctx.root.contains === "function" && ctx.root.contains(element) ? element : null;
}

/** 描き直したあと、同じ手がかりの要素に focus を戻す */
function mainRestoreFocus_(ctx, key) {
  const list = typeof ctx.root.querySelectorAll === "function" ? ctx.root.querySelectorAll("[data-action]") : [];
  for (const element of list) {
    if (mainFocusKey_(element) !== key) continue;
    if (typeof element.focus === "function") element.focus();
    return;
  }
}

function mainBuildModel_(ctx) {
  ctx.model = buildDashboard({
    config: ctx.config,
    datasets: ctx.datasets,
    filters: ctx.state.filters,
    today: ctx.today,
    lang: ctx.lang,
  });
}

function mainRender_(ctx) {
  if (ctx.destroyed) return;
  const key = mainFocusKey_(mainActive_(ctx));
  mainHideTip_(ctx);
  ctx.root.innerHTML = renderDashboard(mainView_(ctx));
  mainPlaceTip_(ctx);
  if (key !== null) mainRestoreFocus_(ctx, key);
}

/**
 * 描き直しをひとまとめにする。続けて起きた操作を 1 回の描き直しにまとめると、
 * 押しつづけても画面がなめらかに保てる。窓が無いところでは、その場で描く
 */
function mainSchedule_(ctx) {
  if (ctx.destroyed || ctx.pending) return;
  const win = ctx.env.window;
  if (!win || typeof win.requestAnimationFrame !== "function") {
    mainBuildModel_(ctx);
    mainRender_(ctx);
    return;
  }
  ctx.pending = true;
  ctx.frame = win.requestAnimationFrame(() => {
    ctx.pending = false;
    ctx.frame = 0;
    mainBuildModel_(ctx);
    mainRender_(ctx);
  });
}

// ---- 吹き出し ---------------------------------------------------------------

/** 吹き出しは 1 つだけ作って使い回す。中身は textContent で入れる（文字列は差し込まない） */
function mainPlaceTip_(ctx) {
  const doc = ctx.env.document;
  if (!doc || typeof doc.createElement !== "function") return;
  if (ctx.tip === null) {
    const tip = doc.createElement("div");
    tip.className = "db-tip";
    tip.setAttribute("role", "tooltip");
    tip.setAttribute("aria-hidden", "true");
    tip.style.display = "none";
    ctx.tip = tip;
  }
  // 描いた中身と同じ包みの中に置くと、明るい・暗いの選び方がそのまま吹き出しにも効き、
  // 置き場所が拡大・縮小された中にあっても、包みと一緒に動く
  const host = mainTipHost_(ctx);
  if (typeof host.appendChild === "function") host.appendChild(ctx.tip);
}

function mainHideTip_(ctx) {
  if (ctx.tip !== null) {
    ctx.tip.style.display = "none";
    ctx.tip.setAttribute("aria-hidden", "true");
  }
  mainHideCrosshair_(ctx);
}

/** 印に添えてある吹き出しの中身（JSON）。読めない形は無いものとして扱う */
function mainTipData_(element) {
  const raw = mainAttr_(element, "data-tip");
  if (raw === null || raw === "") return null;
  try {
    return mainTipModel_(JSON.parse(raw));
  } catch {
    return null;
  }
}

/** 吹き出しの中身を組み立てる。値が先、系列の名前が後、色の鍵は短い線 */
function mainFillTip_(ctx, data) {
  const doc = ctx.env.document;
  const tip = ctx.tip;
  while (tip.firstChild) tip.removeChild(tip.firstChild);

  if (data.title !== "") {
    const title = doc.createElement("div");
    title.className = "db-tip-title";
    title.textContent = data.title;
    tip.appendChild(title);
  }
  for (const row of data.rows) {
    const line = doc.createElement("div");
    line.className = "db-tip-row";
    if (row.color !== null) {
      const key = doc.createElement("span");
      key.className = "db-tip-key db-tip-swatch db-s" + row.color;
      key.setAttribute("aria-hidden", "true");
      line.appendChild(key);
    }
    const value = doc.createElement("span");
    value.className = "db-tip-value";
    value.textContent = row.value;
    line.appendChild(value);

    const label = doc.createElement("span");
    label.className = "db-tip-label";
    label.textContent = row.label;
    line.appendChild(label);

    tip.appendChild(line);
  }
}

/** 吹き出しを入れてある包み（描いた中身の .db）。無ければ置き場所そのもの */
function mainTipHost_(ctx) {
  return ctx.root.firstElementChild || ctx.root;
}

/**
 * 吹き出しを、指や印のそばに置く。包みの左上からの場所で置くので、
 * ページ側で拡大・縮小された中に埋め込まれていても、指のところに出る
 */
function mainMoveTip_(ctx, x, y) {
  const tip = ctx.tip;
  const win = ctx.env.window;
  const host = mainTipHost_(ctx);
  const box = typeof tip.getBoundingClientRect === "function" ? tip.getBoundingClientRect() : { width: 0, height: 0 };
  const rootRect = typeof host.getBoundingClientRect === "function" ? host.getBoundingClientRect() : { left: 0, top: 0, width: 0, height: 0 };

  const place = mainTipPlacement_({
    x,
    y,
    tipWidth: box.width,
    tipHeight: box.height,
    rootRect,
    rootWidth: Number(host.offsetWidth),
    rootHeight: Number(host.offsetHeight),
    viewWidth: win && Number.isFinite(win.innerWidth) ? win.innerWidth : 0,
    viewHeight: win && Number.isFinite(win.innerHeight) ? win.innerHeight : 0,
  });
  tip.style.left = place.left + "px";
  tip.style.top = place.top + "px";
}

function mainShowTip_(ctx, element, x, y) {
  const data = mainTipData_(element);
  if (data === null || ctx.tip === null || !ctx.env.document) {
    mainHideTip_(ctx);
    return;
  }
  mainFillTip_(ctx, data);
  ctx.tip.style.display = "block";
  ctx.tip.setAttribute("aria-hidden", "false");
  mainMoveTip_(ctx, x, y);
}

// ---- 折れ線の縦の線 ---------------------------------------------------------

function mainHideCrosshair_(ctx) {
  if (ctx.crosshair === null) return;
  ctx.crosshair.setAttribute("visibility", "hidden");
  ctx.crosshair = null;
}

function mainShowCrosshair_(ctx, svg, at) {
  const line = typeof svg.querySelector === "function" ? svg.querySelector(".db-crosshair") : null;
  if (!line) return;
  line.setAttribute("x1", at);
  line.setAttribute("x2", at);
  line.setAttribute("visibility", "visible");
  ctx.crosshair = line;
}

/** 図の中の座標の幅（viewBox の 3 つめの数） */
function mainViewBoxWidth_(svg) {
  const parts = textOf(mainAttr_(svg, "viewBox")).split(/\s+/);
  const width = Number(parts[2]);
  return Number.isFinite(width) && width > 0 ? width : 0;
}

/** 指のところに、いちばん近い刻みの帯を探す（画面の座標を図の座標に移して比べる） */
function mainNearestBand_(svg, clientX) {
  if (typeof svg.getBoundingClientRect !== "function" || typeof svg.querySelectorAll !== "function") return null;
  const bands = Array.from(svg.querySelectorAll("[data-bucket]"));
  const positions = bands.map((band) => Number(mainAttr_(band, "data-x")));
  const index = mainNearestBandIndex_(clientX, svg.getBoundingClientRect(), mainViewBoxWidth_(svg), positions);
  return index === -1 ? null : bands[index];
}

/** その印が折れ線の帯なら、縦の線をそこへ動かす */
function mainTrackCrosshair_(ctx, element) {
  const svg = mainClosest_(element, "svg.db-chart-svg");
  const at = mainAttr_(element, "data-x");
  if (svg === null || at === null) {
    mainHideCrosshair_(ctx);
    return;
  }
  mainShowCrosshair_(ctx, svg, at);
}

// ---- 出来事 -----------------------------------------------------------------

function mainDispatch_(ctx, action) {
  const before = ctx.state;
  const next = reduce(before, action);
  if (next === before) return;
  ctx.state = next;
  // 先に描き直しを予約してから URL を書き換える。URL の書き換えでつまずいても、画面は必ず変わる
  mainSchedule_(ctx);
  if (filtersDiffer(before.filters, next.filters) || action.type === "reset") mainSyncHash_(ctx);
}

/** 日付の 2 つの入力は、どちらを変えても両方まとめて読む（片側だけの指定も受ける） */
function mainReadRange_(ctx) {
  const range = { from: "", to: "" };
  const list = typeof ctx.root.querySelectorAll === "function" ? ctx.root.querySelectorAll('[data-action="set-range"]') : [];
  for (const input of list) {
    const name = mainAttr_(input, "name");
    if (name === "from" || name === "to") range[name] = textOf(input.value);
  }
  return range;
}

function mainOnChange_(ctx, event) {
  const element = event.target;
  const action = mainAttr_(element, "data-action");
  if (action === "set-period") {
    mainDispatch_(ctx, { type: "set-period", period: textOf(element.value) });
  } else if (action === "set-dimension") {
    mainDispatch_(ctx, { type: "set-dimension", column: textOf(mainAttr_(element, "data-column")), value: textOf(element.value) });
  } else if (action === "set-range") {
    const range = mainReadRange_(ctx);
    mainDispatch_(ctx, { type: "set-range", from: range.from, to: range.to });
  }
}

function mainOnClick_(ctx, event) {
  const element = mainClosest_(event.target, "[data-action]");
  const action = mainAttr_(element, "data-action");
  if (action === null || MAIN_CLICK_ACTIONS_.indexOf(action) === -1) return;

  if (action === "download-csv") {
    mainDownloadCsv_(ctx, textOf(mainAttr_(element, "data-widget")));
    return;
  }
  if (action === "sort") {
    mainDispatch_(ctx, { type: "sort", widget: textOf(mainAttr_(element, "data-widget")), column: mainAttr_(element, "data-column") });
    return;
  }
  if (action === "toggle-table") {
    mainDispatch_(ctx, { type: "toggle-table", widget: textOf(mainAttr_(element, "data-widget")) });
    return;
  }
  mainDispatch_(ctx, { type: "reset" });
}

/** 指やペンでの操作か（マウスは押していなくても位置が分かるので、分けて扱う） */
function mainIsTouch_(event) {
  return MAIN_TOUCH_POINTERS_.indexOf(textOf(event && event.pointerType)) !== -1;
}

/** 指した先に合わせて、吹き出しと縦の線を出す（マウスでも指でも同じ） */
function mainPointAt_(ctx, event) {
  const svg = mainClosest_(event.target, "svg.db-chart-svg");
  if (svg !== null && typeof svg.querySelector === "function" && svg.querySelector(".db-crosshair")) {
    const band = mainNearestBand_(svg, event.clientX);
    if (band !== null) {
      mainShowCrosshair_(ctx, svg, mainAttr_(band, "data-x"));
      mainShowTip_(ctx, band, event.clientX, event.clientY);
      return;
    }
  }
  mainHideCrosshair_(ctx);
  const mark = mainClosest_(event.target, "[data-tip]");
  if (mark === null) mainHideTip_(ctx);
  else mainShowTip_(ctx, mark, event.clientX, event.clientY);
}

/**
 * 指やペンで触れたとき。印に触れればその吹き出しを出し、印の無いところに触れれば消す。
 * ここから指を離すまでのあいだは、横になぞると縦の線が刻みを追いかける
 */
function mainOnPointerDown_(ctx, event) {
  if (!mainIsTouch_(event)) return;
  ctx.touching = true;
  mainPointAt_(ctx, event);
}

/** マウスはいつでも、指やペンは触れているあいだだけ、指した先を追いかける */
function mainOnPointerMove_(ctx, event) {
  if (mainIsTouch_(event) && ctx.touching !== true) return;
  mainPointAt_(ctx, event);
}

/**
 * 指を離したとき。吹き出しはそのまま残す（触れたものの値を、離してから読めるように）。
 * 消えるのは、印の無いところに触れたときと、Escape と、描き直したときだけ
 */
function mainOnPointerEnd_(ctx) {
  ctx.touching = false;
}

/** 置き場所から出たとき。指やペンでは、離したあとにも届くので、マウスのときだけ消す */
function mainOnPointerLeave_(ctx, event) {
  if (mainIsTouch_(event)) return;
  ctx.touching = false;
  mainHideTip_(ctx);
}

/** キーボードの focus でも、指で指したときと同じ吹き出しを出す */
function mainOnFocusIn_(ctx, event) {
  const mark = mainClosest_(event.target, "[data-tip]");
  if (mark === null) {
    mainHideTip_(ctx);
    return;
  }
  mainTrackCrosshair_(ctx, mark);
  const box = typeof mark.getBoundingClientRect === "function" ? mark.getBoundingClientRect() : null;
  const x = box ? box.left + box.width / 2 : 0;
  const y = box ? box.top + Math.min(box.height / 2, 60) : 0;
  mainShowTip_(ctx, mark, x, y);
}

function mainOnKeyDown_(ctx, event) {
  if (event.key === "Escape" || event.key === "Esc") mainHideTip_(ctx);
}

/**
 * 絞り込みの form は、押しボタンではなく select と日付の入力だけで動く。
 * それでも Enter などで送信されるとページが読み直されてしまうので、ここで止める
 */
function mainOnSubmit_(event) {
  if (event && typeof event.preventDefault === "function") event.preventDefault();
}

function mainHandle_(ctx, type, event) {
  if (ctx.destroyed) return;
  if (type === "change") mainOnChange_(ctx, event);
  else if (type === "click") mainOnClick_(ctx, event);
  else if (type === "submit") mainOnSubmit_(event);
  else if (type === "pointerdown") mainOnPointerDown_(ctx, event);
  else if (type === "pointermove") mainOnPointerMove_(ctx, event);
  else if (type === "pointerup" || type === "pointercancel") mainOnPointerEnd_(ctx);
  else if (type === "pointerleave") mainOnPointerLeave_(ctx, event);
  else if (type === "focusin") mainOnFocusIn_(ctx, event);
  else if (type === "keydown") mainOnKeyDown_(ctx, event);
  else mainHideTip_(ctx); // focusout
}

function mainBind_(ctx) {
  const root = ctx.root;
  if (typeof root.addEventListener === "function") {
    for (const type of MAIN_EVENTS_) {
      const handler = (event) => mainHandle_(ctx, type, event);
      ctx.handlers.push({ type, handler });
      root.addEventListener(type, handler);
    }
  }
  const win = ctx.env.window;
  if (ctx.hashPrefix !== "" && win && typeof win.addEventListener === "function") {
    ctx.hashHandler = () => {
      if (ctx.destroyed) return;
      const filters = mainMergeFilters_(ctx.state.initial, decodeFilters(mainHash_(ctx), ctx.config, ctx.hashPrefix));
      if (!filtersDiffer(ctx.state.filters, filters)) return;
      ctx.state = Object.assign({}, ctx.state, { filters });
      mainSchedule_(ctx);
    };
    win.addEventListener("hashchange", ctx.hashHandler);
  }
}

function mainUnbind_(ctx) {
  const root = ctx.root;
  if (typeof root.removeEventListener === "function") {
    for (const entry of ctx.handlers) root.removeEventListener(entry.type, entry.handler);
  }
  ctx.handlers = [];
  const win = ctx.env.window;
  if (ctx.hashHandler !== null && win && typeof win.removeEventListener === "function") {
    win.removeEventListener("hashchange", ctx.hashHandler);
  }
  ctx.hashHandler = null;
}

// ---- CSV の書き出し ---------------------------------------------------------

function mainWidget_(ctx, id) {
  const widgets = ctx.model && Array.isArray(ctx.model.widgets) ? ctx.model.widgets : [];
  for (const widget of widgets) {
    if (widget && widget.id === id) return widget;
  }
  return null;
}

/** 表の中身をそのまま CSV にして渡す。表計算ソフトが数式として動かさない形は toCsv が受け持つ */
function mainDownloadCsv_(ctx, id) {
  const widget = mainWidget_(ctx, id);
  if (widget === null || !Array.isArray(widget.csv)) return;

  const doc = ctx.env.document;
  const win = ctx.env.window;
  if (!doc || !win || typeof win.Blob !== "function" || !win.URL) return;

  const blob = new win.Blob([toCsv(widget.csv)], { type: "text/csv;charset=utf-8" });
  const url = win.URL.createObjectURL(blob);
  const link = doc.createElement("a");
  link.href = url;
  link.download = mainFileNameOf_(widget.title, ctx.config.title, ctx.today);
  link.rel = "noopener";

  const host = doc.body || ctx.root;
  if (typeof host.appendChild === "function") host.appendChild(link);
  link.click();
  if (typeof link.remove === "function") link.remove();

  // 書き出しが始まる前に消してしまわないよう、少し待ってから手放す。
  // 待っているあいだに片づけられたときのために、待ち合わせを控えておく
  const pending = { url, timer: 0 };
  const release = () => {
    ctx.revokes = ctx.revokes.filter((entry) => entry !== pending);
    win.URL.revokeObjectURL(url);
  };
  if (typeof win.setTimeout === "function") {
    pending.timer = win.setTimeout(release, MAIN_REVOKE_DELAY_);
    ctx.revokes.push(pending);
  } else {
    release();
  }
}

/** 待ち合わせを取りやめて、まだ手放していない置き場所をその場で手放す */
function mainReleaseUrls_(ctx) {
  const win = ctx.env.window;
  const pending = ctx.revokes;
  ctx.revokes = [];
  for (const entry of pending) {
    if (entry.timer && win && typeof win.clearTimeout === "function") win.clearTimeout(entry.timer);
    if (win && win.URL && typeof win.URL.revokeObjectURL === "function") win.URL.revokeObjectURL(entry.url);
  }
}

// ---- 読み込み ---------------------------------------------------------------

/** まだ設定が届いていないときの、いちばん外がわの形（読み込み中の知らせを出すために使う） */
function mainBlankConfig_(lang, theme) {
  return { title: "", lang, theme, cacheMinutes: 5, datasets: {}, filters: { period: "all", from: "", to: "", dimensions: [] }, widgets: [] };
}

function mainBlankState_() {
  const dimensions = Object.create(null);
  const filters = { period: "all", from: "", to: "", dimensions };
  return { status: "loading", filters, initial: filters, tableView: {}, sort: {}, message: "" };
}

/** 届いた設定とデータを画面の形にそろえて、描く */
function mainApply_(ctx, result) {
  const loaded = result !== null && typeof result === "object" ? result : {};
  const parsed = parseConfig(loaded.config);
  const config = parsed.config;
  if (ctx.langOverride !== "") config.lang = ctx.langOverride;
  if (ctx.themeOverride !== "") config.theme = ctx.themeOverride;

  ctx.config = config;
  ctx.errors = parsed.errors;
  ctx.lang = config.lang === "en" ? "en" : "ja";
  ctx.datasets = mainBuildDatasets_(config, loaded.datasets, ctx.inline, loaded.missing, loaded.truncated);
  ctx.options = mainDimensionOptions_(config, ctx.datasets);

  const fresh = initialState(config, ctx.today);
  const before = ctx.state.status === "ready" ? ctx.state : null;
  // 読み直しのときは、いま選んでいる絞り込みを引き継ぐ。はじめは URL の # を読む
  const partial =
    before !== null ? before.filters : ctx.hashPrefix !== "" ? decodeFilters(mainHash_(ctx), config, ctx.hashPrefix) : null;
  const state = Object.assign({}, fresh, { filters: mainMergeFilters_(fresh.filters, partial) });
  if (before !== null) {
    state.tableView = before.tableView;
    state.sort = before.sort;
  }
  ctx.state = reduce(state, { type: "loaded" });

  mainRootAttrs_(ctx);
  mainBuildModel_(ctx);
  mainRender_(ctx);
}

/**
 * 読み込めなかったときは、やわらかい知らせだけを出す。
 * 読み口が「この文はそのまま出してよい」と印を付けてきたとき（dashboardMessage）だけ、
 * その文を画面に出す。印の無い誤りは、内がわの事情を見せないよう既定の 1 文にする
 */
function mainFail_(ctx, error) {
  const log = ctx.env.console;
  if (log && typeof log.error === "function") log.error(error);
  ctx.model = {};
  const shown = error !== null && typeof error === "object" ? textOf(error.dashboardMessage) : "";
  ctx.state = reduce(ctx.state, { type: "failed", message: shown });
  mainRender_(ctx);
}

/**
 * 設定とデータを読み込んで画面に入れる。
 *
 * 読み込みには順番の札（token）を持たせ、いちばん新しい読み込みの返事だけを画面に入れる。
 * 先に始めたほうが遅れて返ってきても、そこで古い中身に戻ってしまわないようにするため
 * （片づけたあと（destroy）に届いた返事も、同じ仕組みで見送る）
 */
function mainLoad_(ctx, fresh) {
  ctx.loadToken += 1;
  const token = ctx.loadToken;
  return Promise.resolve()
    .then(() => ctx.source.load({ fresh }))
    .then(
      (result) => {
        if (mainLoadWins_(token, ctx.loadToken, ctx.destroyed)) mainApply_(ctx, result);
      },
      (error) => {
        if (mainLoadWins_(token, ctx.loadToken, ctx.destroyed)) mainFail_(ctx, error);
      }
    );
}

/** load() が、画面にそのまま出してよい 1 文で必ず失敗する読み口 */
function mainFailingSource_(message) {
  return {
    load() {
      const error = new Error(message);
      error.dashboardMessage = message;
      return Promise.reject(error);
    },
  };
}

/**
 * どこから設定とデータを持ってくるかを決める。load() を持つものを渡されたらそれを使い、
 * "memory" なら見本、それ以外は取りに行く読み口にする。
 * 束ねた中に入っていない読み口は typeof で確かめる（入口ごとに積む読み口が違うため）。
 * 見本の読み口は見本のページ（demo/app.js）にだけ入れてあるので、配布物で "memory" を
 * 指定されたときは、そのことを丁寧にお伝えして失敗の表示にする
 */
function mainSource_(ctx, options) {
  const given = options.source;
  if (given !== null && typeof given === "object" && typeof given.load === "function") return given;

  const name = textOf(given);
  if (name === "memory") {
    if (typeof sourceMemoryCreate_ !== "function") return mainFailingSource_(t(ctx.lang, "error.sampleOnlyInDemo"));
    return sourceMemoryCreate_({ today: ctx.today, lang: ctx.langOverride || "ja" });
  }
  if (name === "gas" && typeof sourceGasCreate_ === "function") {
    return sourceGasCreate_({ env: ctx.env });
  }
  if (typeof sourceWebCreate_ === "function") {
    return sourceWebCreate_({ config: options.config, data: options.data, env: ctx.env });
  }
  return { load: () => Promise.reject(new Error("dashboard: データの読み口が見つかりません")) };
}

/**
 * 置き場所（root）にダッシュボードを組み立てる。options は
 * { config, data, source, lang, theme, today, hash }。
 * hash は true（既定・URL の # に "db." の頭で書く）／"売上" のような頭の指定／false（使わない）。
 * 戻り値の destroy() で後片づけ、refresh() で取り込み直す。
 *
 * 同じ置き場所にもう一度組み立てるときは、先にいたほうを片づけてから組み立てる
 * （そのあとで古いほうの destroy() を呼んでも、新しい画面は消えない）
 */
function mountDashboard(root, options) {
  if (root === null || typeof root !== "object") throw new TypeError("dashboard: 置き場所の要素を渡してください");

  const living = MAIN_INSTANCES_.get(root);
  if (living !== undefined && typeof living.destroy === "function") living.destroy();

  const env = mainEnv_();
  const opts = options !== null && typeof options === "object" ? options : {};
  const today = isDateKey(textOf(opts.today)) ? textOf(opts.today) : mainToday_(env);
  const langOverride = opts.lang === "en" || opts.lang === "ja" ? opts.lang : "";
  const themeOverride = MAIN_THEMES_.indexOf(opts.theme) === -1 ? "" : opts.theme;

  const ctx = {
    env,
    root,
    today,
    langOverride,
    themeOverride,
    lang: langOverride === "" ? "ja" : langOverride,
    inline: opts.data !== null && typeof opts.data === "object" ? opts.data : null,
    hashPrefix: env.location ? mainHashPrefixOf_(opts.hash) : "",
    config: mainBlankConfig_(langOverride === "" ? "ja" : langOverride, themeOverride === "" ? "auto" : themeOverride),
    errors: [],
    datasets: Object.create(null),
    options: {},
    model: {},
    state: mainBlankState_(),
    tip: null,
    crosshair: null,
    touching: false,
    handlers: [],
    hashHandler: null,
    revokes: [],
    pending: false,
    frame: 0,
    loadToken: 0,
    destroyed: false,
    source: null,
  };

  const view = {
    destroy() {
      if (ctx.destroyed) return;
      ctx.destroyed = true;
      if (MAIN_INSTANCES_.get(root) === view) MAIN_INSTANCES_.delete(root);
      mainUnbind_(ctx);
      const win = ctx.env.window;
      if (ctx.frame && win && typeof win.cancelAnimationFrame === "function") win.cancelAnimationFrame(ctx.frame);
      mainReleaseUrls_(ctx);
      mainHideTip_(ctx);
      if (ctx.tip !== null && ctx.tip.parentNode && typeof ctx.tip.parentNode.removeChild === "function") {
        ctx.tip.parentNode.removeChild(ctx.tip);
      }
      ctx.tip = null;
      ctx.root.innerHTML = "";
    },
    refresh() {
      if (ctx.destroyed) return Promise.resolve();
      return mainLoad_(ctx, true);
    },
  };

  MAIN_INSTANCES_.set(root, view);
  mainRootAttrs_(ctx);
  mainRender_(ctx);
  mainBind_(ctx);
  ctx.source = mainSource_(ctx, opts);
  mainLoad_(ctx, false);
  return view;
}

window.Dashboard = { mount: mountDashboard, version: "1.0.0" };
})();
