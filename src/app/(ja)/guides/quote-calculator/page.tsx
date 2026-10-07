/*
 * 検索の言葉「見積もり シミュレーター 作り方」「料金シミュレーター 作り方」「見積もり フォーム 自動 計算」の着地の紙。
 * 何が変わるか → 料金の決まりを書き出す → 手で置ける電卓（コード 1 つ）→ 端数・源泉・見積書 → 3 つの道、の順に読ませる。
 * 事実はキットの販売ページ（s1-quote-calculator）と /projects/quote-simulator の見本だけから取る。
 * FORM: 料紙（作品ページ）— 文法は DESIGN.md。朱は戻りの落款だけ。
 */
import type { Metadata } from "next";
import Link from "next/link";

import { goHref } from "@/lib/go";
import { guideBySlug } from "@/lib/guides";

import { fontVars } from "../../projects/fonts";
import s from "../../projects/projects.module.css";
import g from "../guides.module.css";
import {
  GuideAnswer,
  GuideByline,
  GuideJsonLd,
  GuideLinks,
  guideMetadata,
} from "../parts";
import { ShopEmbed } from "../../projects/shell";

const IMAGE = "/og/quote-simulator.png";
const guide = guideBySlug("quote-calculator");

const CODE = `<!-- ページの置きたい場所に貼る。単価・率・税率はご自分の料金に直す -->
<form id="quote">
  <label>時間単価（円） <input id="rate" type="number" min="0" value="5000"></label>
  <label>工数（時間） <input id="hours" type="number" min="0" value="10"></label>
  <label><input id="rush" type="checkbox"> 急ぎ（+20%）</label>
  <p id="total"></p>
</form>
<script>
  const $ = (id) => document.getElementById(id);
  const num = (id) => Math.max(0, Number($(id).value) || 0); // 空欄・負の数は 0
  const yen = (n) => n.toLocaleString('ja-JP') + ' 円';
  function update() {
    const subtotal = Math.round(num('rate') * num('hours'));
    const option = $('rush').checked ? Math.round(subtotal * 0.2) : 0;
    const net = subtotal + option;                // 税抜合計
    const tax = Math.floor((net * 10) / 100);     // 消費税 10%、端数は切り捨て
    $('total').textContent = '税込 ' + yen(net + tax) + '（うち消費税 ' + yen(tax) + '）';
  }
  $('quote').addEventListener('input', update);
  update();
</script>`;

export const metadata: Metadata = guideMetadata(guide, IMAGE);

export default function QuoteCalculatorGuide() {
  return (
    <main className={`${s.paper} ${fontVars}`}>
      <GuideJsonLd guide={guide} image={IMAGE} />
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
          <span className={s.latin}>Quote Calculator</span>
        </h1>
        <GuideAnswer guide={guide} />
        <p className={s.lede}>{guide.lede}</p>
        <GuideByline guide={guide} />
      </header>

      <div className={s.work}>
        <section className={g.section}>
          <h2 className={g.heading}>
            ホームページに見積もりシミュレーターを置くと、何が変わりますか
          </h2>
          <ul className={g.list}>
            <li>
              問い合わせの前に、相手がご自分で概算を出せる。「だいたいいくらですか」の往復が減る
            </li>
            <li>
              条件を変えるたびに内訳と合計がその場で変わるので、どのオプションでいくら上がるのかが相手に伝わる
            </li>
            <li>
              出した内訳をそのまま問い合わせのメールに入れてもらえば、どの条件の話かを取り違えない
            </li>
          </ul>
          <p className={g.text}>
            どう見えるかは、
            <Link href="/projects/quote-simulator" className={s.textLink}>
              見積もりシミュレーターの見本
            </Link>
            で試せます。時間単価・一式・オプション・消費税だけの、基本の計算をする版です。
          </p>
        </section>

        <section className={g.section}>
          <h2 className={g.heading}>料金の決まりは、どう書き出しますか</h2>
          <p className={g.text}>
            コードを書く前に、紙か表に料金の決まりを書き出します。ここが決まれば、電卓は決まりを写すだけです。
          </p>
          <ol className={g.list}>
            <li>
              小計の出し方を決める。時間単価 × 工数か、一式の金額か、項目 × 数量
              × 単価の明細か
            </li>
            <li>
              オプション（急ぎ・土日の対応など）の率と、その率を何に掛けるかを決める。小計に掛けるのがいちばん分かりやすい
            </li>
            <li>
              値引きを円で引くのか %
              で引くのか、引ける上限をどこにするのかを決める
            </li>
            <li>
              消費税の率と、1
              円未満の端数を切り捨てるのか、四捨五入か、切り上げかを決める
            </li>
            <li>
              「税抜合計 ＝ 小計 ＋ オプション − 値引き」「税込 ＝ 税抜合計 ＋
              消費税」のように、式を 1 行ずつ書く
            </li>
          </ol>
        </section>

        <section className={g.section}>
          <h2 className={g.heading}>手で置ける電卓は、どう作りますか</h2>
          <p className={g.text}>
            時間単価 × 工数に「急ぎ」のオプションと消費税を足すだけなら、下の
            HTML を 1
            つ貼れば動きます。入力のたびに計算し直し、合計を書き換えます。
          </p>
          <pre className={g.code}>
            <code>{CODE}</code>
          </pre>
          <p className={g.text}>
            消費税を「net × 0.1」と書かずに「net × 10 ÷
            100」としているのは、小数の掛け算で出る誤差で、切り捨ての結果が 1
            円ずれることを避けるためです。オプションや明細を増やすときも、1
            つの計算の中で「小計 → オプション → 値引き →
            税」の順を守ると、表示と見積書の金額がそろいます。
          </p>
          <p className={g.text}>
            オプションを増やすときは、チェックボックスを 1 つ足し、option
            の行を同じ形で足します。問い合わせにつなぐなら、内訳の文を
            encodeURIComponent で包んで mailto: のリンクの body
            に入れると、内訳が本文に入った状態でメールが開きます。
          </p>
        </section>

        <section className={g.section}>
          <h2 className={g.heading}>
            税込からの逆算や源泉徴収、見積書の PDF はどうしますか
          </h2>
          <p className={g.text}>
            電卓を仕事で使い始めると、次の 3
            つが欲しくなります。キットではこう扱っています。
          </p>
          <ul className={g.list}>
            <li>
              税込からの逆算:
              税込の金額から税額を割り戻して税抜を出す。合計は入力した税込の額と
              1 円もずれないようにする
            </li>
            <li>
              源泉徴収: 税抜合計に 10.21%（100 万円を超えた分は
              20.42%）を掛け、差し引いたお支払額まで出す
            </li>
            <li>
              見積書: 宛名・件名・発行者・有効期限の入った A4 1
              枚を、ブラウザの印刷から PDF で保存する
            </li>
          </ul>
        </section>

        <section className={g.section}>
          <h2 className={g.heading}>
            自分で組むか、キットを使うか、設定ごと頼むか
          </h2>
          <p className={g.text}>道は 3 つあります。</p>
          <ul className={g.list}>
            <li>
              自分で組む: 料金の決まりが単純なら、上の HTML
              で足ります。費用はかかりません
            </li>
            <li>
              キットを使う: 「見積もり電卓テンプレ」（¥2,980
              の買い切り）は、時間単価・一式・明細・税込からの逆算の 4
              つの方式、10% と
              8%（軽減税率）の切り替え、値引き、源泉徴収、見積書の印刷、内訳のコピー、内訳を本文に入れた問い合わせのメールまでを行います。ファイルを
              3 つ置いてコードを 4 行貼れば、ビルドなしで動きます。React
              版の部品も入っています ──{" "}
              <a
                href={goHref("s1", "booth", "/guides/quote-calculator")}
                rel="nofollow"
                className={s.textLink}
              >
                BOOTH
              </a>
              {" / "}
              <a
                href={goHref("s1", "note", "/guides/quote-calculator")}
                rel="nofollow"
                className={s.textLink}
              >
                note
              </a>
              <ShopEmbed linkKey="s1" />
            </li>
            <li>
              設定ごと頼む:
              お使いの料金表に合わせた設定と、サイトへの設置までお受けします ──{" "}
              <Link href="/contact" className={s.textLink}>
                制作のご相談
              </Link>
            </li>
          </ul>
        </section>
        <GuideLinks guide={guide} />
      </div>
    </main>
  );
}
