"use client";

/**
 * 開発専用: 墨流しの静止画をソルバから書き出す。
 * rAF ではなく同期ループで step/render するので、背面タブでも確実に生成できる。
 * 画像を作り終えたらこのディレクトリごと削除する。
 */
import { useCallback, useRef, useState } from "react";
import {
  FluidSimulation,
  INK_ABSORPTION,
  UNDYED,
} from "@/components/suminagashi/fluid/simulation";

type Recipe = {
  name: string;
  w: number;
  h: number;
  /** 落とす滴。x/y は 0..1、species は 0=墨 1=藍 */
  drops: Array<{ x: number; y: number; s: number; r: number }>;
  /** 風を通す回数と強さ */
  fans: Array<{ at: number; strength: number; phase: number }>;
  /** 渦を立てる（中心, 半径, 強さ） */
  stirs: Array<{ at: number; cx: number; cy: number; radius: number; force: number }>;
  frames: number;
  /** 染料の拡散。上げるほど霧に近づく */
  dye: number;
};

/** 中心付近へ交互に落として輪を育てる。angle/spread でばらけさせる */
function ring(
  count: number,
  cx: number,
  cy: number,
  spread: number,
  r: number,
  startSpecies = 0,
): Recipe["drops"] {
  return Array.from({ length: count }, (_, i) => ({
    x: cx + Math.sin(i * 12.9898) * spread,
    y: cy + Math.cos(i * 7.233) * spread,
    s: startSpecies,
    r,
  }));
}

const RECIPES: Recipe[] = [
  {
    // ヒーロー: 藍一色の濃淡。深藍 → 灰青 → 紙白のトーンで組む
    name: "hero",
    w: 2400,
    h: 1350,
    dye: 0.05,
    drops: [
      ...ring(80, 0.30, 0.48, 0.15, 0.030, 1),
      ...ring(70, 0.60, 0.54, 0.14, 0.028, 1),
      ...ring(62, 0.84, 0.44, 0.12, 0.026, 1),
      ...ring(44, 0.46, 0.80, 0.11, 0.024, 1),
      ...ring(30, 0.14, 0.62, 0.10, 0.022, 1),
    ],
    fans: [
      { at: 0, strength: 1.4, phase: 0.4 },
      { at: 40, strength: 1.0, phase: 2.4 },
      { at: 90, strength: 0.6, phase: 4.6 },
    ],
    stirs: [
      { at: 6, cx: 0.3, cy: 0.48, radius: 0.22, force: 0.05 },
      { at: 24, cx: 0.62, cy: 0.54, radius: 0.2, force: -0.045 },
      { at: 55, cx: 0.84, cy: 0.44, radius: 0.18, force: 0.04 },
      { at: 95, cx: 0.5, cy: 0.6, radius: 0.34, force: 0.025 },
    ],
    frames: 210,
  },
  {
    name: "sites",
    w: 1600,
    h: 1100,
    dye: 0.05,
    drops: [...ring(58, 0.5, 0.5, 0.13, 0.028, 1), ...ring(22, 0.46, 0.54, 0.06, 0.022, 1)],
    fans: [
      { at: 0, strength: 1.2, phase: 1.2 },
      { at: 50, strength: 0.7, phase: 3.4 },
    ],
    stirs: [
      { at: 8, cx: 0.5, cy: 0.5, radius: 0.2, force: 0.055 },
      { at: 70, cx: 0.44, cy: 0.56, radius: 0.13, force: -0.04 },
    ],
    frames: 200,
  },
  {
    // TOOLS は墨一色。灰の濃淡で硬く静かに
    name: "tools",
    w: 1600,
    h: 1100,
    dye: 0.06,
    drops: [...ring(50, 0.48, 0.5, 0.13, 0.028, 0)],
    fans: [
      { at: 0, strength: 1.8, phase: 0.0 },
      { at: 45, strength: 1.0, phase: 0.2 },
    ],
    stirs: [{ at: 20, cx: 0.5, cy: 0.5, radius: 0.24, force: 0.03 }],
    frames: 190,
  },
  {
    name: "games",
    w: 1600,
    h: 1100,
    dye: 0.14,
    drops: [...ring(20, 0.52, 0.5, 0.12, 0.020, 1)],
    fans: [
      { at: 0, strength: 1.0, phase: 3.1 },
      { at: 40, strength: 0.6, phase: 0.7 },
    ],
    stirs: [{ at: 8, cx: 0.5, cy: 0.5, radius: 0.2, force: 0.04 }],
    frames: 170,
  },
];

export default function DevRender() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [log, setLog] = useState<string[]>([]);

  const run = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const lines: string[] = [];

    for (const recipe of RECIPES) {
      canvas.style.width = `${recipe.w}px`;
      canvas.style.height = `${recipe.h}px`;

      const sim = new FluidSimulation(canvas, {
        resStep: 0,
        pressureIterations: 32,
        maxDpr: 1,
      });
      if (!sim.supported) {
        lines.push(`${recipe.name}: WebGL2 が使えません`);
        break;
      }
      sim.setPalette([
        [...INK_ABSORPTION.carbon],
        [...INK_ABSORPTION.indigo],
        [...UNDYED],
        [...UNDYED],
      ]);
      sim.setEdgeFade(0);
      // 渦度を上げて細い筋を巻かせ、拡散を上げて縁をほどく
      sim.setViscosityDials({ curl: 14, dyeDissipation: recipe.dye });
      sim.setHoming(0);
      sim.clearAll();

      // 滴を全部落としてから流す（時間軸は要らない。最終状態だけが欲しい）
      for (const d of recipe.drops) {
        sim.splatInk(d.x, d.y, d.s === 0 ? "carbon" : "indigo", d.r);
      }

      for (let f = 0; f < recipe.frames; f++) {
        for (const fan of recipe.fans) {
          if (f >= fan.at && f < fan.at + 24) sim.fan(fan.strength * 0.006, fan.phase);
        }
        for (const st of recipe.stirs) {
          if (f >= st.at && f < st.at + 30) {
            for (let i = 0; i < 12; i++) {
              const a = (i / 12) * Math.PI * 2;
              sim.splatVelocity(
                st.cx + st.radius * Math.cos(a),
                st.cy + st.radius * Math.sin(a),
                -Math.sin(a) * st.force * 0.003,
                Math.cos(a) * st.force * 0.003,
              );
            }
          }
        }
        sim.step(1 / 60);
      }
      sim.still();
      sim.render();

      const dataUrl = canvas.toDataURL("image/png");
      const res = await fetch("/api/dev-capture", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: recipe.name, dataUrl }),
      });
      const json = await res.json();
      lines.push(`${recipe.name}: ${res.ok ? json.file : JSON.stringify(json)} (${recipe.w}×${recipe.h})`);
      setLog([...lines]);
      sim.destroy();
    }
  }, []);

  return (
    <main style={{ padding: 24, fontFamily: "system-ui", background: "#fff" }}>
      <button
        type="button"
        onClick={run}
        style={{ padding: "8px 16px", fontSize: 16, cursor: "pointer" }}
      >
        書き出す
      </button>
      <pre style={{ marginTop: 16, fontSize: 13 }}>{log.join("\n")}</pre>
      <canvas
        ref={canvasRef}
        style={{ width: 600, height: 340, border: "1px solid #ccc", marginTop: 16 }}
      />
    </main>
  );
}
