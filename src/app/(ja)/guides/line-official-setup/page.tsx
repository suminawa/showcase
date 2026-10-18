/*
 * 悩みの言葉「LINE 公式アカウントのあいさつ・自動応答・リッチメニューを、初期のまま止めない」の着地の紙。
 * 困ること → 見本で何が変わるか → 自分で組む手順（記事）→ キット → 設定・設置のご依頼、の順に読ませる。
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

const IMAGE = "/og/ai-concierge.png";
const guide = guideBySlug("line-official-setup");

const NOTE_ARTICLE = "https://note.com/suminawa/n/nb152a484b12a";
const AI_GUIDE = "/guides/line-auto-reply";
const COCONALA = "https://coconala.com/services/4416823";
const LANCERS = "https://www.lancers.jp/menu/detail/1345031";

export const metadata: Metadata = guideMetadata(guide, IMAGE);

export default function LineOfficialSetupGuide() {
  return (
    <GuideArticle guide={guide} image={IMAGE}>
        <section className={g.section}>
          <h2 className={g.heading}>初期のままだと、何が困りますか</h2>
          <ul className={g.list}>
            <li>
              友だち追加で届くのが、初期のあいさつ「最新情報を定期的に配信」のまま
            </li>
            <li>
              何を送っても「個別のお問い合わせを受け付けておりません」と返ってしまう
            </li>
            <li>リッチメニューが空で、料金や予約の案内にたどり着けない</li>
          </ul>
        </section>

        <section className={g.section}>
          <h2 className={g.heading}>AI の窓口をつなぐと、どう変わりますか</h2>
          <p className={g.text}>
            キーワード応答は、届いた文が登録した言葉と完全に一致したときだけ返ります。「料金を教えて」「いくらですか」は外れます。AI
            の窓口をつなぐと、こうした言い換えを含む質問にも、自社の文書の範囲で答え、根拠にした文書の題名を添えます。資料に無いことは担当者へ引き継ぎます。
          </p>
          <figure className={g.figure}>
            <Link href="/projects/ai-concierge">
              <Image
                src="/og/ai-concierge.png"
                alt="AI 案内窓口の見本。質問に資料の範囲で答え、根拠を添える"
                width={1200}
                height={630}
              />
            </Link>
            <figcaption className={g.caption}>
              答え方はその場で試せます ──{" "}
              <Link href="/projects/ai-concierge" className={g.link}>
                AI 案内窓口の見本を開く
              </Link>
            </figcaption>
          </figure>
        </section>

        <section className={g.section}>
          <h2 className={g.heading}>Manager だけで組むには、どうしますか</h2>
          <ul className={g.list}>
            <li>
              「応答設定」で、チャット（手で返す）と応答メッセージ（自動で返す）の両方をオンにする
            </li>
            <li>
              「あいさつメッセージ」を、何を送るアカウントか・次にしてほしいこと・返事の目安の順に書き換える
            </li>
            <li>
              「リッチメニュー」は大（2500×1686）の 6
              分割。ページを開かせるものはリンク、LINE
              の中で答えるものはテキスト動作にする
            </li>
            <li>
              「応答メッセージ」のキーワードは完全一致なので、1
              つの返答に言い換えを並べ、一律応答も受け付けの文に書き換える
            </li>
          </ul>
          <p className={g.text}>
            実際の設定の値と落とし穴は、note の記事{" "}
            <a href={NOTE_ARTICLE} className={g.link}>
              「{guide.title}」
            </a>
            に書きました。AI に答えさせる側の組み方は{" "}
            <Link href={AI_GUIDE} className={g.link}>
              「LINE 公式アカウントの問い合わせに、自社の資料だけで答えさせる」
            </Link>
            をご覧ください。
          </p>
          <NoteEmbed url={NOTE_ARTICLE} />
        </section>

        <section className={g.section}>
          <h2 className={g.heading}>そのまま使えるキットはありますか</h2>
          <p className={g.text}>
            LINE 公式アカウントに AI の窓口をつなぐ部品を「LINE
            案内窓口キット」として販売しています（定価 ¥12,800
            の買い切り）。Messaging API と Webhook の設定、置き場所（Vercel
            など）、Anthropic の API の鍵はご自身で用意し、API
            の利用料が別にかかります。キットを使うときは、Manager
            の応答メッセージとあいさつメッセージはオフにします。 ──{" "}
            <a
              href={goHref(
                "line-concierge",
                "booth",
                "/guides/line-official-setup",
              )}
              rel="nofollow"
              className={g.link}
            >
              BOOTH
            </a>
            {" / "}
            <a
              href={goHref(
                "line-concierge",
                "note",
                "/guides/line-official-setup",
              )}
              rel="nofollow"
              className={g.link}
            >
              note
            </a>
          </p>
        </section>

        <section className={g.section}>
          <h2 className={g.heading}>設定・設置のご依頼</h2>
          <p className={g.text}>
            文書の整理・置き場所への設置・LINE
            公式アカウントの設定（チャネル、Webhook、応答設定）まで、こちらで行うこともできます。
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
