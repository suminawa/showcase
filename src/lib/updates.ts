/*
 * 更新の記録。キットの CHANGELOG（suminawa-products/packages/<kit>/CHANGELOG.md）の公開済みの版だけを、
 * お客さま向けの一行に縮めて写す。「未リリース」の直しは載せない。新しい順。
 * 版を出したら、ここに 1 行足す（トップ・/kits・品物のページが同じ表を読む）。
 */
export type KitUpdate = {
  /** 公開した日（YYYY-MM-DD） */
  date: string;
  /** projects.ts の slug */
  slug: string;
  version: string;
  /** 何が変わったかの一行（敬体） */
  note: string;
};

export const UPDATES: readonly KitUpdate[] = [
  {
    date: "2026-10-18",
    slug: "sheet-app",
    version: "1.1.3",
    note: "LINE の中継を拒否したときは実行ログに理由を残し、接続情報が空のまま通知しようとしたときは「接続情報が未設定です」と通知ログに残します。通知の設定の直すところは画面の上にも出ます。",
  },
  {
    date: "2026-10-17",
    slug: "deadline",
    version: "1.2.0",
    note: "通知先にメール（Gmail）と Google Chat を足し、カンマで区切って複数の通知先に送れるようにしました。一部の通知先にだけ送れなかったときは、届いた先で直す設定の行をお知らせします。",
  },
  {
    date: "2026-10-17",
    slug: "form",
    version: "1.1.2",
    note: "送れなかった通知を受付シートの「通知」の列と連絡先メールでお知らせし、送信の回数に上限を設けました。先頭が 0 の電話番号の 0 が消える不具合と、枠の時間帯が合わず受け付けられない不具合も直しました。",
  },
  {
    date: "2026-10-17",
    slug: "booking",
    version: "1.1.1",
    note: "前日のリマインドを送れなかったご予約があったとき、受付番号を Slack・Discord・LINE と連絡先メールにお知らせするようにしました。",
  },
  {
    date: "2026-10-10",
    slug: "sheet-app",
    version: "1.1.2",
    note: "台帳 ID でアプリを開けるようにし、同時更新のときは古い保存を拒否します。接続情報はスクリプト プロパティへ移し、LINE の受信は Cloudflare Worker の中継（上げ方は README の 12 章）を通るようにしました。",
  },
  {
    date: "2026-09-29",
    slug: "form",
    version: "1.1.1",
    note: "メニューの「見本の受付を 1 件入れる」が、実行した方のメールアドレスを受付シートに書き込まないようにしました。",
  },
  {
    date: "2026-09-29",
    slug: "inbox-triage",
    version: "1.0.2",
    note: "持ち主のメールアドレスを、スクリプト プロパティにそのまま置かないようにしました。",
  },
  {
    date: "2026-09-29",
    slug: "ai-concierge",
    version: "1.0.2",
    note: "同梱の Next.js のテンプレートで、npm install が止まる不具合を直しました。",
  },
  {
    date: "2026-09-28",
    slug: "deadline",
    version: "1.1.0",
    note: "メニューに「初期化」と「設定を確かめる」を足しました。直すところを、シートの名前と行と一緒にまとめてお知らせします。",
  },
  {
    date: "2026-09-28",
    slug: "form",
    version: "1.1.0",
    note: "メニューに「初期化」を足し、「設定を確かめる」が直すところをまとめてお知らせするようにしました。",
  },
  {
    date: "2026-09-28",
    slug: "booking",
    version: "1.1.0",
    note: "「設定を確かめる」に、タイムゾーン・枠の不足・通知の URL の形などの検査を足しました。1.0 をお持ちの方は無料で更新できます。",
  },
  {
    date: "2026-09-28",
    slug: "sheet-app",
    version: "1.1.1",
    note: "「初期化」で、空白を詰めて書いた設定の値が空に戻ることがある不具合を直しました。",
  },
  {
    date: "2026-09-28",
    slug: "inbox-triage",
    version: "1.0.1",
    note: "通知の文に入った字が、Slack と Discord で全員への呼び出しにならないようにしました。",
  },
  {
    date: "2026-09-25",
    slug: "sheet-app",
    version: "1.1.0",
    note: "登録・更新を LINE・Slack・Discord に知らせる通知と、詳細画面の「LINE で送る」を足しました。1.0 をお持ちの方は無料で更新できます。",
  },
  {
    date: "2026-09-25",
    slug: "ai-concierge",
    version: "1.0.1",
    note: "短い節をまとめたときに、答えの出典の題がずれることがある不具合を直しました。",
  },
  {
    date: "2026-09-25",
    slug: "saas-starter",
    version: "1.0.1",
    note: "確認メールのリンクを別のブラウザで開いたときのログインの案内を分けました。1.0.0 をお求めの方は無料で更新いただけます。",
  },
  {
    date: "2026-09-20",
    slug: "lp-pack",
    version: "1.0.1",
    note: "Next.js の脆弱性の勧告に合わせて、同梱の Next.js を 16.3.5 以上に上げました。",
  },
];

/** その品物の更新（新しい順） */
export function updatesFor(slug: string): KitUpdate[] {
  return UPDATES.filter((u) => u.slug === slug);
}

/** 「2026-09-28」→「2026.9.28」（更新の記録の日付） */
export function updateDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return `${y}.${m}.${d}`;
}
