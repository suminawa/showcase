"use client";
/*
 * 問い合わせのメールのリンク。押されたら Vercel Web Analytics のカスタムイベント「contact」を 1 回送る。
 * 添える値は from（押された紙の道）だけ。宛先も本文も送らない。
 */
import { track } from "@vercel/analytics";
import { usePathname } from "next/navigation";

export const CONTACT_MAIL = "hello@suminawa.dev";

export function ContactMail({ className, children = CONTACT_MAIL }: { className?: string; children?: React.ReactNode }) {
  const from = usePathname();
  return (
    <a href={`mailto:${CONTACT_MAIL}`} className={className} onClick={() => track("contact", { from })}>
      {children}
    </a>
  );
}
