import type { Metadata } from "next";
import Link from "next/link";
import { QuoteSimulator } from "@/components/quote-simulator/QuoteSimulator";

export const metadata: Metadata = {
  title: "見積もりシミュレーター",
  description:
    "作業条件を入力すると、見積もりの内訳と合計がリアルタイムで見える電卓",
};

export default function QuoteSimulatorPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <Link
        href="/"
        className="text-sm text-neutral-500 transition-colors hover:text-neutral-900"
      >
        ← Showcase
      </Link>
      <h1 className="mt-6 text-3xl font-bold tracking-tight">
        見積もりシミュレーター
      </h1>
      <p className="mt-2 text-neutral-500">
        条件を入れると、その場で見積もりの内訳が見えます。
      </p>
      <div className="mt-10">
        <QuoteSimulator />
      </div>
    </main>
  );
}
