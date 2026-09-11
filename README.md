# Showcase

Things I've built.

動くデモ・ツール・LP を一つずつ追加していくポートフォリオです。作品は SITES / TOOLS / GAMES / CHALLENGE のカテゴリに分けて並べています。

## Projects

| カテゴリ  | 作品                                                        | 概要                                                                                       |
| --------- | ----------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| SITES     | [見本のサイト 6 件](/src/app/demos)                         | すべて架空の会社で作った見本。会社案内 1 件と、業種別の LP 5 件                             |
| TOOLS     | [見積もりシミュレーター](/src/app/projects/quote-simulator) | 作業条件を入れると見積もりの内訳と合計がその場で見える電卓                                 |
| TOOLS     | [間取りシミュレーター](/src/app/projects/floorplan)         | マス目を塗って間取りを描き、家具を置いて 3D で確かめる住まいの検討用の道具                 |
| TOOLS     | [墨流し — Suminagashi](/src/app/projects/suminagashi)       | 藍と墨が水面で渦を巻く WebGL2 の GPU 流体。かき混ぜて、墨を落として、模様を PNG 保存できる |
| CHALLENGE | [30日 — Thirty Days](/src/app/projects/30days)              | AIエージェントに全部やらせて30日で稼ぐ実験の、売上・提案数・介在時間を毎日足す公開の帳面 |

## Tech Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS
- WebGL2 + 自作 GLSL（墨流しの流体。ライブラリ非依存）
- React Three Fiber + three.js（間取りシミュレーターの 3D）
- Vitest

## Development

```bash
npm install
npm run dev   # http://localhost:3010
npm test      # 計算ロジックとレジストリの単体テスト
```
