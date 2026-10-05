/*
 * 悩みの言葉「会議や取材の録音を、外部に出さずに文字起こしする」の着地の紙。
 * なぜ外に出したくないか → 手元で動かす道具 → 段取り（機械 → 人 → 書式）→ 頼む道、の順。
 * FORM: 料紙（作品ページ）— 文法は DESIGN.md。朱は戻りの落款だけ。
 */
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { guideBySlug } from "@/lib/guides";

import { fontVars } from "../../projects/fonts";
import s from "../../projects/projects.module.css";
import g from "../guides.module.css";
import { GuideAnswer, GuideByline, GuideJsonLd, GuideLinks, guideMetadata } from "../parts";

const IMAGE = "/og/doc-reader.png";
const guide = guideBySlug("local-transcription");

const COCONALA = "https://coconala.com/services/4433425";

export const metadata: Metadata = guideMetadata(guide, IMAGE);

export default function LocalTranscriptionGuide() {
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
          <span className={s.latin}>Local Transcription</span>
        </h1>
        <GuideAnswer guide={guide} />
        <p className={s.lede}>{guide.lede}</p>
        <GuideByline guide={guide} />
      </header>

      <div className={s.work}>
        <section className={g.section}>
          <h2 className={g.heading}>録音を外部のサービスに上げたくないのは、どんなときですか</h2>
          <ul className={g.list}>
            <li>社内会議や面接、取材の録音に、人の名前や取引先の話が入っている</li>
            <li>相手に「録音は外に出しません」と約束している</li>
            <li>文字起こしのサービスは便利だが、どこに保存され、いつ消えるのかが契約書を読まないと分からない</li>
          </ul>
        </section>

        <section className={g.section}>
          <h2 className={g.heading}>手元のパソコンだけで書き起こすには、何を使いますか</h2>
          <p className={g.text}>
            公開されている音声認識のモデル（Whisper）を、手元のパソコンで動かします。音声はパソコンから出ません。Apple シリコンの Mac なら、mlx-whisper という道具で、音声の長さの 4 分の 1 ほどの時間で書き起こせます。60 分の録音なら 15 分前後です。Windows でも同じモデルを動かす道具があり、速さは機械の性能で変わります。
          </p>
          <ol className={g.list}>
            <li>録音を 16 kHz のモノラルの音声に変換します（ffmpeg という無料の道具で 1 行）</li>
            <li>モデルは「large-v3-turbo」を選びます。日本語の精度と速さの釣り合いがよく、初回だけモデルの取得（1.6 GB ほど）があります</li>
            <li>出力は、開始と終了の時刻がついた区間の並びです。これを Excel や Word に流し込みます</li>
          </ol>
          <p className={g.text}>
            精度の癖は、固有名詞が崩れることです。会社名や商品名、人名は聞いて直す前提にします。数字と敬体の文は安定しています。
          </p>
        </section>

        <section className={g.section}>
          <h2 className={g.heading}>納品までの段取りは、どう組みますか</h2>
          <ol className={g.list}>
            <li>
              <b>機械で起こす</b>: 時刻つきの区間を Excel（開始・終了・話者・本文・備考の 5 列）と SRT に出します。話者の列は空欄にしておきます
            </li>
            <li>
              <b>聞きながら直す</b>: 固有名詞、言い直し、相づちを直し、話者の列を埋めます。60 分の対談で 2〜3 時間。ここが仕上がりを決めます
            </li>
            <li>
              <b>指定の書式へ</b>: 依頼主の書式（Word の段落、1 分ごとの時刻、発言者の見出しなど）に合わせて整えます。SRT は字幕にそのまま使えます
            </li>
          </ol>
          <p className={g.text}>
            「ケバ取り」（えー、あの、を消す）や「整文」（話し言葉を書き言葉に直す）をどこまでやるかは、始める前に決めます。取材記事の素材なら整文まで、議事録なら発言のまま、が多いです。
          </p>
          <figure className={g.figure}>
            <Link href="/projects/doc-reader">
              <Image
                src={IMAGE}
                alt="AI 書類読み取りの見本。読み取った項目と検算の画面"
                width={1200}
                height={630}
              />
            </Link>
            <figcaption className={g.caption}>
              書類の読み取りも同じ考え方（機械で読む → 人が確かめる）です ──{" "}
              <Link href="/projects/doc-reader" className={s.textLink}>
                AI 書類読み取りの見本を開く
              </Link>
            </figcaption>
          </figure>
        </section>

        <section className={g.section}>
          <h2 className={g.heading}>文字起こしを頼めますか</h2>
          <p className={g.text}>
            録音を外部に送らず、手元で起こして、時刻つきの Excel と Word、字幕用の SRT でお納めします。固有名詞と話者は聞きながら直します。 ──{" "}
            <a href={COCONALA} className={s.textLink}>
              ココナラ
            </a>
          </p>
          <p className={g.text}>
            会議の録音から決定事項と宿題を分けた議事録まで作る形は、
            <Link href="/guides/inbox-triage" className={s.textLink}>
              問い合わせメールの仕分け
            </Link>
            と同じ「機械で読んで人が確かめる」組み方です。ご相談は{" "}
            <a href="mailto:hello@suminawa.dev" className={s.textLink}>
              hello@suminawa.dev
            </a>{" "}
            へ。3 営業日以内に返信します。
          </p>
        </section>
        <GuideLinks guide={guide} />
      </div>
    </main>
  );
}
