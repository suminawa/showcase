/*
 * 悩みの言葉「顧客管理のスプレッドシートが、いつの間にか崩れていく」の着地の紙。
 * 困ること → 見本で何が変わるか → 自分で組む手順（記事）→ キット → 導入代行、の順に読ませる。
 * FORM: 方眼（DESIGN.md）。枠は ../parts の GuideArticle。
 */
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { NoteEmbed } from "@/components/note/NoteEmbed";
import { goHref } from "@/lib/go";
import { guideBySlug } from "@/lib/guides";

import g from "../guides.module.css";
import { GuideArticle, GuideLinks, guideMetadata } from "../parts";
import { ContactMail } from "@/components/track/ContactMail";

const IMAGE = "/og/sheet-app.png";
const guide = guideBySlug("customer-sheet");

const NOTE_ARTICLE = "https://note.com/suminawa/n/n523660b792fe";
const ZENN_ARTICLE = "https://zenn.dev/suminawa/articles/e97396f937857f";
const COCONALA = "https://coconala.com/services/4414516";
const LANCERS = "https://www.lancers.jp/menu/detail/1344800";

export const metadata: Metadata = guideMetadata(guide, IMAGE);

export default function CustomerSheetGuide() {
  return (
    <GuideArticle guide={guide} image={IMAGE}>
        <section className={g.section}>
          <h2 className={g.heading}>
            顧客管理のスプレッドシートは、どう崩れていくのですか
          </h2>
          <ul className={g.list}>
            <li>
              「株式会社」と「(株)」、ハイフンの有無が混ざり、検索しても見つからない
            </li>
            <li>
              担当者が変わるたびに同じお客さまが新しい行で登録され、どちらが正しいか分からない
            </li>
            <li>
              一部の列だけで並べ替えて電話番号がずれる。2
              人が同時に直すと後の人の内容だけが残る
            </li>
          </ul>
        </section>

        <section className={g.section}>
          <h2 className={g.heading}>
            表のまま入力の画面を足すと、何が変わりますか
          </h2>
          <p className={g.text}>
            台帳はスプレッドシートのまま、入力と閲覧の画面を 1
            枚足します。「定義」シートに書いた列の型と選択肢から画面が組み上がるので、入力の形がそろいます。保存のときに更新日時を照合して上書きを止め、削除は別シートに残します。スマートフォンでは表がカード表示に変わります。
          </p>
          <figure className={g.figure}>
            <Link href="/projects/sheet-app">
              <Image
                src="/og/sheet-app.png"
                alt="スプレッドシート業務アプリの見本。表の一覧・検索・登録の画面"
                width={1200}
                height={630}
              />
            </Link>
            <figcaption className={g.caption}>
              見本はその場で試せます ──{" "}
              <Link href="/projects/sheet-app" className={g.link}>
                スプレッドシート業務アプリの見本を開く
              </Link>
            </figcaption>
          </figure>
        </section>

        <section className={g.section}>
          <h2 className={g.heading}>崩れない台帳は、どう作りますか</h2>
          <ul className={g.list}>
            <li>
              見出しを固定し、左端に「20260926-001」のような ID の列を作る
            </li>
            <li>
              状態や担当者は「データの入力規則」でプルダウンに、電話番号と郵便番号は「書式なしテキスト」にする
            </li>
            <li>
              右端に「更新日時」と「更新者」、COUNTIF で重複に色を付ける列を足す
            </li>
            <li>
              並べ替えはフィルタから行い、行は消さずに状態を「削除」にし、共有は名前を指定する
            </li>
          </ul>
          <p className={g.text}>
            詳しい手順は note の記事{" "}
            <a href={NOTE_ARTICLE} className={g.link}>
              「{guide.title}」
            </a>
            に、Google Apps Script での実装は Zenn の記事{" "}
            <a href={ZENN_ARTICLE} className={g.link}>
              「Google Apps Script で顧客管理の画面を作る」
            </a>
            に書きました。
          </p>
          <NoteEmbed url={NOTE_ARTICLE} />
        </section>

        <section className={g.section}>
          <h2 className={g.heading}>そのまま使えるキットはありますか</h2>
          <p className={g.text}>
            見本と同じものを「スプレッドシート業務アプリ
            キット」として販売しています（定価 ¥9,800
            の買い切り）。一覧・検索・絞り込み・登録・編集・削除・CSV
            出力の画面と、顧客管理・案件管理・在庫管理の見本、LINE・Slack・Discord
            への通知が入っています。 ──{" "}
            <a
              href={goHref("sheet-app", "booth", "/guides/customer-sheet")}
              rel="nofollow"
              className={g.link}
            >
              BOOTH
            </a>
            {" / "}
            <a
              href={goHref("sheet-app", "note", "/guides/customer-sheet")}
              rel="nofollow"
              className={g.link}
            >
              note
            </a>
          </p>
        </section>

        <section className={g.section}>
          <h2 className={g.heading}>設定や設置まで頼めますか</h2>
          <p className={g.text}>
            お使いの表に合わせた定義づくり・画面の配置・通知の設定まで、こちらで行うこともできます。
            ──{" "}
            <a href={COCONALA} className={g.link}>
              ココナラ
            </a>
            {" / "}
            <a href={LANCERS} className={g.link}>
              ランサーズ
            </a>
          </p>
          <p className={g.text}>
            ご相談は{" "}
            <ContactMail className={g.link} />{" "}
            へ。3 営業日以内に返信します。
          </p>
        </section>
        <GuideLinks guide={guide} />
    </GuideArticle>
  );
}
