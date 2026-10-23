/*
 * 検索の言葉「契約更新 期限管理 エクセル 通知」「スプレッドシート 期限 メール 通知」の着地の紙。
 * なぜ見落とすか → 無料でできる 3 つ（カレンダー・条件付き書式・GAS を自分で書く）→ 比べる表 →
 * 無料で足りなくなるとき → キット → 設置を頼む、の順に読ませる。
 * キットの事実は ops 30days/products/s2-deadline-alert-gas/booth-description.md だけから取る。
 * FORM: 方眼（DESIGN.md）。枠は ../parts の GuideArticle。
 */
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { NoteEmbed } from "@/components/note/NoteEmbed";
import { ContactMail } from "@/components/track/ContactMail";
import { goHref } from "@/lib/go";
import { guideBySlug } from "@/lib/guides";

import g from "../guides.module.css";
import { GuideArticle, GuideCompare, GuideLinks, guideMetadata } from "../parts";

const guide = guideBySlug("deadline-alert");

const NOTE_ARTICLE = "https://note.com/suminawa/n/n60440b87a271";
/** note の記事の題（記事の側の題なので、この紙の題を直しても変えない） */
const NOTE_TITLE = "契約の更新や点検の期限を、スプレッドシートに書いたまま見落とす";
const COCONALA = "https://coconala.com/services/4427437";
const SHOT = "/guides/deadline-alert-notice.png";

const CODE = `// 期限シートの列: A 件名 / B 期限（日付）/ C 担当 / D 状態
const TO = 'soumu@example.co.jp'; // 知らせる宛先
const DAYS = 7; // 何日前から知らせるか

function notifyDeadlines() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('期限');
  const rows = sheet.getDataRange().getValues().slice(1); // 1 行目は見出し
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const lines = [];
  rows.forEach(function (r) {
    if (!(r[1] instanceof Date) || r[3] === '完了') return;
    const days = Math.round((r[1] - today) / 86400000);
    if (days > DAYS) return;
    const when = days < 0 ? '【超過】' : days === 0 ? '【今日】' : 'あと ' + days + ' 日 ';
    lines.push(when + r[0] + '（' + (r[2] || '担当なし') + '）');
  });
  if (lines.length === 0) return; // 知らせる行が無い日は送らない
  MailApp.sendEmail(TO, '期限のお知らせ（' + lines.length + ' 件）', lines.join('\\n'));
}`;

export const metadata: Metadata = guideMetadata(guide, SHOT);

export default function DeadlineAlertGuide() {
  return (
    <GuideArticle guide={guide} image={SHOT}>
      <section className={g.section}>
        <h2 className={g.heading}>エクセルやスプレッドシートで期限を管理していて、なぜ見落とすのですか</h2>
        <ul className={g.list}>
          <li>契約の更新・車検・保険・ドメインの期限を表に並べてあっても、開かなかった日に期限が過ぎる</li>
          <li>件数が増えると、どれが近いのかを毎回探すことになり、種類ごとに月もばらばらになる</li>
          <li>担当が 2 人いると「相手が見ているはず」で誰も動かず、気づくのが期限の翌日になる</li>
        </ul>
        <p className={g.text}>
          自動で更新される契約は、更新しない旨を伝える期限が満了日より前にあることが多く、見落とすと次の期間の費用がかかります。表に「満了日」だけでなく「連絡の期限」も書いておくと、知らせる日を決めやすくなります。
        </p>
      </section>

      <section className={g.section}>
        <h2 className={g.heading}>無料でできる方法は、どれですか</h2>
        <p className={g.text}>費用をかけずにできる方法は 3 つあります。件数と、見る人の数で選びます。</p>
        <ol className={g.list}>
          <li>
            <b>Google カレンダーの通知</b>: 期限を予定として入れ、通知を 30 日前と 7
            日前に設定します。期限が数件で、知るのが自分だけならこれで足ります。件ごとに予定を作るので、件数が増えると入れ直しの手間が増え、済んだかどうかを一覧で追えません。
          </li>
          <li>
            <b>スプレッドシートの条件付き書式</b>: 列を「件名・期限・担当・状態」の 4 つにし、期限は文字ではなく日付で入れます。「書式」→「条件付き書式」で、30
            日以内は黄色・7 日以内はオレンジ・超過は赤にします。済んだ行は消さずに状態を「完了」にし、フィルタで外して見ます。表を毎日開く人がいれば、これで見落としが減ります。
          </li>
          <li>
            <b>Google Apps Script（GAS）を自分で書く</b>: 表を開かない日にも知らせるには、下のコードで、期限の近い行を毎朝 1
            通のメールにまとめて送ります。
          </li>
        </ol>
        <pre className={g.code}>
          <code>{CODE}</code>
        </pre>
        <ol className={g.list}>
          <li>期限の表で「拡張機能」→「Apps Script」を開き、上のコードを貼って、宛先とシート名を直す</li>
          <li>左の歯車（プロジェクトの設定）で、タイムゾーンが「(GMT+09:00) 東京」になっているかを確かめる</li>
          <li>
            左の時計の印（トリガー）から「トリガーを追加」を押し、関数に notifyDeadlines、イベントのソースに「時間主導型」、種類に「日付ベースのタイマー」、時刻に「午前 8 時〜9 時」を選ぶ
          </li>
          <li>一度「実行」を押して Google の承認画面で許可し、メールが届くかを確かめる</li>
        </ol>
        <p className={g.text}>
          スプレッドシートだけで組む手順は、note の記事{" "}
          <a href={NOTE_ARTICLE} className={g.link}>
            「{NOTE_TITLE}」
          </a>
          にも書きました。
        </p>
        <NoteEmbed url={NOTE_ARTICLE} />
      </section>

      <section className={g.section}>
        <h2 className={g.heading}>Google カレンダー・自作の GAS・キットは、何が違いますか</h2>
        <GuideCompare
          rows={[
            {
              way: "Google カレンダーの通知",
              cost: "0 円",
              fits: "期限が数件で、知るのが自分だけ",
              limit: "件ごとに予定を作る。一覧で見られず、済んだかどうかを表で追えない",
            },
            {
              way: "条件付き書式の色分け",
              cost: "0 円",
              fits: "表を毎日開く人がいる",
              limit: "表を開かない日は気づけない",
            },
            {
              way: "自分で書く GAS",
              cost: "0 円",
              fits: "GAS を直せる人が社内にいる",
              limit: "送れなかった日の知らせ、二重送信の防止、Slack などへの送り分けは自分で作り、直し続ける",
            },
            {
              way: "契約管理のサービス",
              cost: "月額",
              fits: "契約書の保管や承認まで 1 つにまとめたい",
              limit: "期限の通知だけなら機能が多く、月々の費用がかかる",
            },
          ]}
          kit={{
            way: "deadline",
            fits: "期限が数十件あり、担当者みんなに同じ 1 通を届けたい",
            limit: "通知の時刻は毎朝 8 時台。契約書の保管や承認の流れはない",
          }}
        />
      </section>

      <section className={g.section}>
        <h2 className={g.heading}>無料の方法で足りなくなるのは、どんなときですか</h2>
        <ul className={g.list}>
          <li>期限が数十件になり、カレンダーの予定を入れ直すだけで手間になった</li>
          <li>担当が 2 人以上いて、同じ知らせを全員に届けたい（Slack のチャンネルや共有のメーリングリストに送れば、全員に同じ 1 通が届きます）</li>
          <li>自分で書いた GAS が止まっていたのに、何日も気づかなかった</li>
          <li>件ごとに通知が届き、多すぎて読まなくなった</li>
        </ul>
      </section>

      <section className={g.section}>
        <h2 className={g.heading}>期限アラート GAS キットでは、何ができますか</h2>
        <p className={g.text}>
          スプレッドシートに書いた期限を、毎朝 8 時台に、メール（Gmail）・Slack・Discord・Google Chat のうち選んだ先へ 1
          通でお知らせします。1 通の中は、期限を過ぎたもの・今日が期限のもの・3
          日後が期限のものの順に並び、いちばん危ないものが先頭に来ます。何日前に知らせるか、文面、列の名前は設定シートで変えられ、「状態」が「完了」の行は知らせません。同じ日に
          2 回動いても同じ行は 2 度送らず、読み取りに失敗したときは同じ通知先にエラーを送ります。
        </p>
        <figure className={g.figure}>
          <Link href="/projects/deadline">
            <Image
              src={SHOT}
              alt="期限アラートの見本。期限を過ぎたもの・今日が期限のもの・3 日後が期限のものが 1 通にまとまった通知"
              width={1282}
              height={600}
            />
          </Link>
          <figcaption className={g.caption}>
            期限や状態を書き換えて、届く 1 通がどう変わるかを試せます ──{" "}
            <Link href="/projects/deadline" className={g.link}>
              期限アラートの見本を開く
            </Link>
          </figcaption>
        </figure>
        <p className={g.text}>
          価格は ¥2,980（税込・買い切り）で、月額の費用はかかりません。Google スプレッドシートと Apps Script の 1
          ファイルで動き、置き方は同梱の手順書に沿って 4 つの操作で終わります。 ──{" "}
          <a href={goHref("s2", "booth", "/guides/deadline-alert")} rel="nofollow" className={g.link}>
            BOOTH
          </a>
          {" / "}
          <a href={goHref("s2", "note", "/guides/deadline-alert")} rel="nofollow" className={g.link}>
            note
          </a>
        </p>
      </section>

      <section className={g.section}>
        <h2 className={g.heading}>設置まで頼めますか</h2>
        <p className={g.text}>
          <a href={COCONALA} className={g.link}>
            ココナラ
          </a>
          で、設置込みのご依頼もできます。複数のシートや独自の条件での設定のご相談は、 <ContactMail className={g.link} />{" "}
          へお送りください。3 営業日以内に返信します。
        </p>
      </section>
      <GuideLinks guide={guide} />
    </GuideArticle>
  );
}
