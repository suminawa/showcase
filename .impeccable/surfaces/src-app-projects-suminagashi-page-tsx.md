---
version: 1
slug: "src-app-projects-suminagashi-page-tsx"
primary_target: "src/app/projects/suminagashi/page.tsx"
related_targets: ["src/components/suminagashi/SuminagashiBasin.tsx","src/components/suminagashi/fluid/simulation.ts"]
---

# Surface: Suminagashi (`/projects/suminagashi`)

- **Mode:** Experience — 作品そのものが体験。UI は框に退き、水盤が視界を占める
- **Audience/job:** ハブの SITES ベイから来た訪問者が「CSS/JS がすごい、触れて動く Web 表現」を体感する。実装力の証明が目的で、タスク完了は目的ではない
- **Content:** 藍と墨の GPU 流体の水盤。操作は ドラッグ = かき混ぜる / タップ = 墨を落とす / 下帯のボタン（墨を落とす・風を送る・静める・流し直す・保存）
- **Direction:** glazier partition の框の中に紙白の水盤。**水盤内部だけが「動かない」原則の例外**
- **Memorable moment:** 開くと墨と藍の滴が同心円を育て、風が通って羽根状のマーブルが開く（約 5.6 秒）。以後も微かに漂い続ける
- **技術の核（ここが作品の主張）:**
  - Stable Fluids（移流 → 渦強化 → 発散 → ヤコビ圧力 → 勾配減算）を自作 GLSL で実装、依存ゼロ
  - **輪の成長は速度場ではなく面積保存の放射変位で表現**（非圧縮ソルバは点からの湧き出しを打ち消すため）。これが本物の同心円を出す鍵
  - 滴は加算ではなく置換で描き、輪を重ねても黒く飽和しない
  - 風は点の集まりではなく速度場全体へ 1 パスで足す（`breezeShader`）
- **State/制約:**
  - 演出は壁時計ではなく**描いたフレーム時間の積算**で進める（背面タブで開かれても「見ないうちに終わっていた」が起きない）
  - reduced-motion: 完成形を 1 フレームで作り、以後アイドル時は step も render もしない（染料の減衰も止まる）。直接操作の 1.2 秒間だけ動く
  - `destroy()` で `loseContext()` を呼んではいけない（同じ canvas への再マウントが復帰不能になる）
  - リサイズ中で未操作なら演出をやり直す（引き伸ばしで輪が楕円に歪むため）
- **Unresolved:** 保存画像のギャラリー / 音 / 粘度・渦のダイヤル UI は意図的にスコープ外
