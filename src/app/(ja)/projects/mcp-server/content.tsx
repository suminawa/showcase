/*
 * THESIS: スプレッドシートの台帳を、AI との会話から触れるようにする道具の見本（Operate）。
 *   実物の MCP サーバーはブラウザでは動かないので、キットを見本のデータで動かして記録した
 *   やり取りを、1 手ずつ再生する。見せたいのは「AI が何を呼び、何が返り、どう答えたか」。
 * OWN-WORLD: 頭（戻り・名乗り・一行）は料紙の文法そのまま。再生の中は紙の上に置いた
 *   一枚の帳面で、枠は髪の毛ほどの線一本。ツール名と引数と JSON だけが等幅の字を持つ（中身がコードだから）。
 * COLOR: 朱は戻りの落款と、「選んでいる」ことの印（問いと設定の切り替え）だけ。
 * STORY: 問いを選ぶ → ツールの呼び出しと結果 → 答え。「読むだけ／書く」を切り替えると、
 *   書くツールが一覧に出たり消えたりし、書く問いへの答えが変わる。
 * FORM: 料紙（作品ページ）— 文法は DESIGN.md
 * このページはサーバー部品のまま。再生（Replay）だけが "use client"。
 */
import Link from "next/link";

import { localSaleLabel } from "@/i18n/catalog";
import { hrefFor, type Lang } from "@/i18n/routes";
import { projects } from "@/lib/projects";

import {
  ProjectShell,
  Rich,
  ShopEmbed,
  ShopLinks,
  projectMetadata,
} from "../shell";
import s from "../projects.module.css";
import { copy } from "./copy";
import { Diagram } from "./Diagram";
import m from "./mcp-server.module.css";
import { Replay } from "./Replay";

/** キットを MCP_DEMO=1 で起こし、stdio で tools/list と tools/call を記録したもの */
const RECORDING_SRC = "/demos/mcp-server/exchanges.json";

const project = projects.find((p) => p.slug === "mcp-server");
if (!project?.sale) throw new Error("レジストリに mcp-server の sale がない");
const sale = project.sale;

export const metadataFor = (lang: Lang) =>
  projectMetadata(lang, "mcp-server", copy[lang].meta, false);

export function Content({ lang }: { lang: Lang }) {
  const t = copy[lang];
  const code = m.inlineCode;
  return (
    <ProjectShell
      lang={lang}
      slug="mcp-server"
      title={t.title}
      latin="MCP Server"
      lede={t.lede}
      head={
        <p className={`${s.lede} ${m.sale}`}>
          {localSaleLabel(lang, sale, { detail: true })}
        </p>
      }
    >
      <section className={m.section} aria-labelledby="replay-heading">
        <h2 id="replay-heading" className={m.heading}>
          {t.replayHeading}
        </h2>
        <p className={m.text}>{t.replay}</p>
        <Replay src={RECORDING_SRC} />
      </section>

      <section className={m.section} aria-labelledby="how-heading">
        <h2 id="how-heading" className={m.heading}>
          {t.howHeading}
        </h2>
        <Diagram />
        {t.how.map((text) => (
          <p key={text} className={m.text}>
            <Rich text={text} codeClass={code} />
          </p>
        ))}
      </section>

      <section className={m.section} aria-labelledby="setup-heading">
        <h2 id="setup-heading" className={m.heading}>
          {t.setupHeading}
        </h2>
        <ol className={m.steps}>
          {t.steps.map((step) => (
            <li key={step.title}>
              <span className={m.stepTitle}>{step.title}</span>
              <span className={m.stepText}>
                <Rich text={step.text} codeClass={code} />
              </span>
            </li>
          ))}
        </ol>
      </section>

      <section className={m.section} aria-labelledby="not-heading">
        <h2 id="not-heading" className={m.heading}>
          {t.notHeading}
        </h2>
        <ul className={m.list}>
          {t.not.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </section>

      <section className={m.section} aria-labelledby="buy-heading">
        <h2 id="buy-heading" className={m.heading}>
          {t.buyHeading}
        </h2>
        <p className={m.text}>
          {t.buy}
          <ShopLinks lang={lang} slug="mcp-server" linkKey="mcp-server" />
        </p>
        <ShopEmbed linkKey="mcp-server" />
        <p className={m.text}>
          {t.service}{" "}
          <Link href={hrefFor(lang, "/contact")} className={s.textLink}>
            {t.contact}
          </Link>
        </p>
      </section>
    </ProjectShell>
  );
}
