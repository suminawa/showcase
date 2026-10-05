/*
 * 悩みの言葉「Excel の名簿の重複と表記ゆれを整理する」の着地の紙。
 * 何が起きているか → 先に決める規則 → 手でやる手順 → 仕組みでやるとき → 頼む道、の順。
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

const IMAGE = "/og/sheet-app.png";
const guide = guideBySlug("excel-list-cleanup");

const COCONALA = "https://coconala.com/services/4433425";

export const metadata: Metadata = guideMetadata(guide, IMAGE);

export default function ExcelListCleanupGuide() {
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
          <span className={s.latin}>Excel List Cleanup</span>
        </h1>
        <GuideAnswer guide={guide} />
        <p className={s.lede}>{guide.lede}</p>
        <GuideByline guide={guide} />
      </header>

      <div className={s.work}>
        <section className={g.section}>
          <h2 className={g.heading}>名簿が「同じ人なのに別の行」になるのは、なぜですか</h2>
          <ul className={g.list}>
            <li>会社名の書き方が人によって違う。「(株)ABC」「株式会社ＡＢＣ」「ABC 株式会社」は、Excel には全部別の文字列です</li>
            <li>全角と半角、名字と名前の間の空白、電話番号のハイフンの有無が混ざる。見た目は同じでも一致しません</li>
            <li>メールアドレスの大文字と小文字。「Taro@Example.com」と「taro@example.com」は同じ宛先ですが、Excel の重複の削除では別扱いです</li>
          </ul>
        </section>

        <section className={g.section}>
          <h2 className={g.heading}>整理の前に、何を決めますか</h2>
          <p className={g.text}>
            規則を先に決めてから手を動かすと、途中で迷いません。あとで人に頼むときも、この規則をそのまま渡せます。
          </p>
          <ol className={g.list}>
            <li>
              <b>そろえる形</b>: 英数字と記号は半角、カタカナは全角、空白は半角 1 つ。電話番号は「03-1234-5678」のようにハイフンで区切る。メールは小文字
            </li>
            <li>
              <b>会社名の扱い</b>: 「(株)」は「株式会社」に戻す。前株（株式会社ABC）と後株（ABC株式会社）は別の会社のことがあるので、機械では並べ替えず、人が見ます
            </li>
            <li>
              <b>「同じ 1 件」と見なす列</b>: メールがあればメール、無ければ電話番号、どちらも無ければ会社名と氏名の組。この順で決めておきます
            </li>
            <li>
              <b>重複をまとめたとき、どちらを残すか</b>: 古い方を残して、新しい方の値で空欄だけ埋める、のように決めます。両方に値があって違うときは、人が見る印を付けます
            </li>
          </ol>
        </section>

        <section className={g.section}>
          <h2 className={g.heading}>Excel だけで手でやるには、どうしますか</h2>
          <ol className={g.list}>
            <li>元のシートをコピーして「作業用」を作ります。元には触りません</li>
            <li>
              作業用に列を足して、関数でそろえます。全角半角は ASC 関数、空白は TRIM と SUBSTITUTE（全角空白を半角に）、小文字は LOWER。電話番号は SUBSTITUTE でハイフンと括弧を取ってから、TEXT 関数で形を作ります
            </li>
            <li>
              そろえた列で COUNTIF を使い、2 以上の行に色を付けます。これが重複の候補です
            </li>
            <li>色の付いた行を並べ替えて並べ、どちらを残すかを規則どおりに決めて、残さない行には「削除」の印を付けます。行はまだ消しません</li>
            <li>印の付いた行を別のシートに移してから、作業用を納品の形に整えます。消した行が後から要ることがあるためです</li>
          </ol>
          <p className={g.text}>
            100 件なら、この手順で 1 時間ほどです。1,000 件を超えると、関数の列が増えて見落としが出るので、次の「仕組みでやる」方が確実です。
          </p>
        </section>

        <section className={g.section}>
          <h2 className={g.heading}>仕組みでやるときは、何が変わりますか</h2>
          <p className={g.text}>
            上の規則をそのままプログラムにすると、何千件でも同じ規則で 1 分以内に終わります。大事なのは速さより、<b>何をどう直したかが残ること</b>です。納品の形は 3 つのシートにします。
          </p>
          <ul className={g.list}>
            <li>
              <b>整理後</b>: 1 件 1 行にそろえた表
            </li>
            <li>
              <b>重複</b>: まとめた元の行と、残した行の対応。「3 行目は 2 行目と同じメールだったので、2 行目に寄せた」が分かります
            </li>
            <li>
              <b>変更ログ</b>: どのセルを、何から何に直したか。「(株)ＡＢＣ商事 → 株式会社ABC商事」のように 1 セル 1 行で並びます
            </li>
          </ul>
          <p className={g.text}>
            変更ログがあると、依頼した側は直した箇所だけを確かめればよく、全部を読み直さずに済みます。前株と後株のように機械が決めない項目は、変更ログに「要確認」として残します。
          </p>
          <figure className={g.figure}>
            <Link href="/projects/sheet-app">
              <Image
                src={IMAGE}
                alt="スプレッドシート業務アプリの見本。一覧と入力画面"
                width={1200}
                height={630}
              />
            </Link>
            <figcaption className={g.caption}>
              整理したあとの台帳を崩さずに使い続ける形は、こちらの見本で ──{" "}
              <Link href="/projects/sheet-app" className={s.textLink}>
                スプレッドシート業務アプリの見本を開く
              </Link>
            </figcaption>
          </figure>
        </section>

        <section className={g.section}>
          <h2 className={g.heading}>整理を頼めますか</h2>
          <p className={g.text}>
            名簿や顧客表の整理は、上の規則を先に文章でお見せしてから、変更ログつきの 3 シートでお納めします。100 件ほどの小さな表は ──{" "}
            <a href={COCONALA} className={s.textLink}>
              ココナラ
            </a>
            。数千件や、整理したあとに崩れない台帳まで組む場合は、
            <Link href="/guides/customer-sheet" className={s.textLink}>
              顧客管理のスプレッドシートが、いつの間にか崩れていく
            </Link>
            の形でご相談ください。
          </p>
          <p className={g.text}>
            ご相談は{" "}
            <a href="mailto:hello@suminawa.dev" className={s.textLink}>
              hello@suminawa.dev
            </a>{" "}
            へ。3 営業日以内に返信します。
          </p>
          <p className={g.text}>
            台帳を自分で持ち続けるキットは ──{" "}
            <a href={goHref("sheet-app", "booth", "/guides/excel-list-cleanup")} rel="nofollow" className={s.textLink}>
              BOOTH
            </a>
            {" / "}
            <a href={goHref("sheet-app", "note", "/guides/excel-list-cleanup")} rel="nofollow" className={s.textLink}>
              note
            </a>
          </p>
        </section>
        <GuideLinks guide={guide} />
      </div>
    </main>
  );
}
