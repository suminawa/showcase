"use client";

/*
 * 余白の索引の、水盤と連動する部分だけ。
 *
 * hover と focus は**完全に同一**の連動を起こす（キーボードだけの人と
 * ポインタの人が同じものを見る）。pointerdown も同じ強調を即座に立てる。
 * 逆向きに、水面をホバーされたときも同じ状態でこちらが光る。
 */

import Link from "next/link";
import { useSyncExternalStore } from "react";
import {
  IDLE_BASIN_FOCUS,
  clearBasinFocus,
  getBasinFocus,
  setBasinFocus,
  subscribeBasinFocus,
} from "./basinBridge";

const SUMI = "var(--sumi, #14171b)";
const SUMI_SOFT = "var(--sumi-soft, #5a564c)";
/** 素水のスウォッチの輪郭。顔料ではないので paper 寄りの灰 */
const UNDYED_LINE = "#a8a49a";

/** その species が今どこか（索引・水面・登場演出）で強調されているか */
function useBasinLit(species: number): boolean {
  const focus = useSyncExternalStore(
    subscribeBasinFocus,
    getBasinFocus,
    () => IDLE_BASIN_FOCUS,
  );
  return focus.species === species && focus.amount > 0;
}

/**
 * カテゴリ見出しの縦棒スウォッチ。3px × 1.6em。丸にしない。
 * 意味はテキスト（「藍 SITES」）が持つので `aria-hidden`。
 * 対提示では 320ms で満ちる。
 */
export function BasinSwatch({
  species,
  tone,
}: {
  species: number;
  /** 顔料の色。null = 素水（輪郭だけ） */
  tone: string | null;
}) {
  const lit = useBasinLit(species);
  const undyed = tone === null;
  return (
    <span
      aria-hidden="true"
      className="relative inline-block h-[1.6em] w-[3px] shrink-0 align-middle"
      style={
        undyed
          ? { border: `1px solid ${UNDYED_LINE}` }
          : {
              backgroundColor: `color-mix(in srgb, ${tone} 28%, transparent)`,
            }
      }
    >
      <span
        className="absolute inset-x-0 bottom-0 transition-[height] duration-[320ms] ease-out motion-reduce:transition-none"
        style={{
          height: lit ? "100%" : "0%",
          backgroundColor: undyed
            ? `color-mix(in srgb, ${UNDYED_LINE} 45%, transparent)`
            : (tone ?? "transparent"),
        }}
      />
    </span>
  );
}

/**
 * 作品名のリンク。**常時 1px・35% の下線**を敷く — 静止状態で「押せる」と
 * 分かる唯一の条件。強調で下線が 100%、ウェイトが 600 になる。
 */
export function BasinIndexItem({
  species,
  href,
  children,
}: {
  species: number;
  href: string;
  children: React.ReactNode;
}) {
  const lit = useBasinLit(species);
  const light = () => setBasinFocus(species, "index", 1);
  const unlight = () => clearBasinFocus("index");

  return (
    <Link
      href={href}
      onPointerEnter={light}
      onFocus={light}
      onPointerDown={light}
      onPointerLeave={unlight}
      onBlur={unlight}
      className="inline-block text-[1.0625rem] leading-[1.5] transition-[font-weight,border-color] duration-[220ms] ease-out focus-visible:outline-2 focus-visible:outline-offset-[3px] motion-reduce:transition-none"
      style={{
        color: SUMI,
        fontWeight: lit ? 600 : 400,
        borderBottom: `1px solid ${
          lit ? SUMI : `color-mix(in srgb, ${SUMI} 35%, transparent)`
        }`,
        outlineColor: SUMI,
      }}
    >
      {children}
    </Link>
  );
}

/**
 * 素水（GAMES）の一節。リンクではないので `aria-disabled` も置かない。
 * 索引側からのホバーにだけ、水面が応える。
 */
export function BasinIndexNote({
  species,
  children,
}: {
  species: number;
  children: React.ReactNode;
}) {
  return (
    <p
      onPointerEnter={() => setBasinFocus(species, "index", 1)}
      onPointerLeave={() => clearBasinFocus("index")}
      className="max-w-[42ch] text-[0.9375rem] leading-[1.9]"
      style={{ color: SUMI_SOFT }}
    >
      {children}
    </p>
  );
}
