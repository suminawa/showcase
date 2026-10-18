/*
 * 検索の言葉「スプレッドシート アプリ化」「gas webアプリ サンプル」の着地の紙。
 * 何が変わるか → 表を整える → Web アプリを手で公開する（コード 2 つ）→ 同時の更新と数式 → 3 つの道、の順に読ませる。
 * 事実はキットの販売ページ（sheet-app-gas）と /projects/sheet-app の見本だけから取る。
 * FORM: 方眼（DESIGN.md）。枠は ../parts の GuideArticle。
 */
import type { Metadata } from "next";

import { goHref } from "@/lib/go";
import { guideBySlug } from "@/lib/guides";

import g from "../guides.module.css";
import { NoteEmbed } from "@/components/note/NoteEmbed";
import { GuideArticle, GuideLinks, guideMetadata } from "../parts";
import { ShopEmbed } from "../../projects/shell";

const PRODUCT_NOTE = "https://note.com/suminawa/n/n206d0f5b8324";

const IMAGE = "/og/sheet-app.png";
const guide = guideBySlug("spreadsheet-app");

/** 設定ごと頼める出品。customer-sheet と同じ */
const COCONALA = "https://coconala.com/services/4414516";
const LANCERS = "https://www.lancers.jp/menu/detail/1344800";

const CODE_GS = `// コード.gs ── 開いた人に index.html の画面を返し、シートの中身を渡す
function doGet() {
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('顧客一覧')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function getRows() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('顧客');
  return sheet.getDataRange().getDisplayValues(); // 1 行目は見出し
}`;

const CODE_HTML = `<!-- index.html ── 1 行を 1 つの項目にして並べる -->
<ul id="list"></ul>
<script>
  google.script.run.withSuccessHandler(function (rows) {
    const list = document.getElementById('list');
    rows.slice(1).forEach(function (row) {
      const li = document.createElement('li');
      li.textContent = row.join(' / '); // 文字として出す
      list.appendChild(li);
    });
  }).getRows();
</script>`;

export const metadata: Metadata = guideMetadata(guide, IMAGE);

export default function SpreadsheetAppGuide() {
  return (
    <GuideArticle guide={guide} image={IMAGE}>
        <section className={g.section}>
          <h2 className={g.heading}>
            スプレッドシートをアプリ化すると、何が変わりますか
          </h2>
          <ul className={g.list}>
            <li>
              スマートフォンの小さな画面でも、表を横に送らずに 1 件ずつ読める
            </li>
            <li>
              入力は画面の欄から行うので、関数の入ったセルや見出しを誤って消されない。必須の欄を空のまま保存させないこともできる
            </li>
            <li>見るだけの人と、登録や修正をする人を分けられる</li>
          </ul>
          <p className={g.text}>
            台帳はスプレッドシートのまま残るので、これまでどおりシートを直接開いて直すこともできます。
          </p>
        </section>

        <section className={g.section}>
          <h2 className={g.heading}>アプリにする前に、表をどう整えますか</h2>
          <p className={g.text}>
            画面を作る前に、表の形をそろえておきます。ここまではコードを書かずにできます。
          </p>
          <ol className={g.list}>
            <li>「顧客」「案件」のように、1 つの表を 1 つのシートに置く</li>
            <li>
              1
              行目を見出しにする。画面が見出しの名前で列を探す作りにすれば、列の順番を入れ替えても崩れない
            </li>
            <li>
              左端に ID の列を作り、1 行に 1
              つの番号を振る。同じ名前のお客さまがいても、どの行かを取り違えない
            </li>
            <li>
              状態や担当者のように決まった言葉しか入らない列は、プルダウンにしておく
            </li>
          </ol>
        </section>

        <section className={g.section}>
          <h2 className={g.heading}>GAS の Web アプリは、どう公開しますか</h2>
          <p className={g.text}>
            スプレッドシートの「拡張機能」→「Apps Script」を開き、下の 2
            つを貼ります。index.html は、ファイルの「+」→「HTML」で、index
            という名前で作ります。シート名の「顧客」は、ご自分の表に合わせて直してください。
          </p>
          <pre className={g.code}>
            <code>{CODE_GS}</code>
          </pre>
          <pre className={g.code}>
            <code>{CODE_HTML}</code>
          </pre>
          <ol className={g.list}>
            <li>
              「デプロイ」→「新しいデプロイ」→
              種類の歯車から「ウェブアプリ」を選ぶ
            </li>
            <li>
              「次のユーザーとして実行」を「ウェブアプリにアクセスしているユーザー」、「アクセスできるユーザー」を「Google
              アカウントを持つ全員」にしてデプロイする
            </li>
            <li>
              表示された URL
              をスマートフォンで開き、承認の画面で許可すると一覧が出る
            </li>
          </ol>
          <p className={g.text}>
            開いた人の権限で動くので、スプレッドシートを共有していない人には中身が見えません。見せたい人には、スプレッドシートを閲覧者か編集者として共有します。値を
            getDisplayValues
            で文字として受け取っているのは、日付をシートの表示のまま渡すためです。
          </p>
        </section>

        <section className={g.section}>
          <h2 className={g.heading}>
            画面から書き込むとき、何に気をつけますか
          </h2>
          <p className={g.text}>
            一覧を出すだけなら上の 2
            つで足ります。登録や編集もできるようにするときは、次の 3
            つでつまずきます。
          </p>
          <ul className={g.list}>
            <li>
              2 人が同時に保存すると、後の人の内容で上書きされる。LockService
              で書き込みを 1
              件ずつにし、保存の前にその行が他の人に直されていないかを確かめる
            </li>
            <li>
              「=」で始まる値をそのまま書くと、シートで数式として動いてしまう。先頭に「&apos;」を付けるなどして、文字として保存する
            </li>
            <li>
              シートの値を画面に出すときは、上のコードのように textContent
              で文字として入れる。HTML
              として入れると、シートに書かれた文字がプログラムとして動くことがある
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
              自分で組む:
              一覧を見るだけなら、上のコードと公開の手順で足ります。費用はかかりません
            </li>
            <li>
              キットを使う: 「スプレッドシート業務アプリ キット」（¥9,800
              の買い切り）は、「定義」シートに列の名前と型を書くだけで、一覧・検索・絞り込み・登録・編集・削除・CSV
              出力の画面を組みます。幅の狭い画面では表がカードに切り替わり、権限は共有設定のまま効きます。顧客管理・案件管理・在庫管理の見本が入っていて、貼るのは
              3 ファイル、置くのは 10 分ほどです ──{" "}
              <a
                href={goHref("sheet-app", "booth", "/guides/spreadsheet-app")}
                rel="nofollow"
                className={g.link}
              >
                BOOTH
              </a>
              {" / "}
              <a
                href={goHref("sheet-app", "note", "/guides/spreadsheet-app")}
                rel="nofollow"
                className={g.link}
              >
                note
              </a>
              <ShopEmbed linkKey="sheet-app" />
            </li>
            <li>
              設定ごと頼む:
              お使いの表に合わせた定義づくりと権限の設定、スマートフォンでの確認まで、こちらでお受けします
              ──{" "}
              <a href={COCONALA} className={g.link}>
                ココナラ
              </a>
              {" / "}
              <a href={LANCERS} className={g.link}>
                ランサーズ
              </a>
            </li>
          </ul>
          <NoteEmbed url={PRODUCT_NOTE} />
        </section>
        <GuideLinks guide={guide} />
    </GuideArticle>
  );
}
