# Showcase

Things I've built.

動くデモ・ツール・LP を一つずつ追加していくポートフォリオです。作品は SITES / TOOLS / GAMES のカテゴリに分けて並べています。

## Projects

| カテゴリ | 作品 | 概要 |
| --- | --- | --- |
| SITES | [墨流し — Suminagashi](/src/app/projects/suminagashi) | 藍と墨が水面で渦を巻く WebGL2 の GPU 流体。かき混ぜて、墨を落として、模様を PNG 保存できる |
| TOOLS | [見積もりシミュレーター](/src/app/projects/quote-simulator) | 作業条件を入れると見積もりの内訳と合計がその場で見える電卓 |

## Tech Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS
- WebGL2 + 自作 GLSL（墨流しの流体。ライブラリ非依存）
- Vitest

## Development

```bash
npm install
npm run dev   # http://localhost:3010
npm test      # 計算ロジックとレジストリの単体テスト
```
