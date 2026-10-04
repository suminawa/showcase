// このファイルは「AI 問い合わせ整理キット」の src/ からの写しです（中身は書き換えていません）。
// 直すときはキットの側を直してから、scripts/sync-gas-kits.mjs を走らせてください。
/**
 * Claude に返させる JSON の型（structured outputs の JSON Schema）と、返ってきた答えの検証・補正。
 * 型は API が守らせるが、分類の一覧や日付の形は念のためこちらでも見る。
 */
import { toDateKey } from "./dates.js";

export const URGENCIES = ["高", "中", "低"];
// "OTHER" という名前の定数にすると config.js の同名の定数と衝突する（1 ファイルに束ねて 1 つの名前空間になるため。build.test.mjs が検出）。
// そのためここでは定数にせず、"その他" をそのまま書く。
const SUMMARY_LIMIT = 200;

const ANSWER_KEYS = ["category", "urgency", "summary", "request", "deadline", "person", "replyDraft", "needsHuman", "confidence", "notes"];

/** 「文字列か null」は anyOf で書く（structured outputs が示している書き方） */
function nullableString_(description) {
  const field = { anyOf: [{ type: "string" }, { type: "null" }] };
  if (description !== undefined) field.description = description;
  return field;
}

export function buildSchema(categories) {
  return {
    type: "object",
    properties: {
      category: { type: "string", enum: categories.slice() },
      urgency: { type: "string", enum: URGENCIES.slice() },
      summary: { type: "string", description: "120 字以内の要約。体言止めの 1〜2 文" },
      request: { type: "string", description: "相手が求めていること。1 文" },
      deadline: nullableString_("本文に書かれた期日。YYYY-MM-DD。無ければ null"),
      person: {
        type: "object",
        properties: { name: nullableString_(), company: nullableString_(), phone: nullableString_() },
        required: ["name", "company", "phone"],
        additionalProperties: false,
      },
      replyDraft: { type: "string", description: "敬体の返信案。署名は含めない" },
      needsHuman: { type: "boolean" },
      confidence: { type: "number", description: "0〜1" },
      notes: { type: "string", description: "迷った点。無ければ空" },
    },
    required: ANSWER_KEYS.slice(),
    additionalProperties: false,
  };
}

/** 答えが壊れていたときの、要対応の「その他」 */
export function fallbackAnswer(reason) {
  return {
    category: "その他",
    urgency: "中",
    summary: "",
    request: "",
    deadline: null,
    person: { name: null, company: null, phone: null },
    replyDraft: "",
    needsHuman: true,
    confidence: 0,
    notes: "答えを読み取れませんでした（" + String(reason) + "）",
  };
}

function text_(value) {
  return value === null || value === undefined ? "" : String(value).trim();
}

function nullable_(value) {
  const text = text_(value);
  return text === "" ? null : text;
}

/** YYYY-MM-DD の形で、暦にある日付だけを通す（2026-02-30 は null）。照合は dates.js の 1 か所に寄せる */
function dateOrNull_(value) {
  const text = text_(value);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) return null;
  return toDateKey(text);
}

function boolean_(value) {
  if (typeof value === "boolean") return value;
  const text = text_(value).toLowerCase();
  return text === "true" || text === "1" || text === "yes";
}

function confidence_(value) {
  const number = typeof value === "number" ? value : Number(text_(value));
  if (Number.isNaN(number)) return 0;
  return Math.min(1, Math.max(0, number));
}

/** 型と一覧に合わせて補正する。raw はオブジェクトであること（parseAnswer が確かめる） */
export function normalizeAnswer(raw, config) {
  const person = raw.person && typeof raw.person === "object" ? raw.person : {};
  const category = text_(raw.category);
  const urgency = text_(raw.urgency);
  return {
    category: config.categories.indexOf(category) >= 0 ? category : "その他",
    urgency: URGENCIES.indexOf(urgency) >= 0 ? urgency : "中",
    summary: text_(raw.summary).slice(0, SUMMARY_LIMIT),
    request: text_(raw.request),
    deadline: dateOrNull_(raw.deadline),
    person: { name: nullable_(person.name), company: nullable_(person.company), phone: nullable_(person.phone) },
    replyDraft: text_(raw.replyDraft),
    needsHuman: boolean_(raw.needsHuman),
    confidence: confidence_(raw.confidence),
    notes: text_(raw.notes),
  };
}

/** Claude の返した文字列 → { ok, answer, reason }。壊れていても answer は必ず返す */
export function parseAnswer(text, config) {
  let raw;
  try {
    raw = JSON.parse(String(text === null || text === undefined ? "" : text));
  } catch (error) {
    return { ok: false, answer: fallbackAnswer("json"), reason: "json" };
  }
  if (raw === null || typeof raw !== "object" || Array.isArray(raw)) {
    return { ok: false, answer: fallbackAnswer("shape"), reason: "shape" };
  }
  return { ok: true, answer: normalizeAnswer(raw, config), reason: "" };
}
