/*
 * 検索の言葉「問い合わせフォーム 自動返信 GAS」「Googleフォーム 自動返信メール 設定」の着地の紙。
 * なぜ要るか → Google フォームの手順（コード 1 つ）→ 自前のフォーム → 迷惑投稿と二重送信 → 通知 → 3 つの道、の順に読ませる。
 * コードの実例はキットと同じく MailApp で送り、1 日の上限を先に確かめる（packages/form-intake-gas/src/gas_mail.js）。
 * FORM: 料紙（作品ページ）— 文法は DESIGN.md。朱は戻りの落款だけ。
 */
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { goHref } from "@/lib/go";
import { guideBySlug } from "@/lib/guides";

import { fontVars } from "../../projects/fonts";
import s from "../../projects/projects.module.css";
import g from "../guides.module.css";
import { GuideAnswer, GuideByline, GuideJsonLd, GuideLinks, guideMetadata } from "../parts";

const guide = guideBySlug("form-auto-reply");

const SHOT = "/guides/form-auto-reply-email.png";
/** 設定ごと頼める出品（ココナラ ③）。名は /projects/form と同じ字にする */
const SETUP = { name: "問い合わせフォームに台帳・通知・自動返信をつけます", href: "https://coconala.com/services/4394572" };

const CODE = `// 回答先のスプレッドシートの Apps Script に貼る。トリガー「フォーム送信時」で動く
function sendAutoReply(e) {
  const answers = e.namedValues; // 質問の題 → 回答（配列）
  const to = (answers['メールアドレス'] || [''])[0].trim();
  if (to === '') return;
  if (MailApp.getRemainingDailyQuota() <= 0) return; // 今日の上限に達した
  const name = (answers['お名前'] || [''])[0];
  MailApp.sendEmail({
    to: to,
    subject: 'お問い合わせを受け付けました',
    body: name + ' 様\\n\\nお問い合わせいただきありがとうございます。\\n'
      + '内容を確認のうえ、あらためてご連絡します。\\n\\n'
      + '※ このメールは自動でお送りしています。',
    name: '（会社名）',
  });
}`;

export const metadata: Metadata = guideMetadata(guide, SHOT);

export default function FormAutoReplyGuide() {
  return (
    <main className={`${s.paper} ${fontVars}`}>
      <GuideJsonLd guide={guide} image={SHOT} />
      <div className={s.stroke} aria-hidden="true">
        <span className={`${s.ink} ${s.inkKasure}`} />
        <span className={`${s.ink} ${s.inkCore}`} />
      </div>

      <header className={s.head}>
        <Link href="/guides" className={s.back}>
          <span className={s.seal} aria-hidden="true">
            墨
          </span>
          悩みから読む へ戻る
        </Link>
        <h1 className={s.title}>
          {guide.title}
          <span className={s.latin}>Form Auto Reply</span>
        </h1>
        <GuideAnswer guide={guide} />
        <p className={s.lede}>{guide.lede}</p>
        <GuideByline guide={guide} />
      </header>

      <div className={s.work}>
        <section className={g.section}>
          <h2 className={g.heading}>なぜ問い合わせフォームに自動返信が要るのですか</h2>
          <ul className={g.list}>
            <li>送った直後に何も届かないと、送った方は届いたのかが分からず、同じ内容をもう一度送ったり、電話をかけ直したりする</li>
            <li>担当者が返事を書けるのが翌日になる日でも、受け付けたことだけは先にお伝えできる</li>
            <li>受付番号と送られた内容を返しておくと、あとで電話やメールで問い合わせを受けたときに、どの件の話かを突き合わせられる</li>
          </ul>
        </section>

        <section className={g.section}>
          <h2 className={g.heading}>Google フォームで自動返信を付けるには、どうしますか</h2>
          <p className={g.text}>
            まず、フォームの「設定」→「回答」で、メールアドレスを集める設定と、回答のコピーを送る設定で足りるかを確かめます。送られるのは回答の写しだけなので、お礼の文や会社名を入れたいときは GAS を使います。
          </p>
          <ol className={g.list}>
            <li>フォームの「回答」タブからスプレッドシートにつなぎ、そのスプレッドシートで「拡張機能」→「Apps Script」を開く</li>
            <li>下のコードを貼り、「メールアドレス」「お名前」を自分のフォームの質問の題に合わせる</li>
            <li>
              左の時計の印（トリガー）から「トリガーを追加」を押し、実行する関数に sendAutoReply、イベントのソースに「スプレッドシートから」、イベントの種類に「フォーム送信時」を選ぶ
            </li>
            <li>保存すると Google の承認画面が出るので、自分のアカウントで許可する。最後に、自分のメールアドレスで 1 件送って、返信が届くかを確かめる</li>
          </ol>
          <pre className={g.code}>
            <code>{CODE}</code>
          </pre>
          <p className={g.text}>
            メールを送る道具には MailApp と GmailApp があります。MailApp は送ることしかできないぶん、承認画面で求める権限が狭くて済みます。GmailApp は受信箱を読んだり下書きを作ったりもできるので、広い権限を求めます。自動返信だけなら MailApp で足ります。どちらを使っても 1 日に送れる数には上限があり、無料の Google アカウントでは 100 通ほどです。コードの途中で残りの数を確かめているのは、このためです。
          </p>
        </section>

        <section className={g.section}>
          <h2 className={g.heading}>自動返信が届かないときは、どこを確かめますか</h2>
          <p className={g.text}>
            Google フォームの自動返信が届かないときの原因は、ほぼ次の 6 つのどれかです。上から順に確かめると、たいてい 5 分で見つかります。
          </p>
          <ol className={g.list}>
            <li>
              <b>トリガーの種類</b>: 「イベントの種類」が「フォーム送信時」になっているかを見ます。「編集時」や「変更時」では、回答が入っても関数は動きません。「イベントのソース」は、スプレッドシートに貼ったコードなら「スプレッドシートから」です。
            </li>
            <li>
              <b>承認</b>: トリガーを作ったあとに Google の承認画面を閉じてしまうと、トリガーは残っていても実行のたびに失敗します。Apps Script の左の「実行数」を開き、赤い「失敗」が並んでいたら、関数を一度手で実行して承認をやり直します。
            </li>
            <li>
              <b>質問の題とコードの食い違い</b>: コードは、回答を質問の題で探します。フォームの質問が「ご連絡先（メール）」なら、コードの「メールアドレス」もそのとおりに書き換えます。フォームの設定で集めたアドレスは、スプレッドシートでは「メールアドレス」という列に入ります。
            </li>
            <li>
              <b>1 日の上限</b>: 無料の Google アカウントは 1 日 100 通ほどで止まります。上のコードは残りが 0 なら送らずに終わるので、「実行数」では成功に見えます。テスト送信を繰り返した日は、翌日まで待つか、別のアカウントで試します。
            </li>
            <li>
              <b>迷惑メールの箱</b>: 送信元は自分の Gmail なので、受け取る側の会社のメールが弾くことがあります。届かないと言われたら、まず相手の迷惑メールの箱を見てもらい、件名に会社名を入れて、本文に URL をいくつも並べないようにします。
            </li>
            <li>
              <b>二重のトリガー</b>: フォーム側とスプレッドシート側の両方にトリガーを作ると、同じ返信が 2 通届きます。片方を消します。
            </li>
          </ol>
          <p className={g.text}>
            どれにも当てはまらないときは、「実行数」の失敗の行を開くと、エラーの文が出ます。そこに「権限」とあれば承認、「undefined」とあれば質問の題の食い違いです。
          </p>
        </section>

        <section className={g.section}>
          <h2 className={g.heading}>ホームページの自前のフォームでは、どうしますか</h2>
          <p className={g.text}>
            Google フォームと違い、送信を受け取る先（受け口）を自分で用意します。GAS のスクリプトをウェブアプリとして公開すると URL が 1 つでき、フォームの送信先をその URL にすると、送信のたびに doPost という関数が呼ばれます。doPost の中でスプレッドシートに 1 行書き、上と同じように MailApp で返信を送ります。
          </p>
          <p className={g.text}>
            つまずきやすい点が 1 つあります。フォームから JSON を送るときに Content-Type を application/json にすると、ブラウザが送信の前に許可を問い合わせます。GAS のウェブアプリはこれに答えられないため、内容が届きません。text/plain にすれば、中身は同じ JSON のまま届きます。公開のしかた、承認画面の進み方、そのまま使えるフォームの HTML は、キットの手順書に入れています。
          </p>
          <figure className={g.figure}>
            <Link href="/projects/form">
              <Image
                src={SHOT}
                alt="フォーム受付 GAS キットの自動返信メール。件名に受付番号が入り、本文に送られた名前・メールアドレス・お問い合わせの内容が並ぶ"
                width={1324}
                height={425}
              />
            </Link>
            <figcaption className={g.caption}>
              キットの自動返信には、受付番号と送られた内容が入ります ──{" "}
              <Link href="/projects/form" className={s.textLink}>
                フォーム受付の見本を開く
              </Link>
            </figcaption>
          </figure>
        </section>

        <section className={g.section}>
          <h2 className={g.heading}>迷惑投稿と二重送信は、どう防ぎますか</h2>
          <p className={g.text}>
            自動返信を付けると、迷惑投稿や送信ボタンの連打にもメールを返してしまい、1 日の上限を早く使い切ります。キットでは次の 4 つで防いでいます。
          </p>
          <ul className={g.list}>
            <li>
              人には見えない欄を 1 つ置き、そこに字が入った送信は記録も返信もしない。弾かれたと分かると bot は形を変えて送り直してくるので、フォームには受け付けたときと同じ形の返事を返す
            </li>
            <li>同じ中身の送信が 10 分以内に届いたら、シートに書かず、前回の受付番号をそのまま返す。鍵は CacheService に 10 分だけ置く</li>
            <li>同時に 2 件届いても、LockService で 1 件ずつ処理して、受付番号が重ならないようにする</li>
            <li>1 項目は 2,000 字まで、1 回の送信は 30 項目までにして、それを超える送信は断る</li>
          </ul>
        </section>

        <section className={g.section}>
          <h2 className={g.heading}>Slack や LINE への通知も同時に付けるには、どうしますか</h2>
          <p className={g.text}>
            自動返信を送る関数の中で、UrlFetchApp から Slack の Incoming Webhook の URL へ送ると、社内への通知も 1 件ごとに届きます。LINE に送るなら、LINE 公式アカウントのチャネルアクセストークン（長期）を使います。
          </p>
          <p className={g.text}>
            キットでは、通知先を設定シートで slack・discord・line から選びます。カンマで区切って並べると、同じ 1 件が両方に届きます。メールの上限に達した日は自動返信を送らず、通知の末尾に「自動返信は本日の上限に達したため送っていません」と足すので、返信が届いていない件を人が拾えます。設定の書き間違いで処理できなかったときも、通知先にエラーが 1 通届きます。
          </p>
        </section>

        <section className={g.section}>
          <h2 className={g.heading}>自分で組むか、キットを使うか、設定ごと頼むか</h2>
          <p className={g.text}>道は 3 つあります。</p>
          <ul className={g.list}>
            <li>自分で組む: Google フォームに返信を付けるだけなら、上のコードとトリガーで足ります。費用はかかりません</li>
            <li>
              キットを使う: 「フォーム受付 GAS キット」（¥3,480 の買い切り）は、ホームページのフォームの受け口として、受付シートへの記録、受付番号、Slack や LINE への通知、自動返信、迷惑投稿と二重送信の防止までを行います。貼るのは Code.gs と appsscript.json の 2 ファイルで、設定は 20 分ほどです ──{" "}
              <a href={goHref("s3", "booth", "/guides/form-auto-reply")} rel="nofollow" className={s.textLink}>
                BOOTH
              </a>
              {" / "}
              <a href={goHref("s3", "note", "/guides/form-auto-reply")} rel="nofollow" className={s.textLink}>
                note
              </a>
            </li>
            <li>
              設定ごと頼む: ココナラの「
              <a href={SETUP.href} className={s.textLink}>
                {SETUP.name}
              </a>
              」（30,000 円・7 日）で、お使いのフォームのつなぎ替えから動作確認、手順書までお受けします
            </li>
          </ul>
        </section>
        <GuideLinks guide={guide} />
      </div>
    </main>
  );
}
